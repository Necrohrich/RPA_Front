// src/components/wizard/steps/RollAndAssignStep.tsx
import { useState } from 'react'
import { Dices, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { useRoll } from '@/hooks/useSheet'
import type { WizardStep, StageInput } from '@/types'

type Props = {
    step:        WizardStep
    characterId: string
    isPending:   boolean
    onSubmit:    (stepId: string, payload: StageInput) => Promise<unknown>
}

export function RollAndAssignStep({ step, characterId, isPending, onSubmit }: Props) {
    const { t }        = useTranslation()
    const rollMutation = useRoll(characterId)

    const [rollResult, setRollResult] = useState<number | null>(null)
    const [accepted,   setAccepted]   = useState(false)

    // текущее значение поля из localDraft (если шаг уже пройден в этой сессии)
    // или просто показываем статус completed
    const isCompleted = step.status === 'completed'

    const handleRoll = async () => {
        if (!step.roll) return
        const result = await rollMutation.mutateAsync({ rollId: step.roll })
        setRollResult(result.total)
        setAccepted(false)
    }

    const handleAccept = async () => {
        if (rollResult === null) return
        await onSubmit(step.id, { value: rollResult })
        setAccepted(true)
    }

    const isRolling = rollMutation.isPending

    return (
        <div className="flex flex-col items-start gap-6">
            {/* Статус завершённости */}
            {isCompleted && !rollResult && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg
                                bg-brand/5 border border-brand/20 text-brand text-sm">
                    <CheckCircle2 size={14} />
                    {t('wizard.roll_already_accepted')}
                </div>
            )}

            {/* Бросок */}
            <div className="flex items-center gap-4">
                <button
                    onClick={handleRoll}
                    disabled={isRolling || isPending || accepted}
                    className={cn(
                        'flex items-center gap-2 px-5 py-2.5 rounded-lg border-2',
                        'text-sm font-medium transition-all',
                        'border-brand/60 bg-brand/5 text-brand',
                        'hover:border-brand hover:bg-brand/10',
                        (isRolling || isPending || accepted) && 'opacity-50 cursor-not-allowed',
                    )}
                >
                    <Dices size={16} />
                    {isRolling ? t('wizard.rolling') : t('wizard.roll')}
                </button>

                {rollResult !== null && (
                    <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold tabular-nums text-brand">
                            {rollResult}
                        </span>
                        {rollMutation.data?.breakdown && (
                            <span className="text-xs text-muted-foreground">
                                {rollMutation.data.breakdown}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Принять результат */}
            {rollResult !== null && !accepted && (
                <button
                    onClick={handleAccept}
                    disabled={isPending}
                    className={cn(
                        'px-5 py-2 rounded-lg text-sm font-medium transition-colors',
                        'bg-brand text-white hover:bg-brand/80',
                        isPending && 'opacity-50 cursor-not-allowed',
                    )}
                >
                    {t('wizard.accept_roll', { value: rollResult })}
                </button>
            )}

            {/* Результат принят */}
            {accepted && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg
                                bg-brand/5 border border-brand/20 text-brand text-sm">
                    <CheckCircle2 size={14} />
                    {t('wizard.roll_accepted', { value: rollResult })}
                </div>
            )}
        </div>
    )
}