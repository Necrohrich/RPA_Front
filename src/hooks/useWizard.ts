// src/hooks/useWizard.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { apiClient } from '@/api/client'
import type { WizardStatus, CanProgressResponse, StageInput } from '@/types'

// ── API ───────────────────────────────────────────────────────────────────────

const wizardApi = {
    // Creation
    creationSteps: (characterId: string, lang: string) =>
        apiClient
            .get<WizardStatus>(`/characters/${characterId}/creation-steps`, { params: { lang } })
            .then(r => r.data),

    applyCreationStep: (characterId: string, stepId: string, payload: StageInput) =>
        apiClient
            .post<WizardStatus>(`/characters/${characterId}/creation-steps/${stepId}`, payload)
            .then(r => r.data),

    // Progression
    canProgress: (characterId: string) =>
        apiClient
            .get<CanProgressResponse>(`/characters/${characterId}/can-progress`)
            .then(r => r.data),

    progressionSteps: (characterId: string, lang: string) =>
        apiClient
            .get<WizardStatus>(`/characters/${characterId}/progression-steps`, { params: { lang } })
            .then(r => r.data),

    applyProgressionStep: (characterId: string, stepId: string, payload: StageInput) =>
        apiClient
            .post<WizardStatus>(`/characters/${characterId}/progression/${stepId}`, payload)
            .then(r => r.data),
}

// ── Query keys ────────────────────────────────────────────────────────────────

export const wizardKeys = {
    creation:    (id: string) => ['character', id, 'creation'] as const,
    progression: (id: string) => ['character', id, 'progression'] as const,
    canProgress: (id: string) => ['character', id, 'can-progress'] as const,
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export const useCreationSteps = (characterId: string) => {
    const { i18n } = useTranslation()
    const lang = i18n.language.split('-')[0]
    return useQuery({
        queryKey: [...wizardKeys.creation(characterId), lang],
        queryFn:  () => wizardApi.creationSteps(characterId, lang),
        enabled:  !!characterId,
    })
}

export const useApplyCreationStep = (characterId: string) => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ stepId, payload }: { stepId: string; payload: StageInput }) =>
            wizardApi.applyCreationStep(characterId, stepId, payload),
        onSuccess: async (updatedStatus) => {
            // сервер вернул свежий WizardStatus — кладём прямо в кеш без рефетча
            // lang не знаем здесь точно, поэтому инвалидируем по префиксу
            qc.setQueriesData(
                { queryKey: wizardKeys.creation(characterId) },
                updatedStatus,
            )
            // confirm завершает wizard — инвалидируем анкету и детали персонажа
            if (updatedStatus.is_complete) {
                await qc.invalidateQueries({ queryKey: ['character', characterId] })
            }
        },
    })
}

export const useCanProgress = (characterId: string) =>
    useQuery({
        queryKey: wizardKeys.canProgress(characterId),
        queryFn:  () => wizardApi.canProgress(characterId),
        enabled:  !!characterId,
    })

export const useProgressionSteps = (characterId: string) => {
    const { i18n } = useTranslation()
    const lang = i18n.language.split('-')[0]
    return useQuery({
        queryKey: [...wizardKeys.progression(characterId), lang],
        queryFn:  () => wizardApi.progressionSteps(characterId, lang),
        enabled:  !!characterId,
    })
}

export const useApplyProgressionStep = (characterId: string) => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ stepId, payload }: { stepId: string; payload: StageInput }) =>
            wizardApi.applyProgressionStep(characterId, stepId, payload),
        onSuccess: async (updatedStatus) => {
            qc.setQueriesData(
                { queryKey: wizardKeys.progression(characterId) },
                updatedStatus,
            )
            if (updatedStatus.is_complete) {
                // confirm прокачки инкрементирует level и обновляет sheet_data
                await qc.invalidateQueries({ queryKey: ['character', characterId] })
                // can-progress сбрасывается — GM должен снова выдать уровень
                await qc.invalidateQueries({ queryKey: wizardKeys.canProgress(characterId) })
            }
        },
    })
}