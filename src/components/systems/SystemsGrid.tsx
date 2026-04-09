// src/components/systems/SystemsGrid.tsx
import { useTranslation } from 'react-i18next'
import { SystemCard } from './SystemCard'
import type { GameSystem } from '@/types'

type Props = {
    systems: GameSystem[]
    isLoading: boolean
    isSuperadmin: boolean
    onEdit: (system: GameSystem) => void
    onDelete: (system: GameSystem) => void
    onToggleActive: (system: GameSystem) => void
    onClick: (system: GameSystem) => void
}

export function SystemsGrid({ systems, isLoading, isSuperadmin, onEdit, onDelete, onToggleActive, onClick }: Props) {
    const { t } = useTranslation()

    if (isLoading) return (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 rounded-xl bg-secondary/50 animate-pulse" />
            ))}
        </div>
    )

    if (systems.length === 0) return (
        <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            {t('dashboard.systems_page.empty')}
        </div>
    )

    return (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {systems.map(system => (
                <SystemCard
                    key={system.id}
                    system={system}
                    isSuperadmin={isSuperadmin}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleActive={onToggleActive}
                    onClick={onClick}
                />
            ))}
        </div>
    )
}