// src/components/games/JoinGameModal.tsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useJoinGame } from '@/hooks/useGames'
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

export function JoinGameModal({ open, onClose }: Props) {
    const { t } = useTranslation()
    const joinGame = useJoinGame()
    const [gameId, setGameId] = useState('')

    // простая UUID-валидация
    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(gameId.trim())
    const canSubmit = isValidUuid && !joinGame.isPending

    const handleSubmit = async () => {
        if (!canSubmit) return
        await joinGame.mutateAsync(gameId.trim())
        toast.success(t('dashboard.games_page.join_success'))
        handleClose()
    }

    const handleClose = () => {
        setGameId('')
        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={(open: boolean) => !open && handleClose()}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>{t('dashboard.games_page.join_title')}</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 pt-2">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] text-muted-foreground uppercase tracking-wider">
                            {t('dashboard.games_page.join_id_label')}
                        </label>
                        <input
                            value={gameId}
                            onChange={e => setGameId(e.target.value)}
                            placeholder={t('dashboard.games_page.join_id_placeholder')}
                            className={cn(
                                'h-9 w-full rounded-md px-3 text-sm font-mono text-foreground',
                                'bg-secondary border border-border',
                                'focus:border-brand focus:outline-none focus:ring-0',
                                'placeholder:text-muted-foreground/30 transition-colors',
                                gameId && !isValidUuid && 'border-destructive',
                            )}
                            autoFocus
                            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className={cn(
                            'h-9 rounded-md text-sm font-medium transition-colors',
                            'bg-brand text-white hover:bg-brand/90',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                        )}
                    >
                        {joinGame.isPending ? '...' : t('dashboard.games_page.join_submit')}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}