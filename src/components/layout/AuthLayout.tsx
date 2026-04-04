// src/components/layout/AuthLayout.tsx
import { type ReactNode } from 'react'
import logo from '@/assets/logo.webp'
import { LanguageSwitcher } from '@/components'

interface AuthLayoutProps {
    children: ReactNode
}

export function AuthLayout({children}: AuthLayoutProps){
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 py-12"
             style={{ backgroundColor: 'var(--auth-bg-from)' }}>

            {/* Градиентное свечение сверху */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background: `
                        radial-gradient(ellipse 80% 50% at 50% -5%, var(--auth-glow) 0%, transparent 60%),
                        radial-gradient(ellipse 50% 40% at 90% 80%, var(--auth-glow-secondary) 0%, transparent 50%)
                      `,
            }}
            />

            {/* Hex-паттерн поверх градиента */}
            <div className="bg-hex-pattern pointer-events-none absolute inset-0 opacity-[0.035]" />

            {/* Логотип */}
            <div className="relative z-10 mb-8 flex flex-col items-center">
                <img
                    src={logo}
                    alt="Role Play Asylum"
                    className="h-20 w-20 drop-shadow-[0_0_24px_rgba(17,128,106,0.55)]"
                />
                <p
                    className="mt-3 text-lg font-bold tracking-wide text-white"
                    style={{ fontFamily: 'var(--font-display)' }}
                >
                    Role Play Asylum
                </p>
                <p className="mt-1 text-xs tracking-[0.18em] text-white/40 italic" style={{ fontFamily:
                        'var(--font-cinzel)' }}>
                    online rpg tools
                </p>
            </div>

            {/* Слот — карточка формы */}
            <div className="relative z-10 w-full max-w-sm">
                {/* Переключатель языка */}
                <div className="absolute top-4 right-4 z-10">
                    <LanguageSwitcher />
                </div>
                {children}
            </div>
        </div>
    )
}