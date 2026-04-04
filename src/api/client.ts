// src/api/client.ts
import axios from 'axios'
import {tokenStorage} from '@/api/tokenStorage.ts'
import {refreshTokens} from "@/api/refreshTokens.ts";
import { handleAxiosError } from '@/api/errorHandler'

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {'Content-Type': 'application/json'}
})

// ── Request интерцептор ───────────────────────────────────────────────────────
// Добавляет access token к каждому запросу автоматически
apiClient.interceptors.request.use((config) => {
    const token = tokenStorage.getAccess()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// ── Response интерцептор ──────────────────────────────────────────────────────
// Перехватывает 401 и запускает тихий refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config

        const isAuthEndpoint = original.url?.includes('/auth/')

        // _retry флаг защищает от бесконечного цикла:
        // если refresh сам вернул 401 — не пытаемся рефрешить снова
        if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
            original._retry = true
            try {
                await refreshTokens()
                // повторяем оригинальный запрос с новым токеном
                original.headers.Authorization = `Bearer ${tokenStorage.getAccess()}`
                return apiClient(original)
            } catch {
                tokenStorage.clear()
                window.location.href = '/login'
                return Promise.reject(error)
            }
        }

        // все не-401 ошибки показываем пользователю
        console.log('interceptor error:', error.response?.status, error.config?.url, error.config?._retry)
        handleAxiosError(error)
        return Promise.reject(error)
    })