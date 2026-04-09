// src/components/systems/SystemsToolbar.tsx:
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import * as React from "react";

type Props = {
    search: string
    onSearch: (v: string) => void
    action?: React.ReactNode
}

export function SystemsToolbar({ search, onSearch, action }: Props) {
    const { t } = useTranslation()

    return (
        <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="relative flex-1 min-w-[160px]">
                <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <input
                    value={search}
                    onChange={e => onSearch(e.target.value)}
                    placeholder={t('dashboard.systems_page.search_placeholder')}
                    className={cn(
                        'h-9 w-full rounded-md pl-8 pr-3 text-sm',
                        'bg-secondary border border-border text-foreground',
                        'focus:border-brand focus:outline-none focus:ring-0',
                        'placeholder:text-muted-foreground/50 transition-colors',
                    )}
                />
            </div>
            {action}
        </div>
    )
}