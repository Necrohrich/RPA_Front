// src/pages/SettingsPage.tsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import {useUpdateSecondaryEmail, useChangePassword, useDeleteSecondaryEmail} from '@/hooks/useProfile'
import * as React from "react";

// ── SettingsSection ───────────────────────────────────────────────────────────

function SettingsSection({
                             title,
                             children,
                             className,
                         }: {
    title: string
    children: React.ReactNode
    className?: string
}) {
    return (
        <div className={cn('flex flex-col gap-4', className)}>
            {/* акцентная полоса слева — RPG-панель */}
            <div className="flex items-center gap-3">
                <div className="w-1 h-5 rounded-full bg-brand" />
                <h2 className="text-sm font-semibold text-foreground tracking-wide uppercase">
                    {title}
                </h2>
            </div>
            <div className="border border-border/50 rounded-lg p-4 flex flex-col gap-3 bg-card/40">
                {children}
            </div>
        </div>
    )
}

// ── FieldGroup ────────────────────────────────────────────────────────────────

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-muted-foreground uppercase tracking-wider">
                {label}
            </label>
            {children}
        </div>
    )
}

// ── inputCn — общий класс для всех инпутов страницы ──────────────────────────

const inputCn = cn(
    'h-9 rounded-md px-3 text-sm text-foreground',
    'bg-secondary border border-border',
    'focus:border-brand focus:outline-none focus:ring-0',
    'placeholder:text-muted-foreground/50 transition-colors',
    'disabled:opacity-50 disabled:cursor-not-allowed',
)

const btnCn = cn(
    'self-end h-9 px-4 rounded-md text-sm font-medium transition-colors',
    'bg-brand text-white hover:bg-brand/90',
    'disabled:opacity-50 disabled:cursor-not-allowed',
)

// ── ContactsSection ───────────────────────────────────────────────────────────

function ContactsSection() {
    const { t } = useTranslation()
    const { user } = useAuth()
    const updateEmail = useUpdateSecondaryEmail()
    const deleteEmail = useDeleteSecondaryEmail()

    const [email, setEmail] = useState(user?.secondary_email ?? '')

    const isClearing = email === '' && user?.secondary_email != null
    const isDirty = email !== (user?.secondary_email ?? '')

    const handleSave = async () => {
        if (isClearing) {
            await deleteEmail.mutateAsync()
        } else {
            await updateEmail.mutateAsync(email)
        }
        toast.success(t('dashboard.profile.email_updated'))
    }

    return (
        <SettingsSection title={t('dashboard.settings.section_contacts')}>
            <FieldGroup label={t('dashboard.profile.email')}>
                {/* primary email — readonly, просто показываем */}
                <input
                    value={user?.primary_email ?? ''}
                    readOnly
                    className={cn(inputCn, 'opacity-60 cursor-default select-all')}
                />
            </FieldGroup>

            <FieldGroup label={t('dashboard.settings.secondary_email_label')}>
                <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={t('dashboard.settings.secondary_email_placeholder')}
                    className={inputCn}
                />
            </FieldGroup>

            <button
                onClick={handleSave}
                disabled={!isDirty || updateEmail.isPending}
                className={btnCn}
            >
                {t('common.save')}
            </button>
        </SettingsSection>
    )
}

// ── SecuritySection ───────────────────────────────────────────────────────────

function SecuritySection() {
    const { t } = useTranslation()
    const changePassword = useChangePassword()

    const [fields, setFields] = useState({
        old_password: '',
        new_password: '',
        confirm: '',
    })

    const set = (key: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setFields(f => ({ ...f, [key]: e.target.value }))

    const confirmMismatch = fields.confirm.length > 0 && fields.confirm !== fields.new_password
    const canSubmit =
        fields.old_password.length > 0 &&
        fields.new_password.length >= 8 &&
        fields.new_password === fields.confirm &&
        !changePassword.isPending

    const handleSave = async () => {
        await changePassword.mutateAsync({
            old_password: fields.old_password,
            new_password: fields.new_password,
        })
        toast.success(t('dashboard.profile.password_updated'))
        setFields({ old_password: '', new_password: '', confirm: '' })
    }

    return (
        <SettingsSection title={t('dashboard.settings.section_security')}>
            <FieldGroup label={t('dashboard.profile.old_password')}>
                <input
                    type="password"
                    value={fields.old_password}
                    onChange={set('old_password')}
                    autoComplete="current-password"
                    className={inputCn}
                />
            </FieldGroup>

            <FieldGroup label={t('dashboard.profile.new_password')}>
                <input
                    type="password"
                    value={fields.new_password}
                    onChange={set('new_password')}
                    autoComplete="new-password"
                    className={inputCn}
                />
            </FieldGroup>

            <FieldGroup label={t('dashboard.settings.confirm_password')}>
                <input
                    type="password"
                    value={fields.confirm}
                    onChange={set('confirm')}
                    autoComplete="new-password"
                    className={cn(inputCn, confirmMismatch && 'border-destructive')}
                />
                {/* inline-ошибка под полем, не тост */}
                {confirmMismatch && (
                    <p className="text-[11px] text-destructive">
                        {t('dashboard.settings.confirm_mismatch')}
                    </p>
                )}
            </FieldGroup>

            <button onClick={handleSave} disabled={!canSubmit} className={btnCn}>
                {t('common.save')}
            </button>
        </SettingsSection>
    )
}

// ── DiscordSection ────────────────────────────────────────────────────────────

function DiscordSection() {
    const { t } = useTranslation()
    const { user } = useAuth()

    const formatId = (id: number | null) =>
        id ? String(id) : t('dashboard.settings.discord_not_linked')

    return (
        <SettingsSection title={t('dashboard.settings.section_discord')}>
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground text-[12px]">
            {t('dashboard.settings.discord_primary')}
          </span>
                    <span className={cn(
                        'font-mono text-[12px]',
                        user?.primary_discord_id ? 'text-brand' : 'text-muted-foreground/50 italic',
                    )}>
            {formatId(user?.primary_discord_id ?? null)}
          </span>
                </div>

                <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground text-[12px]">
            {t('dashboard.settings.discord_secondary')}
          </span>
                    <span className={cn(
                        'font-mono text-[12px]',
                        user?.secondary_discord_id ? 'text-brand' : 'text-muted-foreground/50 italic',
                    )}>
            {formatId(user?.secondary_discord_id ?? null)}
          </span>
                </div>
            </div>

            <p className="text-[11px] text-muted-foreground/70 leading-relaxed border-t border-border/40 pt-3">
                {t('dashboard.settings.discord_hint')}
            </p>
        </SettingsSection>
    )
}

// ── SettingsPage ──────────────────────────────────────────────────────────────

export function SettingsPage() {
    return (
        <div className="flex justify-center px-4 py-6 overflow-y-auto scrollbar-hidden h-full">
            <div className="w-full max-w-[560px] flex flex-col gap-6">
                <ContactsSection />
                <SecuritySection />
                <DiscordSection />
            </div>
        </div>
    )
}