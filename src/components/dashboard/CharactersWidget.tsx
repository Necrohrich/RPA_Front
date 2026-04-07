// src/components/dashboard/CharactersWidget.tsx

import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useMyCharacters } from '@/hooks/useDashboard'
import { pushLastCharacter } from '@/hooks/useLastVisited'
import { CopyableId } from '@/components/ui/CopyableId'
import { Plus, UserCircle } from 'lucide-react'

const CHAR_LIMIT = 5

// ── CharacterCard ─────────────────────────────────────────────────────────────

type CharacterCardProps = {
    id: string
    name: string
    game_system_name: string | null
    game_name: string | null
    avatar: string | null
    onClick: () => void
}

function CharacterCard({ id, name, game_system_name, game_name, avatar, onClick }: CharacterCardProps) {
    const initials = name.slice(0, 2).toUpperCase()

    return (
        <button
            onClick={onClick}
            className={cn(
                'w-full flex items-center gap-2.5 py-2 border-b border-border/40 last:border-0',
                'hover:bg-secondary/40 -mx-4 px-4 transition-colors',
            )}
        >
            {/* Аватар */}
            <div className="w-8 h-8 shrink-0 rounded-full bg-brand/15 overflow-hidden flex items-center
            justify-center">
                {avatar ? (
                    <img src={avatar} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-[11px] font-semibold text-brand">{initials}</span>
                )}
            </div>

            {/* Инфо */}
            <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                    <span className="text-[12px] font-medium text-foreground truncate shrink min-w-0">{name}</span>
                    <CopyableId id={id} />
                    {game_system_name && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-medium bg-secondary
                        text-muted-foreground border border-border/60">
              {game_system_name}
            </span>
                    )}
                </div>
                <p className="text-[10px] text-muted-foreground truncate">
                    {game_name ?? '—'}
                </p>
            </div>
        </button>
    )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function CharacterSkeleton() {
    return (
        <div className="flex items-center gap-2.5 py-2 border-b border-border/40 last:border-0">
            <div className="w-8 h-8 shrink-0 rounded-full bg-secondary animate-pulse" />
            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                <div className="h-2.5 w-2/3 rounded bg-secondary animate-pulse" />
                <div className="h-2 w-1/2 rounded bg-secondary animate-pulse" />
            </div>
        </div>
    )
}

// ── CharactersWidget ──────────────────────────────────────────────────────────

export function CharactersWidget({ className }: { className?: string }) {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { data, isLoading } = useMyCharacters()

    const characters = data?.items.slice(0, CHAR_LIMIT) ?? []
    const isEmpty = !isLoading && characters.length === 0

    const handleCharacterClick = (char: typeof characters[number]) => {
        pushLastCharacter({
            id: char.id,
            name: char.name,
            game_system_name: char.game_system_name ?? null,
            avatar: char.avatar ?? null,
        })
        navigate(`/dashboard/characters/${char.id}`)
    }

    return (
        <div className={cn('flex flex-col min-w-0', className)}>
            {/* Шапка в стиле папки */}
            <div className="flex items-end">
                <div className={cn(
                    'px-3 py-1.5 text-[11px] font-medium',
                    'bg-card border border-b-0 border-border rounded-t-md',
                    'text-foreground select-none',
                )}>
                    {t('dashboard.characters.tab')}
                </div>
            </div>

            <div className="bg-card border border-border rounded-md rounded-tl-none flex flex-col flex-1 min-h-0
            p-4 relative z-10">
                {/* Список */}
                <div className="px-4 py-1 flex-1 overflow-y-auto scrollbar-hidden">
                    {isLoading ? (
                        Array.from({ length: 3 }, (_, i) => <CharacterSkeleton key={i} />)
                    ) : isEmpty ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="flex flex-col items-center gap-2">
                                <UserCircle size={28} className="text-muted-foreground/30" />
                                <p className="text-[12px] text-muted-foreground/60 italic">
                                    {t('dashboard.characters.empty')}
                                </p>
                            </div>
                        </div>
                    ) : (
                        characters.map(char => (
                            <CharacterCard
                                key={char.id}
                                id={char.id}
                                name={char.name}
                                game_system_name={char.game_system_name ?? null}
                                game_name={char.game_name ?? null}
                                avatar={char.avatar ?? null}
                                onClick={() => handleCharacterClick(char)}
                            />
                        ))
                    )}
                </div>

                {/* Кнопка добавить */}
                <div className="mt-3 pt-3 border-t border-border/40 shrink-0">
                    <button
                        onClick={() => navigate('/dashboard/characters/new')}
                        className={cn(
                            'w-full flex items-center justify-center gap-1.5',
                            'px-3 py-1.5 rounded text-[12px] font-medium',
                            'border border-dashed border-border text-muted-foreground',
                            'hover:text-foreground hover:border-brand/50 hover:bg-brand/5 transition-colors',
                        )}
                    >
                        <Plus size={12} />
                        {t('dashboard.characters.add')}
                    </button>
                </div>
            </div>
        </div>
    )
}