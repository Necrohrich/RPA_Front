// src/components/wizard/WizardStepContent.tsx
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WizardStep, StageInput } from '@/types'
import { PickOptionStep }       from './steps/PickOptionStep'
import { DistributePoolStep }   from './steps/DistributePoolStep'
import { StandardArrayStep }    from './steps/StandardArrayStep'
import { RollAndAssignStep }    from './steps/RollAndAssignStep'
import { FreeTextStep }         from './steps/FreeTextStep'
import { ComputeAndAssignStep } from './steps/ComputeAndAssignStep'
import { ConfirmStep }          from './steps/ConfirmStep'

type Props = {
    step:        WizardStep
    characterId: string
    steps:       WizardStep[]
    isComplete:  boolean
    isPending:   boolean
    onSubmit:    (stepId: string, payload: StageInput) => Promise<unknown>
    onNavigate:  (stepId: string) => void
    localDraft?: Record<string, number>
}

export function WizardStepContent({
                                      step,
                                      characterId,
                                      steps,
                                      isComplete,
                                      isPending,
                                      onSubmit,
                                      onNavigate,
                                      localDraft
                                  }: Props) {
    const { t } = useTranslation()

    // индекс текущего шага для Prev/Next навигации
    const currentIndex = steps.findIndex(s => s.id === step.id)
    const prevStep = steps[currentIndex - 1] ?? null
    const nextStep = steps[currentIndex + 1] ?? null

    const stepProps = { step, isPending, onSubmit }

    return (
        <div className="flex flex-col h-full">
            {/* Контент шага */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
                {/* Заголовок шага */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-foreground">{step.label}</h2>
                    {!step.required && (
                        <span className="text-xs text-muted-foreground">
                            {t('wizard.optional_step')}
                        </span>
                    )}
                </div>

                {/* Рендер по типу */}
                <div key={step.id}>
                    {step.type === 'pick_option'        && <PickOptionStep       {...stepProps} />}
                    {step.type === 'distribute_pool' && (
                        <DistributePoolStep
                            step={step}
                            characterId={characterId}
                            isPending={isPending}
                            onSubmit={onSubmit}
                            localDraft={localDraft}
                        />
                    )}
                    {step.type === 'standard_array' && (
                        <StandardArrayStep
                            step={step}
                            isPending={isPending}
                            onSubmit={onSubmit}
                            localDraft={localDraft}
                        />
                    )}
                    {step.type === 'roll_and_assign'    && <RollAndAssignStep    {...stepProps} characterId={characterId} />}
                    {step.type === 'free_text'          && <FreeTextStep         {...stepProps} />}
                    {step.type === 'compute_and_assign' && <ComputeAndAssignStep {...stepProps} />}
                    {step.type === 'confirm'            && (
                        <ConfirmStep
                            step={step}
                            steps={steps}
                            isComplete={isComplete}
                            isPending={isPending}
                            onSubmit={onSubmit}
                            onNavigate={onNavigate}
                        />
                    )}
                </div>
            </div>

            {/* Footer: Prev / Next */}
            {step.type !== 'confirm' && (
                <footer className="shrink-0 flex items-center justify-between px-8 py-4
                                   border-t border-border/40 bg-card/40">
                    <button
                        onClick={() => prevStep && onNavigate(prevStep.id)}
                        disabled={!prevStep}
                        className={cn(
                            'flex items-center gap-1.5 text-sm transition-colors',
                            prevStep
                                ? 'text-muted-foreground hover:text-foreground'
                                : 'text-muted-foreground/30 cursor-not-allowed',
                        )}
                    >
                        <ChevronLeft size={15} />
                        {prevStep?.label ?? t('wizard.prev')}
                    </button>

                    <button
                        onClick={() => nextStep && onNavigate(nextStep.id)}
                        disabled={!nextStep}
                        className={cn(
                            'flex items-center gap-1.5 text-sm transition-colors',
                            nextStep
                                ? 'text-muted-foreground hover:text-foreground'
                                : 'text-muted-foreground/30 cursor-not-allowed',
                        )}
                    >
                        {nextStep?.label ?? t('wizard.next')}
                        <ChevronRight size={15} />
                    </button>
                </footer>
            )}
        </div>
    )
}