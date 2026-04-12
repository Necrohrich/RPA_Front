// src/components/wizard/steps/ConfirmStep.tsx
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import type { WizardStep, StageInput } from '@/types'

type Props = {
    step:        WizardStep
    steps:       WizardStep[]
    isComplete:  boolean
    isPending:   boolean
    onSubmit:    (stepId: string, payload: StageInput) => Promise<unknown>
    onNavigate:  (stepId: string) => void
}

export function ConfirmStep({ step, steps, isComplete, isPending, onSubmit, onNavigate }: Props) {
    const { t } = useTranslation()

    const nonConfirmSteps = steps.filter(s => s.type !== 'confirm')
    const incomplete = nonConfirmSteps.filter(s => s.required && s.status !== 'completed')

    return (
        <div className="flex flex-col gap-6 max-w-lg">
            {/* Сводка шагов */}
            <div className="flex flex-col gap-2">
                {nonConfirmSteps.map(s => (
                    <button
                        key={s.id}
                        onClick={() => s.status !== 'completed' && onNavigate(s.id)}
                        className={cn(
                            'flex items-center gap-3 px-4 py-2.5 rounded-lg border text-left',
                            'transition-colors text-sm',
                            s.status === 'completed'
                                ? 'border-brand/30 bg-brand/5 text-foreground'
                                : s.required
                                    ? 'border-destructive/40 bg-destructive/5 text-destructive hover:bg-destructive/10'
                                    : 'border-border/40 bg-secondary/20 text-muted-foreground hover:bg-secondary/40',
                        )}
                    >
                        {s.status === 'completed'
                            ? <CheckCircle2 size={14} className="text-brand shrink-0" />
                            : <AlertCircle  size={14} className={cn('shrink-0', s.required ? 'text-destructive' : 'text-muted-foreground/50')} />
                        }
                        <span className="flex-1">{s.label}</span>
                        {!s.required && (
                            <span className="text-[10px] text-muted-foreground/50">
                                {t('wizard.optional')}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Кнопка завершить */}
            <button
                onClick={() => onSubmit(step.id, {})}
                disabled={isPending || !isComplete}
                className={cn(
                    'px-6 py-3 rounded-xl text-sm font-semibold transition-all',
                    'bg-brand text-white hover:bg-brand/80',
                    (!isComplete || isPending) && 'opacity-50 cursor-not-allowed',
                )}
            >
                {isPending ? t('wizard.finishing') : t('wizard.finish')}
            </button>

            {!isComplete && incomplete.length > 0 && (
                <p className="text-xs text-muted-foreground">
                    {t('wizard.incomplete_hint', { count: incomplete.length })}
                </p>
            )}
        </div>
    )
}