// src/pages/MyGamesPage.tsx
import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useMyGamesList, useDeleteGame } from '@/hooks/useGames'
import { useGameSystems } from '@/hooks/useCharacters'
import { useAuth } from '@/hooks/useAuth'
import { useDebounce } from '@/hooks/useDebounce'
import { GamesGrid, GamesToolbar, CreateGameModal } from '@/components/games'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { Game } from '@/types'
import {setLastGameId} from "@/hooks/useLastVisited.ts";

const PAGE_SIZE = 100

export function MyGamesPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [search, setSearch] = useState('')
    const debouncedSearch = useDebounce(search, 400)
    const [systemFilter, setSystemFilter] = useState('__all__')
    const [createOpen, setCreateOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<Game | null>(null)
    const [searchParams, setSearchParams] = useSearchParams()

    const { data, isLoading } = useMyGamesList({
        page: 1, page_size: PAGE_SIZE,
        name: debouncedSearch || undefined,
    })
    const { data: gameSystems } = useGameSystems()
    const deleteGame = useDeleteGame()

    const games = useMemo(() => {
        if (!data?.items) return []
        if (systemFilter === '__all__') return data.items
        if (systemFilter === '') return data.items.filter(g => !g.game_system_id)
        return data.items.filter(g => g.game_system_id === systemFilter)
    }, [data, systemFilter])

    useEffect(() => {
        if (searchParams.get('create') === 'true') {
            setCreateOpen(true)
            setSearchParams({}, { replace: true })
        }
    }, [searchParams, setSearchParams])

    const handleDelete = async () => {
        if (!deleteTarget) return
        await deleteGame.mutateAsync(deleteTarget.id)
        toast.success(t('dashboard.games_page.delete_confirm_ok'))
        setDeleteTarget(null)
    }

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
                        onClick={() => setCreateOpen(true)}
                        className={cn(
                            'h-9 px-4 rounded-md text-sm font-medium flex items-center gap-2',
                            'bg-brand text-white hover:bg-brand/90 transition-colors shrink-0',
                        )}
                    >
                        <Plus size={14} />
                        {t('dashboard.games_page.create_btn')}
                    </button>
                }
            />

            <div className="flex-1 overflow-y-auto scrollbar-hidden">
                <GamesGrid
                    games={games}
                    isLoading={isLoading}
                    isOwner={g => g.author_id === user?.id}
                    onDelete={setDeleteTarget}
                    onSettings={g => navigate(`/dashboard/games/${g.id}/settings`)}
                    onReviews={g => navigate(`/dashboard/games/${g.id}/reviews`)}
                    onClick={g => {
                        setLastGameId('mine', g.id)
                        navigate(`/dashboard/games/${g.id}`)
                    }}
                />
            </div>

            <CreateGameModal open={createOpen} onClose={() => setCreateOpen(false)} />

            <AlertDialog open={!!deleteTarget} onOpenChange={(v: boolean) => !v && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('dashboard.games_page.delete_confirm_title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('dashboard.games_page.delete_confirm_desc', { name: deleteTarget?.name ?? '' })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            {t('dashboard.games_page.delete_confirm_ok')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}