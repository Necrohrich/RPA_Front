// src/router/guards.tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { DiceLoader } from '@/components'

export function PrivateRoute() {
    const {isAuthenticated, isLoading} = useAuth()

    // пока идёт запрос /users/me — не редиректим, ждём
    if (isLoading) return <DiceLoader fullscreen/>

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export function PublicRoute() {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) return <DiceLoader fullscreen/>

    return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" replace />
}