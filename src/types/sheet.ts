// src/types/sheet.ts

// ── Поля анкеты ───────────────────────────────────────────────────────────────

export type FieldType =
    | 'integer'
    | 'number'
    | 'text'
    | 'textarea'
    | 'boolean'
    | 'select'
    | 'multiselect'
    | 'dice'
    | 'computed'
    | 'resource'
    | 'skill'
    | 'list'

export type FieldDisplay = {
    size?:      'small' | 'normal' | 'large'
    color?:     string
    hint?:      string
    icon?:      string
    collapsed?: boolean
}

export type SectionDisplay = {
    collapsed?: boolean
    icon?:      string
    color?:     string
}

// Дескриптор поля внутри list-типа (item_schema)
export type ItemSchemaField = {
    id:        string
    label:     LocalizedString
    type:      FieldType
    required?: boolean
    options?:  string[]
}

export type RenderedField = {
    id:          string
    label:       string
    type:        FieldType
    value:       unknown
    max_value?:  number | null
    options?:    string[]
    display?:    FieldDisplay
    readonly?:   boolean
    // для list-полей
    items?:      Record<string, unknown>[]
    item_schema?: ItemSchemaField[]
}

export type RenderedSection = {
    id:       string
    label:    string
    fields:   RenderedField[]
    display?: SectionDisplay
}

export type SheetResponse = {
    sections:    RenderedSection[]
    raw:         Record<string, unknown>
    can_edit:    boolean
    can_progress: boolean
    can_roll:    boolean
    is_gm:        boolean
    version_mismatch: boolean
    schema_version:   string | null
}

// ── Персонаж ──────────────────────────────────────────────────────────────────

export type CharacterAuthor = {
    id:       string
    username: string
    avatar?:  string | null
}

export type CharacterDetail = {
    id:              string
    name:            string
    avatar:          string | null
    game_system_id:  string | null
    game_system_name: string | null
    game_id:         string | null
    game_name:       string | null
    author_id:       string
    author:          CharacterAuthor | null
    sheet_data:      Record<string, unknown> | null
    schema_version:  string | null
    dice_mode:       string | null
}

// ── Система ───────────────────────────────────────────────────────────────────

export type ManifestConfig = {
    has_conditions:  boolean
    has_actions:     boolean
    has_progression: boolean
    player_can_edit_sheet: boolean
    player_can_roll: boolean
}

type LocalizedString = string | Record<string, string>

export type Condition = {
    id:           string
    label:        LocalizedString
    description?: LocalizedString
    effects?:     Record<string, unknown>
}

export type CustomPool = {
    id:               string
    label:            string
    gm_can_create_custom: boolean
    fields:           ItemSchemaField[]
}

export type RulesSchema = {
    custom_pools?: CustomPool[]
    [key: string]: unknown
}

export type ActionCost = {
    resource: string
    amount:   number
}

export type Action = {
    id:           string
    label:        LocalizedString
    description?: LocalizedString
    cost?:        ActionCost
    effects?:     Record<string, unknown>
}

export type ActionsSchema = {
    actions: Action[]
}

export type ActionResult = {
    action_id:      string
    needs_params:   boolean
    roll_id:        string | null
    roll_result:    RollResult | null
    resource_spent: Record<string, unknown> | null
}

// Публичное представление системы (без полных схем)
export type GameSystemDetail = {
    id:              string
    name:            string
    version:         string
    manifest:        ManifestConfig
    conditions:      Condition[]
    actions_schema:  ActionsSchema | null
    rules_schema:    RulesSchema   | null
}

// ── Элементы кампании (custom pools) ─────────────────────────────────────────

export type CustomPoolItem = {
    id:       string
    pool_id:  string
    label:    string
    data:     Record<string, unknown>
    assigned_character_ids: string[]
}

// ── Броски ────────────────────────────────────────────────────────────────────

export type RollResult = {
    roll_id:          string
    formula_resolved: string
    rolls:            number[]
    kept:             number[]
    total:            number
    outcome:          string | null
    success:          boolean | null
    breakdown:        string
    successes:        number | null
    botch:            boolean | null
    extra_fields:     Record<string, unknown>
}

// ── PATCH /sheet ──────────────────────────────────────────────────────────────

export type UpdateSheetPayload = {
    fields: Record<string, unknown>
}