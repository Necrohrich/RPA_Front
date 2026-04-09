// src/components/games/AttachCharacterModal.tsx
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { User, Unlink, Link } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAttachCharacter, useDetachCharacter } from '@/hooks/useGames'
import { useCharactersList } from '@/hooks/useCharacters'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import type { Game } from '@/types'

type Props = {
    game: Game | null
    onClose: () => void
}

export function AttachCharacterModal({ game, onClose }: Props) {
    const { t } = useTranslation()
    const attachCharacter = useAttachCharacter()
    const detachCharacter = useDetachCharacter()

    // загружаем всех своих персонажей совместимых с системой игры
    const { data } = useCharactersList({
        page: 1,
        page_size: 100,
        game_system_id: game?.game_system_id,
    })

    const characters = data?.items ?? []

    // персонаж уже привязанный к этой игре
    const attached = characters.find(c => c.game_id === game?.id)

    // персонажи доступные для привязки:
    // - не привязаны ни к какой игре (game_id === null)
    // - или уже привязаны к этой игре (чтобы показать текущий)
    const available = characters.filter(c => c.game_id === null || c.game_id === game?.id)

    const handleAttach = async (characterId: string) => {
        if (!game) return
        await attachCharacter.mutateAsync({ gameId: game.id, characterId })
        toast.success(t('dashboard.games_page.attach_success'))
    }

    const handleDetach = async (characterId: string) => {
        if (!game) return
        await detachCharacter.mutateAsync({ gameId: game.id, characterId })
        toast.success(t('dashboard.games_page.detach_success'))
    }

    const isPending = attachCharacter.isPending || detachCharacter.isPending

    return (
        <Dialog open={!!game} onOpenChange={(open: boolean) => !open && onClose()}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>{t('dashboard.games_page.attach_character')}</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-2 pt-2">
                    {/* текущий привязанный персонаж — выделен */}
                    {attached && (
                        <div className="flex items-center gap-3 p-2.5 rounded-lg border border-brand/40 bg-brand/5 mb-1">
                            <Avatar avatar={attached.avatar} name={attached.name} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{attached.name}</p>
                                <p className="text-[11px] text-brand/70">{t('dashboard.games_page.attached_current')}</p>
                            </div>
                            <button
                                onClick={() => handleDetach(attached.id)}
                                disabled={isPending}
                                title={t('dashboard.games_page.detach')}
                                className={cn(
                                    'p-1.5 rounded-md transition-colors shrink-0',
                                    'text-muted-foreground hover:text-destructive hover:bg-destructive/10',
                                    'disabled:opacity-50',
                                )}
                            >
                                <Unlink size={14} />
                            </button>
                        </div>
                    )}

                    {/* список доступных персонажей */}
                    {available.length === 0 && !attached ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            {t('dashboard.games_page.no_compatible_characters')}
                        </p>
                    ) : (
                        <div className="flex flex-col gap-1 max-h-64 overflow-y-auto scrollbar-hidden">
                            {available
                                .filter(c => c.game_id !== game?.id) // не показываем уже привязанного повторно
                                .map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => handleAttach(c.id)}
                                        disabled={isPending || !!attached} // блокируем если уже есть привязанный
                                        className={cn(
                                            'flex items-center gap-3 p-2.5 rounded-lg text-left w-full',
                                            'border border-border/50 transition-colors',
                                            'hover:border-brand/40 hover:bg-brand/5',
                                            'disabled:opacity-40 disabled:cursor-not-allowed',
                                            'disabled:hover:border-border/50 disabled:hover:bg-transparent',
                                        )}
                                    >
                                        <Avatar avatar={c.avatar} name={c.name} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                                            {c.game_system_name && (
                                                <p className="text-[11px] text-muted-foreground truncate">
                                                    {c.game_system_name}
                                                </p>
                                            )}
                                        </div>
                                        <Link size={14} className="text-muted-foreground shrink-0" />
                                    </button>
                                ))
                            }
                        </div>
                    )}

                    {/* подсказка если уже привязан */}
                    {attached && available.filter(c => c.game_id !== game?.id).length > 0 && (
                        <p className="text-[11px] text-muted-foreground/60 text-center">
                            {t('dashboard.games_page.detach_first')}
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ avatar, name }: { avatar: string | null; name: string }) {
    return (
        <div className="w-8 h-8 shrink-0 rounded-full bg-secondary border border-border overflow-hidden flex
        items-center justify-center">
            {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
            ) : (
                <User size={14} className="text-muted-foreground/50" />
            )}
        </div>
    )
}