// src/pages/SystemEditorPage.tsx
import {useState, useEffect, useCallback, useRef} from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import {
    EditorTopbar,
    EditorTabs,
    SchemaEditor,
    SchemaTree,
    ValidationPanel,
    SaveModal,
} from '@/components/system-editor'
import {
    useGameSystemDetail,
    useValidateSchemas,
    useSaveSchemas,
    useUploadZip,
    exportZip, useGameSystemSchemas,
} from '@/hooks/useGameSystems'
import { SCHEMA_TEMPLATES, isSchemaEmpty } from '@/lib/schemaTemplates'
import type { SchemaTab, SchemasDto, ValidationReport } from '@/types'

// ── helpers ───────────────────────────────────────────────────────────────────

function toJson(obj: Record<string, unknown>): string {
    return JSON.stringify(obj, null, 2)
}

function parseJson(str: string): Record<string, unknown> | null {
    try { return JSON.parse(str) } catch { return null }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function SystemEditorPage() {
    const { id } = useParams<{ id: string }>()
    const { t } = useTranslation()

    const { data: system } = useGameSystemDetail(id!)
    const { data: serverSchemas} = useGameSystemSchemas(id!)
    const isLoading = !system || !serverSchemas

    const validateMutation = useValidateSchemas()
    const saveMutation = useSaveSchemas()
    const uploadMutation = useUploadZip()

    const [activeTab, setActiveTab] = useState<SchemaTab>('sheet_schema')
    const [saveModalOpen, setSaveModalOpen] = useState(false)
    const [report, setReport] = useState<ValidationReport | null>(null)

    // каждая вкладка хранит свою JSON-строку независимо
    const [schemas, setSchemas] = useState<Record<SchemaTab, string>>({
        sheet_schema:   toJson(SCHEMA_TEMPLATES.sheet_schema),
        rolls_schema:   toJson(SCHEMA_TEMPLATES.rolls_schema),
        rules_schema:   toJson(SCHEMA_TEMPLATES.rules_schema),
        actions_schema: toJson(SCHEMA_TEMPLATES.actions_schema),
    })

    // заполняем редактор данными системы когда они загрузились
    useEffect(() => {
        if (!serverSchemas) return

        const hasAnySchema = !isSchemaEmpty(serverSchemas.sheet_schema)
            || !isSchemaEmpty(serverSchemas.rolls_schema)
            || !isSchemaEmpty(serverSchemas.rules_schema)
            || !isSchemaEmpty(serverSchemas.actions_schema)

        setSchemas({
            sheet_schema:   toJson(hasAnySchema
                ? serverSchemas.sheet_schema
                : SCHEMA_TEMPLATES.sheet_schema),
            rolls_schema:   toJson(hasAnySchema
                ? serverSchemas.rolls_schema
                : SCHEMA_TEMPLATES.rolls_schema),
            rules_schema:   toJson(hasAnySchema
                ? serverSchemas.rules_schema
                : SCHEMA_TEMPLATES.rules_schema),
            actions_schema: toJson(hasAnySchema
                ? serverSchemas.actions_schema
                : SCHEMA_TEMPLATES.actions_schema),
        })
    }, [serverSchemas])

    // Ctrl+S — слушаем кастомное событие из SchemaEditor
    useEffect(() => {
        const handler = () => setSaveModalOpen(true)
        window.addEventListener('editor:save', handler)
        return () => window.removeEventListener('editor:save', handler)
    }, [])

    // ── валидация ─────────────────────────────────────────────────────────────

    const schemasRef = useRef(schemas)
    useEffect(() => { schemasRef.current = schemas }, [schemas])

    const buildDto = useCallback((overrides?: Partial<Record<SchemaTab, string>>): SchemasDto | null => {
        const merged = { ...schemasRef.current, ...overrides }

        const sheet   = parseJson(merged.sheet_schema)
        const rolls   = parseJson(merged.rolls_schema)
        const rules   = parseJson(merged.rules_schema)
        const actions = parseJson(merged.actions_schema)

        // если хотя бы одна вкладка невалидный JSON — не отправляем
        if (!sheet || !rolls || !rules || !actions) return null

        return {
            version: system?.version ?? '1.0.0',
            sheet_schema:   sheet,
            rolls_schema:   rolls,
            rules_schema:   rules,
            actions_schema: actions,
        }
    }, [system?.version])

    const handleValidateRequest = useCallback(async (_: string) => {
        if (!id) return
        const dto = buildDto()
        if (!dto) return  // невалидный JSON в одной из вкладок — ждём исправления

        try {
            const result = await validateMutation.mutateAsync({ id, dto })
            setReport(result)
        } catch {
            // ошибки сети не сбрасывают отчёт
        }
    }, [id, buildDto])

    // ── сохранение ────────────────────────────────────────────────────────────

    const handleSaveConfirm = async (version: string, changelog: string) => {
        if (!id) return
        const dto = buildDto()
        if (!dto) return

        try {
            const result = await saveMutation.mutateAsync({
                id,
                dto: { ...dto, version, changelog: changelog || null },
            })
            setReport(result)
            setSaveModalOpen(false)
            toast.success(t('dashboard.editor.save_ok'))
        } catch {
            // axios интерцептор показывает тост с ошибкой
        }
    }

    // ── upload ZIP ────────────────────────────────────────────────────────────

    const handleUploadZip = async (file: File) => {
        if (!id) return
        try {
            const result = await uploadMutation.mutateAsync({ id, file })
            setReport(result)
            toast.success(t('dashboard.editor.upload_ok'))
            // система перезагрузится через invalidateQueries в хуке
        } catch {}
    }

    // ── export ZIP ────────────────────────────────────────────────────────────

    const handleExportZip = async () => {
        if (!id) return
        try {
            const blob = await exportZip(id)
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `schema_${id}.zip`
            a.click()
            URL.revokeObjectURL(url)
        } catch {}
    }

    // ── вычисляем вкладки с ошибками для индикаторов ─────────────────────────

    // сервер возвращает path вида "sheet_schema.sections[0].id" — берём первый сегмент
    const errorTabs = new Set<SchemaTab>(
        report?.errors
            .map(e => e.path?.split('.')[0] as SchemaTab)
            .filter(Boolean) ?? []
    )
    const warningTabs = new Set<SchemaTab>(
        report?.warnings
            .map(e => e.path?.split('.')[0] as SchemaTab)
            .filter(Boolean) ?? []
    )

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <span className="text-sm text-muted-foreground">{t('common.loading')}...</span>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen bg-background overflow-hidden">
            <EditorTopbar
                systemName={system.name}
                systemVersion={system.version}
                systemChangelog={system.changelog}
                report={report}
                isValidating={validateMutation.isPending}
                isSaving={saveMutation.isPending}
                onSave={() => setSaveModalOpen(true)}
                onUploadZip={handleUploadZip}
                onExportZip={handleExportZip}
            />

            <PanelGroup
                direction="horizontal"
                style={{ flex: 1, overflow: 'hidden', height: 0 }}
            >
                {/* вкладки схем */}
                <Panel defaultSize={12} minSize={8} maxSize={20}>
                    <div style={{ height: '100%', overflow: 'hidden' }}>
                        <EditorTabs
                            active={activeTab}
                            onChange={setActiveTab}
                            errorTabs={errorTabs}
                            warningTabs={warningTabs}
                        />
                    </div>
                </Panel>

                <PanelResizeHandle className="w-1 bg-border hover:bg-brand/50 transition-colors cursor-col-resize" />

                {/* центр: редактор + validation */}
                <Panel defaultSize={68} minSize={40}>
                    <PanelGroup direction="vertical" style={{ height: '100%' }}>
                        <Panel defaultSize={75} minSize={30}>
                            <div style={{ height: '100%' }}>
                                <SchemaEditor
                                    activeTab={activeTab}
                                    value={schemas[activeTab]}
                                    onChange={val => setSchemas(prev => ({ ...prev, [activeTab]: val }))}
                                    onValidateRequest={handleValidateRequest}
                                />
                            </div>
                        </Panel>

                        <PanelResizeHandle className="h-1 bg-border hover:bg-brand/50 transition-colors cursor-row-resize" />

                        <Panel defaultSize={25} minSize={10} maxSize={50}>
                            <div style={{ height: '100%', overflow: 'auto' }}>
                                <ValidationPanel
                                    report={report}
                                    isValidating={validateMutation.isPending}
                                />
                            </div>
                        </Panel>
                    </PanelGroup>
                </Panel>

                <PanelResizeHandle className="w-1 bg-border hover:bg-brand/50 transition-colors cursor-col-resize" />

                {/* дерево структуры */}
                <Panel defaultSize={20} minSize={10} maxSize={35}>
                    <div style={{ height: '100%', overflow: 'hidden' }}>
                        <SchemaTree
                            activeTab={activeTab}
                            schema={parseJson(schemas[activeTab]) ?? {}}
                        />
                    </div>
                </Panel>
            </PanelGroup>

            <SaveModal
                open={saveModalOpen}
                currentVersion={system.version}
                onClose={() => setSaveModalOpen(false)}
                onConfirm={handleSaveConfirm}
                isPending={saveMutation.isPending}
            />
        </div>
    )
}