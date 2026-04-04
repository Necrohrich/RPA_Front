// src/hooks/useAuth.ts
import {apiClient} from "@/api/client.ts";
import type {AuthResponse, User} from "@/types";
import {tokenStorage} from "@/api/tokenStorage.ts";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useNavigate} from "react-router-dom";
import {toast} from "sonner";

// ── API-функции ───────────────────────────────────────────────────────────────
// Живут здесь, а не в api/ потому что используются только этим хуком.
// Если понадобятся в нескольких хуках — выносим в api/

type LoginPayload = {email: string, password: string}
type RegisterPayload = { login: string; email: string; password: string}

const authApi = {
    login: (data: LoginPayload) =>
        apiClient.post<AuthResponse>('/auth/login', {
                ...data,
                device_info: navigator.userAgent,
            }).then(r => r.data),

    register: (data: RegisterPayload) =>
        apiClient.post<AuthResponse>('/auth/register', data).then(r => r.data),

    logout: () =>
        apiClient.post('/auth/logout', {
            refresh_token: tokenStorage.getRefresh(),
        }),

    me: () =>
        apiClient.get<User>('/users/me').then(r => r.data),
}

// ── Хук ──────────────────────────────────────────────────────────────────────

export const useAuth = () => {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    // Текущий пользователь — загружается если есть токен
    const {data: user, isLoading} = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            await new Promise(r => setTimeout(r, 2000))
            return authApi.me()
        },
        // не делаем запрос если токена нет — незачем получать 401
        enabled: !!tokenStorage.getAccess(),
        retry: false,
    })

    const loginMutation = useMutation({
        mutationFn: authApi.login,
        onSuccess: async (data) => {
            tokenStorage.set(data.access_token, data.refresh_token)
            // инвалидируем кэш user — useQuery['user'] перезапросит /users/me
            await queryClient.invalidateQueries({ queryKey: ['user'] })
            navigate('/dashboard')
        },
    })

    const registerMutation = useMutation({
        mutationFn: authApi.register,
        onSuccess: async (data) => {
            tokenStorage.set(data.access_token, data.refresh_token)
            await queryClient.invalidateQueries({ queryKey: ['user'] })
            navigate('/dashboard')
        },
    })

    const logoutMutation = useMutation({
        mutationFn: authApi.logout,
        onSuccess: () => {
            tokenStorage.clear()
            queryClient.clear()  // очищаем весь кэш — данные другого пользователя не должны остаться
            navigate('/login')
            toast.success('Вы вышли из аккаунта')
        },
    })

    return {
        user,
        isLoading,
        isAuthenticated: !!user,
        login: loginMutation.mutate,
        register: registerMutation.mutate,
        logout: logoutMutation.mutate,
        isLoginPending: loginMutation.isPending,
        isRegisterPending: registerMutation.isPending,
    }
}