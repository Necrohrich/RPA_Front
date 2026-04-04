// src/hooks/useDashboard.ts
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import type { Character, Game, GameReview, GameSession, Paginated } from '@/types'

const dashboardApi = {
    myGames: () =>
        apiClient
            .get<Paginated<Game>>('/users/me/games', { params: { page: 1, page_size: 5 } })
            .then(r => r.data),

    participatedGames: () =>
        apiClient
            .get<Paginated<Game>>('/users/me/games/participated', { params: { page: 1, page_size: 5 } })
            .then(r => r.data),

    myCharacters: () =>
        apiClient
            .get<Paginated<Character>>('/users/me/characters', { params: { page: 1, page_size: 5 } })
            .then(r => r.data),

    myReviews: () =>
        apiClient
            .get<Paginated<GameReview>>('/users/me/reviews', { params: { page: 1, page_size: 3 } })
            .then(r => r.data),

    myGamesReviews: () =>
        apiClient
            .get<Paginated<GameReview>>('/users/me/games/reviews', { params: { page: 1, page_size: 3 } })
            .then(r => r.data),

    lastSession: (gameId: string) =>
        apiClient
            .get<GameSession>(`/game-sessions/games/${gameId}/last`)
            .then(r => r.data)
            .catch(err => {
                // 404 = сессий нет, это нормально
                if (err?.response?.status === 404) return null
                throw err
            }),
}

export const useMyGames = () =>
    useQuery({
        queryKey: ['dashboard', 'my-games'],
        queryFn: dashboardApi.myGames,
    })

export const useParticipatedGames = () =>
    useQuery({
        queryKey: ['dashboard', 'participated-games'],
        queryFn: dashboardApi.participatedGames,
    })

export const useMyCharacters = () =>
    useQuery({
        queryKey: ['dashboard', 'my-characters'],
        queryFn: dashboardApi.myCharacters,
    })

export const useMyReviews = () =>
    useQuery({
        queryKey: ['dashboard', 'my-reviews'],
        queryFn: dashboardApi.myReviews,
    })

export const useMyGamesReviews = () =>
    useQuery({
        queryKey: ['dashboard', 'my-games-reviews'],
        queryFn: dashboardApi.myGamesReviews,
    })

export const useLastSession = (gameId: string | null | undefined) =>
    useQuery({
        queryKey: ['dashboard', 'last-session', gameId],
        queryFn: () => dashboardApi.lastSession(gameId!),
        enabled: !!gameId,
        retry: false,
    })