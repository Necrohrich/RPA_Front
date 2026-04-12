// src/pages/CharacterPage.tsx
import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
    useCharacterDetail,
    useCharacterSchema,
    useSheet,
    useUpdateSheet,
    useCopyCharacter, useCustomPoolItems,
} from '@/hooks/useSheet'
import {
    ActionsPanel,
    CharacterHero, ConditionsPanel, CustomPoolsPanel,
    SheetAccordion,
} from '@/components/sheet'
import type { UpdateSheetPayload } from '@/types'

export function CharacterPage() {
    const { id }       = useParams<{ id: string }>()
    const navigate     = useNavigate()
    const { t }        = useTranslation()

    // ── Данные ──────────────────────────────────────────────────────────────
    const characterQ = useCharacterDetail(id!)
    const sheetQ     = useSheet(id!)
    const schemaQ    = useCharacterSchema(id!, !!sheetQ.data)
    const customItemsQ = useCustomPoolItems(id!)
    const activeConditionIds = (sheetQ.data?.raw['conditions'] as string[] | undefined) ?? []
    const creationCompleted = Boolean(sheetQ.data?.raw['_creation_completed'])

    const updateSheet = useUpdateSheet(id!)
    const copyChar    = useCopyCharacter()

    // ── Edit state ───────────────────────────────────────────────────────────
    // localFields — накопленные изменения, ещё не отправленные на сервер.
    // Храним только diff: { field_id: newValue }.
    // При Save отправляем весь diff одним PATCH.
    const [editMode,    setEditMode]    = useState(false)
    const [localFields, setLocalFields] = useState<Record<string, unknown>>({})

    const handleEdit = useCallback(() => {
        setLocalFields({})
        setEditMode(true)
    }, [])

    const handleCancel = useCallback(() => {
        setLocalFields({})
        setEditMode(false)
    }, [])

    const handleFieldChange = useCallback((fieldId: string, value: unknown) => {
        setLocalFields(prev => ({ ...prev, [fieldId]: value }))
    }, [])

    const handleSave = useCallback(async () => {
        if (Object.keys(localFields).length === 0) {
            setEditMode(false)
            return
        }
        const payload: UpdateSheetPayload = { fields: localFields }
        try {
            await updateSheet.mutateAsync(payload)
            setLocalFields({})
            setEditMode(false)
            toast.success(t('character_page.saved'))
        } catch {
            // axios-интерцептор уже показал toast с ошибкой
        }
    }, [localFields, updateSheet, t])

    // handleConditionToggle:
    const handleConditionToggle = useCallback((conditionId: string, active: boolean) => {
        const current = (sheetQ.data?.raw['conditions'] as string[] | undefined) ?? []
        const next = active
            ? [...current, conditionId]
            : current.filter(id => id !== conditionId)
        updateSheet.mutate({ fields: { conditions: next } })
    }, [sheetQ.data, updateSheet])

    const handleEquip = useCallback((slot: string, item: Record<string, unknown> | null) => {
        setLocalFields(prev => {
            const currentEquipped = (sheetQ.data?.raw['equipped'] as Record<string, unknown> | undefined) ?? {}
            const prevEquipped    = (prev['equipped'] as Record<string, unknown> | undefined) ?? currentEquipped
            if (item === null) {
                const { [slot]: _, ...rest } = prevEquipped
                return { ...prev, equipped: rest }
            }
            return { ...prev, equipped: { ...prevEquipped, [slot]: item } }
        })
    }, [sheetQ.data])

    // ── Copy ─────────────────────────────────────────────────────────────────
    const handleCopy = useCallback(async () => {
        try {
            const copy = await copyChar.mutateAsync(id!)
            toast.success(t('character_page.copied'))
            navigate(`/dashboard/characters/${copy.id}`)
        } catch {
            // обработано интерцептором
        }
    }, [id, copyChar, navigate, t])

    // ── Отображение raw с наложенным diff ────────────────────────────────────
    // Мерджим raw из сервера с локальным diff чтобы UI отражал несохранённые изменения.
    // Сам SheetResponse не мутируем — это важно для cancel (просто сбрасываем localFields).
    const rawWithDiff = sheetQ.data
        ? { ...sheetQ.data.raw, ...localFields }
        : {}

    // Подмешиваем localFields в rendered sections для полей у которых value берётся из raw
    // (resource, integer, text, etc. — всё кроме computed).
    const sectionsWithDiff = sheetQ.data?.sections.map(section => ({
        ...section,
        fields: section.fields.map(field => {
            if (localFields[field.id] !== undefined) {
                return {
                    ...field,
                    value: localFields[field.id],
                    // для list-полей items = localFields значение
                    ...(field.type === 'list' ? { items: localFields[field.id] as Record<string, unknown>[] } : {}),
                }
            }
            return field
        })
    })) ?? []

    // ── Loading / error ──────────────────────────────────────────────────────
    if (characterQ.isLoading || sheetQ.isLoading) {
        return <PageSkeleton />
    }

    // Нет системы — редирект (движок не сможет рендерить анкету)
    if (sheetQ.isError) {
        navigate('/dashboard/characters')
        return null
    }

    if (characterQ.isError) {
        return (
            <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                {t('character_page.load_error')}
            </div>
        )
    }

    const character = characterQ.data!
    const sheet     = sheetQ.data!
    const canToggle = sheet.is_gm

    return (
        <div className={cn('flex flex-col gap-4 max-w-4xl mx-auto pb-12')}>
            {/* Шапка */}
            <CharacterHero
                character={character}
                sheet={sheet}
                editMode={editMode}
                saving={updateSheet.isPending}
                onEdit={handleEdit}
                onSave={handleSave}
                onCancel={handleCancel}
                onCopy={handleCopy}
                creationCompleted={creationCompleted}
            />


            {schemaQ.data && schemaQ.data.conditions.length > 0 && (
                <ConditionsPanel
                    conditions={schemaQ.data.conditions}
                    activeIds={activeConditionIds}
                    canToggle={canToggle}
                    onToggle={handleConditionToggle}
                />
            )}

            {/* Действия */}
            {schemaQ.data?.manifest.has_actions &&
                schemaQ.data.actions_schema &&
                schemaQ.data.actions_schema.actions.length > 0 && (
                    <ActionsPanel
                        characterId={id!}
                        actions={schemaQ.data.actions_schema.actions}
                        canAct={sheet.can_roll || sheet.is_gm}
                    />
                )}

            {/* Кастомные поля */}
            {character.game_id &&
                schemaQ.data?.rules_schema?.custom_pools &&
                schemaQ.data.rules_schema.custom_pools.length > 0 && (
                    <CustomPoolsPanel
                        pools={schemaQ.data.rules_schema.custom_pools}
                        assignedItems={customItemsQ.data ?? []}
                        characterId={id!}
                        gameId={character.game_id}
                        isGm={sheetQ.data?.is_gm ?? false}
                    />
                )}

            {/* Анкета */}
            <SheetAccordion
                sections={sectionsWithDiff}
                raw={rawWithDiff}
                editMode={editMode}
                onChange={handleFieldChange}
                onEquip={handleEquip}
            />
        </div>
    )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function PageSkeleton() {
    return (
        <div className="flex flex-col gap-4 max-w-4xl mx-auto animate-pulse">
            {/* hero */}
            <div className="h-32 rounded-xl bg-secondary/60" />
            {/* секции */}
            {[1, 2, 3].map(i => (
                <div key={i} className="h-16 rounded-xl bg-secondary/40" />
            ))}
        </div>
    )
}