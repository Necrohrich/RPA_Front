// src/components/characters/EditCharacterModal.tsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useUpdateCharacter, useGameSystems } from '@/hooks/useCharacters'
import type { Character } from '@/types'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {SystemSelect} from "@/components/ui/SystemSelect.tsx";

type Props = {
    character: Character | null
    onClose: () => void
}

const inputCn = cn(
    'h-9 w-full rounded-md px-3 text-sm text-foreground',
    'bg-secondary border border-border',
    'focus:border-brand focus:outline-none focus:ring-0',
    'placeholder:text-muted-foreground/50 transition-colors',
    'disabled:opacity-50 disabled:cursor-not-allowed',
)

export function EditCharacterModal({ character, onClose }: Props) {
    const { t } = useTranslation()
    const updateCharacter = useUpdateCharacter()
    const { data: gameSystems } = useGameSystems()

    const [name, setName] = useState('')
    const [avatar, setAvatar] = useState('')
    const [gameSystemId, setGameSystemId] = useState('')

    // синхронизируем стейт когда открывается модалка с новым персонажем
    useEffect(() => {
        if (character) {
            setName(character.name)
            setAvatar(character.avatar ?? '')
            setGameSystemId(character.game_system_id ?? '')
        }
    }, [character])

    const canSubmit = name.trim().length > 0 && !updateCharacter.isPending
    // система заблокирована если уже установлена — сервер не позволяет менять
    const systemLocked = !!character?.game_system_id

    const handleSubmit = async () => {
        if (!character || !canSubmit) return
        await updateCharacter.mutateAsync({
            id: character.id,
            dto: {
                name: name.trim(),
                avatar: avatar.trim() || null,
                // не отправляем game_system_id если заблокирована
                ...(!systemLocked && { game_system_id: gameSystemId || null }),
            },
        })
        toast.success(t('common.save'))
        onClose()
    }

    return (
        <Dialog open={!!character} onOpenChange={v => !v && onClose()}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>{t('dashboard.characters_page.edit_title')}</DialogTitle>
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
                            className={inputCn}
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

                    {/* Система — readonly если уже установлена */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] text-muted-foreground uppercase tracking-wider">
                            {t('dashboard.characters_page.create_system')}
                        </label>
                        <SystemSelect
                            systems={gameSystems ?? []}
                            value={gameSystemId}
                            onChange={setGameSystemId}
                            disabled={systemLocked}
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
                        {updateCharacter.isPending ? '...' : t('dashboard.characters_page.edit_submit')}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}