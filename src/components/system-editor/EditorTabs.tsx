// src/components/system-editor/EditorTabs.tsx
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { SchemaTab } from '@/types'

type Props = {
    active: SchemaTab
    onChange: (tab: SchemaTab) => void
    // подсвечиваем вкладки с ошибками
    errorTabs: Set<SchemaTab>
    warningTabs: Set<SchemaTab>
}

type TabConfig = {
    id: SchemaTab
    labelKey: string
}

const TABS: TabConfig[] = [
    { id: 'sheet_schema',   labelKey: 'dashboard.editor.tab_sheet'   },
    { id: 'rolls_schema',   labelKey: 'dashboard.editor.tab_rolls'   },
    { id: 'rules_schema',   labelKey: 'dashboard.editor.tab_rules'   },
    { id: 'actions_schema', labelKey: 'dashboard.editor.tab_actions' },
]

export function EditorTabs({ active, onChange, errorTabs, warningTabs }: Props) {
    const { t } = useTranslation()

    return (
        <div className="flex flex-col h-full border-r border-border bg-card overflow-y-auto">
        <p className="px-3 pt-3 pb-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                {t('dashboard.editor.tabs_label')}
            </p>
            {TABS.map(({ id, labelKey }) => {
                const hasError   = errorTabs.has(id)
                const hasWarning = warningTabs.has(id)
                const isActive   = active === id

                return (
                    <button
                        key={id}
                        onClick={() => onChange(id)}
                        className={cn(
                            'flex items-center gap-2 px-3 py-2 text-[12px] text-left transition-colors',
                            'border-l-[3px]',
                            isActive
                                ? 'border-brand bg-secondary text-foreground font-medium'
                                : 'border-transparent text-muted-foreground hover:text-foreground ' +
                                'hover:bg-secondary/60',
                        )}
                    >
                        <span className="flex-1">{t(labelKey)}</span>
                        {/* индикаторы ошибок/предупреждений на вкладке */}
                        {hasError && (
                            <span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                        )}
                        {!hasError && hasWarning && (
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" />
                        )}
                    </button>
                )
            })}
        </div>
    )
}