// src/components/wizard/steps/DistributePoolStep.tsx
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import type { WizardStep, StageInput } from '@/types'

type Props = {
    step:        WizardStep
    characterId: string          // ← добавляем проп
    isPending:   boolean
    onSubmit:    (stepId: string, payload: StageInput) => Promise<unknown>
    localDraft?: Record<string, number>
}

export function DistributePoolStep({ step, characterId: _characterId, isPending, onSubmit, localDraft = {} }: Props) {
    const { t }   = useTranslation()
    const targets = step.pool_targets ?? []
    const budget  = step.pool_budget ?? 0

    const [allocations, setAllocations] = useState<Record<string, number>>(
        Object.fromEntries(targets.map(t => [t, 0]))
    )

    const localSpent  = Object.values(allocations).reduce((a, b) => a + b, 0)
    const serverSpent = step.pool_spent ?? 0
    const totalSpent  = serverSpent + localSpent
    const remaining   = budget - totalSpent

    const change = (field: string, delta: number) => {
        const current   = allocations[field] ?? 0
        const next      = current + delta
        const fieldMax  = step.pool_field_limits?.[field] ?? null
        const baseValue = localDraft[field] ?? 0

        if (next < 0) return
        if (delta > 0 && remaining <= 0) return
        if (delta > 0 && fieldMax != null && baseValue + next > fieldMax) return
        setAllocations(prev => ({ ...prev, [field]: next }))
    }

    const reset = () =>
        setAllocations(Object.fromEntries(targets.map(t => [t, 0])))

    const handleSubmit = async () => {
        await onSubmit(step.id, { allocations })
        reset()
    }

    const handleRevoke = async () => {
        // отправляем нули — сервер перезапишет draft[stage_id]
        const zeroAllocations = Object.fromEntries(targets.map(t => [t, 0]))
        await onSubmit(step.id, { allocations: zeroAllocations })
    }

    const hasLocalAllocations = localSpent > 0

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                {targets.map(field => {
                    // база из localDraft (standard_array или pick_option эффекты)
                    const baseValue   = localDraft[field] ?? 0
                    const localAmount = allocations[field] ?? 0
                    const resultValue = baseValue + localAmount

                    return (
                        <div
                            key={field}
                            className="flex items-center justify-between gap-4 px-4 py-3
                                       rounded-lg bg-secondary/30 border border-border/40"
                        >
                            <span className="text-sm text-foreground capitalize min-w-[120px]">
                                {field.replace(/_/g, ' ')}
                            </span>

                            <span className={cn(
                                'text-sm font-mono tabular-nums min-w-[2rem] text-center',
                                localAmount > 0 ? 'text-brand font-semibold' : 'text-muted-foreground',
                            )}>
                                {resultValue > 0 ? resultValue : '—'}
                                {localAmount > 0 && (
                                    <span className="text-xs text-brand/60 ml-1">
                                        (+{localAmount})
                                    </span>
                                )}
                            </span>

                            <Stepper
                                value={localAmount}
                                onDecrement={() => change(field, -1)}
                                onIncrement={() => change(field, +1)}
                                disableIncrement={remaining <= 0}
                                disabled={isPending}
                            />
                        </div>
                    )
                })}
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={handleSubmit}
                    disabled={isPending || !hasLocalAllocations}
                    className={cn(
                        'px-5 py-2 rounded-lg text-sm font-medium transition-colors',
                        'bg-brand text-white hover:bg-brand/80',
                        (isPending || !hasLocalAllocations) && 'opacity-50 cursor-not-allowed',
                    )}
                >
                    {t('wizard.apply')}
                </button>

                {hasLocalAllocations && (
                    <button
                        onClick={reset}
                        disabled={isPending}
                        className="px-4 py-2 rounded-lg text-sm text-muted-foreground
                                   hover:text-foreground border border-border hover:border-brand/40
                                   transition-colors disabled:opacity-50"
                    >
                        {t('wizard.reset')}
                    </button>
                )}

                {serverSpent > 0 && !hasLocalAllocations && (
                    <button
                        onClick={handleRevoke}
                        disabled={isPending}
                        className="text-xs text-muted-foreground/50 hover:text-destructive
                   transition-colors disabled:opacity-50 underline-offset-2 hover:underline"
                    >
                        {t('wizard.revoke')}
                    </button>
                )}
            </div>
        </div>
    )
}

function Stepper({ value, onDecrement, onIncrement, disableIncrement, disabled }: {
    value:            number
    onDecrement:      () => void
    onIncrement:      () => void
    disableIncrement: boolean
    disabled:         boolean
}) {
    return (
        <div className="flex items-center gap-2">
            <button
                onClick={onDecrement}
                disabled={disabled || value <= 0}
                className={cn(
                    'w-7 h-7 rounded-md border border-border flex items-center justify-center',
                    'text-sm text-muted-foreground hover:text-foreground hover:border-brand/50',
                    'transition-colors disabled:opacity-30 disabled:cursor-not-allowed',
                )}
            >−</button>

            <span className="w-8 text-center text-sm font-mono text-foreground tabular-nums">
                {value}
            </span>

            <button
                onClick={onIncrement}
                disabled={disabled || disableIncrement}
                className={cn(
                    'w-7 h-7 rounded-md border border-border flex items-center justify-center',
                    'text-sm text-muted-foreground hover:text-foreground hover:border-brand/50',
                    'transition-colors disabled:opacity-30 disabled:cursor-not-allowed',
                )}
            >+</button>
        </div>
    )
}