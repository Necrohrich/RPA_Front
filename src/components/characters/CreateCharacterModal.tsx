// src/components/characters/CreateCharacterModal.tsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useCreateCharacter, useGameSystems } from '@/hooks/useCharacters'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {SystemSelect} from "@/components/ui/SystemSelect.tsx";

type Props = {
    open: boolean
    onClose: () => void
}

const inputCn = cn(
    'h-9 w-full rounded-md px-3 text-sm text-foreground',
    'bg-secondary border border-border',
    'focus:border-brand focus:outline-none focus:ring-0',
    'placeholder:text-muted-foreground/50 transition-colors',
    'disabled:opacity-50',
)

export function CreateCharacterModal({ open, onClose }: Props) {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const createCharacter = useCreateCharacter()
    const { data: gameSystems } = useGameSystems()

    const [name, setName] = useState('')
    const [avatar, setAvatar] = useState('')
    const [gameSystemId, setGameSystemId] = useState<string>('')

    const canSubmit = name.trim().length > 0 && !createCharacter.isPending

    const handleSubmit = async () => {
        if (!canSubmit) return
        const result = await createCharacter.mutateAsync({
            name: name.trim(),
            game_system_id: gameSystemId || null,
            avatar: avatar.trim() || null,
        })
        toast.success(t('dashboard.characters_page.create_btn'))
        handleClose()
        navigate(`/dashboard/characters/${result.id}`)
    }

    const handleClose = () => {
        setName('')
        setAvatar('')
        setGameSystemId('')
        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={v => !v && handleClose()}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>{t('dashboard.characters_page.create_title')}</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 pt-2">
                    {/* Имя */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] text-muted-foreground uppercase tracking-wider">
                            {t('dashboard.characters_page.create_name')}
                        </label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder={t('dashboard.characters_page.create_name_placeholder')}
                            className={inputCn}
                            autoFocus
                            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                        />
                    </div>

                    {/* Аватар */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] text-muted-foreground uppercase tracking-wider">
                            {t('dashboard.characters_page.edit_avatar')}
                        </label>
                        <input
                            value={avatar}
                            onChange={e => setAvatar(e.target.value)}
                            placeholder={t('dashboard.characters_page.edit_avatar_placeholder')}
                            className={inputCn}
                        />
                    </div>

                    {/* Игровая система */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] text-muted-foreground uppercase tracking-wider">
                            {t('dashboard.characters_page.create_system')}
                        </label>
                        <SystemSelect
                            systems={gameSystems ?? []}
                            value={gameSystemId}
                            onChange={setGameSystemId}
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
                        {createCharacter.isPending ? '...' : t('dashboard.characters_page.create_submit')}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}