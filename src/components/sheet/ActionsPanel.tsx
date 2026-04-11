// src/components/sheet/ActionsPanel.tsx
import { useState } from 'react'
import { Swords, Loader2, ChevronDown, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {cn, resolveLabel} from '@/lib/utils'
import { useApplyAction } from '@/hooks/useSheet'
import type { Action } from '@/types'

type Props = {
    characterId: string
    actions:     Action[]
    canAct:      boolean
}

export function ActionsPanel({ characterId, actions, canAct }: Props) {
    const { t } = useTranslation()

    if (actions.length === 0) return null

    return (
        <div
            id="character-actions-panel"
            className={cn(
                'rounded-xl border border-border/50 bg-card p-4',
                'flex flex-col gap-3',
            )}
        >
            <div className="flex items-center gap-2">
                <Swords size={14} className="text-brand" />
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                    {t('character_page.actions')}
                </span>
            </div>

            <div className="flex flex-col gap-2">
                {actions.map(action => (
                    <ActionRow
                        key={action.id}
                        action={action}
                        characterId={characterId}
                        canAct={canAct}
                    />
                ))}
            </div>
        </div>
    )
}

// ── Одно действие ─────────────────────────────────────────────────────────────

type ActionRowProps = {
    action:      Action
    characterId: string
    canAct:      boolean
}

function ActionRow({ action, characterId, canAct }: ActionRowProps) {
    const { t, i18n } = useTranslation()
    const applyMut = useApplyAction(characterId)

    const [expanded,       setExpanded]       = useState(false)

    const handleActivate = async () => {
        try {
            const result = await applyMut.mutateAsync({ actionId: action.id, params: {} })

            if (result.roll_result) {
                const r   = result.roll_result
                const msg = r.success === true
                    ? t('character_page.action_success', { total: r.total })
                    : r.success === false
                        ? t('character_page.action_fail',   { total: r.total })
                        : t('character_page.action_rolled', { total: r.total })
                toast(msg, { description: r.breakdown ?? undefined })
            } else {
                toast.success(t('character_page.action_applied'))
            }
        } catch {
            // обработано интерцептором
        }
    }

    const costLabel = action.cost
        ? `${action.cost.amount} ${action.cost.resource}`
        : null

    return (
        <div className={cn(
            'rounded-lg border border-border/50 bg-secondary/30 transition-colors',
            canAct && 'hover:border-border/80',
        )}>
            {/* ── Строка действия ── */}
            <div className="flex items-center gap-2 px-3 py-2">
                <button
                    onClick={() => setExpanded(p => !p)}
                    className="text-muted-foreground/40 hover:text-muted-foreground transition-colors shrink-0"
                >
                    {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                </button>

                <span className="text-sm font-medium text-foreground flex-1 truncate">
                    {resolveLabel(action.label, i18n.language)}
                </span>

                {costLabel && (
                    <span className="text-[11px] text-muted-foreground/60 shrink-0">
                        {costLabel}
                    </span>
                )}

                {canAct && (
                    <button
                        onClick={() => handleActivate()}
                        disabled={applyMut.isPending}
                        className={cn(
                            'flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium',
                            'bg-brand/20 border border-brand/40 text-brand',
                            'hover:bg-brand/30 transition-colors',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                        )}
                    >
                        {applyMut.isPending
                            ? <Loader2 size={11} className="animate-spin" />
                            : <Swords size={11} />
                        }
                        {t('character_page.activate')}
                    </button>
                )}
            </div>

            {/* ── Описание ── */}
            {expanded && action.description && (
                <div className="px-3 pb-2 border-t border-border/30">
                    <p className="text-xs text-muted-foreground pt-2">
                        {resolveLabel(action.description, i18n.language)}
                    </p>
                </div>
            )}
        </div>
    )
}