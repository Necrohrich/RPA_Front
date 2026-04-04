// src/pages/RegisterPage.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { AuthLayout } from '@/components/layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

const schema = z.object({
    login: z.string()
        .min(3, 'Минимум 3 символа')
        .max(30, 'Максимум 30 символов')
        .regex(/^[a-zA-Z0-9_]+$/, 'Только латинские буквы, цифры и _'),
    email: z.string().check(z.email('Некорректный email')),
    password: z.string()
        .min(8, 'Минимум 8 символов')
        .max(128, 'Максимум 128 символов')
        .regex(/[A-Z]/, 'Нужна минимум одна заглавная буква')
        .regex(/[a-z]/, 'Нужна минимум одна строчная буква')
        .regex(/[0-9]/, 'Нужна минимум одна цифра')
        .regex(/[^A-Za-z0-9]/, 'Нужен минимум один спецсимвол'),
    confirmPassword: z.string(),
}).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: 'Пароли не совпадают',
        path: ['confirmPassword'],  // ошибка появится под confirmPassword
    }
)

type FormData = z.infer<typeof schema>

export function RegisterPage() {
    const { register: registerUser, isRegisterPending } = useAuth()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    })

    const onSubmit = ({ confirmPassword: _, ...data }: FormData) => {
        registerUser(data)
    }

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
                <div className="space-y-4">

                    {/* Логин */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/50">
                            Логин
                        </label>
                        <Input
                            type="text"
                            placeholder="adventurer"
                            {...register('login')}
                            className={inputCn}
                        />
                        {errors.login && (
                            <p className="text-xs text-red-400">{errors.login.message}</p>
                        )}
                    </div>

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
                            placeholder="Минимум 8 символов"
                            {...register('password')}
                            className={inputCn}
                        />
                        {errors.password && (
                            <p className="text-xs text-red-400">{errors.password.message}</p>
                        )}
                    </div>

                    {/* Подтверждение пароля */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/50">
                            Подтвердите пароль
                        </label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            {...register('confirmPassword')}
                            className={inputCn}
                        />
                        {errors.confirmPassword && (
                            <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    {/* Кнопка */}
                    <Button
                        className="mt-1 w-full bg-brand text-white hover:bg-brand-hover"
                        disabled={isRegisterPending}
                        onClick={handleSubmit(onSubmit)}
                    >
                        {isRegisterPending ? 'Создаём аккаунт...' : 'Создать аккаунт'}
                    </Button>

                </div>

                {/* Ссылка на логин */}
                <div className="mt-5 text-center">
                    <Link
                        to="/login"
                        className="text-sm text-white/40 transition-colors hover:text-brand"
                    >
                        Уже есть аккаунт? Войти
                    </Link>
                </div>
            </div>
        </AuthLayout>
    )
}