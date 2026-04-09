// src/hooks/useCharacters.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import type { Character, Paginated } from '@/types'

// ── API ───────────────────────────────────────────────────────────────────────

const charactersApi = {
    list: (params: { page: number; page_size: number; name?: string; game_system_id?: string }) =>
        apiClient
            .get<Paginated<Character>>('/users/me/characters', { params })
            .then(r => r.data),

    create: (dto: { name: string; game_system_id?: string | null; avatar?: string | null }) =>
        apiClient.post<Character>('/characters', dto).then(r => r.data),

    update: (id: string, dto: { name?: string; game_system_id?: string | null; avatar?: string | null }) =>
        apiClient.patch<Character>(`/characters/${id}`, dto).then(r => r.data),

    remove: (id: string) =>
        apiClient.delete(`/characters/${id}`).then(r => r.data),

}

// ── Query keys ────────────────────────────────────────────────────────────────

export const characterKeys = {
    // фабрика ключей — позволяет инвалидировать всё дерево одним вызовом
    all: ['characters'] as const,
    list: (params: object) => ['characters', 'list', params] as const,
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export { useGameSystemsList as useGameSystems } from '@/hooks/useGameSystems'

export const useCharactersList = (params: {
    page: number
    page_size: number
    name?: string
    game_system_id?: string
}) =>
    useQuery({
        queryKey: characterKeys.list(params),
        queryFn: () => charactersApi.list(params),
        placeholderData: prev => prev, // сохраняет предыдущие данные при смене параметров — без мигания
    })

export const useCreateCharacter = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: charactersApi.create,
        onSuccess: async () => {
            // инвалидируем всё дерево 'characters' и виджет дашборда
            await queryClient.invalidateQueries({ queryKey: characterKeys.all })
            await queryClient.invalidateQueries({ queryKey: ['dashboard', 'my-characters'] })
        },
    })
}

export const useUpdateCharacter = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: Parameters<typeof charactersApi.update>[1] }) =>
            charactersApi.update(id, dto),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: characterKeys.all })
            await queryClient.invalidateQueries({ queryKey: ['dashboard', 'my-characters'] })
        },
    })
}

export const useDeleteCharacter = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => charactersApi.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: characterKeys.all })
            await queryClient.invalidateQueries({ queryKey: ['dashboard', 'my-characters'] })
        },
    })
}