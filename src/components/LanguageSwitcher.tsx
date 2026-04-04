// src/components/LanguageSwitcher.tsx
import { useTranslation } from 'react-i18next'

const LANGUAGES = ['ru', 'en'] as const
type Lang = typeof LANGUAGES[number]

export function LanguageSwitcher() {
    const { i18n } = useTranslation()
    const current = (LANGUAGES.includes(i18n.language as Lang) ? i18n.language : 'ru') as Lang

    const toggle = (lang: Lang) => {
        if (lang !== current) void i18n.changeLanguage(lang)
    }

    return (
        <div
            role="group"
            aria-label="Language switcher"
            className="relative flex items-center rounded-full p-0.5"
            style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--lang-switcher-border)',
            }}
        >
            <span
                aria-hidden
                className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 rounded-full
                transition-transform duration-300 ease-in-out"
                style={{
                    width: 'calc(50% - 2px)',
                    backgroundColor: 'var(--color-brand)',
                    boxShadow: '0 0 8px var(--lang-switcher-glow)',
                    transform: current === 'en' ? 'translateX(100%)' : 'translateX(0)',
                }}
            />

            {LANGUAGES.map((lang) => (
                <button
                    key={lang}
                    onClick={() => toggle(lang)}
                    className="relative z-10 w-9 py-1 text-[11px] font-semibold uppercase tracking-widest
                    transition-colors duration-200"
                    style={{
                        color: current === lang ? '#ffffff' : 'var(--lang-inactive)',
                    }}
                >
                    {lang}
                </button>
            ))}
        </div>
    )
}