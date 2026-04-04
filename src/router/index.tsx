// src/router/index.tsx
import { createBrowserRouter } from 'react-router-dom'
import {PrivateRoute, PublicRoute} from "@/router/guards.tsx";
import {LoginPage} from "@/pages/LoginPage.tsx";
import {RegisterPage} from "@/pages/RegisterPage.tsx";
import {LandingPage} from "@/pages/LandingPage.tsx";

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
            { path: '/dashboard', element: <Dashboard /> },
        ],
    },

    // Лендинг — доступен всем
    { path: '/', element: <LandingPage /> },
])