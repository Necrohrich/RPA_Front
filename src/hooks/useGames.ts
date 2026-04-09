// src/hooks/useGames.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import type {Character, Game, Paginated} from '@/types'

// ── API ───────────────────────────────────────────────────────────────────────

const gamesApi = {
    myGames: (params: { page: number; page_size: number; name?: string }) =>
        apiClient
            .get<Paginated<Game>>('/users/me/games', { params })
            .then(r => r.data),

    participatedGames: (params: { page: number; page_size: number; name?: string }) =>
        apiClient
            .get<Paginated<Game>>('/users/me/games/participated', { params })
            .then(r => r.data),

    create: (dto: { name: string; game_system_id: string; description?: string | null; cover_url?: string | null }) =>
        apiClient.post<Game>('/games', dto).then(r => r.data),

    update: (id: string, dto: {
        name?: string
        description?: string | null
        cover_url?: string | null
        game_system_id?: string | null
    }) =>
        apiClient.patch<Game>(`/games/${id}`, dto).then(r => r.data),

    remove: (id: string) =>
        apiClient.delete(`/games/${id}`).then(r => r.data),

    join: (gameId: string) =>
        apiClient.post<{ game_id: string; user_id: string; status: string }>(
            `/games/${gameId}/players/join`
        ).then(r => r.data),

    leave: (gameId: string, userId: string) =>
        apiClient.delete(`/games/${gameId}/players/${userId}`).then(r => r.data),

    attachCharacter: (gameId: string, characterId: string) =>
        apiClient.post<Character>(`/games/${gameId}/characters/${characterId}`).then(r => r.data),

    detachCharacter: (gameId: string, characterId: string) =>
        apiClient.delete(`/games/${gameId}/characters/${characterId}`).then(r => r.data),
}

// ── Query keys ────────────────────────────────────────────────────────────────

export const gameKeys = {
    all: ['games'] as const,
    myList: (params: object) => ['games', 'my', params] as const,
    participatedList: (params: object) => ['games', 'participated', params] as const,
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export const useMyGamesList = (params: {
    page: number
    page_size: number
    name?: string
}) =>
    useQuery({
        queryKey: gameKeys.myList(params),
        queryFn: () => gamesApi.myGames(params),
        placeholderData: prev => prev,
    })

export const useParticipatedGamesList = (params: {
    page: number
    page_size: number
    name?: string
}) =>
    useQuery({
        queryKey: gameKeys.participatedList(params),
        queryFn: () => gamesApi.participatedGames(params),
        placeholderData: prev => prev,
    })

export const useCreateGame = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: gamesApi.create,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: gameKeys.all })
            await queryClient.invalidateQueries({ queryKey: ['dashboard', 'my-games'] })
        },
    })
}

export const useUpdateGame = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: Parameters<typeof gamesApi.update>[1] }) =>
            gamesApi.update(id, dto),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: gameKeys.all })
            await queryClient.invalidateQueries({ queryKey: ['dashboard', 'my-games'] })
        },
    })
}

export const useDeleteGame = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => gamesApi.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: gameKeys.all })
            await queryClient.invalidateQueries({ queryKey: ['dashboard', 'my-games'] })
        },
    })
}

export const useJoinGame = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (gameId: string) => gamesApi.join(gameId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: gameKeys.all })
            await queryClient.invalidateQueries({ queryKey: ['dashboard', 'participated-games'] })
        },
    })
}

export const useLeaveGame = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ gameId, userId }: { gameId: string; userId: string }) =>
            gamesApi.leave(gameId, userId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: gameKeys.all })
            await queryClient.invalidateQueries({ queryKey: ['dashboard', 'participated-games'] })
        },
    })
}

export const useAttachCharacter = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ gameId, characterId }: { gameId: string; characterId: string }) =>
            gamesApi.attachCharacter(gameId, characterId),
        onSuccess:  async () => {
            await queryClient.invalidateQueries ({ queryKey: ['characters'] })
            await queryClient.invalidateQueries({ queryKey: ['dashboard', 'my-characters'] })
        },
    })
}

export const useDetachCharacter = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ gameId, characterId }: { gameId: string; characterId: string }) =>
            gamesApi.detachCharacter(gameId, characterId),
        onSuccess:  async () => {
            await queryClient.invalidateQueries ({ queryKey: ['characters'] })
            await queryClient.invalidateQueries({ queryKey: ['dashboard', 'my-characters'] })
        },
    })
}