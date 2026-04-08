// src/hooks/useProfile.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client.ts'

const profileApi = {
    updateSecondaryEmail: (email: string) =>
        apiClient.patch('/users/me/secondary-email', { email }).then(r => r.data),

    deleteSecondaryEmail: () =>
        apiClient.delete('/users/me/secondary-email').then(r => r.data),

    changePassword: (old_password: string, new_password: string) =>
        apiClient.patch('/users/me/password', { old_password, new_password }).then(r => r.data),
}

export const useUpdateSecondaryEmail = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (email: string) => profileApi.updateSecondaryEmail(email),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['user'] })
        },
    })
}

export const useDeleteSecondaryEmail = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: () => profileApi.deleteSecondaryEmail(),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['user'] })
        },
    })
}

export const useChangePassword = () =>
    useMutation({
        mutationFn: ({ old_password, new_password }: { old_password: string; new_password: string }) =>
            profileApi.changePassword(old_password, new_password),
    })