// src/components/layout/WizardLayout.tsx
import { cn } from '@/lib/utils'
import { ArrowLeft, CheckCircle2, Circle, Lock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { WizardStep } from '@/types'
import * as React from "react";

// ── ProgressSidebar ───────────────────────────────────────────────────────────

type SidebarProps = {
    steps:        WizardStep[]
    activeStepId: string
    onSelect:     (id: string) => void
}

function StepIcon({ status }: { status: WizardStep['status'] }) {
    if (status === 'completed') return <CheckCircle2 size={14} className="text-brand shrink-0" />
    if (status === 'locked')   return <Lock size={14} className="text-muted-foreground/40 shrink-0" />
    return <Circle size={14} className="text-muted-foreground shrink-0" />
}

function ProgressSidebar({ steps, activeStepId, onSelect }: SidebarProps) {
    const { t } = useTranslation()
    const total     = steps.filter(s => s.type !== 'confirm').length
    const completed = steps.filter(s => s.status === 'completed').length
    const pct       = total > 0 ? Math.round((completed / total) * 100) : 0

    return (
        <aside className="w-60 shrink-0 flex flex-col border-r border-border/60 bg-card overflow-hidden">
            {/* Прогресс-бар */}
            <div className="px-4 py-4 border-b border-border/40">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">
                        {t('wizard.progress', { completed, total })}
                    </span>
                    <span className="text-xs font-medium text-brand">{pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                        className="h-full bg-brand rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                    />
                </div>
            </div>

            {/* Список шагов */}
            <nav className="flex-1 overflow-y-auto py-2 scrollbar-hidden">
                {steps.map(step => {
                    const isActive   = step.id === activeStepId
                    const isLocked   = step.status === 'locked'

                    return (
                        <button
                            key={step.id}
                            onClick={() => !isLocked && onSelect(step.id)}
                            disabled={isLocked}
                            className={cn(
                                'w-full flex items-center gap-2.5 px-4 py-2.5 text-left',
                                'text-[13px] border-l-[3px] transition-colors',
                                isActive
                                    ? 'border-brand bg-brand/5 text-foreground font-medium'
                                    : isLocked
                                        ? 'border-transparent text-muted-foreground/40 cursor-not-allowed'
                                        : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50',
                            )}
                        >
                            <StepIcon status={step.status} />
                            <span className="truncate">{step.label}</span>
                            {!step.required && (
                                <span className="ml-auto text-[10px] text-muted-foreground/50 shrink-0">
                                    {t('wizard.optional')}
                                </span>
                            )}
                        </button>
                    )
                })}
            </nav>
        </aside>
    )
}

// ── PoolBudgetBar — глобальная шапка с очками ─────────────────────────────────

type PoolBudgetBarProps = {
    steps: WizardStep[]
}

// Показываем все distribute_pool шаги у которых есть бюджет
function PoolBudgetBar({ steps }: PoolBudgetBarProps) {
    const poolSteps = steps.filter(
        s => s.type === 'distribute_pool' && s.pool_budget != null,
    )
    if (poolSteps.length === 0) return null

    return (
        <div className="flex items-center gap-6 px-6 py-2 border-b border-border/40 bg-card/60 text-xs">
            {poolSteps.map(step => {
                const remaining = (step.pool_budget ?? 0) - (step.pool_spent ?? 0)
                return (
                    <span key={step.id} className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">{step.label}:</span>
                        <span className={cn(
                            'font-semibold tabular-nums',
                            remaining < 0 ? 'text-destructive' : 'text-brand',
                        )}>
                            {remaining}
                        </span>
                        <span className="text-muted-foreground">/ {step.pool_budget}</span>
                    </span>
                )
            })}
        </div>
    )
}

// ── WizardLayout ──────────────────────────────────────────────────────────────

type WizardLayoutProps = {
    title:        string
    steps:        WizardStep[]
    activeStepId: string
    onSelectStep: (id: string) => void
    onBack:       () => void
    children:     React.ReactNode
}

export function WizardLayout({
                                 title,
                                 steps,
                                 activeStepId,
                                 onSelectStep,
                                 onBack,
                                 children,
                             }: WizardLayoutProps) {
    const { t } = useTranslation()

    return (
        <div className="flex flex-col h-screen bg-background overflow-hidden">
            {/* Header */}
            <header className="flex items-center gap-3 px-4 py-3 border-b border-border/60 bg-card shrink-0">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground
                               text-sm transition-colors"
                >
                    <ArrowLeft size={15} />
                    {t('common.back')}
                </button>
                <span className="text-border/60">|</span>
                <h1 className="text-sm font-medium text-foreground">{title}</h1>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <ProgressSidebar
                    steps={steps}
                    activeStepId={activeStepId}
                    onSelect={onSelectStep}
                />

                {/* Main content */}
                <div className="flex flex-col flex-1 overflow-hidden">
                    <PoolBudgetBar steps={steps} />
                    <main className="flex-1 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    )
}