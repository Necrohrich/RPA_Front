// src/components/systems/SystemCard.tsx
import { Trash2, Settings, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CopyableId } from '@/components/ui/CopyableId'
import type { GameSystem } from '@/types'
import * as React from "react";
import { useTranslation } from 'react-i18next'

type Props = {
    system: GameSystem
    isSuperadmin: boolean
    onEdit: (system: GameSystem) => void
    onDelete: (system: GameSystem) => void
    onToggleActive: (system: GameSystem) => void
    onClick: (system: GameSystem) => void
}

// детерминированный цвет из строки — один и тот же для одного названия
function stringToHslColor(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    const hue = Math.abs(hash) % 360
    return `hsl(${hue}, 35%, 20%)`
}

function stringToHslAccent(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    const hue = Math.abs(hash) % 360
    return `hsl(${hue}, 50%, 60%)`
}

type ActionBtnProps = {
    icon: React.ReactNode
    onClick: (e: React.MouseEvent) => void
    label: string
    danger?: boolean
}

function ActionBtn({ icon, onClick, label, danger }: ActionBtnProps) {
    return (
        <button
            aria-label={label}
            onClick={onClick}
            className={cn(
                'w-6 h-6 rounded flex items-center justify-center transition-colors',
                'bg-black/40 backdrop-blur-sm border border-white/10',
                danger
                    ? 'hover:bg-destructive/80 hover:border-destructive'
                    : 'hover:bg-white/20',
            )}
        >
            {icon}
        </button>
    )
}

export function SystemCard({ system, isSuperadmin, onEdit, onDelete, onToggleActive, onClick }: Props) {
    const bgColor = stringToHslColor(system.name)
    const accentColor = stringToHslAccent(system.name)
    const { t } = useTranslation()

    return (
        <div
            onClick={() => onClick(system)}
            className={cn(
                'relative flex flex-col rounded-xl cursor-pointer',
                'bg-card border border-border/50',
                'hover:border-brand/50 transition-all duration-200 group',
                !system.is_active && 'opacity-60',
            )}
        >
            {/* ── Обложка ── */}
            <div
                className="relative h-32 shrink-0 overflow-hidden rounded-t-xl flex items-center justify-center"
                style={{ background: bgColor }}
            >
                <span
                    className="text-lg font-bold text-center px-3 leading-tight line-clamp-3 select-none"
                    style={{ color: accentColor, fontFamily: 'var(--font-cinzel)' }}
                >
                    {system.name}
                </span>

                {/* is_active badge */}
                {!system.is_active && (
                    <span className={cn(
                        'absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold',
                        'bg-black/60 text-muted-foreground backdrop-blur-sm border border-white/10',
                    )}>
                        {t('dashboard.systems_page.inactive_badge')}
                    </span>
                )}

                {/* Кнопки действий */}
                <div className={cn(
                    'absolute top-2 right-2 flex gap-1',
                    'opacity-0 group-hover:opacity-100 transition-opacity',
                )}>
                    <ActionBtn
                        icon={system.is_active ? <EyeOff size={12} /> : <Eye size={12} />}
                        onClick={e => { e.stopPropagation(); onToggleActive(system) }}
                        label={system.is_active ? 'deactivate' : 'activate'}
                    />
                    <ActionBtn
                        icon={<Settings size={12} />}
                        onClick={e => { e.stopPropagation(); onEdit(system) }}
                        label="edit"
                    />
                    {isSuperadmin && (
                        <ActionBtn
                            icon={<Trash2 size={12} />}
                            onClick={e => { e.stopPropagation(); onDelete(system) }}
                            label="delete"
                            danger
                        />
                    )}
                </div>
            </div>

            {/* ── Контент ── */}
            <div className="flex flex-col gap-2 p-3 flex-1">
                {/* Название + ID */}
                <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm font-semibold text-foreground truncate">
                        {system.name}
                    </span>
                    <CopyableId id={system.id} />
                </div>

                {/* Автор — только для superadmin */}
                {isSuperadmin && system.author_username && (
                    <span className="text-[10px] text-brand/80 font-medium -mt-1">
                        {system.author_username}
                    </span>
                )}

                {/* Описание */}
                <p className="text-[11px] text-muted-foreground line-clamp-2 flex-1">
                    {system.description ?? t('dashboard.systems_page.no_description')}
                </p>

                {/* Версия */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>v{system.version}</span>
                </div>
            </div>
        </div>
    )
}