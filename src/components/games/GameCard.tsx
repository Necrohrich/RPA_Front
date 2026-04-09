// src/components/games/GameCard.tsx
import { Settings, Trash2, LogOut, Users, Scroll, Star, Gamepad2, MessageSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { CopyableId } from '@/components/ui/CopyableId'
import { RatingBar } from '@/components/dashboard/RatingBar'
import type { Game, ReviewRating } from '@/types'
import * as React from "react";

type Props = {
    game: Game
    isOwner: boolean
    onDelete?: (game: Game) => void
    onLeave?: (game: Game) => void
    onAttachCharacter?: (game: Game) => void
    onReviews?: (game: Game) => void
    onSettings?: (game: Game) => void
    onClick: (game: Game) => void
}

const DICE_MODE_LABELS: Record<string, string> = {
    BALANCED: 'Balanced',
    LOYAL:    'Loyal',
    UNFAIR:   'Unfair',
    PURE:     'Pure',
}

export function GameCard({
                             game,
                             isOwner,
                             onDelete,
                             onLeave,
                             onAttachCharacter,
                             onReviews,
                             onSettings,
                             onClick,
                         }: Props) {
    const { t } = useTranslation()

    return (
        <div
            onClick={() => onClick(game)}
            className={cn(
                'relative flex flex-col rounded-xl cursor-pointer',
                'bg-card border border-border/50',
                'hover:border-brand/50 transition-all duration-200 group',
            )}
        >
            {/* ── Обложка ── */}
            <div className="relative h-32 bg-secondary shrink-0 overflow-hidden">
                {game.cover_url ? (
                    <img
                        src={game.cover_url}
                        alt={game.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="relative h-32 bg-secondary shrink-0 overflow-hidden rounded-t-xl">
                        <Gamepad2 size={32} className="text-muted-foreground/20" />
                    </div>
                )}

                {/* dice_mode badge — только если show_dice_mode */}
                {game.show_dice_mode && (
                    <span className={cn(
                        'absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold',
                        'bg-black/60 text-white backdrop-blur-sm border border-white/10',
                    )}>
                        {DICE_MODE_LABELS[game.dice_mode.toUpperCase()] ?? game.dice_mode}
                    </span>
                )}

                {/* Кнопки действий — появляются при hover */}
                <div className={cn(
                    'absolute top-2 right-2 flex gap-1',
                    'opacity-0 group-hover:opacity-100 transition-opacity',
                )}>
                    {isOwner ? (
                        <>
                            <ActionBtn
                                icon={<Settings size={12} />}
                                onClick={e => { e.stopPropagation(); onSettings?.(game) }}
                                label="settings"
                            />
                            <ActionBtn
                                icon={<Trash2 size={12} />}
                                onClick={e => { e.stopPropagation(); onDelete?.(game) }}
                                label="delete"
                                danger
                            />
                        </>
                    ) : (
                        <ActionBtn
                            icon={<LogOut size={12} />}
                            onClick={e => { e.stopPropagation(); onLeave?.(game) }}
                            label="leave"
                            danger
                        />
                    )}
                </div>
            </div>

            {/* ── Контент ── */}
            <div className="flex flex-col gap-2 p-3 flex-1">
                {/* Название + ID */}
                <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm font-semibold text-foreground truncate">
                        {game.name}
                    </span>
                    <CopyableId id={game.id} />
                </div>

                {/* Система */}
                {game.game_system_name && (
                    <span className="text-[10px] text-brand/80 font-medium -mt-1">
                        {game.game_system_name}
                    </span>
                )}

                {/* Описание */}
                <p className="text-[11px] text-muted-foreground line-clamp-2 flex-1">
                    {game.description ?? t('dashboard.games_page.no_description')}
                </p>

                {/* Статистика */}
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Scroll size={11} />
                        {game.sessions_count} {t('dashboard.games_page.sessions')}
                    </span>
                    <span className="flex items-center gap-1">
                        <Users size={11} />
                        {game.players_count} {t('dashboard.games_page.players')}
                    </span>
                    {game.rating_label ? (
                        <RatingBar
                            rating={game.rating_label as ReviewRating}
                            className="ml-auto"
                        />
                    ) : (
                        <span className="ml-auto flex items-center gap-1 italic">
                            <Star size={11} />
                            {t('dashboard.games_page.no_rating')}
                        </span>
                    )}
                </div>

                {/* Нижние действия */}
                <div className="flex gap-1.5 pt-1 border-t border-border/40">
                    {!isOwner && (
                        <BottomBtn
                            icon={<Users size={13} />}
                            label={t('dashboard.games_page.attach_character')}
                            onClick={e => { e.stopPropagation(); onAttachCharacter?.(game) }}
                        />
                    )}
                    <BottomBtn
                        icon={<MessageSquare size={13} />}
                        label={t('dashboard.games_page.reviews')}
                        onClick={e => { e.stopPropagation(); onReviews?.(game) }}
                    />
                    <BottomBtn
                        icon={<Gamepad2 size={13} />}
                        label={t('dashboard.games_page.game_table')}
                        onClick={e => { e.stopPropagation(); onClick(game) }}
                    />
                </div>
            </div>
        </div>
    )
}

// ── вспомогательные компоненты ────────────────────────────────────────────────

function ActionBtn({
                       icon,
                       onClick,
                       label,
                       danger = false,
                   }: {
    icon: React.ReactNode
    onClick: React.MouseEventHandler
    label: string
    danger?: boolean
}) {
    return (
        <button
            onClick={onClick}
            aria-label={label}
            className={cn(
                'p-1.5 rounded-md backdrop-blur-sm transition-colors',
                'bg-black/40 border border-white/10',
                danger
                    ? 'text-red-400 hover:bg-red-500/20'
                    : 'text-white/70 hover:text-white hover:bg-white/10',
            )}
        >
            {icon}
        </button>
    )
}

function BottomBtn({
                       icon,
                       label,
                       onClick,
                       disabled = false,
                   }: {
    icon: React.ReactNode
    label: string
    onClick: React.MouseEventHandler
    disabled?: boolean
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={label}
            className={cn(
                'flex items-center justify-center p-1.5 rounded flex-1',
                'text-muted-foreground border border-border/40 transition-colors',
                'hover:text-foreground hover:border-brand/40 hover:bg-brand/5',
                'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent',
                'disabled:hover:border-border/40 disabled:hover:text-muted-foreground',
            )}
        >
            {icon}
        </button>
    )
}