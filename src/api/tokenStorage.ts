const ACCESS_KEY = 'rpa_access'
const REFRESH_KEY = 'rpa_refresh'

// Тонкая обёртка над localStorage — одно место где знают о ключах
export const tokenStorage = {
    getAccess: () => localStorage.getItem(ACCESS_KEY),
    getRefresh: () => localStorage.getItem(REFRESH_KEY),

    set: (access: string, refresh: string) => {
        localStorage.setItem(ACCESS_KEY, access)
        localStorage.setItem(REFRESH_KEY, refresh)
    },

    clear: () => {
        localStorage.removeItem(ACCESS_KEY)
        localStorage.removeItem(REFRESH_KEY)
    },
}