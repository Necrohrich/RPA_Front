// src/components/wizard/steps/StandardArrayStep.tsx
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import type { WizardStep, StageInput } from '@/types'

type Props = {
    step:      WizardStep
    isPending: boolean
    onSubmit:  (stepId: string, payload: StageInput) => Promise<unknown>
    localDraft?: Record<string, number>
}

export function StandardArrayStep({ step, isPending, onSubmit, localDraft = {} }: Props) {
    const { t } = useTranslation()
    const values  = step.standard_array_values ?? []
    const targets = step.standard_array_targets ?? []

    // assignments: { field → value | null }
    const [assignments, setAssignments] = useState<Record<string, number | null>>(
        Object.fromEntries(
            targets.map(t => [t, localDraft[t] ?? null])
        )
    )

    // какие значения уже назначены
    const usedValues = new Set(Object.values(assignments).filter(v => v !== null))
    const availableValues = values.filter(v => !usedValues.has(v))

    const assign = (field: string, value: number) => {
        setAssignments(prev => {
            // если это значение было у другого поля — сбрасываем его
            const cleared = Object.fromEntries(
                Object.entries(prev).map(([k, v]) => [k, v === value ? null : v])
            )
            return { ...cleared, [field]: value }
        })
    }

    const clear = (field: string) =>
        setAssignments(prev => ({ ...prev, [field]: null }))

    const allAssigned = targets.every(t => assignments[t] !== null)

    const handleSubmit = () => {
        const payload = Object.fromEntries(
            Object.entries(assignments).filter(([, v]) => v !== null)
        ) as Record<string, number>
        void onSubmit(step.id, { array_assignments: payload })
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Доступные значения */}
            <div className="flex flex-col gap-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {t('wizard.available_values')}
                </p>
                <div className="flex flex-wrap gap-2">
                    {values.map(v => (
                        <span
                            key={v}
                            className={cn(
                                'px-3 py-1 rounded-lg border text-sm font-mono tabular-nums',
                                usedValues.has(v)
                                    ? 'border-border/30 text-muted-foreground/30 bg-secondary/20'
                                    : 'border-brand/40 text-brand bg-brand/5',
                            )}
                        >
                            {v}
                        </span>
                    ))}
                </div>
            </div>

            {/* Поля для назначения */}
            <div className="flex flex-col gap-2">
                {targets.map(field => (
                    <div
                        key={field}
                        className="flex items-center justify-between gap-4 px-4 py-3
                                   rounded-lg bg-secondary/30 border border-border/40"
                    >
                        <span className="text-sm text-foreground capitalize min-w-[120px]">
                            {field.replace(/_/g, ' ')}
                        </span>

                        <div className="flex items-center gap-2">
                            {/* select из доступных значений */}
                            <select
                                value={assignments[field] ?? ''}
                                onChange={e => {
                                    const val = Number(e.target.value)
                                    if (!e.target.value) clear(field)
                                    else assign(field, val)
                                }}
                                disabled={isPending}
                                className={cn(
                                    'bg-secondary border border-border rounded-lg px-3 py-1.5',
                                    'text-sm text-foreground focus:outline-none focus:border-brand',
                                    'disabled:opacity-50',
                                )}
                            >
                                <option value="">—</option>
                                {/* показываем доступные + текущее значение поля */}
                                {[
                                    ...availableValues,
                                    ...(assignments[field] != null ? [assignments[field]!] : []),
                                ]
                                    .sort((a, b) => b - a)
                                    .map(v => (
                                        <option key={v} value={v}>{v}</option>
                                    ))}
                            </select>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={handleSubmit}
                disabled={isPending || !allAssigned}
                className={cn(
                    'self-start px-5 py-2 rounded-lg text-sm font-medium transition-colors',
                    'bg-brand text-white hover:bg-brand/80',
                    (isPending || !allAssigned) && 'opacity-50 cursor-not-allowed',
                )}
            >
                {t('wizard.apply')}
            </button>
        </div>
    )
}