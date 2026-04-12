// src/components/sheet/CharacterHero.tsx
import {
    User, Pencil, Save, X, Copy, ArrowRight,
    Swords, TrendingUp, AlertTriangle,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { CharacterDetail, SheetResponse } from '@/types'
import * as React from "react";

type Props = {
    character:   CharacterDetail
    sheet:       SheetResponse | undefined
    editMode:    boolean
    saving:      boolean
    onEdit:      () => void
    onSave:      () => void
    onCancel:    () => void
    onCopy:      () => void
    creationCompleted?: boolean
}

export function CharacterHero({
                                  character,
                                  sheet,
                                  editMode,
                                  saving,
                                  onEdit,
                                  onSave,
                                  onCancel,
                                  onCopy,
                                  creationCompleted
                              }: Props) {
    const { t }    = useTranslation()
    const navigate = useNavigate()

    const canEdit      = sheet?.can_edit     ?? false
    const canProgress  = sheet?.can_progress ?? false
    const versionMismatch = sheet?.version_mismatch ?? false

    return (
        <div className={cn(
            'relative rounded-xl border border-border/50 bg-card',
            'flex flex-col sm:flex-row gap-4 p-4',
        )}>
            {/* ── Аватар ── */}
            <div className={cn(
                'w-20 h-20 sm:w-24 sm:h-24 rounded-xl shrink-0 overflow-hidden',
                'bg-secondary border border-border flex items-center justify-center',
            )}>
                {character.avatar ? (
                    <img
                        src={character.avatar}
                        alt={character.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <User size={36} className="text-muted-foreground/30" />
                )}
            </div>

            {/* ── Инфо ── */}
            <div className="flex flex-col gap-1 flex-1 min-w-0">
                <h1 className="text-xl font-bold text-foreground truncate">
                    {character.name}
                </h1>

                {/* Система + версия */}
                <div className="flex items-center gap-1.5">
                    {character.game_system_name && (
                        <span className="text-sm text-brand/80 font-medium">
                            {character.game_system_name}
                        </span>
                    )}
                    {sheet?.schema_version && (
                        <span className="text-xs text-muted-foreground font-normal">
                            v{sheet.schema_version}
                        </span>
                    )}
                </div>

                {character.game_name ? (
                    <span className="text-xs text-muted-foreground">
                        {t('character_page.in_game')}: {character.game_name}
                    </span>
                ) : (
                    <span className="text-xs text-muted-foreground italic">
                        {t('character_page.no_game')}
                    </span>
                )}

                {/* version mismatch banner */}
                {versionMismatch && (
                    <div className={cn(
                        'flex items-center gap-2 mt-1 px-2 py-1 rounded-lg',
                        'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400',
                        'text-xs',
                    )}>
                        <AlertTriangle size={13} className="shrink-0" />
                        {t('character_page.version_mismatch')}
                    </div>
                )}
            </div>

            {/* ── Кнопки ── */}
            <div className="flex flex-row sm:flex-col gap-1.5 items-start sm:items-end shrink-0 flex-wrap">
                {!editMode ? (
                    <>
                        {/* Edit (если права есть) */}
                        {canEdit && (
                            <HeroBtn
                                icon={<Pencil size={13} />}
                                label={t('character_page.edit')}
                                onClick={onEdit}
                            />
                        )}

                        {/* Progression */}
                        {canProgress && (
                            <HeroBtn
                                icon={<TrendingUp size={13} />}
                                label={t('character_page.progression')}
                                onClick={() => navigate(`/dashboard/characters/${character.id}/progression`)}
                                accent
                            />
                        )}

                        {/* Creation */}
                        {!creationCompleted && (
                            <HeroBtn
                                icon={<ArrowRight size={13} />}
                                label={t('character_page.creation')}
                                onClick={() => navigate(`/dashboard/characters/${character.id}/creation`)}
                            />
                        )}

                        {/* Copy */}
                        <HeroBtn
                            icon={<Copy size={13} />}
                            label={t('character_page.copy')}
                            onClick={onCopy}
                        />
                    </>
                ) : (
                    <>
                        {/* Save */}
                        <HeroBtn
                            icon={<Save size={13} />}
                            label={saving ? t('character_page.saving') : t('character_page.save')}
                            onClick={onSave}
                            accent
                            disabled={saving}
                        />
                        {/* Cancel */}
                        <HeroBtn
                            icon={<X size={13} />}
                            label={t('character_page.cancel')}
                            onClick={onCancel}
                            disabled={saving}
                        />
                    </>
                )}

                {/* Actions quick icon (всегда виден если есть) */}
                {sheet?.can_roll && !editMode && (
                    <HeroBtn
                        icon={<Swords size={13} />}
                        label={t('character_page.actions')}
                        onClick={() => {
                            document.getElementById('character-actions-panel')
                                ?.scrollIntoView({ behavior: 'smooth' })
                        }}
                    />
                )}
            </div>
        </div>
    )
}

// ── вспомогательная кнопка ────────────────────────────────────────────────────

function HeroBtn({
                     icon,
                     label,
                     onClick,
                     accent   = false,
                     disabled = false,
                 }: {
    icon:      React.ReactNode
    label:     string
    onClick:   () => void
    accent?:   boolean
    disabled?: boolean
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium',
                'border transition-colors',
                accent
                    ? 'bg-brand/20 border-brand/50 text-brand hover:bg-brand/30'
                    : 'bg-secondary/60 border-border text-muted-foreground hover:text-foreground hover:border-border/80',
                disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
            )}
        >
            {icon}
            {label}
        </button>
    )
}