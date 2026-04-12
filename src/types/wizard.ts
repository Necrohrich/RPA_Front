// src/types/wizard.ts

// ── Статусы шага ──────────────────────────────────────────────────────────────

export type StepStatus = 'pending' | 'completed' | 'locked'

export type StepType =
    | 'pick_option'
    | 'distribute_pool'
    | 'standard_array'
    | 'roll_and_assign'
    | 'free_text'
    | 'compute_and_assign'
    | 'confirm'

// ── Шаг wizard'а ─────────────────────────────────────────────────────────────

export type WizardStep = {
    id:       string
    label:    string
    type:     StepType
    status:   StepStatus
    required: boolean

    // pick_option
    source_options:         { id: string; label: string }[] | null

    // distribute_pool
    pool_budget:  number | null
    pool_spent:   number | null
    pool_targets: string[] | null

    // standard_array
    standard_array_values:  number[] | null
    standard_array_targets: string[] | null

    // roll_and_assign / compute_and_assign
    roll: string | null
    pool_field_limits?: Record<string, number | null>
}

// ── Ответ GET .../creation-steps / .../progression-steps ─────────────────────

export type WizardStatus = {
    steps:       WizardStep[]
    is_complete: boolean
}

// ── Ответ GET .../can-progress ────────────────────────────────────────────────

export type CanProgressResponse = {
    can:     boolean
    reason:  string | null
    current: number | null   // для pool_threshold — текущий XP
    needed:  number | null   // порог следующего уровня
}

// ── Payload для POST шага ─────────────────────────────────────────────────────

// pick_option
export type PickOptionInput = {
    option_id: string
}

// distribute_pool
export type DistributePoolInput = {
    allocations: Record<string, number>
}

// standard_array
export type StandardArrayInput = {
    array_assignments: Record<string, number>
}

// free_text / roll_and_assign
export type ValueInput = {
    value: string | number | null
}

// confirm — пустой body
export type ConfirmInput = Record<string, never>

// Union для типизации в хуке
export type StageInput =
    | PickOptionInput
    | DistributePoolInput
    | StandardArrayInput
    | ValueInput
    | ConfirmInput