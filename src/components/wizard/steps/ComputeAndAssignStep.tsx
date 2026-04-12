// src/components/wizard/steps/ComputeAndAssignStep.tsx
// Движок считает сам — пользователь просто подтверждает
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import type { WizardStep, StageInput } from '@/types'

type Props = {
    step:      WizardStep
    isPending: boolean
    onSubmit:  (stepId: string, payload: StageInput) => Promise<unknown>
}

export function ComputeAndAssignStep({ step, isPending, onSubmit }: Props) {
    const { t } = useTranslation()

    return (
        <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground max-w-md">
                {t('wizard.compute_description')}
            </p>

            <button
                onClick={() => onSubmit(step.id, {})}
                disabled={isPending}
                className={cn(
                    'self-start px-5 py-2 rounded-lg text-sm font-medium transition-colors',
                    'bg-brand text-white hover:bg-brand/80',
                    isPending && 'opacity-50 cursor-not-allowed',
                )}
            >
                {isPending ? t('wizard.applying') : t('wizard.apply')}
            </button>
        </div>
    )
}