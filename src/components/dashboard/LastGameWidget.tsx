//src/components/dashboard/LastGameWidget.tsx
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { FolderTabs, getCardRadiusClass } from '@/components/dashboard'
import { useMyGames, useParticipatedGames, useLastSession } from '@/hooks/useDashboard'
import { getLastGameId, setLastGameId } from '@/hooks/useLastVisited'
import { CopyableId } from '@/components/ui/CopyableId'
import { Plus, Gamepad2 } from 'lucide-react'
import type { FolderTab } from '@/components/dashboard'
import type { Game, GameSession } from '@/types'

type GameTab = 'mine' | 'participated'

// ── SessionPreview ────────────────────────────────────────────────────────────

type SessionPreviewProps = {
    game: Game
    session: GameSession | null
    isLoading: boolean
}

function SessionPreview({ game, session, isLoading }: SessionPreviewProps) {
    const { t } = useTranslation()

    return (
        // убираем overflow-y-auto отсюда — скролл вешаем на внешний контейнер
        <div className="flex flex-col min-h-0 flex-1">
            {/* Обложка — shrink-0 чтобы не сжималась */}
            <div className="relative w-full h-[72px] shrink-0 bg-secondary rounded-sm overflow-hidden mb-2">
                {session?.image_url ? (
                    <img
                        src={session.image_url}
                        alt={session.title ?? game.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Gamepad2 size={28} className="text-muted-foreground/30" />
                    </div>
                )}
            </div>

            {/* Скроллящаяся часть — только текст */}
            <div className="flex flex-col min-h-0 flex-1 overflow-y-auto">
                <div className="flex items-center gap-1.5 mb-0.5 overflow-hidden shrink-0">
                    <p className="text-[13px] font-semibold text-foreground truncate shrink min-w-0">{game.name}</p>
                    <CopyableId id={game.id} />
                    {game.game_system_name && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-medium bg-secondary text-muted-foreground border border-border/60">
                            {game.game_system_name}
                        </span>
                    )}
                </div>

                {session?.title && (
                    <p className="text-[12px] text-muted-foreground mb-0.5 overflow-hidden whitespace-nowrap text-ellipsis shrink-0">
                        {session.title}
                    </p>
                )}

                <div className="flex items-center gap-2 mb-2 shrink-0">
                    {session && (
                        <span className="text-[10px] text-muted-foreground">
                            {t('dashboard.last_game.session_number', { n: session.session_number })}
                        </span>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex flex-col gap-1.5">
                        <div className="h-2.5 w-full rounded bg-secondary animate-pulse" />
                        <div className="h-2.5 w-4/5 rounded bg-secondary animate-pulse" />
                        <div className="h-2.5 w-3/5 rounded bg-secondary animate-pulse" />
                    </div>
                ) : session?.description ? (
                    <p className="text-[11px] text-muted-foreground">
                        {session.description}
                    </p>
                ) : (
                    <p className="text-[11px] text-muted-foreground/50 italic">
                        {t('dashboard.last_game.no_session')}
                    </p>
                )}
            </div>
        </div>
    )
}
// ── EmptyState ────────────────────────────────────────────────────────────────

function EmptyState() {
    const { t } = useTranslation()
    return (
        <div className="flex flex-col items-center justify-center flex-1 gap-2">
            <p className="text-[12px] text-muted-foreground/60 italic">
                {t('dashboard.last_game.empty')}
            </p>
        </div>
    )
}

// ── LastGameWidget ────────────────────────────────────────────────────────────

export function LastGameWidget({ className, onCreateGame }: {
    className?: string
    onCreateGame?: () => void
}) {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const [activeTab, setActiveTab] = useState<GameTab>(() =>
        // восстанавливаем последнюю активную вкладку — не храним, просто дефолт
        'mine'
    )

    const myGames      = useMyGames()
    const participated = useParticipatedGames()

    const activeList = activeTab === 'mine'
        ? (myGames.data?.items ?? [])
        : (participated.data?.items ?? [])

    // выбираем игру: последняя посещённая или первая в списке
    const selectedGame = useMemo<Game | null>(() => {
        if (activeList.length === 0) return null
        const lastId = getLastGameId(activeTab)
        if (lastId) {
            const found = activeList.find(g => g.id === lastId)
            if (found) return found
        }
        return activeList[0]
    }, [activeList, activeTab])

    const lastSession = useLastSession(selectedGame?.id)

    const handleTabChange = (tab: GameTab) => {
        setActiveTab(tab)
    }

    const handleGoToGame = () => {
        if (!selectedGame) return
        setLastGameId(activeTab, selectedGame.id)
        navigate(`/dashboard/games/${selectedGame.id}`)
    }

    const tabs: FolderTab<GameTab>[] = [
        { key: 'mine',        label: t('dashboard.last_game.tab_mine') },
        { key: 'participated', label: t('dashboard.last_game.tab_participated') },
    ]

    const activeIndex  = tabs.findIndex(t => t.key === activeTab)
    const isListLoading = activeTab === 'mine' ? myGames.isLoading : participated.isLoading
    const isEmpty      = !isListLoading && activeList.length === 0

    return (
        <div className={cn('flex flex-col min-w-0', className)}>
            <FolderTabs tabs={tabs} active={activeTab} onChange={handleTabChange} />

            <div className={cn(
                'bg-card border border-border rounded-md flex flex-col flex-1 min-h-0 p-4 relative z-10',
                getCardRadiusClass(activeIndex),
            )}>
                {isEmpty ? (
                    <EmptyState/>
                ) : selectedGame ? (
                    <SessionPreview
                        game={selectedGame}
                        session={lastSession.data ?? null}
                        isLoading={lastSession.isLoading}
                    />
                ) : (
                    // список ещё грузится
                    <div className="flex flex-col gap-1.5 flex-1">
                        {Array.from({ length: 3 }, (_, i) => (
                            <div key={i} className="h-2.5 rounded bg-secondary animate-pulse" />
                        ))}
                    </div>
                )}

                {/* ── Кнопки ── */}
                {!isEmpty && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/40 shrink-0">
                        <button
                            onClick={handleGoToGame}
                            disabled={!selectedGame}
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium',
                                'bg-brand hover:bg-brand-hover text-white transition-colors',
                                'disabled:opacity-50 disabled:cursor-not-allowed',
                            )}
                        >
                            {t('dashboard.last_game.go_to_game')}
                        </button>

                        {activeTab === 'mine' && (
                            <button
                                onClick={onCreateGame}
                                className={cn(
                                    'flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium',
                                    'border border-border text-muted-foreground hover:text-foreground',
                                    'hover:bg-secondary transition-colors',
                                )}
                            >
                                <Plus size={12} />
                                {t('dashboard.last_game.create_game')}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}