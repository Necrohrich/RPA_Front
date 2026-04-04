// src/pages/LandingPage.tsx
import { Link } from 'react-router-dom'
import logo from '@/assets/logo.webp'
import { DiscordIcon } from '@/components/icons'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '@/components'

const DISCORD_SERVER_URL = 'https://discord.gg/f4ZbA4Zhxy'
const DISCORD_BOT_URL = 'https://discord.com/oauth2/authorize?client_id=1478025525724315860&permissions=8&' +
    'integration_type=0&scope=bot'

export function LandingPage() {

    const { t } = useTranslation()

    return (
        <div
            className="relative flex min-h-screen flex-col overflow-hidden"
            style={{ backgroundColor: 'var(--auth-bg-from)' }}
        >

            {/* Градиентное свечение */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background: `radial-gradient(ellipse 60% 50% at 50% 30%, var(--auth-glow) 0%, transparent 60%)`,
                }}
            />

            {/* Hex-паттерн */}
            <div className="bg-hex-pattern pointer-events-none absolute inset-0 opacity-[0.025]" />

            {/* Navbar */}
            <nav
                className="relative z-10 grid items-center px-8 py-4"
                style={{
                    gridTemplateColumns: '1fr auto 1fr',
                    borderBottom: '1px solid var(--nav-border)',
                    backgroundColor: 'var(--nav-bg)',
                    backdropFilter: 'blur(10px)',
                }}
            >
                {/* Левые кнопки */}
                <div className="flex items-center gap-2">
                    <Link
                        to="/docs"
                        className="rounded-md px-4 py-1.5 text-xs font-medium text-white/60 transition-colors
                        hover:text-white"
                        style={{ border: '1px solid rgba(255,255,255,0.12)' }}
                    >
                        {t('nav.docs')}
                    </Link>
                    <a
                        href={DISCORD_BOT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md px-4 py-1.5 text-xs font-medium text-white/60 transition-colors
                        hover:text-white"
                        style={{ border: '1px solid rgba(255,255,255,0.12)' }}
                    >
                        {t('nav.add_bot')}
                    </a>
                </div>

                {/* Логотип по центру */}
                <div className="flex flex-col items-center">
                    <img
                        src={logo}
                        alt="Role Play Asylum"
                        className="h-11 w-11 drop-shadow-[0_0_16px_rgba(17,128,106,0.4)]"
                    />
                    <p
                        className="mt-2 text-[11px] tracking-[0.06em] text-white/70"
                        style={{ fontFamily: 'var(--font-display)' }}
                    >
                        Role Play Asylum
                    </p>
                </div>

                {/* Правые кнопки */}
                <div className="flex items-center justify-end gap-3">
                    <LanguageSwitcher />
                    <Link
                        to="/login"
                        className="rounded-md px-4 py-1.5 text-xs font-medium text-white/60 transition-colors
                        hover:text-white"
                        style={{ border: '1px solid rgba(255,255,255,0.12)' }}
                    >
                        {t('nav.login')}
                    </Link>
                    <Link
                        to="/register"
                        className="rounded-md px-4 py-1.5 text-xs font-medium text-white transition-colors
                        hover:bg-brand-hover bg-brand"
                    >
                        {t('nav.register')}
                    </Link>
                </div>
            </nav>

            {/* Hero — пока пусто */}
            <main className="relative z-10 flex flex-1 items-center justify-center">
                {/* Контент лендинга — добавим позже */}
            </main>

            {/* Footer */}
            <footer
                className="relative z-10 flex items-center justify-between px-8 py-4"
                style={{
                    borderTop: '1px solid var(--footer-border)',
                    backgroundColor: 'var(--footer-bg)',
                }}
            >
                <span className="text-xs text-white/25">
                   {t('footer.copyright', { year: new Date().getFullYear() })}
                </span>

                <a
                href={DISCORD_SERVER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 transition-colors hover:text-brand"
                aria-label="Discord сервер"
                >
                    <DiscordIcon />
                </a>
            </footer>
        </div>
    )
}