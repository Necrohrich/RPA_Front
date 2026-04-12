// src/pages/CreationPage.tsx
import { useState} from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useCreationSteps, useApplyCreationStep } from '@/hooks/useWizard'
import { WizardLayout } from '@/components/layout'
import { WizardStepContent } from '@/components/wizard/WizardStepContent'
import type {StageInput} from "@/types";
import {useWizardDraft} from "@/hooks/useWizardDraft.ts";
import {WizardSkeleton} from "@/components/wizard";

export function CreationPage() {
    const { id }   = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { t }    = useTranslation()

    const stepsQ        = useCreationSteps(id!)
    const applyMutation = useApplyCreationStep(id!)

    const steps      = stepsQ.data?.steps ?? []
    const isComplete = stepsQ.data?.is_complete ?? false

    const [activeStepId, setActiveStepId] = useState('')
    const { localDraft, updateDraft } = useWizardDraft()
    const effectiveActiveId = activeStepId || steps[0]?.id || ''
    const activeStep = steps.find(s => s.id === effectiveActiveId)

    const handleSubmit = async (stepId: string, payload: StageInput) => {
        const result = await applyMutation.mutateAsync({ stepId, payload })
        updateDraft(payload)
        if (stepId === 'confirm') {
            toast.success(t('wizard.creation_complete'))  // или progression_complete
            navigate(`/dashboard/characters/${id}`)
        }
        return result
    }

    if (stepsQ.isLoading) return <WizardSkeleton />

    return (
        <WizardLayout
            title={t('wizard.creation_title')}
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