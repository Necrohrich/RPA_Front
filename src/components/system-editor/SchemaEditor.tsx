// src/components/system-editor/SchemaEditor.tsx
import { useEffect, useRef, useCallback } from 'react'
import Editor, {type BeforeMount, type OnMount} from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { useDebounce } from '@/hooks/useDebounce'
import type { SchemaTab } from '@/types'

type Props = {
    activeTab: SchemaTab
    value: string                          // JSON строка текущей вкладки
    onChange: (value: string) => void      // вызывается при каждом изменении
    onValidateRequest: (value: string) => void  // вызывается после debounce
}

export function SchemaEditor({ activeTab, value, onChange, onValidateRequest }: Props) {
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

    // debounce 1500ms — после паузы в наборе запускаем серверную валидацию
    const debouncedValue = useDebounce(value, 1500)

    useEffect(() => {
        // не валидируем пустую строку
        if (debouncedValue.trim()) {
            onValidateRequest(debouncedValue)
        }
    }, [debouncedValue, onValidateRequest])

    // при смене вкладки обновляем содержимое редактора
    // Monaco не реагирует на изменение prop value сам по себе если editor controlled
    useEffect(() => {
        const editor = editorRef.current
        if (!editor) return
        const current = editor.getValue()
        if (current !== value) {
            editor.setValue(value)
        }
    }, [activeTab]) // только при смене вкладки, не при каждом value

    const handleBeforeMount: BeforeMount = useCallback((monaco) => {
        monaco.editor.defineTheme('rpa-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
                'editor.background': '#0d1117',
                'editor.lineHighlightBackground': '#161b22',
                'editor.selectionBackground': '#264f78',
                'editorLineNumber.foreground': '#4a5568',
                'editorLineNumber.activeForeground': '#a0aec0',
            },
        })
    }, [])

    const handleMount: OnMount = useCallback((editor) => {

        editorRef.current = editor

        // форматируем JSON при открытии
        editor.getAction('editor.action.formatDocument')?.run()

        // Ctrl+S / Cmd+S — триггер для save (передаём наверх через кастомное событие)
        editor.addCommand(
            // monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS
            2097152 | 49,
            () => {
                window.dispatchEvent(new CustomEvent('editor:save'))
            }
        )
    }, [])

    const handleChange = useCallback((val: string | undefined) => {
        onChange(val ?? '')
    }, [onChange])

    return (
        <Editor
            height="100%"
            language="json"
            theme="rpa-dark"
            value={value}
            onChange={handleChange}
            beforeMount={handleBeforeMount}
            onMount={handleMount}
            options={{
                fontSize: 13,
                fontFamily: 'Geist Mono, Consolas, monospace',
                minimap: { enabled: true },   // миникарта занимает место, не нужна
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                lineNumbers: 'on',
                folding: true,
                formatOnPaste: true,
                tabSize: 2,
                renderLineHighlight: 'line',
                scrollbar: {
                    verticalScrollbarSize: 6,
                    horizontalScrollbarSize: 6,
                },
                find: {
                    addExtraSpaceOnTop: false,
                    autoFindInSelection: 'never',
                    seedSearchStringFromSelection: 'always',
                },
                fixedOverflowWidgets: false,
            }}
        />
    )
}