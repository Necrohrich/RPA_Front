// src/components/characters/CharacterCard.tsx
import { User, Trash2, Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { CopyableId } from '@/components/ui/CopyableId'
import type { Character } from '@/types'

type Props = {
    character: Character
    onEdit: (character: Character) => void
    onDelete: (character: Character) => void
    onClick: (character: Character) => void
}

export function CharacterCard({ character, onEdit, onDelete, onClick }: Props) {
    const { t } = useTranslation()

    return (
        <div
            onClick={() => onClick(character)}
            className={cn(
                'relative flex flex-col items-center gap-2 p-4 rounded-xl cursor-pointer',
                'bg-card border border-border/50',
                'hover:border-brand/50 hover:bg-card/80 transition-all duration-200',
                'group aspect-square justify-center',
            )}
        >
            {/* Кнопки действий — появляются при hover */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={e => { e.stopPropagation(); onEdit(character) }}
                    className={cn(
                        'p-1.5 rounded-md transition-colors',
                        'text-muted-foreground hover:text-foreground hover:bg-secondary',
                    )}
                    aria-label="edit"
                >
                    <Pencil size={13} />
                </button>
                <button
                    onClick={e => { e.stopPropagation(); onDelete(character) }}
                    className={cn(
                        'p-1.5 rounded-md transition-colors',
                        'text-muted-foreground hover:text-destructive hover:bg-destructive/10',
                    )}
                    aria-label="delete"
                >
                    <Trash2 size={13} />
                </button>
            </div>

            {/* Аватар */}
            <div className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center shrink-0',
                'bg-secondary border border-border',
                'overflow-hidden',
            )}>
                {character.avatar ? (
                    <img
                        src={character.avatar}
                        alt={character.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <User size={28} className="text-muted-foreground/50" />
                )}
            </div>

            {/* Имя + копируемый ID */}
            <div className="flex items-center gap-1.5 max-w-full">
                <span className="text-sm font-medium text-foreground truncate">
                    {character.name}
                </span>
                <CopyableId id={character.id} />
            </div>

            {/* Игра и система */}
            <div className="flex flex-col items-center gap-0.5 w-full">
                <span className="text-[11px] text-muted-foreground truncate max-w-full">
                    {character.game_name ?? t('dashboard.characters_page.no_game')}
                </span>
                {character.game_system_name && (
                    <span className="text-[10px] text-brand/70 truncate max-w-full">
                        {character.game_system_name}
                    </span>
                )}
            </div>
        </div>
    )
}