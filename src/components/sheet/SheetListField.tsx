// src/components/sheet/SheetListField.tsx
import { useState } from 'react'
import { Plus, Trash2, Shield, ShieldOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {cn, resolveLabel} from '@/lib/utils'
import type { RenderedField, ItemSchemaField } from '@/types'

type Props = {
    field:    RenderedField
    editMode: boolean
    // equipped — весь слот из sheet_data.equipped
    equipped: Record<string, unknown>
    onChange: (id: string, value: unknown) => void
    // экипировка — отдельный ключ в sheet_data
    onEquip:  (slot: string, item: Record<string, unknown> | null) => void
}

export function SheetListField({ field, editMode, equipped, onChange, onEquip }: Props) {
    const { t, i18n }      = useTranslation()
    const items      = (field.items ?? []) as Record<string, unknown>[]
    const schema     = field.item_schema ?? []
    // первое поле item_schema — "имя" предмета
    const nameField  = schema[0] as ItemSchemaField | undefined

    const [showForm, setShowForm] = useState(false)
    const [draft,    setDraft]    = useState<Record<string, string>>({})

    // id экипированного предмета — ищем в equipped по совпадению данных
    // equipped хранит { slot: item_data }, slot обычно совпадает с field.id
    const equippedItem = equipped[field.id] as Record<string, unknown> | undefined

    const handleAdd = () => {
        if (!draft[nameField?.id ?? '']?.trim()) return
        const newItem: Record<string, unknown> = {}
        schema.forEach(f => { newItem[f.id] = draft[f.id] ?? '' })
        onChange(field.id, [...items, newItem])
        setDraft({})
        setShowForm(false)
    }

    const handleRemove = (index: number) => {
        const next = items.filter((_, i) => i !== index)
        onChange(field.id, next)
        // если удаляем экипированный — снимаем экипировку
        if (equippedItem && JSON.stringify(equippedItem) === JSON.stringify(items[index])) {
            onEquip(field.id, null)
        }
    }

    const handleToggleEquip = (item: Record<string, unknown>) => {
        const isEquipped = JSON.stringify(equippedItem) === JSON.stringify(item)
        onEquip(field.id, isEquipped ? null : item)
    }

    const getName = (item: Record<string, unknown>) =>
        nameField ? String(item[nameField.id] ?? '—') : '—'

    // есть ли у системы экипировка (item_schema содержит поле slot или система поддерживает equipped)
    const hasEquip = schema.some(f => f.id === 'slot') || true  // всегда показываем кнопку экипировки

    return (
        <div className="flex flex-col gap-2">
            {/* ── Таблица предметов ── */}
            {items.length > 0 ? (
                <div className="rounded-lg border border-border/50 overflow-hidden">
                    {items.map((item, idx) => {
                        const isEquipped = JSON.stringify(equippedItem) === JSON.stringify(item)
                        return (
                            <div
                                key={idx}
                                className={cn(
                                    'flex items-center gap-2 px-3 py-1.5 text-xs',
                                    'border-b border-border/30 last:border-0',
                                    isEquipped && 'bg-brand/5',
                                )}
                            >
                                {/* Имя предмета */}
                                <span className={cn(
                                    'flex-1 truncate',
                                    isEquipped ? 'text-brand font-medium' : 'text-foreground',
                                )}>
                                    {getName(item)}
                                </span>

                                {/* Дополнительные поля (кроме первого) */}
                                {schema.slice(1).map(f => {
                                    const val = item[f.id]
                                    if (!val && val !== 0) return null
                                    return (
                                        <span key={f.id} className="text-muted-foreground/60 shrink-0">
                                            {String(val)}
                                        </span>
                                    )
                                })}

                                {/* Кнопка экипировки */}
                                {isEquipped && !editMode && (
                                    <Shield size={11} className="text-brand shrink-0" />
                                )}
                                {hasEquip && editMode && (
                                    <button
                                        onClick={() => handleToggleEquip(item)}
                                        title={isEquipped
                                            ? t('character_page.list.unequip')
                                            : t('character_page.list.equip')
                                        }
                                        className={cn(
                                            'p-1 rounded transition-colors shrink-0',
                                            isEquipped
                                                ? 'text-brand hover:text-muted-foreground'
                                                : 'text-muted-foreground/40 hover:text-brand',
                                        )}
                                    >
                                        {isEquipped
                                            ? <Shield size={11} />
                                            : <ShieldOff size={11} />
                                        }
                                    </button>
                                )}

                                {/* Кнопка удаления */}
                                {editMode && (
                                    <button
                                        onClick={() => handleRemove(idx)}
                                        className="p-1 rounded text-muted-foreground/40 hover:text-destructive
                                         transition-colors shrink-0"
                                    >
                                        <Trash2 size={11} />
                                    </button>
                                )}
                            </div>
                        )
                    })}
                </div>
            ) : (
                <span className="text-xs text-muted-foreground/50 italic">
                    {t('character_page.list.empty')}
                </span>
            )}

            {/* ── Форма добавления ── */}
            {editMode && !showForm && (
                <button
                    onClick={() => setShowForm(true)}
                    className={cn(
                        'flex items-center gap-1.5 text-xs text-muted-foreground/60',
                        'hover:text-brand transition-colors w-fit',
                    )}
                >
                    <Plus size={12} />
                    {t('character_page.list.add')}
                </button>
            )}

            {editMode && showForm && (
                <div className={cn(
                    'flex flex-col gap-2 p-2 rounded-lg',
                    'bg-secondary/40 border border-border/50',
                )}>
                    {schema.map(f => (
                        <div key={f.id} className="flex flex-col gap-1">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                {resolveLabel(f.label, i18n.language)}
                            </span>
                            {f.type === 'select' && f.options ? (
                                <select
                                    value={draft[f.id] ?? ''}
                                    onChange={e => setDraft(p => ({ ...p, [f.id]: e.target.value }))}
                                    className={cn(
                                        'bg-secondary border border-border rounded px-2 py-1',
                                        'text-xs text-foreground focus:outline-none focus:border-brand',
                                    )}
                                >
                                    <option value="">—</option>
                                    {f.options.map(o => (
                                        <option key={o} value={o}>{o}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={f.type === 'integer' || f.type === 'number' ? 'number' : 'text'}
                                    value={draft[f.id] ?? ''}
                                    onChange={e => setDraft(p => ({ ...p, [f.id]: e.target.value }))}
                                    className={cn(
                                        'bg-secondary border border-border rounded px-2 py-1',
                                        'text-xs text-foreground focus:outline-none focus:border-brand',
                                    )}
                                />
                            )}
                        </div>
                    ))}
                    <div className="flex gap-2 pt-1">
                        <button
                            onClick={handleAdd}
                            className="px-3 py-1 rounded text-xs font-medium bg-brand/20 border border-brand/40
                            text-brand hover:bg-brand/30 transition-colors"
                        >
                            {t('character_page.list.confirm_add')}
                        </button>
                        <button
                            onClick={() => { setShowForm(false); setDraft({}) }}
                            className="px-3 py-1 rounded text-xs font-medium bg-secondary border border-border
                            text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {t('common.cancel')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}