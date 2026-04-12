// src/router/index.tsx
import { createBrowserRouter } from 'react-router-dom'
import {PrivateRoute, PublicRoute} from "@/router/guards.tsx";
import {LoginPage} from "@/pages/LoginPage.tsx";
import {RegisterPage} from "@/pages/RegisterPage.tsx";
import {LandingPage} from "@/pages/LandingPage.tsx";
import { DashboardLayout } from '@/components/layout';
import { DashboardPage } from '@/pages/DashboardPage'
import {SettingsPage} from "@/pages/SettingsPage.tsx";
import {CharactersPage} from "@/pages/CharactersPage.tsx";
import {MyGamesPage} from "@/pages/MyGamesPage.tsx";
import {ParticipatedGamesPage} from "@/pages/ParticipatedGamesPage.tsx";
import {SystemsPage} from "@/pages/SystemsPage.tsx";
import {SystemEditorPage} from "@/pages/SystemEditorPage.tsx";
import {CharacterPage} from "@/pages/CharacterPage.tsx";
import {CreationPage} from "@/pages/CreationPage.tsx";
import {ProgressionPage} from "@/pages/ProgressionPage.tsx";


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
                    { path: '/dashboard', element: <DashboardPage />,
                        handle: { titleKey: 'dashboard.nav.overview' } },
                    { path: '/dashboard/characters', element: <CharactersPage />,
                        handle: { titleKey: 'dashboard.nav.characters' } },
                    { path: '/dashboard/characters/:id', element: <CharacterPage />,
                        handle: { titleKey: 'dashboard.nav.characters' } },
                    { path: '/dashboard/games', element: <MyGamesPage />,
                        handle: { titleKey: 'dashboard.nav.my_games' } },
                    { path: '/dashboard/games/:id', element: <div />,
                        handle: { titleKey: 'dashboard.nav.my_games' } },
                    { path: '/dashboard/participated', element: <ParticipatedGamesPage />,
                        handle: { titleKey: 'dashboard.nav.participated' } },
                    { path: '/dashboard/systems', element: <SystemsPage />,
                        handle: { titleKey: 'dashboard.nav.systems' } },
                    { path: '/dashboard/settings', element: <SettingsPage />,
                        handle: { titleKey: 'dashboard.nav.settings' } },
                ],
            },
            { path: '/dashboard/systems/:id', element: <SystemEditorPage /> },
            { path: '/dashboard/characters/:id/creation',   element: <CreationPage /> },
            { path: '/dashboard/characters/:id/progression', element: <ProgressionPage /> },
        ],
    },

    // Лендинг — доступен всем
    { path: '/', element: <LandingPage /> },
])