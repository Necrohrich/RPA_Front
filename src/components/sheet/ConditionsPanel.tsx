// src/components/sheet/ConditionsPanel.tsx
import {cn, resolveLabel} from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import type { Condition } from '@/types'

type Props = {
    // все доступные условия из rules_schema
    conditions:       Condition[]
    // активные id из sheet_data["conditions"]
    activeIds:        string[]
    canToggle:        boolean
    onToggle:         (id: string, active: boolean) => void
}

export function ConditionsPanel({ conditions, activeIds, canToggle, onToggle }: Props) {
    const { t } = useTranslation()

    if (conditions.length === 0) return null

    return (
        <div className={cn(
            'rounded-xl border border-border/50 bg-card p-4',
            'flex flex-col gap-3',
        )}>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                {t('character_page.conditions.title')}
            </span>

            <div className="flex flex-wrap gap-2">
                {conditions.map(condition => {
                    const isActive = activeIds.includes(condition.id)

                    return (
                        <ConditionChip
                            key={condition.id}
                            condition={condition}
                            isActive={isActive}
                            canToggle={canToggle}
                            onToggle={onToggle}
                        />
                    )
                })}
            </div>

            {activeIds.length === 0 && (
                <span className="text-xs text-muted-foreground/50 italic">
                    {t('character_page.conditions.empty')}
                </span>
            )}
        </div>
    )
}

// ── Chip ──────────────────────────────────────────────────────────────────────

type ChipProps = {
    condition: Condition
    isActive:  boolean
    canToggle: boolean
    onToggle:  (id: string, active: boolean) => void
}

function ConditionChip({ condition, isActive, canToggle, onToggle }: ChipProps) {
    const { t, i18n } = useTranslation()

    // Цвет берём из description если там есть hex/color-hint,
    // иначе дефолтный accent. Пока просто оранжевый для активных.
    return (
        <div className="relative group/chip">
            <button
                disabled={!canToggle}
                onClick={() => onToggle(condition.id, !isActive)}
                title={resolveLabel(condition.label, i18n.language)}
                className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                    isActive
                        ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                        : 'bg-secondary border-border text-muted-foreground',
                    canToggle && 'hover:border-orange-500/40 hover:text-orange-300 cursor-pointer',
                    !canToggle && 'cursor-default',
                )}
            >
                {resolveLabel(condition.label, i18n.language)}
            </button>

            {/* tooltip с описанием и подсказкой действия */}
            {condition.description && (
                <div className={cn(
                    'absolute bottom-full left-0 mb-1.5 z-10',
                    'w-48 p-2 rounded-lg text-[11px]',
                    'bg-popover border border-border shadow-lg',
                    'hidden group-hover/chip:block pointer-events-none',
                )}>
                    <p className="text-foreground mb-1">
                        {resolveLabel(condition.description, i18n.language)}
                    </p>
                    {canToggle && (
                        <p className="text-muted-foreground/60 italic">
                            {isActive
                                ? t('character_page.conditions.toggle_off')
                                : t('character_page.conditions.toggle_on')}
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}