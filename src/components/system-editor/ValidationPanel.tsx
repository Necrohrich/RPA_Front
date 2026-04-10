// src/components/system-editor/ValidationPanel.tsx
import { useTranslation } from 'react-i18next'
import { AlertCircle, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'
import type { ValidationReport } from '@/types'
import type {TFunction} from "i18next";

type Props = {
    report: ValidationReport | null
    isValidating: boolean
}

const CODE_KEY: Record<string, string> = {
    DUPLICATE_ID:                        'dashboard.editor.err_duplicate_id',
    INVALID_ID_FORMAT:                   'dashboard.editor.err_invalid_id_format',
    COMPUTED_NO_FORMULA:                 'dashboard.editor.err_computed_no_formula',
    UNKNOWN_VARIABLE:                    'dashboard.editor.err_unknown_variable',
    SELECT_NO_OPTIONS:                   'dashboard.editor.err_select_no_options',
    SKILL_NO_BASE:                       'dashboard.editor.err_skill_no_base',
    MIN_GREATER_MAX:                     'dashboard.editor.err_min_greater_max',
    CIRCULAR_DEPENDENCY:                 'dashboard.editor.err_circular_dependency',
    UNKNOWN_ROLL_RESULT_TYPE:            'dashboard.editor.err_unknown_roll_result_type',
    ROLL_UNKNOWN_TABLE:                  'dashboard.editor.err_roll_unknown_table',
    ROLL_UNKNOWN_REF:                    'dashboard.editor.err_roll_unknown_ref',
    CONDITION_UNKNOWN_ROLL_REF:          'dashboard.editor.err_condition_unknown_roll_ref',
    ACTION_UNKNOWN_ROLL_REF:             'dashboard.editor.err_action_unknown_roll_ref',
    OPTION_EFFECT_UNKNOWN_FIELD:         'dashboard.editor.err_option_effect_unknown_field',
    RESOURCE_POOL_UNKNOWN_TARGET:        'dashboard.editor.err_resource_pool_unknown_target',
    RESOURCE_POOL_UNKNOWN_INITIAL_FIELD: 'dashboard.editor.err_resource_pool_unknown_initial_field',
    ITEM_UNKNOWN_FIELD:                  'dashboard.editor.err_item_unknown_field',
    TOO_MANY_SECTIONS:                   'dashboard.editor.err_too_many_sections',
    TOO_MANY_FIELDS:                     'dashboard.editor.err_too_many_fields',
    TOO_MANY_ROLLS:                      'dashboard.editor.err_too_many_rolls',
    TOO_MANY_OPTIONS:                    'dashboard.editor.err_too_many_options',
    INVALID_EXPLODE_LIMIT:               'dashboard.editor.err_invalid_explode_limit',
    MANIFEST_MODULE_EMPTY:               'dashboard.editor.warn_manifest_module_empty',
    MISSING_EXPLODE_LIMIT:               'dashboard.editor.warn_missing_explode_limit',
}

function issueMessage(code: string, message: string, t: TFunction): string {
    const key = CODE_KEY[code]
    // если есть перевод — используем его, иначе сырое сообщение с сервера как fallback
    if (!key) return message
    const translated = t(key)
    return `${translated} (${message})`
}

export function ValidationPanel({ report, isValidating }: Props) {
    const { t } = useTranslation()

    return (
        <div className="h-full shrink-0 border-t border-border bg-card flex flex-col overflow-hidden">
            {/* статус-строка */}
            <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border shrink-0">
                {isValidating ? (
                    <>
                        <Loader2 size={12} className="text-muted-foreground animate-spin" />
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
                            {t('dashboard.editor.has_errors')} ({report.errors.length})
                        </span>
                    </>
                ) : (
                    <>
                        <AlertTriangle size={12} className="text-yellow-500" />
                        <span className="text-[11px] text-yellow-500">
                            {t('dashboard.editor.has_warnings')} ({report.warnings.length})
                        </span>
                    </>
                )}
            </div>

            {/* статистика — показываем всегда когда есть report */}
            {report !== null && !isValidating && (
                <div className="flex items-center gap-3 px-3 py-1.5 border-b border-border shrink-0 text-[10px] text-muted-foreground">
                    <span>
                        {t('dashboard.editor.stat_sections', { count: report.stats.sections_count })}
                    </span>
                    <span>
                        {t('dashboard.editor.stat_fields', { count: report.stats.fields_count })}
                    </span>
                    {report.stats.computed_fields > 0 && (
                        <span>
                            {t('dashboard.editor.stat_computed', { count: report.stats.computed_fields })}
                        </span>
                    )}
                    <span>
                        {t('dashboard.editor.stat_rolls', { count: report.stats.rolls_count })}
                    </span>
                </div>
            )}

            {/* список issues */}
            <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-1">
                {report === null || (report.errors.length === 0 && report.warnings.length === 0) ? (
                    <span className="text-[11px] text-muted-foreground">
                        {!isValidating && report !== null && t('dashboard.editor.no_issues')}
                    </span>
                ) : (
                    <>
                        {report.errors.map((issue, i) => (
                            <div key={i} className="flex items-start gap-2 text-[11px]">
                                <AlertCircle size={11} className="text-destructive shrink-0 mt-0.5" />
                                <span className="text-destructive font-mono">
                                    {issue.path && (
                                        <span className="text-destructive/70 mr-1">[{issue.path}]</span>
                                    )}
                                    {issueMessage(issue.code, issue.message, t)}
                                </span>
                            </div>
                        ))}
                        {report.warnings.map((issue, i) => (
                            <div key={i} className="flex items-start gap-2 text-[11px]">
                                <AlertTriangle size={11} className="text-yellow-500 shrink-0 mt-0.5" />
                                <span className="text-yellow-500 font-mono">
                                    {issue.path && (
                                        <span className="text-yellow-500/70 mr-1">[{issue.path}]</span>
                                    )}
                                    {issueMessage(issue.code, issue.message, t)}
                                </span>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    )
}