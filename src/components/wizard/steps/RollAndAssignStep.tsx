// src/components/wizard/steps/RollAndAssignStep.tsx
// Два этапа: 1) бросить кубик через /roll, 2) отправить результат как value шага
import { useState } from 'react'
import { Dices } from 'lucide-react'
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
    const { t }  = useTranslation()
    const rollMutation = useRoll(characterId)

    const [rollResult, setRollResult] = useState<number | null>(null)

    const handleRoll = async () => {
        if (!step.roll) return
        const result = await rollMutation.mutateAsync({ rollId: step.roll })
        setRollResult(result.total)
    }

    const handleAccept = () => {
        if (rollResult === null) return
        void onSubmit(step.id, { value: rollResult })
    }

    const isRolling = rollMutation.isPending

    return (
        <div className="flex flex-col items-start gap-6">
            {/* Бросок */}
            <div className="flex items-center gap-4">
                <button
                    onClick={handleRoll}
                    disabled={isRolling || isPending}
                    className={cn(
                        'flex items-center gap-2 px-5 py-2.5 rounded-lg border-2',
                        'text-sm font-medium transition-all',
                        'border-brand/60 bg-brand/5 text-brand',
                        'hover:border-brand hover:bg-brand/10',
                        (isRolling || isPending) && 'opacity-50 cursor-not-allowed',
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
                        <span className="text-xs text-muted-foreground">
                            {rollMutation.data?.breakdown}
                        </span>
                    </div>
                )}
            </div>

            {/* Принять результат */}
            {rollResult !== null && (
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
        </div>
    )
}