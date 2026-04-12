// src/components/wizard/steps/FreeTextStep.tsx
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import type { WizardStep, StageInput } from '@/types'

type Props = {
    step:      WizardStep
    isPending: boolean
    onSubmit:  (stepId: string, payload: StageInput) => Promise<unknown>
}

export function FreeTextStep({ step, isPending, onSubmit }: Props) {
    const { t }  = useTranslation()
    const [text, setText] = useState('')

    const handleSubmit = () => {
        if (!step.required && !text.trim()) {
            void onSubmit(step.id, { value: null })
            return
        }
        void onSubmit(step.id, { value: text })
    }

    return (
        <div className="flex flex-col gap-4">
            <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                disabled={isPending}
                rows={5}
                placeholder={step.required ? t('wizard.required_field') : t('wizard.optional_field')}
                className={cn(
                    'w-full max-w-xl bg-secondary border border-border rounded-lg px-4 py-3',
                    'text-sm text-foreground placeholder:text-muted-foreground/50',
                    'focus:outline-none focus:border-brand resize-none',
                    'disabled:opacity-50',
                )}
            />

            <button
                onClick={handleSubmit}
                disabled={isPending || (step.required && !text.trim())}
                className={cn(
                    'self-start px-5 py-2 rounded-lg text-sm font-medium transition-colors',
                    'bg-brand text-white hover:bg-brand/80',
                    (isPending || (step.required && !text.trim())) && 'opacity-50 cursor-not-allowed',
                )}
            >
                {t('wizard.apply')}
            </button>
        </div>
    )
}