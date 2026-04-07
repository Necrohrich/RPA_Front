// src/components/dashboard/ProfileWidget.tsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useUpdateSecondaryEmail, useChangePassword } from '@/hooks/useProfile'
import { toast } from 'sonner'

// ── FieldRow ──────────────────────────────────────────────────────────────────

type FieldRowProps = {
    label: string
    value: string | null
    placeholder?: string
    editing?: boolean
    inputValue?: string
    onInputChange?: (v: string) => void
    inputType?: string
    readonly?: boolean
}

function FieldRow({
                      label,
                      value,
                      placeholder = '—',
                      editing,
                      inputValue,
                      onInputChange,
                      inputType = 'text',
                      readonly,
                  }: FieldRowProps) {
    return (
        <div className="flex items-center gap-3 py-[7px] border-b border-border/40 last:border-0 overflow-hidden">
            <span className="text-[11px] text-muted-foreground w-[88px] shrink-0">{label}</span>

            {editing && !readonly ? (
                <input
                    type={inputType}
                    value={inputValue ?? ''}
                    onChange={e => onInputChange?.(e.target.value)}
                    placeholder={placeholder}
                    autoComplete={inputType === 'password' ? 'new-password' : 'off'}
                    className={cn(
                        'w-0 flex-1 h-7 rounded px-2 text-[12px] text-foreground',
                        '!bg-secondary border border-border',
                        'focus:border-brand focus:outline-none focus:ring-0 focus:!shadow-none',
                        'placeholder:text-muted-foreground/50',
                        'transition-colors',
                    )}
                />
            ) : (
                <span className={cn(
                    'w-0 flex-1 text-[12px] truncate text-right',
                    value ? 'text-foreground' : 'text-muted-foreground/50 italic',
                )}>
                  {value ?? placeholder}
                </span>
            )}
        </div>
    )
}

// ── State ─────────────────────────────────────────────────────────────────────

type ViewState = { mode: 'view' }
type EditState = {
    mode: 'edit'
    secondaryEmail: string
    oldPassword: string
    newPassword: string
}
type WidgetState = ViewState | EditState

// ── ProfileWidget ─────────────────────────────────────────────────────────────

export function ProfileWidget({ className }: { className?: string }) {
    const {t} = useTranslation()
    const {user} = useAuth()
    const updateEmail = useUpdateSecondaryEmail()
    const changePassword = useChangePassword()

    const [state, setState] = useState<WidgetState>({mode: 'view'})
    const isEdit = state.mode === 'edit'

    const enterEdit = () => setState({
        mode: 'edit',
        secondaryEmail: user?.secondary_email ?? '',
        oldPassword: '',
        newPassword: '',
    })

    const cancelEdit = () => setState({mode: 'view'})

    const handleSave = async () => {
        if (state.mode !== 'edit') return

        const tasks: Promise<unknown>[] = []

        if (state.secondaryEmail !== (user?.secondary_email ?? '')) {
            tasks.push(
                updateEmail.mutateAsync(state.secondaryEmail)
                    .then(() => toast.success(t('dashboard.profile.email_updated')))
                    .catch(() => {
                    }), // axios-интерцептор уже показал ошибку
            )
        }

        if (state.oldPassword.trim() && state.newPassword.trim()) {
            tasks.push(
                changePassword.mutateAsync({
                    old_password: state.oldPassword,
                    new_password: state.newPassword,
                })
                    .then(() => toast.success(t('dashboard.profile.password_updated')))
                    .catch(() => {
                    }),
            )
        }

        await Promise.allSettled(tasks)
        setState({mode: 'view'})
    }

    const isPending = updateEmail.isPending || changePassword.isPending
    const initials = user?.login?.slice(0, 2).toUpperCase() ?? '??'

    return (
        <div className={cn(
            'bg-card border border-border rounded-md flex flex-col min-w-0 overflow-hidden',
            className
        )}>
            {/* ── Шапка ── */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-border/40">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-brand/15 flex items-center justify-center text-[13px]
                    font-semibold text-brand shrink-0">
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <p className="text-[13px] font-medium text-foreground truncate">{user?.login}</p>
                        <p className="text-[10px] text-muted-foreground">
                            {user?.platform_role ?? t('dashboard.nav.no_role')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-0.5 shrink-0 ml-2">
                    {isEdit ? (
                        <>
                            <button
                                onClick={cancelEdit}
                                disabled={isPending}
                                className="p-1.5 rounded text-muted-foreground hover:text-foreground
                                hover:bg-secondary transition-colors disabled:opacity-50"
                                aria-label={t('common.cancel')}
                            >
                                <X size={13} />
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isPending}
                                className="p-1.5 rounded text-brand hover:bg-brand/10 transition-colors
                                disabled:opacity-50"
                                aria-label={t('common.save')}
                            >
                                <Check size={13} />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={enterEdit}
                            className="p-1.5 rounded text-muted-foreground hover:text-foreground
                            hover:bg-secondary transition-colors"
                            aria-label={t('dashboard.profile.edit')}
                        >
                            <Pencil size={13} />
                        </button>
                    )}
                </div>
            </div>

            {/* ── Поля ── */}
            <div className="px-4 py-2 flex-1 min-w-0 overflow-y-auto">
                <FieldRow
                    label={t('dashboard.profile.email')}
                    value={user?.primary_email ?? null}
                    readonly
                    editing={isEdit}
                />
                <FieldRow
                    label={t('dashboard.profile.secondary_email')}
                    value={user?.secondary_email ?? null}
                    placeholder={t('dashboard.profile.not_set')}
                    editing={isEdit}
                    inputType="email"
                    inputValue={isEdit ? (state as EditState).secondaryEmail : undefined}
                    onInputChange={v =>
                        setState(s => s.mode === 'edit' ? { ...s, secondaryEmail: v } : s)
                    }
                />
                <FieldRow
                    label="Discord"
                    value={user?.primary_discord_id ? String(user.primary_discord_id) : null}
                    placeholder={t('dashboard.profile.not_set')}
                    readonly
                    editing={isEdit}
                />

                {/* Смена пароля — только в edit-режиме */}
                {isEdit && (
                    <div className="mt-2 pt-2 border-t border-border/40 flex flex-col gap-1.5">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                            {t('dashboard.profile.change_password')}
                        </p>
                        <input
                            type="password"
                            placeholder={t('dashboard.profile.old_password')}
                            value={(state as EditState).oldPassword}
                            onChange={e =>
                                setState(s => s.mode === 'edit' ? { ...s, oldPassword: e.target.value } : s)
                            }
                            autoComplete="current-password"
                            className="bg-input rounded px-2 py-1 text-[12px] text-foreground border
                            border-border focus:border-brand focus:outline-none transition-colors w-full"
                        />
                        <input
                            type="password"
                            placeholder={t('dashboard.profile.new_password')}
                            value={(state as EditState).newPassword}
                            onChange={e =>
                                setState(s => s.mode === 'edit' ? { ...s, newPassword: e.target.value } : s)
                            }
                            autoComplete="new-password"
                            className={cn(
                                'w-full h-7 rounded px-2 text-[12px] text-foreground',
                                '!bg-secondary border border-border',
                                'focus:border-brand focus:outline-none focus:ring-0 focus:!shadow-none',
                                'placeholder:text-muted-foreground/50 transition-colors',
                            )}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}