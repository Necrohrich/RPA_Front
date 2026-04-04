import axios from 'axios'
import { tokenStorage } from '@/api/tokenStorage'

// Отдельный axios-инстанс без интерцепторов — важно!
// Если использовать apiClient, refresh попадёт в тот же интерцептор
// и при 401 на refresh получим бесконечную рекурсию
const refreshClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { 'Content-Type': 'application/json' },
})

// Очередь запросов ожидающих refresh
type QueueItem = {
    resolve: (token: string) => void
    reject: (error: unknown) => void
}

let isRefreshing = false
let queue: QueueItem[] = []

const processQueue = (error: unknown, token: string | null) => {
    queue.forEach((item) => {
        if (token) item.resolve(token)
        else item.reject(error)
    })
    queue = []
}

export const refreshTokens = (): Promise<void> => {
    if (!tokenStorage.getRefresh()) {
        return Promise.reject(new Error('No refresh token'))
    }

    // Если refresh уже идёт — встаём в очередь вместо нового запроса
    if (isRefreshing) {
        return new Promise<void>((resolve, reject) => {
            queue.push({
                resolve: () => resolve(),
                reject,
            })
        })
    }

    isRefreshing = true

    return refreshClient
        .post<{ access_token: string, refresh_token: string}>('/auth/refresh', {
            refresh_token: tokenStorage.getRefresh(),
        })
        .then(({data}) => {
            tokenStorage.set(data.access_token, data.refresh_token)
            processQueue(null, data.access_token)
        })
        .catch((error) => {
            processQueue(error, null)
            throw error
        })
        .finally(() => {
            isRefreshing = false
        })
}

