// src/pages/ProgressionPage.tsx
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useProgressionSteps, useApplyProgressionStep, useCanProgress } from '@/hooks/useWizard'
import { WizardLayout } from '@/components/layout'
import { WizardStepContent } from '@/components/wizard/WizardStepContent'
import { WizardSkeleton } from '@/components/wizard'
import { useSheet } from '@/hooks/useSheet'
import { useWizardDraft } from '@/hooks/useWizardDraft'
import type { StageInput } from '@/types'

export function ProgressionPage() {
    const { id }   = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { t }    = useTranslation()

    const canProgressQ  = useCanProgress(id!)
    const stepsQ        = useProgressionSteps(id!)
    const applyMutation = useApplyProgressionStep(id!)
    const sheetQ        = useSheet(id!)

    // передаём raw в хук — он сам инициализирует localDraft числовыми полями
    const { localDraft, updateDraft } = useWizardDraft(sheetQ.data?.raw)

    const steps      = stepsQ.data?.steps ?? []
    const isComplete = stepsQ.data?.is_complete ?? false

    const [activeStepId, setActiveStepId] = useState('')
    const effectiveActiveId = activeStepId || steps[0]?.id || ''
    const activeStep = steps.find(s => s.id === effectiveActiveId)

    const handleSubmit = async (stepId: string, payload: StageInput) => {
        const result = await applyMutation.mutateAsync({ stepId, payload })
        updateDraft(payload)
        if (stepId === 'confirm') {
            toast.success(t('wizard.progression_complete'))
            navigate(`/dashboard/characters/${id}`)
        }
        return result
    }

    if (canProgressQ.data && !canProgressQ.data.can) {
        return (
            <ProgressionLockedScreen
                reason={canProgressQ.data.reason}
                onBack={() => navigate(`/dashboard/characters/${id}`)}
            />
        )
    }

    if (stepsQ.isLoading || canProgressQ.isLoading || sheetQ.isLoading) return <WizardSkeleton />

    return (
        <WizardLayout
            title={t('wizard.progression_title')}
            steps={steps}
            activeStepId={effectiveActiveId}
            onSelectStep={setActiveStepId}
            onBack={() => navigate(`/dashboard/characters/${id}`)}
        >
            {activeStep && (
                <WizardStepContent
                    step={activeStep}
                    characterId={id!}
                    isComplete={isComplete}
                    isPending={applyMutation.isPending}
                    onSubmit={handleSubmit}
                    onNavigate={setActiveStepId}
                    steps={steps}
                    localDraft={localDraft}
                />
            )}
        </WizardLayout>
    )
}

function ProgressionLockedScreen({ reason, onBack }: { reason: string | null; onBack: () => void }) {
    const { t } = useTranslation()
    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4 text-center">
            <p className="text-muted-foreground text-sm">
                {reason ?? t('wizard.progression_locked')}
            </p>
            <button onClick={onBack} className="text-brand text-sm hover:underline">
                {t('common.back')}
            </button>
        </div>
    )
}