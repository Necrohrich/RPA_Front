// src/components/sheet/CustomPoolsPanel.tsx
import { usePoolItems, useAssignItem, useUnassignItem } from '@/hooks/useSheet'
import type { CustomPool, CustomPoolItem } from '@/types'
import {cn, resolveLabel} from '@/lib/utils'
import {useTranslation} from "react-i18next";

// ── Вспомогательная функция: первое поле data как "имя" элемента ──────────────
// По соглашению authoring-guide: первое поле item_schema — это название
function getItemLabel(item: CustomPoolItem, pool: CustomPool): string {
    const firstField = pool.fields[0]?.id
    if (firstField && item.data[firstField]) return String(item.data[firstField])
    return item.id.slice(0, 8)
}

function getItemSubtext(item: CustomPoolItem, pool: CustomPool): string {
    return pool.fields
        .slice(1)
        .map(f => item.data[f.id])
        .filter(Boolean)
        .join(' · ')
}

// ── Карточка одного элемента ──────────────────────────────────────────────────

type ItemCardProps = {
    item:        CustomPoolItem
    pool:        CustomPool
    isGm:        boolean
    assigned:    boolean
    onToggle:    (itemId: string, assign: boolean) => void
    pending:     boolean
}

function ItemCard({ item, pool, isGm, assigned, onToggle, pending }: ItemCardProps) {
    const label   = getItemLabel(item, pool)
    const subtext = getItemSubtext(item, pool)

    return (
        <div className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors',
            assigned ? 'border-brand/40 bg-brand/5' : 'border-border/40 bg-secondary/30',
            isGm && 'cursor-pointer hover:border-brand/60',
        )}
             onClick={() => isGm && !pending && onToggle(item.id, !assigned)}
        >
            {/* Чекбокс — только для GM */}
            {isGm && (
                <div className={cn(
                    'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                    assigned ? 'border-brand bg-brand' : 'border-muted-foreground/40',
                    pending && 'opacity-50',
                )}>
                    {assigned && (
                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                            <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    )}
                </div>
            )}

            <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-foreground truncate">{label}</span>
                {subtext && (
                    <span className="text-xs text-muted-foreground truncate">{subtext}</span>
                )}
            </div>
        </div>
    )
}

// ── Секция одного пула (GM — грузит все элементы, игрок — только assigned) ────

type PoolSectionProps = {
    pool:         CustomPool
    assignedItems: CustomPoolItem[]  // уже отфильтрованные для этого пула
    characterId:  string
    gameId:       string
    isGm:         boolean
}

function PoolSection({ pool, assignedItems, characterId, gameId, isGm }: PoolSectionProps) {
    // Только GM делает этот запрос — остальным enabled=false
    const { i18n } = useTranslation()
    const lang = i18n.language.split('-')[0]
    const poolQ   = usePoolItems(gameId, pool.id, isGm)
    const assign  = useAssignItem(characterId)
    const unassign = useUnassignItem(characterId)

    const handleToggle = (itemId: string, doAssign: boolean) => {
        if (doAssign) assign.mutate(itemId)
        else          unassign.mutate(itemId)
    }

    // GM видит все элементы пула; игрок — только свои
    const items: CustomPoolItem[] = isGm ? (poolQ.data ?? []) : assignedItems

    if (!isGm && items.length === 0) return null

    const assignedIds = new Set(assignedItems.map(i => i.id))
    const isPending   = assign.isPending || unassign.isPending

    return (
        <div className="flex flex-col gap-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
                {resolveLabel(pool.label, lang)}
            </p>

            {isGm && poolQ.isLoading ? (
                <div className="h-8 rounded-lg bg-secondary/40 animate-pulse" />
            ) : items.length === 0 ? (
                <p className="text-xs text-muted-foreground/60 px-1 py-1">—</p>
            ) : (
                <div className="flex flex-col gap-1">
                    {items.map(item => (
                        <ItemCard
                            key={item.id}
                            item={item}
                            pool={pool}
                            isGm={isGm}
                            assigned={assignedIds.has(item.id)}
                            onToggle={handleToggle}
                            pending={isPending}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

// ── Публичный компонент ───────────────────────────────────────────────────────

type CustomPoolsPanelProps = {
    pools:        CustomPool[]
    assignedItems: CustomPoolItem[]
    characterId:  string
    gameId:       string
    isGm:         boolean
}

export function CustomPoolsPanel({ pools, assignedItems, characterId, gameId, isGm }: CustomPoolsPanelProps) {
    if (pools.length === 0) return null

    // Игроку нечего показывать — скрываем всю панель
    if (!isGm && assignedItems.length === 0) return null

    return (
        <div className="rounded-xl border border-border/60 bg-card p-4 flex flex-col gap-4">
            {pools.map(pool => (
                <PoolSection
                    key={pool.id}
                    pool={pool}
                    assignedItems={assignedItems.filter(i => i.pool_id === pool.id)}
                    characterId={characterId}
                    gameId={gameId}
                    isGm={isGm}
                />
            ))}
        </div>
    )
}