// src/components/dashboard/ReviewsWidget.tsx
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { FolderTabs, getCardRadiusClass, RatingBar } from '@/components/dashboard'
import { useMyReviews, useMyGamesReviews, useMyGames, useParticipatedGames } from '@/hooks/useDashboard'
import type { FolderTab } from '@/components/dashboard'
import type { GameReview } from '@/types'

const REVIEW_LIMIT = 5

type ReviewTab = 'mine' | 'on_my_games'

// ── ReviewCard ────────────────────────────────────────────────────────────────

type ReviewCardProps = {
    review: GameReview
    gameName: string | null
}

function ReviewCard({ review, gameName }: ReviewCardProps) {
    const { t } = useTranslation()

    return (
        <div className="py-2.5 border-b border-border/40 last:border-0">
            <p className="text-[12px] font-medium text-foreground truncate mb-0.5">
                {gameName ?? t('dashboard.reviews.unknown_game')}
            </p>

            {review.comment ? (
                <p className="text-[11px] text-muted-foreground line-clamp-2 mb-1.5">
                    {review.comment}
                </p>
            ) : (
                <p className="text-[11px] text-muted-foreground/50 italic mb-1.5">
                    {t('dashboard.reviews.no_comment')}
                </p>
            )}

            {/* Лучшие сцены */}
            {review.best_scenes && Object.keys(review.best_scenes).length > 0 && (
                <p className="text-[10px] text-muted-foreground truncate mb-0.5">
                    🎭 {Object.keys(review.best_scenes).join(', ')}
                </p>
            )}

            {/* Запомнившиеся НИП */}
            {review.best_npc && review.best_npc.length > 0 && (
                <p className="text-[10px] text-muted-foreground truncate mb-0.5">
                    👤 {review.best_npc.join(', ')}
                </p>
            )}

            {review.rating
                ? <RatingBar rating={review.rating} className="mt-1" />
                : <span className="text-[10px] text-muted-foreground/50">{t('dashboard.reviews.no_rating')}</span>
            }
        </div>
    )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ReviewSkeleton() {
    return (
        <div className="py-2.5 border-b border-border/40 last:border-0 flex flex-col gap-1.5">
            <div className="h-3 w-2/3 rounded bg-secondary animate-pulse" />
            <div className="h-2.5 w-full rounded bg-secondary animate-pulse" />
            <div className="h-2.5 w-4/5 rounded bg-secondary animate-pulse" />
            <div className="flex gap-1 mt-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
                ))}
            </div>
        </div>
    )
}

// ── ReviewsWidget ─────────────────────────────────────────────────────────────

export function ReviewsWidget({ className }: { className?: string }) {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState<ReviewTab>('mine')

    const myReviews       = useMyReviews()
    const myGamesReviews  = useMyGamesReviews()
    const myGames         = useMyGames()
    const participated    = useParticipatedGames()

    // game_id → name из уже загруженных данных, без доп. запросов
    const gameNameMap = useMemo(() => {
        const map = new Map<string, string>()
        myGames.data?.items.forEach(g => map.set(g.id, g.name))
        participated.data?.items.forEach(g => map.set(g.id, g.name))
        return map
    }, [myGames.data, participated.data])

    const tabs: FolderTab<ReviewTab>[] = [
        { key: 'mine',        label: t('dashboard.reviews.tab_mine') },
        { key: 'on_my_games', label: t('dashboard.reviews.tab_on_my_games') },
    ]

    const activeQuery   = activeTab === 'mine' ? myReviews : myGamesReviews
    const isLoading     = activeQuery.isLoading
    const reviews       = activeQuery.data?.items.slice(0, REVIEW_LIMIT) ?? []
    const activeIndex   = tabs.findIndex(t => t.key === activeTab)

    return (
        <div className={cn('flex flex-col min-w-0', className)}>
            <FolderTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

            <div className={cn(
                'bg-card border border-border rounded-md flex flex-col flex-1 min-h-0 relative z-10',
                getCardRadiusClass(activeIndex),
            )}>
                <div className="px-4 py-1 flex-1 overflow-y-auto scrollbar-hidden">
                    {isLoading ? (
                        // скелетон — показываем 3 заглушки
                        Array.from({ length: 3 }, (_, i) => <ReviewSkeleton key={i} />)
                    ) : reviews.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-[12px] text-muted-foreground/60 italic">
                                {t('dashboard.reviews.empty')}
                            </p>
                        </div>
                    ) : (
                        reviews.map(review => (
                            <ReviewCard
                                key={review.id}
                                review={review}
                                gameName={gameNameMap.get(review.game_id) ?? null}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}