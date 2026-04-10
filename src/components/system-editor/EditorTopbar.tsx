// src/components/system-editor/EditorTopbar.tsx
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Upload, Download, Save, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import type { ValidationReport } from '@/types'
import * as React from "react";

type Props = {
    systemName: string
    systemVersion: string
    systemChangelog: string | null
    report: ValidationReport | null
    isValidating: boolean
    isSaving: boolean
    onSave: () => void
    onUploadZip: (file: File) => void
    onExportZip: () => void
}

export function EditorTopbar({
                                 systemName,
                                 systemVersion,
                                 systemChangelog,
                                 report,
                                 isValidating,
                                 isSaving,
                                 onSave,
                                 onUploadZip,
                                 onExportZip,
                             }: Props) {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const hasErrors = report !== null && !report.valid
    const canSave = !hasErrors && !isSaving && !isValidating

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            onUploadZip(file)
            e.target.value = ''
        }
    }

    return (
        <TooltipProvider delay={300}>
            <div className={cn(
                'flex items-center gap-3 px-4 py-2 shrink-0',
                'border-b border-border bg-card',
            )}>
                {/* ← Назад */}
                <button
                    onClick={() => navigate('/dashboard/systems')}
                    className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                    <ChevronLeft size={14} />
                    {t('dashboard.editor.back')}
                </button>

                <div className="w-px h-4 bg-border shrink-0" />

                {/* Название + версия */}
                <span className="text-[13px] font-medium text-foreground truncate flex-1">
                    {systemName}
                </span>

                {/* Версия с тултипом changelog */}
                <Tooltip>
                    <TooltipTrigger>
                        <span className={cn(
                            'text-[11px] text-muted-foreground shrink-0 cursor-default',
                            'border-b border-dashed border-muted-foreground/40',
                            systemChangelog && 'cursor-help',
                        )}>
                            v{systemVersion}
                        </span>
                    </TooltipTrigger>
                    {systemChangelog && (
                        <TooltipContent
                            side="bottom"
                            className="max-w-xs text-[11px] whitespace-pre-wrap"
                        >
                            {systemChangelog}
                        </TooltipContent>
                    )}
                </Tooltip>

                <div className="w-px h-4 bg-border shrink-0" />

                {/* Статус валидации */}
                <div className="flex items-center gap-1.5 shrink-0">
                    {isValidating ? (
                        <>
                            <Loader2 size={12} className="animate-spin text-muted-foreground" />
                            <span className="text-[11px] text-muted-foreground">
                                {t('dashboard.editor.validating')}
                            </span>
                        </>
                    ) : report === null ? null : report.valid && report.warnings.length === 0 ? (
                        <>
                            <CheckCircle2 size={12} className="text-green-500" />
                            <span className="text-[11px] text-green-500">
                                {t('dashboard.editor.valid')}
                            </span>
                        </>
                    ) : !report.valid ? (
                        <>
                            <AlertCircle size={12} className="text-destructive" />
                            <span className="text-[11px] text-destructive">
                                {t('dashboard.editor.has_errors')}
                            </span>
                        </>
                    ) : (
                        <>
                            <AlertCircle size={12} className="text-yellow-500" />
                            <span className="text-[11px] text-yellow-500">
                                {t('dashboard.editor.has_warnings')}
                            </span>
                        </>
                    )}
                </div>

                <div className="w-px h-4 bg-border shrink-0" />

                {/* Кнопки */}
                <div className="flex items-center gap-2 shrink-0">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".zip"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            'flex items-center gap-1.5 h-8 px-3 rounded-md text-[12px]',
                            'bg-secondary border border-border text-muted-foreground',
                            'hover:text-foreground hover:border-brand/50 transition-colors',
                        )}
                    >
                        <Upload size={12} />
                        {t('dashboard.editor.upload_zip')}
                    </button>

                    <button
                        onClick={onExportZip}
                        className={cn(
                            'flex items-center gap-1.5 h-8 px-3 rounded-md text-[12px]',
                            'bg-secondary border border-border text-muted-foreground',
                            'hover:text-foreground hover:border-brand/50 transition-colors',
                        )}
                    >
                        <Download size={12} />
                        {t('dashboard.editor.export_zip')}
                    </button>

                    <button
                        onClick={onSave}
                        disabled={!canSave}
                        className={cn(
                            'flex items-center gap-1.5 h-8 px-3 rounded-md text-[12px] font-medium',
                            'bg-brand text-white hover:bg-brand/90 transition-colors',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                        )}
                    >
                        <Save size={12} />
                        {t('dashboard.editor.save')}
                    </button>
                </div>
            </div>
        </TooltipProvider>
    )
}