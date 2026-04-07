// src/components/dashboard/RatingBar.tsx

import { cn } from '@/lib/utils'
import type { ReviewRating } from '@/types'

const RATING_TO_FILLED: Record<ReviewRating, number> = {
    TERRIBLE:  1,
    BAD:       2,
    NEUTRAL:   3,
    GOOD:      4,
    EXCELLENT: 5,
}

const RATING_COLOR: Record<ReviewRating, string> = {
    TERRIBLE:  'bg-red-500',
    BAD:       'bg-orange-400',
    NEUTRAL:   'bg-yellow-400',
    GOOD:      'bg-brand',
    EXCELLENT: 'bg-emerald-400',
}

type Props = {
    rating: ReviewRating
    className?: string
}

export function RatingBar({ rating, className }: Props) {
    const filled = RATING_TO_FILLED[rating]
    const color  = RATING_COLOR[rating]

    return (
        <div className={cn('flex items-center gap-[3px]', className)}>
            {Array.from({ length: 5 }, (_, i) => (
                <span
                    key={i}
                    className={cn(
                        'inline-block w-[10px] h-[10px] rounded-full',
                        i < filled ? color : 'bg-secondary',
                    )}
                />
            ))}
        </div>
    )
}