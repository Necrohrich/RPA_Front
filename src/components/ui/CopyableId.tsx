// src/components/ui/CopyableId.tsx

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import * as React from "react";

type Props = {
    id: string
    className?: string
}

export function CopyableId({ id, className }: Props) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation()  // не даём клику всплыть до родительской кнопки
        await navigator.clipboard.writeText(id)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    return (
        <div className={cn('group relative inline-flex', className)}>
            {/* стрелка-триггер */}
            <button
                onClick={handleCopy}
                className="flex items-center gap-0.5 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                aria-label="Copy ID"
            >
                {copied
                    ? <Check size={11} className="text-brand" />
                    : <Copy size={11} />
                }
            </button>

            {/* tooltip */}
            <div className={cn(
                'absolute left-full top-1/2 -translate-y-1/2 ml-1.5 z-50',
                'pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150',
                'bg-popover border border-border rounded px-2 py-1',
                'text-[10px] text-muted-foreground font-mono whitespace-nowrap',
            )}>
                {id}
            </div>
        </div>
    )
}