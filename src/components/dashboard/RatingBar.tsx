// src/components/dashboard/RatingBar.tsx

import { cn } from '@/lib/utils'
import type { ReviewRating } from '@/types'

const RATING_TO_FILLED: Record<ReviewRating, number> = {
    terrible:  1,
    bad:       2,
    neutral:   3,
    good:      4,
    excellent: 5,
}

const RATING_COLOR_STYLE: Record<ReviewRating, string> = {
    terrible:  '#ef4444',
    bad:       '#fb923c',
    neutral:   '#facc15',
    good:      '#11806a',
    excellent: '#34d399',
}

type Props = {
    rating: ReviewRating
    className?: string
}

export function RatingBar({ rating, className }: Props) {
    const filled = RATING_TO_FILLED[rating]
    const color  = RATING_COLOR_STYLE[rating]

    return (
        <div className={cn('flex items-center gap-[3px]', className)}>
            {Array.from({ length: 5 }, (_, i) => (
                <span
                    key={i}
                    className="inline-block w-[10px] h-[10px] rounded-full"
                    style={{ backgroundColor: i < filled ? color : 'hsl(var(--secondary))' }}
                />
            ))}
        </div>
    )
}