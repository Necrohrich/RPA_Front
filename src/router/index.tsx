import { createBrowserRouter } from 'react-router-dom'
import {PrivateRoute, PublicRoute} from "@/router/guards.tsx";

// Страницы пока заглушки — создадим по одной
const Landing = () => <div>Landing</div>
const Login = () => <div>Login</div>
const Register = () => <div>Register</div>
const Dashboard = () => <div>Dashboard</div>

export const router = createBrowserRouter([
    // Публичные маршруты — авторизованных редиректит на /dashboard
    {
        element: <PublicRoute />,
        children: [
            {path: '/login', element: <Login />},
            { path: '/register', element: <Register /> },
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
    { path: '/', element: <Landing /> },
])