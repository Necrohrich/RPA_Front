// src/components/system-editor/SchemaTree.tsx
import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { SchemaTab } from '@/types'

type Props = {
    activeTab: SchemaTab
    schema: Record<string, unknown>
}

type TreeNodeProps = {
    label: string
    value: unknown
    depth: number
}

function TreeNode({ label, value, depth }: TreeNodeProps) {
    const [open, setOpen] = useState(depth < 2)
    const isObject = value !== null && typeof value === 'object' && !Array.isArray(value)
    const isArray  = Array.isArray(value)
    const hasChildren = (isObject && Object.keys(value as object).length > 0) ||
        (isArray && (value as unknown[]).length > 0)

    const preview = isArray
        ? `[${(value as unknown[]).length}]`
        : isObject
            ? `{${Object.keys(value as object).length}}`
            : String(value)

    return (
        <div style={{ paddingLeft: depth * 12 }}>
            <button
                onClick={() => hasChildren && setOpen(p => !p)}
                className={cn(
                    'flex items-center gap-1 w-full text-left py-0.5 px-1 rounded text-[11px]',
                    'hover:bg-secondary/60 transition-colors',
                    !hasChildren && 'cursor-default',
                )}
            >
                {/* стрелка — только если есть дочерние */}
                <ChevronRight
                    size={10}
                    className={cn(
                        'shrink-0 transition-transform text-muted-foreground',
                        open && 'rotate-90',
                        !hasChildren && 'opacity-0',
                    )}
                />
                {/* ключ */}
                <span className="text-brand/80 font-mono">{label}</span>
                {/* превью значения если свёрнуто или примитив */}
                {(!open || !hasChildren) && (
                    <span className="text-muted-foreground ml-1 truncate font-mono">
                        {preview}
                    </span>
                )}
            </button>

            {open && hasChildren && (
                isArray
                    ? (value as unknown[]).map((item, i) => (
                        <TreeNode
                            key={i}
                            label={String(i)}
                            value={item}
                            depth={depth + 1}
                        />
                    ))
                    : Object.entries(value as Record<string, unknown>).map(([k, v]) => (
                        <TreeNode
                            key={k}
                            label={k}
                            value={v}
                            depth={depth + 1}
                        />
                    ))
            )}
        </div>
    )
}

const TAB_LABELS: Record<SchemaTab, string> = {
    sheet_schema:   'dashboard.editor.tab_sheet',
    rolls_schema:   'dashboard.editor.tab_rolls',
    rules_schema:   'dashboard.editor.tab_rules',
    actions_schema: 'dashboard.editor.tab_actions',
}

export function SchemaTree({ activeTab, schema }: Props) {
    const { t } = useTranslation()
    const isEmpty = !schema || Object.keys(schema).length === 0

    return (
        <div className="flex flex-col h-full border-l border-border bg-card overflow-hidden">
        <p className="px-3 pt-3 pb-2 text-[10px] uppercase tracking-widest text-muted-foreground shrink-0">
                {t(TAB_LABELS[activeTab])}
            </p>
            <div className="flex-1 overflow-y-auto px-1 pb-2">
                {isEmpty ? (
                    <span className="px-2 text-[11px] text-muted-foreground">—</span>
                ) : (
                    Object.entries(schema).map(([key, value]) => (
                        <TreeNode key={key} label={key} value={value} depth={0} />
                    ))
                )}
            </div>
        </div>
    )
}