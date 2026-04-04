// src/types/auth.ts

export type AuthResponse = {
    access_token: string
    refresh_token: string
    token_type: string
}

export type PlatformRole = 'SUPERADMIN' | 'MODERATOR' | 'SUPPORT' | 'CREATOR'

export type User = {
    id: string
    login: string
    primary_email: string
    secondary_email: string | null
    primary_discord_id: number | null
    secondary_discord_id: number | null
    platform_role: PlatformRole | null
}