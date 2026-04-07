// src/hooks/useLastVisited.ts

const GAME_KEY_MINE         = 'rpa:last_game_mine'
const GAME_KEY_PARTICIPATED = 'rpa:last_game_participated'
const CHAR_KEY              = 'rpa:last_characters'
const CHAR_MAX              = 5

export type CharacterSnapshot = {
    id: string
    name: string
    game_system_name: string | null
    avatar: string | null
}

type GameTab = 'mine' | 'participated'

function readJson<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key)
        return raw ? (JSON.parse(raw) as T) : fallback
    } catch {
        return fallback
    }
}

// ── Игры ─────────────────────────────────────────────────────────────────────

export function getLastGameId(tab: GameTab): string | null {
    const key = tab === 'mine' ? GAME_KEY_MINE : GAME_KEY_PARTICIPATED
    return localStorage.getItem(key)
}

export function setLastGameId(tab: GameTab, gameId: string): void {
    const key = tab === 'mine' ? GAME_KEY_MINE : GAME_KEY_PARTICIPATED
    localStorage.setItem(key, gameId)
}

// ── Персонажи ─────────────────────────────────────────────────────────────────

export function getLastCharacters(): CharacterSnapshot[] {
    return readJson<CharacterSnapshot[]>(CHAR_KEY, [])
}

export function pushLastCharacter(snapshot: CharacterSnapshot): void {
    const current = getLastCharacters().filter(c => c.id !== snapshot.id)
    // новый элемент в начало, обрезаем до CHAR_MAX
    const updated = [snapshot, ...current].slice(0, CHAR_MAX)
    localStorage.setItem(CHAR_KEY, JSON.stringify(updated))
}