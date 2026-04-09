// src/components/games/CreateGameModal.tsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useCreateGame } from '@/hooks/useGames'
import { useGameSystems } from '@/hooks/useCharacters'
import { SystemSelect } from '@/components/ui/SystemSelect'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

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

export function CreateGameModal({ open, onClose }: Props) {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const createGame = useCreateGame()
    const { data: gameSystems } = useGameSystems()

    const [name, setName] = useState('')
    const [gameSystemId, setGameSystemId] = useState('')
    const [description, setDescription] = useState('')
    const [coverUrl, setCoverUrl] = useState('')

    const canSubmit = name.trim().length > 0 && gameSystemId.length > 0 && !createGame.isPending

    const handleSubmit = async () => {
        if (!canSubmit) return
        const result = await createGame.mutateAsync({
            name: name.trim(),
            game_system_id: gameSystemId,
            description: description.trim() || null,
            cover_url: coverUrl.trim() || null,
        })
        toast.success(t('dashboard.games_page.create_btn'))
        handleClose()
        navigate(`/dashboard/games/${result.id}`)
    }

    const handleClose = () => {
        setName('')
        setGameSystemId('')
        setDescription('')
        setCoverUrl('')
        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={(open: boolean) => !open && handleClose()}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>{t('dashboard.games_page.create_title')}</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 pt-2">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] text-muted-foreground uppercase tracking-wider">
                            {t('dashboard.games_page.create_name')}
                        </label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder={t('dashboard.games_page.create_name_placeholder')}
                            className={inputCn}
                            autoFocus
                            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                        />
                    </div>

                    {/* система обязательна для игры */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] text-muted-foreground uppercase tracking-wider">
                            {t('dashboard.games_page.create_system')}
                            <span className="text-destructive ml-0.5">*</span>
                        </label>
                        <SystemSelect
                            systems={gameSystems ?? []}
                            value={gameSystemId}
                            onChange={setGameSystemId}
                            allowNone={false}
                            placeholder={t('dashboard.games_page.create_system')}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] text-muted-foreground uppercase tracking-wider">
                            {t('dashboard.games_page.create_description')}
                        </label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder={t('dashboard.games_page.create_description_placeholder')}
                            rows={3}
                            className={cn(
                                inputCn,
                                'h-auto resize-none py-2 leading-relaxed',
                            )}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] text-muted-foreground uppercase tracking-wider">
                            {t('dashboard.games_page.create_cover')}
                        </label>
                        <input
                            value={coverUrl}
                            onChange={e => setCoverUrl(e.target.value)}
                            placeholder={t('dashboard.games_page.create_cover_placeholder')}
                            className={inputCn}
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
                        {createGame.isPending ? '...' : t('dashboard.games_page.create_submit')}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}