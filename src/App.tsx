// src/App.tsx
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/api/queryClient'
import { router } from '@/router'
import {Toaster} from '@/components/ui/sonner';

export function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
            <Toaster position="bottom-right" richColors />
        </QueryClientProvider>
    )
}