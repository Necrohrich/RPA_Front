// src/types/game.ts
export type GameDiceMode = 'balanced' | 'loyal' | 'unfair' | 'pure'

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
    cover_url: string | null
    description: string | null
    sessions_count: number
    players_count: number
    rating_label: string | null   // 'terrible' | 'bad' | 'neutral' | 'good' | 'excellent'
    rating_score: number | null   // 0.0–4.0
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
    author_id: string | null
    author_username: string | null
    changelog: string | null
}

export type SchemaTab = 'sheet_schema' | 'rolls_schema' | 'rules_schema' | 'actions_schema'

export type SchemasDto = {
    version: string
    changelog?: string | null
    sheet_schema: Record<string, unknown>
    rolls_schema: Record<string, unknown>
    rules_schema: Record<string, unknown>
    actions_schema: Record<string, unknown>
}

export type ValidationIssue = {
    code: string
    message: string
    path?: string
}

export type SchemaStats = {
    sections_count: number
    fields_count: number
    computed_fields: number
    rolls_count: number
    has_display_config: boolean
}

export type ValidationReport = {
    valid: boolean
    errors: ValidationIssue[]
    warnings: ValidationIssue[]
    stats: SchemaStats
}

// полная система со схемами — для редактора
export type GameSystemFull = GameSystem & {
    sheet_schema: Record<string, unknown>
    rolls_schema: Record<string, unknown>
    rules_schema: Record<string, unknown>
    actions_schema: Record<string, unknown>
}