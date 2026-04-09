// src/components/games/GamesGrid.tsx
import { useTranslation } from 'react-i18next'
import { GameCard } from './GameCard'
import type { Game } from '@/types'

type Props = {
    games: Game[]
    isLoading: boolean
    isOwner: (game: Game) => boolean
    onDelete?: (game: Game) => void
    onLeave?: (game: Game) => void
    onSettings?: (game: Game) => void
    onAttachCharacter?: (game: Game) => void
    onReviews: (game: Game) => void
    onClick: (game: Game) => void
}

export function GamesGrid({
                              games, isLoading, isOwner,
                              onDelete, onLeave, onSettings,
                              onAttachCharacter, onReviews, onClick,
                          }: Props) {
    const { t } = useTranslation()

    if (isLoading) return (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-64 rounded-xl bg-secondary/50 animate-pulse" />
            ))}
        </div>
    )

    if (games.length === 0) return (
        <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            {t('dashboard.games_page.empty')}
        </div>
    )

    return (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {games.map(game => (
                <GameCard
                    key={game.id}
                    game={game}
                    isOwner={isOwner(game)}
                    onDelete={onDelete}
                    onLeave={onLeave}
                    onSettings={onSettings}
                    onAttachCharacter={onAttachCharacter}
                    onReviews={onReviews}
                    onClick={onClick}
                />
            ))}
        </div>
    )
}