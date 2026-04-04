import { useLottie } from 'lottie-react'
import animationData from '@/assets/d20.json'

type Props = {
    size?: number
    fullscreen?: boolean  // true = на весь экран по центру, false = инлайн
}

export function DiceLoader({ size = 120, fullscreen = false }: Props) {
    const { View } = useLottie({
        animationData,
        loop: true,
        autoplay: true,
        style: { width: size, height: size },
    })

    if (!fullscreen) return View

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--background)',
            zIndex: 50,
        }}>
            {View}
        </div>
    )
}