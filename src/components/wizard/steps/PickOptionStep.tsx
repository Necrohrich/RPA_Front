// src/components/wizard/steps/PickOptionStep.tsx
import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import type { WizardStep, StageInput } from '@/types'

type Props = {
    step:      WizardStep
    isPending: boolean
    onSubmit:  (stepId: string, payload: StageInput) => Promise<unknown>
}

export function PickOptionStep({ step, isPending, onSubmit }: Props) {
    const { t } = useTranslation()
    const options = step.source_options ?? []

    // если шаг уже completed — пытаемся определить выбранную опцию
    // сервер не возвращает текущее значение из draft, поэтому храним локально
    const [selected, setSelected] = useState<string | null>(null)

    const handlePick = async (optionId: string) => {
        if (isPending) return
        setSelected(optionId)
        await onSubmit(step.id, { option_id: optionId })
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {options.map(opt => {
                const isSelected = selected === opt.id ||
                    (step.status === 'completed' && selected === null && options.length === 1)

                return (
                    <button
                        key={opt.id}
                        onClick={() => handlePick(opt.id)}
                        disabled={isPending}
                        className={cn(
                            'relative flex flex-col items-start gap-1 p-4 rounded-xl border-2',
                            'text-left transition-all duration-150',
                            isSelected
                                ? 'border-brand bg-brand/5 text-foreground'
                                : 'border-border bg-secondary/30 text-muted-foreground',
                            'hover:border-brand/50 hover:text-foreground',
                            isPending && 'opacity-50 cursor-not-allowed',
                        )}
                    >
                        {isSelected && (
                            <CheckCircle2
                                size={14}
                                className="absolute top-3 right-3 text-brand shrink-0"
                            />
                        )}
                        <span className="text-sm font-medium">{opt.label}</span>
                    </button>
                )
            })}

            {options.length === 0 && (
                <p className="text-sm text-muted-foreground col-span-full">
                    {t('wizard.no_options')}
                </p>
            )}
        </div>
    )
}