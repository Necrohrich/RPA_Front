// src/components/wizard/WizardSkeleton.tsx
export function WizardSkeleton() {
    return (
        <div className="flex h-screen bg-background">
            <div className="w-60 border-r border-border/60 bg-card animate-pulse" />
            <div className="flex-1 p-8 flex flex-col gap-4">
                <div className="h-6 w-48 rounded bg-secondary animate-pulse" />
                <div className="h-32 rounded-xl bg-secondary animate-pulse" />
            </div>
        </div>
    )
}