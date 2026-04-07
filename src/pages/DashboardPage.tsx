// src/pages/DashboardPage.tsx
import {ProfileWidget, ReviewsWidget} from '@/components/dashboard'

export function DashboardPage() {
    return (
        // DashboardPage.tsx
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full"
             style={{ gridTemplateRows: 'repeat(2, minmax(0, 1fr))' }}>
            <ProfileWidget />
            <ReviewsWidget />
            {/* LastGameWidget — следующий */}
            <div className="bg-card border border-border rounded-md" />
            {/* CharactersWidget — следующий */}
            <div className="bg-card border border-border rounded-md" />
        </div>
    )
}