// src/components/dashboard/FolderTabs.tsx

import { cn } from '@/lib/utils'

export type FolderTab<T extends string = string> = {
    key: T
    label: string
}

type Props<T extends string> = {
    tabs: FolderTab<T>[]
    active: T
    onChange: (key: T) => void
    className?: string
}

export function FolderTabs<T extends string>({ tabs, active, onChange, className }: Props<T>) {
    return (
        <div className={cn('flex items-end', className)}>
            {tabs.map((tab, i) => {
                const isActive = tab.key === active
                const prevIsActive = i > 0 && tabs[i - 1].key === active

                return (
                    <button
                        key={tab.key}
                        onClick={() => onChange(tab.key)}
                        className={cn(
                            // базовые стили
                            'relative px-3 py-1.5 text-[11px] font-medium transition-all duration-150',
                            'border border-b-0 rounded-t-md select-none whitespace-nowrap',
                            // налезание вкладок друг на друга
                            i > 0 && '-ml-px',
                            isActive
                                ? 'bg-card border-border text-foreground z-10 translate-y-0'
                                : [
                                    'bg-secondary text-muted-foreground translate-y-[4px] z-0',
                                    'hover:text-foreground hover:bg-secondary/80',
                                    // если левый сосед активен — его border перекрывает нас,
                                    // поэтому левый border не нужен
                                    prevIsActive && 'border-l-transparent',
                                ],
                        )}
                    >
                        {tab.label}
                    </button>
                )
            })}
        </div>
    )
}

// Использование на карточке:
// activeIndex === 0 → rounded-tl-none (левый верхний угол под вкладкой)
// activeIndex > 0  → все углы стандартные

export function getCardRadiusClass(activeIndex: number): string {
    return activeIndex === 0 ? 'rounded-tl-none' : ''
}