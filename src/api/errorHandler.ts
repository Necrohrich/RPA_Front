// src/api/errorHandler.ts
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import i18n from 'i18next'

// 401 от auth-эндпоинтов обрабатывается в интерцепторе client.ts
// здесь они уже не доходят, поэтому SILENT_CODES пустой
const SILENT_CODES = new Set<number>([])

export const handleAxiosError = (error: AxiosError<{detail: string}>): void => {
    const status = error.response?.status
    const detail = error.response?.data?.detail

    if (!status || SILENT_CODES.has(status)) return

    // ключ строится из detail: "Invalid credentials" → "errors.Invalid credentials"
    // если ключ не найден — i18next вернёт сам ключ, поэтому нужен fallback
    const key = detail ? `errors.${detail}` : null
    const message = (key && i18n.exists(key))
        ? i18n.t(key)
        : i18n.t('errors.default')

    toast.error(message)
}