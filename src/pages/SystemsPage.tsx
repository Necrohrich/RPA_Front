// src/pages/SystemsPage.tsx
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useDebounce } from '@/hooks/useDebounce'
import { useAdminGameSystems, useDeleteGameSystem, useUpdateGameSystem } from '@/hooks/useGameSystems'
import { SystemsGrid, SystemsToolbar, CreateSystemModal, EditSystemModal } from '@/components/systems'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { GameSystem } from '@/types'

const PAGE_SIZE = 100

export function SystemsPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { user } = useAuth()

    const isSuperadmin = user?.platform_role === 'superadmin'
    const isCreator = user?.platform_role === 'creator' || user?.platform_role === 'moderator' || isSuperadmin

    const [search, setSearch] = useState('')
    const debouncedSearch = useDebounce(search, 400)
    const [createOpen, setCreateOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<GameSystem | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<GameSystem | null>(null)

    const { data, isLoading } = useAdminGameSystems({ page: 1, page_size: PAGE_SIZE })
    const deleteSystem = useDeleteGameSystem()
    const updateSystem = useUpdateGameSystem()

    // клиентская фильтрация по имени — аналог CharactersPage
    const systems = useMemo(() => {
        if (!data?.items) return []
        const q = debouncedSearch.toLowerCase().trim()
        if (!q) return data.items
        return data.items.filter(s => s.name.toLowerCase().includes(q))
    }, [data, debouncedSearch])

    const handleDelete = async () => {
        if (!deleteTarget) return
        await deleteSystem.mutateAsync(deleteTarget.id)
        toast.success(t('dashboard.systems_page.delete_confirm_ok'))
        setDeleteTarget(null)
    }

    const handleToggleActive = async (system: GameSystem) => {
        await updateSystem.mutateAsync({
            id: system.id,
            dto: { is_active: !system.is_active },
        })
        toast.success(t('dashboard.systems_page.toggle_active_ok'))
    }

    const handleClick = (system: GameSystem) => {
        navigate(`/dashboard/systems/${system.id}`)
    }

    // не даём рендерить страницу игрокам без нужной роли
    if (!isCreator) return null

    return (
        <div className="flex flex-col h-full gap-4 p-4 overflow-hidden">
            <SystemsToolbar
                search={search}
                onSearch={setSearch}
                action={
                    // кнопка создания — только для creator/moderator/superadmin
                    // создание через POST /admin/game-systems доступно всем трём ролям
                    <button
                        onClick={() => setCreateOpen(true)}
                        className={cn(
                            'flex items-center gap-1.5 h-9 px-3 rounded-md text-sm font-medium',
                            'bg-brand text-white hover:bg-brand/90 transition-colors shrink-0',
                        )}
                    >
                        <Plus size={14} />
                        {t('dashboard.systems_page.create_btn')}
                    </button>
                }
            />

            <div className="flex-1 overflow-y-auto scrollbar-hidden">
                <SystemsGrid
                    systems={systems}
                    isLoading={isLoading}
                    isSuperadmin={isSuperadmin}
                    onEdit={setEditTarget}
                    onDelete={setDeleteTarget}
                    onToggleActive={handleToggleActive}
                    onClick={handleClick}
                />
            </div>

            <CreateSystemModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
            />

            <EditSystemModal
                system={editTarget}
                onClose={() => setEditTarget(null)}
            />

            <AlertDialog
                open={!!deleteTarget}
                onOpenChange={open => !open && setDeleteTarget(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t('dashboard.systems_page.delete_confirm_title')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('dashboard.systems_page.delete_confirm_desc', { name: deleteTarget?.name })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {deleteSystem.isPending ? '...' : t('dashboard.systems_page.delete_confirm_ok')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}