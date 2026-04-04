// src/components/layout/DashboardLayout.tsx
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { LayoutDashboard, Swords, Users, Settings, UserCircle, ChevronLeft, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMatches } from 'react-router-dom'
import type { RouteHandle } from '@/router/types'
import logo from '@/assets/logo.webp'
import { Link } from 'react-router-dom'

const NAV_MAIN = [
    { to: '/dashboard',             labelKey: 'dashboard.nav.overview',      Icon: LayoutDashboard, end: true  },
    { to: '/dashboard/characters',  labelKey: 'dashboard.nav.characters',    Icon: UserCircle,      end: false },
    { to: '/dashboard/games',       labelKey: 'dashboard.nav.my_games',      Icon: Swords,          end: false },
    { to: '/dashboard/participated',labelKey: 'dashboard.nav.participated',  Icon: Users,           end: false },
] as const

const EXPANDED_W = 220
const COLLAPSED_W = 56

export function DashboardLayout() {
    const { t } = useTranslation()
    const { user, logout } = useAuth()
    const [expanded, setExpanded] = useState(true)

    const initials = user?.login?.slice(0, 2).toUpperCase() ?? '??'
    const matches = useMatches()
    const titleKey = matches
        .map(m => (m.handle as RouteHandle | undefined)?.titleKey)
        .filter(Boolean)
        .at(-1) ?? 'dashboard.nav.overview'

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {/* ── Сайдбар ───────────────────────────────────────────────────── */}
            <aside
                className="relative flex flex-col shrink-0 bg-card border-r border-border transition-[width]
                duration-200 ease-in-out"
                style={{ width: expanded ? EXPANDED_W : COLLAPSED_W }}
            >
                {/* Логотип */}
                <Link
                    to="/"
                    className="flex items-center gap-2.5 px-4 py-4 overflow-hidden shrink-0 hover:opacity-80 transition-opacity"
                >
                    <img src={logo} alt="RPA" className="w-[26px] h-[26px] shrink-0 object-contain" />
                    {expanded && (
                        <span
                            className="text-[13px] font-medium text-foreground whitespace-nowrap"
                            style={{ fontFamily: 'var(--font-cinzel)' }}
                        >
                          Role Play Asylum
                        </span>
                    )}
                </Link>

                {/* Навигация */}
                <nav className="flex-1 py-2 overflow-hidden">
                    {expanded && (
                        <p className="px-4 pt-2 pb-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                            {t('dashboard.nav.section_main')}
                        </p>
                    )}

                    {NAV_MAIN.map(({ to, labelKey, Icon, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) => cn(
                                'flex items-center gap-2.5 px-4 py-[7px] text-[13px] transition-colors ' +
                                'border-l-[3px]',
                                isActive
                                    ? 'border-brand bg-secondary text-foreground font-medium'
                                    : 'border-transparent text-muted-foreground hover:text-foreground ' +
                                    'hover:bg-secondary/60'
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon size={14} className={cn('shrink-0 transition-colors', isActive ?
                                        'text-brand' : '')} />
                                    {expanded && <span className="whitespace-nowrap">{t(labelKey)}</span>}
                                </>
                            )}
                        </NavLink>
                    ))}

                    {expanded && (
                        <p className="px-4 pt-4 pb-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                            {t('dashboard.nav.section_account')}
                        </p>
                    )}

                    <NavLink
                        to="/dashboard/settings"
                        className={({ isActive }) => cn(
                            'flex items-center gap-2.5 px-4 py-[7px] text-[13px] transition-colors border-l-[3px]',
                            isActive
                                ? 'border-brand bg-secondary text-foreground font-medium'
                                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                <Settings size={14} className={cn('shrink-0', isActive ? 'text-brand' : '')} />
                                {expanded && <span className="whitespace-nowrap">{t('dashboard.nav.settings')}</span>}
                            </>
                        )}
                    </NavLink>
                </nav>

                {/* Пользователь */}
                <div className="border-t border-border px-4 py-3 flex items-center gap-2 overflow-hidden shrink-0">
                    <div className="w-[26px] h-[26px] shrink-0 rounded-full bg-brand/20 flex items-center
                    justify-center text-[10px] font-medium text-brand">
                        {initials}
                    </div>
                    {expanded && (
                        <>
                            <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-medium text-foreground truncate">{user?.login}</p>
                                <p className="text-[10px] text-muted-foreground truncate">
                                    {user?.platform_role ?? t('dashboard.nav.no_role')}
                                </p>
                            </div>
                            <button
                                onClick={() => logout()}
                                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                                aria-label={t('dashboard.nav.logout')}
                            >
                                <LogOut size={14} />
                            </button>
                        </>
                    )}
                </div>

                {/* Язычок */}
                <button
                    onClick={() => setExpanded(p => !p)}
                    className="absolute -right-[11px] top-1/2 -translate-y-1/2 z-10 w-[22px] h-[38px] flex items-center
                     justify-center rounded-full bg-card border border-border text-muted-foreground
                     hover:text-foreground transition-colors"
                    aria-label={expanded ? t('dashboard.nav.collapse') : t('dashboard.nav.expand')}
                    style={{ backgroundColor: 'hsl(var(--card))' }}
                >
                    <ChevronLeft size={12} className={cn('transition-transform duration-200', !expanded &&
                        'rotate-180')} />
                </button>
            </aside>

            {/* ── Контент ───────────────────────────────────────────────────── */}
            <div className="flex flex-col flex-1 overflow-hidden">
                <header className="flex items-center justify-between px-5 py-3 border-b border-border bg-card shrink-0">
                    <h1 className="text-[14px] font-medium text-foreground">
                        {t(titleKey)}
                    </h1>
                    <LanguageSwitcher />
                </header>

                <main className="flex-1 overflow-auto p-4">
                    <Outlet />
                </main>
            </div>

        </div>
    )
}