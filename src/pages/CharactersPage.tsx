// src/pages/CharactersPage.tsx
import {useState, useMemo, useEffect} from 'react'
import { useTranslation } from 'react-i18next'
import {useNavigate, useSearchParams} from 'react-router-dom'
import { Search, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useCharactersList, useGameSystems, useDeleteCharacter } from '@/hooks/useCharacters'
import { CharacterCard, CreateCharacterModal, EditCharacterModal } from '@/components/characters'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { Character } from '@/types'
import {useDebounce} from "@/hooks/useDebounce.ts";
import {SystemSelect} from "@/components/ui/SystemSelect.tsx";
import {pushLastCharacter} from "@/hooks/useLastVisited.ts";

const PAGE_SIZE = 100

export function CharactersPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()

    // ── search & filter state ─────────────────────────────────────────────────
    const [search, setSearch] = useState('')
    const debouncedSearch = useDebounce(search, 400)
    const [systemFilter, setSystemFilter] = useState<string>('__all__')

    // ── modal state ───────────────────────────────────────────────────────────
    const [createOpen, setCreateOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<Character | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<Character | null>(null)
    const [searchParams, setSearchParams] = useSearchParams()

    // ── data ──────────────────────────────────────────────────────────────────
    const { data, isLoading } = useCharactersList({
        page: 1,
        page_size: PAGE_SIZE,
        name: debouncedSearch || undefined,
    })
    const { data: gameSystems } = useGameSystems()
    const deleteCharacter = useDeleteCharacter()

    // клиентская фильтрация по системе
    const characters = useMemo(() => {
        if (!data?.items) return []
        if (systemFilter === '__all__') return data.items
        if (systemFilter === '') return data.items.filter(c => !c.game_system_id)
        return data.items.filter(c => c.game_system_id === systemFilter)
    }, [data, systemFilter])

    // ── handlers ──────────────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!deleteTarget) return
        await deleteCharacter.mutateAsync(deleteTarget.id)
        toast.success(t('dashboard.characters_page.delete_confirm_ok'))
        setDeleteTarget(null)
    }

    // открываем модалку если ?create=true
    useEffect(() => {
        if (searchParams.get('create') === 'true') {
            setCreateOpen(true)
            setSearchParams({}, { replace: true })
        }
    }, [searchParams])

    return (
        <div className="flex flex-col h-full gap-4 p-4 overflow-hidden">

            {/* ── Тулбар ── */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* Поиск */}
                <div className="relative flex-1 min-w-[160px]">
                    <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={t('dashboard.characters_page.search_placeholder')}
                        className={cn(
                            'h-9 w-full rounded-md pl-8 pr-3 text-sm',
                            'bg-secondary border border-border text-foreground',
                            'focus:border-brand focus:outline-none focus:ring-0',
                            'placeholder:text-muted-foreground/50 transition-colors',
                        )}
                    />
                </div>

                {/* Фильтр по системе */}
                <div className="min-w-[180px]">
                    <SystemSelect
                        systems={gameSystems ?? []}
                        value={systemFilter}
                        onChange={setSystemFilter}
                        allLabel={t('dashboard.characters_page.filter_system')}
                        allowNone={true}
                    />
                </div>

                {/* Создать */}
                <button
                    onClick={() => setCreateOpen(true)}
                    className={cn(
                        'h-9 px-4 rounded-md text-sm font-medium flex items-center gap-2',
                        'bg-brand text-white hover:bg-brand/90 transition-colors shrink-0',
                    )}
                >
                    <Plus size={14} />
                    {t('dashboard.characters_page.create_btn')}
                </button>
            </div>

            {/* ── Сетка персонажей ── */}
            <div className="flex-1 overflow-y-auto scrollbar-hidden">
                {isLoading ? (
                    // скелетон — простые заглушки нужного размера
                    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div
                                key={i}
                                className="aspect-square rounded-xl bg-secondary/50 animate-pulse"
                            />
                        ))}
                    </div>
                ) : characters.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                        {t('dashboard.characters_page.empty')}
                    </div>
                ) : (
                    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {characters.map(character => (
                            <CharacterCard
                                key={character.id}
                                character={character}
                                onEdit={setEditTarget}
                                onDelete={setDeleteTarget}
                                onClick={() => {
                                    pushLastCharacter({
                                        id: character.id,
                                        name: character.name,
                                        game_system_name: character.game_system_name ?? null,
                                        avatar: character.avatar ?? null,
                                    })
                                    navigate(`/dashboard/characters/${character.id}`)
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Модалки ── */}
            <CreateCharacterModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
            />
            <EditCharacterModal
                character={editTarget}
                onClose={() => setEditTarget(null)}
            />

            {/* ── Подтверждение удаления ── */}
            <AlertDialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t('dashboard.characters_page.delete_confirm_title')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('dashboard.characters_page.delete_confirm_desc', {
                                name: deleteTarget?.name ?? '',
                            })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {t('dashboard.characters_page.delete_confirm_ok')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}