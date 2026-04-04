// src/router/index.tsx
import { createBrowserRouter } from 'react-router-dom'
import {PrivateRoute, PublicRoute} from "@/router/guards.tsx";
import {LoginPage} from "@/pages/LoginPage.tsx";
import {RegisterPage} from "@/pages/RegisterPage.tsx";
import {LandingPage} from "@/pages/LandingPage.tsx";
import { DashboardLayout } from '@/components/layout';

// Страницы пока заглушки — создадим по одной
const Dashboard = () => <div>Dashboard</div>

export const router = createBrowserRouter([
    // Публичные маршруты — авторизованных редиректит на /dashboard
    {
        element: <PublicRoute />,
        children: [
            {path: '/login', element: <LoginPage />},
            { path: '/register', element: <RegisterPage /> },
        ]
    },

    // Защищённые маршруты — неавторизованных редиректит на /login
    {
        element: <PrivateRoute />,
        children: [
            {
                element: <DashboardLayout />,
                children: [
                    { path: '/dashboard',              element: <Dashboard />, handle: { titleKey: 'dashboard.nav.overview' } },
                    { path: '/dashboard/characters',   element: <div />,       handle: { titleKey: 'dashboard.nav.characters' } },
                    { path: '/dashboard/games',        element: <div />,       handle: { titleKey: 'dashboard.nav.my_games' } },
                    { path: '/dashboard/participated', element: <div />,       handle: { titleKey: 'dashboard.nav.participated' } },
                    { path: '/dashboard/settings',     element: <div />,       handle: { titleKey: 'dashboard.nav.settings' } },
                ],
            },
        ],
    },

    // Лендинг — доступен всем
    { path: '/', element: <LandingPage /> },
])