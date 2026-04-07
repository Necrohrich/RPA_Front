// src/pages/DashboardPage.tsx
import {ProfileWidget, ReviewsWidget, LastGameWidget, CharactersWidget} from '@/components/dashboard'

export function DashboardPage() {
    return (
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 lg:h-full dashboard-grid">
            <ProfileWidget className="min-h-[280px] lg:min-h-0" />
            <ReviewsWidget className="min-h-[280px] lg:min-h-0" />
            <LastGameWidget
                className="min-h-[280px] lg:min-h-0"
                onCreateGame={() => console.log('TODO: open create game modal')}
            />
            <CharactersWidget className="min-h-[280px] lg:min-h-0" />
        </div>
    )
}