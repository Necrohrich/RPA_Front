// src/components/systems/EditSystemModal.tsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useUpdateGameSystem } from '@/hooks/useGameSystems'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import type { GameSystem } from '@/types'

type Props = {
    system: GameSystem | null
    onClose: () => void
}

const inputCn = cn(
    'h-9 w-full rounded-md px-3 text-sm text-foreground',
    'bg-secondary border border-border',
    'focus:border-brand focus:outline-none focus:ring-0',
    'placeholder:text-muted-foreground/50 transition-colors',
    'disabled:opacity-50',
)

export function EditSystemModal({ system, onClose }: Props) {
    const { t } = useTranslation()
    const updateSystem = useUpdateGameSystem()

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')

    // синхронизируем поля при открытии модалки с новой системой
    useEffect(() => {
        if (system) {
            setName(system.name)
            setDescription(system.description ?? '')
        }
    }, [system])

    const canSubmit = name.trim().length > 0 && !updateSystem.isPending

    const handleSubmit = async () => {
        if (!canSubmit || !system) return
        await updateSystem.mutateAsync({
            id: system.id,
            dto: {
                name: name.trim(),
                description: description.trim() || null,
            },
        })
        toast.success(t('dashboard.systems_page.update_ok'))
        onClose()
    }

    return (
        <Dialog open={!!system} onOpenChange={open => !open && onClose()}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>{system?.name}</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-3 pt-2">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-muted-foreground">
                            {t('dashboard.systems_page.name_label')}
                        </label>
                        <input
                            className={inputCn}
                            value={name}
                            onChange={e => setName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                            autoFocus
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-muted-foreground">
                            {t('dashboard.systems_page.description_label')}
                        </label>
                        <textarea
                            className={cn(inputCn, 'h-20 resize-none py-2')}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className={cn(
                            'h-9 rounded-md text-sm font-medium transition-colors mt-1',
                            'bg-brand text-white hover:bg-brand/90',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                        )}
                    >
                        {updateSystem.isPending ? '...' : t('common.save')}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}