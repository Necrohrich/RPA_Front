// src/components/system-editor/SaveModal.tsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

type Props = {
    open: boolean
    currentVersion: string
    onClose: () => void
    onConfirm: (version: string, changelog: string) => void
    isPending: boolean
}

const inputCn = cn(
    'h-9 w-full rounded-md px-3 text-sm text-foreground',
    'bg-secondary border border-border',
    'focus:border-brand focus:outline-none focus:ring-0',
    'placeholder:text-muted-foreground/50 transition-colors',
    'disabled:opacity-50',
)

export function SaveModal({ open, currentVersion, onClose, onConfirm, isPending }: Props) {
    const { t } = useTranslation()

    const [version, setVersion] = useState(currentVersion)
    const [changelog, setChangelog] = useState('')

    // синхронизируем версию при открытии
    useEffect(() => {
        if (open) setVersion(currentVersion)
    }, [open, currentVersion])

    const canSubmit = version.trim().length > 0 && !isPending

    const handleConfirm = () => {
        if (!canSubmit) return
        onConfirm(version.trim(), changelog.trim())
    }

    return (
        <Dialog open={open} onOpenChange={o => !o && onClose()}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>{t('dashboard.editor.save_modal_title')}</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-3 pt-2">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-muted-foreground">
                            {t('dashboard.editor.version_label')}
                        </label>
                        <input
                            className={inputCn}
                            value={version}
                            onChange={e => setVersion(e.target.value)}
                            placeholder="1.0.0"
                            autoFocus
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-muted-foreground">
                            {t('dashboard.editor.changelog_label')}
                        </label>
                        <textarea
                            className={cn(inputCn, 'h-24 resize-none py-2')}
                            value={changelog}
                            onChange={e => setChangelog(e.target.value)}
                            placeholder={t('dashboard.editor.changelog_placeholder')}
                        />
                    </div>

                    <button
                        onClick={handleConfirm}
                        disabled={!canSubmit}
                        className={cn(
                            'h-9 rounded-md text-sm font-medium transition-colors mt-1',
                            'bg-brand text-white hover:bg-brand/90',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                        )}
                    >
                        {isPending ? '...' : t('dashboard.editor.save')}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}