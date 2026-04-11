// src/components/sheet/SheetField.tsx
import { cn } from '@/lib/utils'
import type { RenderedField } from '@/types'
import {SheetListField} from "@/components/sheet/SheetListField.tsx";

// Расширяем тип внутри файла — _proficient пробрасывается из SheetSection для skill
type FieldWithMeta = RenderedField & { _proficient?: boolean }

type Props = {
    field:    FieldWithMeta
    editMode: boolean
    locked:   boolean
    equipped: Record<string, unknown>
    onChange: (id: string, value: unknown) => void
    onEquip:  (slot: string, item: Record<string, unknown> | null) => void
}

export function SheetField({ field, editMode, locked, equipped, onChange, onEquip }: Props) {
    const display  = field.display ?? {}
    const isEdit   = editMode && field.type !== 'computed' && !locked
    const color    = display.color
    const hint     = display.hint
    const icon     = display.icon

    const sizeClass: Record<string, string> = {
        small:  'col-span-1',
        normal: 'col-span-2',
        large:  'col-span-4',
    }
    const span = sizeClass[display.size ?? 'normal'] ?? 'col-span-2'

    return (
        <div className={cn('flex flex-col gap-1', span)}>
            {/* Label */}
            <span
                className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider"
                style={color ? { color } : undefined}
            >
                {icon && <span className="mr-1">{icon}</span>}
                {field.label}
            </span>

            {/* Value control */}
            <FieldControl field={field} isEdit={isEdit} equipped={equipped} onChange={onChange} onEquip={onEquip} />

            {/* Hint */}
            {hint && (
                <span className="text-[10px] text-muted-foreground/60 italic">
                    {hint}
                </span>
            )}
        </div>
    )
}

// ── Контрол по типу поля ─────────────────────────────────────────────────────

type ControlProps = {
    field:    FieldWithMeta
    isEdit:   boolean
    equipped: Record<string, unknown>
    onChange: (id: string, value: unknown) => void
    onEquip:  (slot: string, item: Record<string, unknown> | null) => void
}

function FieldControl({ field, isEdit, equipped, onChange, onEquip }: ControlProps) {
    const { id, type, value, options, max_value } = field

    if (type === 'computed') {
        return (
            <span className={cn(
                'text-sm font-mono px-2 py-1 rounded w-fit min-w-[2.5rem] text-center',
                'bg-secondary/40 text-brand border border-brand/20',
            )}>
                {value != null ? String(value) : '—'}
            </span>
        )
    }

    if (type === 'resource') {
        return (
            <ResourceField
                id={id}
                value={value as number ?? 0}
                maxValue={max_value ?? null}
                isEdit={isEdit}
                onChange={onChange}
            />
        )
    }

    if (type === 'boolean') {
        return (
            <BooleanField
                id={id}
                value={value as boolean ?? false}
                isEdit={isEdit}
                onChange={onChange}
            />
        )
    }

    if (type === 'skill') {
        return (
            <SkillField
                id={id}
                value={value as number | null}
                proficient={field._proficient ?? false}
                isEdit={isEdit}
                onChange={onChange}
            />
        )
    }

    if (type === 'select' || type === 'dice') {
        return (
            <SelectField
                id={id}
                value={value as string ?? ''}
                options={options ?? []}
                isEdit={isEdit}
                onChange={onChange}
            />
        )
    }

    if (type === 'multiselect') {
        return (
            <MultiSelectField
                id={id}
                value={value as string[] ?? []}
                options={options ?? []}
                isEdit={isEdit}
                onChange={onChange}
            />
        )
    }

    if (type === 'textarea') {
        return (
            <TextareaField
                id={id}
                value={value as string ?? ''}
                isEdit={isEdit}
                onChange={onChange}
            />
        )
    }

    if (type === 'list') {
        return (
            <SheetListField
                field={field}
                editMode={isEdit}
                equipped={equipped}
                onChange={onChange}
                onEquip={onEquip}
            />
        )
    }

    // integer / number / text
    return (
        <NumberOrTextField
            id={id}
            type={type as 'integer' | 'number' | 'text'}
            value={value as string | number}
            isEdit={isEdit}
            onChange={onChange}
        />
    )
}

// ── Примитивные контролы ──────────────────────────────────────────────────────

function ResourceField({ id, value, maxValue, isEdit, onChange }: {
    id: string
    value: number
    maxValue: number | null
    isEdit: boolean
    onChange: (id: string, v: unknown) => void
}) {
    const pct = maxValue ? Math.max(0, Math.min(100, (value / maxValue) * 100)) : 0
    const barColor = pct > 50 ? 'bg-brand' : pct > 25 ? 'bg-yellow-500' : 'bg-red-500'

    return (
        <div className="flex flex-col gap-1.5">
            {maxValue != null && (
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                        className={cn('h-full rounded-full transition-all duration-300', barColor)}
                        style={{ width: `${pct}%` }}
                    />
                </div>
            )}
            <div className="flex items-center gap-1.5">
                {isEdit && (
                    <StepBtn onClick={() => onChange(id, value - 1)} label="-" />
                )}
                {isEdit ? (
                    <input
                        type="number"
                        value={value}
                        onChange={e => onChange(id, Number(e.target.value))}
                        className={cn(
                            'w-14 text-center bg-secondary border border-border rounded px-1 py-0.5',
                            'text-sm text-foreground focus:outline-none focus:border-brand',
                        )}
                    />
                ) : (
                    <span className="text-sm font-semibold text-foreground tabular-nums">
                        {value}
                    </span>
                )}
                {maxValue != null && (
                    <span className="text-xs text-muted-foreground">/ {maxValue}</span>
                )}
                {isEdit && (
                    <StepBtn onClick={() => onChange(id, value + 1)} label="+" />
                )}
            </div>
        </div>
    )
}

function NumberOrTextField({ id, type, value, isEdit, onChange }: {
    id: string
    type: 'integer' | 'number' | 'text'
    value: string | number
    isEdit: boolean
    onChange: (id: string, v: unknown) => void
}) {
    const isNumeric = type === 'integer' || type === 'number'

    if (!isEdit) {
        return (
            <span className="text-sm text-foreground">
                {value != null && value !== '' ? String(value) : '—'}
            </span>
        )
    }

    return (
        <div className={cn('flex items-center gap-1', isNumeric && 'w-fit')}>
            {isNumeric && (
                <StepBtn onClick={() => onChange(id, Number(value ?? 0) - 1)} label="-" />
            )}
            <input
                type={isNumeric ? 'number' : 'text'}
                value={value ?? ''}
                onChange={e => onChange(
                    id,
                    isNumeric ? Number(e.target.value) : e.target.value,
                )}
                className={cn(
                    'bg-secondary border border-border rounded px-2 py-1',
                    'text-sm text-foreground focus:outline-none focus:border-brand',
                    isNumeric ? 'w-20 text-center' : 'w-full',
                )}
            />
            {isNumeric && (
                <StepBtn onClick={() => onChange(id, Number(value ?? 0) + 1)} label="+" />
            )}
        </div>
    )
}

function TextareaField({ id, value, isEdit, onChange }: {
    id: string
    value: string
    isEdit: boolean
    onChange: (id: string, v: unknown) => void
}) {
    if (!isEdit) {
        return (
            <span className="text-sm text-foreground whitespace-pre-wrap">
                {value || '—'}
            </span>
        )
    }
    return (
        <textarea
            value={value}
            rows={4}
            onChange={e => onChange(id, e.target.value)}
            className={cn(
                'w-full bg-secondary border border-border rounded px-2 py-1',
                'text-sm text-foreground focus:outline-none focus:border-brand resize-y',
            )}
        />
    )
}

function BooleanField({ id, value, isEdit, onChange }: {
    id: string
    value: boolean
    isEdit: boolean
    onChange: (id: string, v: unknown) => void
}) {
    return (
        <button
            disabled={!isEdit}
            onClick={() => onChange(id, !value)}
            className={cn(
                'w-5 h-5 rounded border transition-colors',
                value ? 'bg-brand border-brand' : 'bg-secondary border-border',
                isEdit ? 'hover:border-brand cursor-pointer' : 'cursor-default',
            )}
            aria-checked={value}
        >
            {value && (
                <svg viewBox="0 0 10 10" className="w-full h-full text-white p-0.5">
                    <polyline
                        points="1.5,5 4,7.5 8.5,2.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                </svg>
            )}
        </button>
    )
}

function SkillField({ id, value, proficient, isEdit, onChange }: {
    id: string
    value: number | null
    proficient: boolean
    isEdit: boolean
    onChange: (id: string, v: unknown) => void
}) {
    return (
        <div className="flex items-center gap-2">
            {/* Значение навыка (computed — readonly) */}
            <span className={cn(
                'text-sm font-semibold tabular-nums w-6 text-center',
                proficient ? 'text-brand' : 'text-foreground',
            )}>
                {value ?? 0}
            </span>

            {/* Чекбокс владения (_proficient) */}
            <BooleanField
                id={`${id}_proficient`}
                value={proficient}
                isEdit={isEdit}
                onChange={onChange}
            />
        </div>
    )
}

function SelectField({ id, value, options, isEdit, onChange }: {
    id: string
    value: string
    options: string[]
    isEdit: boolean
    onChange: (id: string, v: unknown) => void
}) {
    if (!isEdit) {
        return <span className="text-sm text-foreground">{value || '—'}</span>
    }
    return (
        <select
            value={value}
            onChange={e => onChange(id, e.target.value)}
            className={cn(
                'bg-secondary border border-border rounded px-2 py-1',
                'text-sm text-foreground focus:outline-none focus:border-brand',
            )}
        >
            <option value="">—</option>
            {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
    )
}

function MultiSelectField({ id, value, options, isEdit, onChange }: {
    id: string
    value: string[]
    options: string[]
    isEdit: boolean
    onChange: (id: string, v: unknown) => void
}) {
    const toggle = (opt: string) => {
        const next = value.includes(opt)
            ? value.filter(v => v !== opt)
            : [...value, opt]
        onChange(id, next)
    }

    if (!isEdit) {
        return (
            <span className="text-sm text-foreground">
                {value.length ? value.join(', ') : '—'}
            </span>
        )
    }

    return (
        <div className="flex flex-wrap gap-1">
            {options.map(opt => (
                <button
                    key={opt}
                    onClick={() => toggle(opt)}
                    className={cn(
                        'px-2 py-0.5 rounded text-xs border transition-colors',
                        value.includes(opt)
                            ? 'bg-brand/20 border-brand text-brand'
                            : 'bg-secondary border-border text-muted-foreground hover:border-brand/50',
                    )}
                >
                    {opt}
                </button>
            ))}
        </div>
    )
}

function StepBtn({ onClick, label }: { onClick: () => void; label: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'w-6 h-6 rounded flex items-center justify-center text-xs font-bold shrink-0',
                'bg-secondary border border-border text-muted-foreground',
                'hover:border-brand/50 hover:text-foreground transition-colors',
            )}
        >
            {label}
        </button>
    )
}