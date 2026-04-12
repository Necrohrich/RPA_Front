// src/hooks/useWizardDraft.ts
import { useState } from 'react'
import type { StageInput } from '@/types'

export function useWizardDraft() {
    const [localDraft, setLocalDraft] = useState<Record<string, number>>({})

    const updateDraft = (payload: StageInput) => {
        if ('array_assignments' in payload && payload.array_assignments) {
            setLocalDraft(prev => ({ ...prev, ...payload.array_assignments }))
        }

        if ('allocations' in payload && payload.allocations) {
            const isRevoke = Object.values(payload.allocations).every(v => v === 0)
            if (!isRevoke) {
                setLocalDraft(prev => {
                    const next = { ...prev }
                    for (const [k, v] of Object.entries(payload.allocations!)) {
                        next[k] = (prev[k] ?? 0) + v
                    }
                    return next
                })
            }
        }
    }

    return { localDraft, updateDraft }
}