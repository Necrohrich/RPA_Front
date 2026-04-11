// src/hooks/useSheet.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { apiClient } from '@/api/client'
import type {
    CharacterDetail,
    SheetResponse,
    UpdateSheetPayload,
    CustomPoolItem,
    RollResult,
    GameSystemDetail, ActionResult,
} from '@/types'

// ── API ───────────────────────────────────────────────────────────────────────

const sheetApi = {
    character: (id: string) =>
        apiClient
            .get<CharacterDetail>(`/characters/${id}`)
            .then(r => r.data),

    schema: (id: string) =>
        apiClient
            .get<GameSystemDetail>(`/characters/${id}/schema`)
            .then(r => r.data),

    sheet: (id: string, lang: string) =>
        apiClient
            .get<SheetResponse>(`/characters/${id}/sheet`, { params: { lang } })
            .then(r => r.data),

    updateSheet: (id: string, payload: UpdateSheetPayload) =>
        apiClient
            .patch<SheetResponse>(`/characters/${id}/sheet`, payload)
            .then(r => r.data),

    customItems: (id: string) =>
        apiClient
            .get<CustomPoolItem[]>(`/characters/${id}/custom`)
            .then(r => r.data),

    roll: (id: string, rollId: string, params: Record<string, unknown> = {}) =>
        apiClient
            .post<RollResult>(`/characters/${id}/roll`, { roll_id: rollId, params })
            .then(r => r.data),

    copy: (id: string) =>
        apiClient
            .post<CharacterDetail>(`/characters/${id}/copy`)
            .then(r => r.data),

    applyAction: (characterId: string, actionId: string, params: Record<string, unknown> = {}, diceMode?: string) =>
        apiClient
            .post<ActionResult>(`/characters/${characterId}/actions/${actionId}`, {
                params,
                dice_mode: diceMode ?? null,
            })
            .then(r => r.data),
}

// ── Query keys ────────────────────────────────────────────────────────────────

export const sheetKeys = {
    all:         (id: string) => ['character', id] as const,
    detail:      (id: string) => ['character', id, 'detail'] as const,
    schema:      (id: string) => ['character', id, 'schema'] as const,
    sheet:       (id: string) => ['character', id, 'sheet'] as const,
    customItems: (id: string) => ['character', id, 'custom'] as const,
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export const useCharacterDetail = (id: string) =>
    useQuery({
        queryKey: sheetKeys.detail(id),
        queryFn:  () => sheetApi.character(id),
        enabled:  !!id,
    })

export const useCharacterSchema = (id: string, enabled = true) =>
    useQuery({
        queryKey: sheetKeys.schema(id),
        queryFn:  () => sheetApi.schema(id),
        enabled:  !!id && enabled,
        // схема меняется редко — кешируем на 10 минут
        staleTime: 10 * 60 * 1000,
    })

export const useSheet = (id: string) => {
    const { i18n } = useTranslation()
    return useQuery({
        queryKey: [...sheetKeys.sheet(id), i18n.language],
        queryFn:  () => sheetApi.sheet(id, i18n.language),
        enabled:  !!id,
    })
}

export const useUpdateSheet = (characterId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (payload: UpdateSheetPayload) =>
            sheetApi.updateSheet(characterId, payload),
        onSuccess: (updatedSheet) => {
            // сервер вернул свежий SheetResponseDTO — кладём прямо в кеш,
            // не делая лишний GET
            queryClient.setQueryData(sheetKeys.sheet(characterId), updatedSheet)
        },
    })
}

export const useCustomPoolItems = (characterId: string, enabled = true) =>
    useQuery({
        queryKey: sheetKeys.customItems(characterId),
        queryFn:  () => sheetApi.customItems(characterId),
        enabled:  !!characterId && enabled,
    })

export const useRoll = (characterId: string) => {
    // roll не мутирует кеш анкеты напрямую — результат показываем в UI локально.
    // Если roll имеет effect (action) — updateSheet инвалидирует sheet сам.
    return useMutation({
        mutationFn: ({
                         rollId,
                         params,
                     }: {
            rollId: string
            params?: Record<string, unknown>
        }) => sheetApi.roll(characterId, rollId, params),
    })
}

export const useCopyCharacter = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (characterId: string) => sheetApi.copy(characterId),
        onSuccess: async () => {
            // инвалидируем список персонажей чтобы копия появилась на /characters
            await queryClient.invalidateQueries({ queryKey: ['characters'] })
        },
    })
}

export const useApplyAction = (characterId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({
                         actionId,
                         params,
                         diceMode,
                     }: {
            actionId:  string
            params?:   Record<string, unknown>
            diceMode?: string
        }) => sheetApi.applyAction(characterId, actionId, params, diceMode),
        onSuccess: async (result) => {
            // если action потратил ресурс или применил effect — обновляем анкету
            if (result.resource_spent || result.roll_result?.success) {
                await queryClient.invalidateQueries({ queryKey: sheetKeys.sheet(characterId) })
            }
        },
    })
}