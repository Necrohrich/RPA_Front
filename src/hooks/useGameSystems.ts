// src/hooks/useGameSystems.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { useAuth } from '@/hooks/useAuth'
import type { GameSystem, Paginated } from '@/types'

type UpdateSystemDto = {
    name?: string
    description?: string | null
    is_active?: boolean
}

const systemsApi = {
    // публичный — для селектов в играх/персонажах
    list: () =>
        apiClient.get<GameSystem[]>('/game-systems').then(r => r.data),

    // только свои (creator/moderator/superadmin)
    my: (params: { page: number; page_size: number }) =>
        apiClient.get<Paginated<GameSystem>>('/admin/game-systems/my', { params })
            .then(r => r.data),

    // все (только superadmin)
    all: (params: { page: number; page_size: number }) =>
        apiClient.get<Paginated<GameSystem>>('/admin/game-systems', { params })
            .then(r => r.data),

    create: (dto: { name: string; description?: string | null }) =>
        apiClient.post<GameSystem>('/admin/game-systems', dto).then(r => r.data),

    update: (id: string, dto: UpdateSystemDto) =>
        apiClient.patch<GameSystem>(`/admin/game-systems/${id}`, dto)
            .then(r => r.data),

    remove: (id: string) =>
        apiClient.delete(`/admin/game-systems/${id}`).then(r => r.data),
}

export const systemKeys = {
    all: ['game-systems'] as const,
    list: () => ['game-systems', 'list'] as const,
    admin: (params: object) => ['game-systems', 'admin', params] as const,
}

// публичный список — переиспользуется в useCharacters, useGames
export const useGameSystemsList = () =>
    useQuery({
        queryKey: systemKeys.list(),
        queryFn: systemsApi.list,
    })

// список для страницы редактора — my или all в зависимости от роли
export const useAdminGameSystems = (params: { page: number; page_size: number }) => {
    const { user } = useAuth()
    const isSuperadmin = user?.platform_role === 'superadmin'

    return useQuery({
        queryKey: systemKeys.admin(params),
        queryFn: () => isSuperadmin ? systemsApi.all(params) : systemsApi.my(params),
        // не запускаем пока роль неизвестна
        enabled: !!user,
    })
}

export const useCreateGameSystem = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: systemsApi.create,
        onSuccess: () => qc.invalidateQueries({ queryKey: systemKeys.all }),
    })
}

export const useUpdateGameSystem = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateSystemDto }) => systemsApi.update(id, dto),
        onSuccess: () => qc.invalidateQueries({ queryKey: systemKeys.all }),
    })
}

export const useDeleteGameSystem = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: systemsApi.remove,
        onSuccess: () => qc.invalidateQueries({ queryKey: systemKeys.all }),
    })
}