// src/components/sheet/SheetAccordion.tsx
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SheetSection } from './SheetSection'
import type { RenderedSection } from '@/types'
import {useTranslation} from "react-i18next";

type Props = {
    sections: RenderedSection[]
    raw:      Record<string, unknown>
    editMode: boolean
    onChange: (id: string, value: unknown) => void
    onEquip:  (slot: string, item: Record<string, unknown> | null) => void
}

export function SheetAccordion({ sections, raw, editMode, onChange, onEquip }: Props) {
    const { t } = useTranslation()
    // Инициализируем collapsed-состояние из display.collapsed каждой секции.
    // Ключ — id секции, значение — открыта ли (true = видна).
    const [open, setOpen] = useState<Record<string, boolean>>(() =>
        Object.fromEntries(
            sections.map(s => [s.id, !(s.display?.collapsed ?? false)])
        )
    )

    const toggle = (id: string) =>
        setOpen(prev => ({ ...prev, [id]: !prev[id] }))

    return (
        <div className="flex flex-col gap-2">
            {sections.map(section => {
                const isOpen     = open[section.id] ?? true
                const icon       = section.display?.icon
                const color      = section.display?.color

                return (
                    <div
                        key={section.id}
                        className={cn(
                            'rounded-xl border border-border/50 bg-card overflow-hidden',
                            'transition-colors',
                            isOpen && 'border-border/70',
                        )}
                    >
                        {/* ── Заголовок секции (кликабельный) ── */}
                        <button
                            onClick={() => toggle(section.id)}
                            className={cn(
                                'w-full flex items-center justify-between gap-2',
                                'px-4 py-3 text-left',
                                'hover:bg-secondary/40 transition-colors',
                            )}
                        >
                            <span className="flex items-center gap-2 min-w-0">
                                {icon && (
                                    <span
                                        className="text-base shrink-0"
                                        style={color ? { color } : undefined}
                                    >
                                        {icon}
                                    </span>
                                )}
                                <span
                                    className="text-sm font-semibold text-foreground truncate"
                                    style={color ? { color } : undefined}
                                >
                                    {section.label}
                                </span>
                                <span className="text-[10px] text-muted-foreground/50 shrink-0">
                                    {t('character_page.fields_count', { count: section.fields.length })}
                                </span>
                            </span>

                            <ChevronDown
                                size={16}
                                className={cn(
                                    'text-muted-foreground shrink-0 transition-transform duration-200',
                                    isOpen && 'rotate-180',
                                )}
                            />
                        </button>

                        {/* ── Тело секции ── */}
                        {isOpen && (
                            <div className="px-4 pb-4 border-t border-border/40">
                                <SheetSection
                                    section={section}
                                    raw={raw}
                                    editMode={editMode}
                                    locked={false}
                                    onChange={onChange}
                                    onEquip={onEquip}
                                />
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}