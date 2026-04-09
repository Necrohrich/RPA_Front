// src/pages/ParticipatedGamesPage.tsx
import {useState, useMemo, useEffect} from 'react'
import { useTranslation } from 'react-i18next'
import {useNavigate, useSearchParams} from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useParticipatedGamesList, useLeaveGame } from '@/hooks/useGames'
import { useGameSystems } from '@/hooks/useCharacters'
import { useAuth } from '@/hooks/useAuth'
import { useDebounce } from '@/hooks/useDebounce'
import {AttachCharacterModal, GamesGrid, GamesToolbar, JoinGameModal} from '@/components/games'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { Game } from '@/types'
import {setLastGameId} from "@/hooks/useLastVisited.ts";

const PAGE_SIZE = 100

export function ParticipatedGamesPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [search, setSearch] = useState('')
    const debouncedSearch = useDebounce(search, 400)
    const [systemFilter, setSystemFilter] = useState('__all__')
    const [joinOpen, setJoinOpen] = useState(false)
    const [leaveTarget, setLeaveTarget] = useState<Game | null>(null)
    const [attachTarget, setAttachTarget] = useState<Game | null>(null)
    const [searchParams, setSearchParams] = useSearchParams()

    const { data, isLoading } = useParticipatedGamesList({
        page: 1, page_size: PAGE_SIZE,
        name: debouncedSearch || undefined,
    })
    const { data: gameSystems } = useGameSystems()
    const leaveGame = useLeaveGame()

    const games = useMemo(() => {
        if (!data?.items) return []
        if (systemFilter === '__all__') return data.items
        if (systemFilter === '') return data.items.filter(g => !g.game_system_id)
        return data.items.filter(g => g.game_system_id === systemFilter)
    }, [data, systemFilter])

    const handleLeave = async () => {
        if (!leaveTarget || !user) return
        await leaveGame.mutateAsync({ gameId: leaveTarget.id, userId: user.id })
        toast.success(t('dashboard.games_page.leave_confirm_ok'))
        setLeaveTarget(null)
    }

    useEffect(() => {
        if (searchParams.get('join') === 'true') {
            setJoinOpen(true)
            setSearchParams({}, { replace: true })
        }
    }, [searchParams, setSearchParams])

    return (
        <div className="flex flex-col h-full gap-4 p-4 overflow-hidden">
            <GamesToolbar
                search={search}
                onSearch={setSearch}
                systemFilter={systemFilter}
                onSystemFilter={setSystemFilter}
                gameSystems={gameSystems ?? []}
                action={
                    <button
                        onClick={() => setJoinOpen(true)}
                        className={cn(
                            'h-9 px-4 rounded-md text-sm font-medium flex items-center gap-2',
                            'bg-brand text-white hover:bg-brand/90 transition-colors shrink-0',
                        )}
                    >
                        <UserPlus size={14} />
                        {t('dashboard.games_page.join_btn')}
                    </button>
                }
            />

            <div className="flex-1 overflow-y-auto scrollbar-hidden">
                <GamesGrid
                    games={games}
                    isLoading={isLoading}
                    isOwner={() => false}
                    onLeave={setLeaveTarget}
                    onAttachCharacter={setAttachTarget}
                    onReviews={g => navigate(`/dashboard/games/${g.id}/reviews`)}
                    onClick={g => {
                        setLastGameId('participated', g.id)
                        navigate(`/dashboard/games/${g.id}`)
                    }}
                />
            </div>

            <JoinGameModal open={joinOpen} onClose={() => setJoinOpen(false)} />
            <AttachCharacterModal
                game={attachTarget}
                onClose={() => setAttachTarget(null)}
            />

            <AlertDialog open={!!leaveTarget} onOpenChange={(v: boolean) => !v && setLeaveTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('dashboard.games_page.leave_confirm_title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('dashboard.games_page.leave_confirm_desc', { name: leaveTarget?.name ?? '' })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleLeave} className="bg-destructive hover:bg-destructive/90">
                            {t('dashboard.games_page.leave_confirm_ok')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}