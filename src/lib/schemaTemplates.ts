// src/lib/schemaTemplates.ts
export const SCHEMA_TEMPLATES = {
    sheet_schema: {
        sections: [
            {
                id: 'attributes',
                label: 'Атрибуты',
                fields: [
                    {
                        id: 'strength',
                        label: 'Сила',
                        type: 'number',
                        default: 10,
                        min: 1,
                        max: 20,
                    },
                ],
            },
        ],
    },

    rolls_schema: {
        ability_check: {
            label: 'Проверка характеристики',
            formula: '1d20 + {modifier}',
            params: [
                { id: 'modifier', label: 'Модификатор', type: 'number', default: 0 },
            ],
            dice_rules: {},
            result: {
                type: 'compare',
                outcomes: [
                    { condition: 'total >= target', label: 'Успех' },
                    { condition: 'total < target', label: 'Провал' },
                ],
            },
        },
    },

    rules_schema: {
        manifest: {
            has_sheet: true,
            has_rolls: true,
            has_creation: false,
            has_progression: false,
            has_actions: false,
        },
        permissions: {
            player_can_edit_sheet: false,
            player_can_roll: true,
            player_can_add_items: true,
            player_can_remove_items: false,
            gm_can_edit_player_sheet: true,
            gm_can_create_custom: true,
            locked_fields: [],
            public_fields: [],
        },
        conditions: [],
        item_types: [],
    },

    actions_schema: {
        actions: [
            {
                id: 'attack',
                label: 'Атака',
                trigger_roll: 'ability_check',  // ← было roll_id, правильно trigger_roll
                cost: { resource: 'action', amount: 1 },
            },
        ],
    },
} satisfies Record<string, Record<string, unknown>>

export function isSchemaEmpty(schema: Record<string, unknown>): boolean {
    return !schema || Object.keys(schema).length === 0
}