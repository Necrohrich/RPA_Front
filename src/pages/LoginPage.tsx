// src/pages/LoginPage.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { AuthLayout } from '@/components/layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

const schema = z.object({
    email: z.string().check(z.email('Некорректный email')),
    password: z.string().min(8, 'Минимум 8 символов'),
})

type FormData = z.infer<typeof schema>

export function LoginPage() {
    const {login, isLoginPending} = useAuth()

    const {register, handleSubmit, formState: {errors}} = useForm<FormData>({
        resolver: zodResolver(schema),
    })

    const onSubmit = (data: FormData) => {login(data)}
    const inputCn = "border-white/10 bg-white/6 text-white placeholder:text-white/20 focus-visible:ring-brand/60"

    return (
        <AuthLayout>
            <div
                className="rounded-2xl p-8"
                style={{
                    backgroundColor: 'var(--auth-card-bg)',
                    border: '1px solid var(--auth-card-border)',
                    backdropFilter: 'blur(12px)',
                }}
            >
                <div className="space-y-5">

                    {/* Email */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/50">
                            Email
                        </label>
                        <Input
                            type="email"
                            placeholder="you@example.com"
                            {...register('email')}
                            className={inputCn}
                        />
                        {errors.email && (
                            <p className="text-xs text-red-400">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Пароль */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/50">
                            Пароль
                        </label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            {...register('password')}
                            className={inputCn}
                        />
                        {errors.password && (
                            <p className="text-xs text-red-400">{errors.password.message}</p>
                        )}
                    </div>

                    {/* Кнопка */}
                    <Button
                        className="mt-1 w-full bg-[#11806a] text-white hover:bg-brand"
                        disabled={isLoginPending}
                        onClick={handleSubmit(onSubmit)}
                    >
                        {isLoginPending ? 'Входим...' : 'Войти'}
                    </Button>

                </div>

                {/* Ссылка на регистрацию */}
                <div className="mt-5 text-center">
                    <Link
                        to="/register"
                        className="text-sm text-white/40 transition-colors hover:text-brand"
                    >
                        Создать аккаунт
                    </Link>
                </div>
            </div>
        </AuthLayout>
    )
}