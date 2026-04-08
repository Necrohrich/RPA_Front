// src/types/game.ts
export type GameDiceMode = 'BALANCED' | 'LOYAL' | `UNFAIR` | `PURE`

export type Game = {
    id: string
    name: string
    author_id: string
    gm_id: number | null
    gm_user_id: string | null
    discord_role_id: number | null
    discord_main_channel_id: number | null
    game_system_id: string
    game_system_name: string | null
    dice_mode: GameDiceMode
    show_dice_mode: boolean
}

export type GameSession = {
    id: string
    game_id: string
    session_number: number
    discord_event_id: number | null
    status: string | null
    title: string | null
    description: string | null
    image_url: string | null
    started_at: string | null
    ended_at: string | null
    created_at: string | null
}

export type Character = {
    id: string
    name: string
    game_system_id: string | null
    game_system_name: string | null
    game_id: string | null
    game_name: string | null
    avatar: string | null
    sheet_data: Record<string, unknown> | null
    schema_version: string | null
    dice_mode: string | null
}

export type ReviewRating = 'terrible' | 'bad' | 'neutral' | 'good' | 'excellent'
export type ReviewStatus = 'created' | 'send' | 'canceled'
export type ReviewAnonymity = 'public' | 'private'

export type GameReview = {
    id: string
    game_id: string
    session_id: string
    user_id: string
    status: ReviewStatus
    anonymity: ReviewAnonymity
    rating: ReviewRating | null
    comment: string
    best_scenes: Record<string, string> | null
    best_npc: string[] | null
    best_player_id: string | null
}

export type GameSystem = {
    id: string
    name: string
    description: string | null
    version: string
    is_active: boolean
}