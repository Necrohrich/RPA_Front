// src/components/ui/SystemSelect.tsx
import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import type { GameSystem } from '@/types'

type Props = {
    systems: GameSystem[]
    value: string
    onChange: (value: string) => void
    disabled?: boolean
    placeholder?: string
    allowNone?: boolean
    allLabel?: string
}

export function SystemSelect({
                                 systems,
                                 value,
                                 onChange,
                                 disabled = false,
                                 placeholder,
                                 allowNone = true,
                                 allLabel,
                             }: Props) {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)

    const ALL_VALUE = '__all__'
    const NONE_VALUE = '__none__'

    const selectedSystem = systems.find(s => s.id === value)
    const displayValue = value === '__all__'
        ? (allLabel ?? placeholder ?? t('dashboard.characters_page.filter_system'))
        : value === ''
            ? t('dashboard.characters_page.create_system_none')
            : (selectedSystem?.name ?? value)

    const handleSelect = (selected: string) => {
        if (selected === ALL_VALUE) {
            onChange('__all__')
        } else if (selected === NONE_VALUE) {
            onChange('')
        } else {
            const system = systems.find(
                s => s.id === selected || s.name.toLowerCase() === selected
            )
            if (system) onChange(system.id)
        }
        setOpen(false)
    }

    return (
        <Popover open={open} onOpenChange={(open: boolean) => !disabled && setOpen(open)}>
            {/* нативная кнопка вместо Button asChild */}
            <PopoverTrigger>
                <button
                    type="button"
                    disabled={disabled}
                    className={cn(
                        'flex h-9 w-full items-center justify-between rounded-md px-3 text-sm',
                        'bg-secondary border border-border transition-colors',
                        'hover:bg-secondary/80 focus:border-brand focus:outline-none',
                        !value && 'text-muted-foreground',
                        disabled && 'opacity-60 cursor-not-allowed',
                    )}
                >
                    <span className="truncate">{displayValue}</span>
                    <ChevronsUpDown size={14} className="ml-2 shrink-0 text-muted-foreground" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                    <CommandInput
                        placeholder={t('dashboard.characters_page.search_placeholder')}
                        className="h-9"
                    />
                    <CommandList>
                        <CommandEmpty>{t('dashboard.characters_page.system_not_found')}</CommandEmpty>
                        <CommandGroup>
                            {allLabel && (
                                <CommandItem value={ALL_VALUE} onSelect={handleSelect}>
                                    <Check
                                        size={14}
                                        className={cn('mr-2 shrink-0', value === '__all__' ? 'opacity-100' : 'opacity-0')}
                                    />
                                    {allLabel}
                                </CommandItem>
                            )}
                            {allowNone && (
                                <CommandItem
                                    value={NONE_VALUE}
                                    onSelect={handleSelect}
                                >
                                    <Check
                                        size={14}
                                        className={cn(
                                            'mr-2 shrink-0',
                                            value === '' ? 'opacity-100' : 'opacity-0',
                                        )}
                                    />
                                    {t('dashboard.characters_page.create_system_none')}
                                </CommandItem>
                            )}
                            {systems.map(system => (
                                <CommandItem
                                    key={system.id}
                                    value={system.id}
                                    keywords={[system.name]}
                                    onSelect={handleSelect}
                                >
                                    <Check
                                        size={14}
                                        className={cn(
                                            'mr-2 shrink-0',
                                            value === system.id ? 'opacity-100' : 'opacity-0',
                                        )}
                                    />
                                    {system.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}