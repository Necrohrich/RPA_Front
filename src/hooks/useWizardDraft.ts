// src/hooks/useWizardDraft.ts
import { useState, useEffect } from 'react'
import type { StageInput } from '@/types'

// чистая функция — переиспользуется в useEffect и в updateDraft
export function applyPayloadToDraft(
    prev: Record<string, number>,
    payload: StageInput,
): Record<string, number> {
    const next = { ...prev }

    if ('array_assignments' in payload && payload.array_assignments) {
        Object.assign(next, payload.array_assignments)
    }

    if ('allocations' in payload && payload.allocations) {
        const isRevoke = Object.values(payload.allocations).every(v => v === 0)
        if (!isRevoke) {
            for (const [k, v] of Object.entries(payload.allocations)) {
                next[k] = (prev[k] ?? 0) + v
            }
        }
    }

    return next
}

export function useWizardDraft(sheetRaw?: Record<string, unknown>) {
    const [localDraft, setLocalDraft] = useState<Record<string, number>>({})

    // инициализируем числовыми полями из sheet.raw когда данные пришли
    // для progression — чтобы distribute_pool показывал текущие значения
    // для creation — sheetRaw не передаётся, эффект не сработает
    useEffect(() => {
        if (!sheetRaw) return
        const numericFields = Object.fromEntries(
            Object.entries(sheetRaw)
                .filter(([, v]) => typeof v === 'number')
                .map(([k, v]) => [k, v as number])
        )
        setLocalDraft(numericFields)
    }, [sheetRaw])

    const updateDraft = (payload: StageInput) => {
        setLocalDraft(prev => applyPayloadToDraft(prev, payload))
    }

    return { localDraft, updateDraft }
}