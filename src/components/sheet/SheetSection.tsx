// src/components/sheet/SheetSection.tsx
import { SheetField } from './SheetField'
import type { RenderedSection } from '@/types'

type Props = {
    section:  RenderedSection
    raw:      Record<string, unknown>
    editMode: boolean
    locked:   boolean
    onChange: (id: string, value: unknown) => void
    onEquip:  (slot: string, item: Record<string, unknown> | null) => void
}

export function SheetSection({ section, raw, editMode, locked, onChange, onEquip }: Props) {
    const { fields, display } = section

    // Группируем поля по display.group (если есть).
    // Поля без группы идут в группу '' — рендерятся первыми.
    const grouped = groupFields(fields)
    const iconColor = display?.color

    return (
        <div className="flex flex-col gap-4">
            {grouped.map(({ groupId, items }) => (
                <div key={groupId} className="flex flex-col gap-3">
                    {/* Заголовок подгруппы (если есть имя) */}
                    {groupId && (
                        <span
                            className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60"
                            style={iconColor ? { color: iconColor } : undefined}
                        >
                            {groupId}
                        </span>
                    )}

                    {/* Поля в 4-колоночной сетке — каждое поле само берёт col-span */}
                    <div className="grid grid-cols-4 gap-x-4 gap-y-3">
                        {items.map(field => {
                            // Для skill пробрасываем реальное значение _proficient из raw
                            const proficientId = `${field.id}_proficient`
                            const proficientValue =
                                field.type === 'skill'
                                    ? (raw[proficientId] as boolean | undefined) ?? false
                                    : undefined

                            return (
                                <SheetField
                                    key={field.id}
                                    field={
                                        field.type === 'skill' && proficientValue !== undefined
                                            ? { ...field, _proficient: proficientValue }
                                            : field
                                    }
                                    editMode={editMode}
                                    locked={locked}
                                    equipped={(raw['equipped'] as Record<string, unknown> | undefined) ?? {}}
                                    onChange={onChange}
                                    onEquip={onEquip}
                                />
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>
    )
}

// ── helpers ───────────────────────────────────────────────────────────────────

type GroupEntry = { groupId: string; items: RenderedSection['fields'] }

function groupFields(fields: RenderedSection['fields']): GroupEntry[] {
    const order: string[] = []
    const map: Record<string, RenderedSection['fields']> = {}

    for (const field of fields) {
        const group = (field.display as Record<string, unknown> | undefined)?.group as string | undefined ?? ''
        if (!map[group]) {
            map[group] = []
            order.push(group)
        }
        map[group].push(field)
    }

    // '' (поля без группы) — первыми
    return order.map(g => ({ groupId: g, items: map[g] }))
}