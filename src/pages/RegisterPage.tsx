// src/pages/RegisterPage.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { AuthLayout } from '@/components/layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import { type TFunction } from 'i18next'

const createSchema = (t: TFunction) => z.object({
    login: z.string()
        .min(3, t('auth.register.login_min'))
        .max(30, t('auth.register.login_max'))
        .regex(/^[a-zA-Z0-9_]+$/, t('auth.register.login_pattern')),
    email: z.string().check(z.email(t('auth.register.email_invalid'))),
    password: z.string()
        .min(8, t('auth.register.password_min'))
        .max(128, t('auth.register.password_max'))
        .regex(/[A-Z]/, t('auth.register.password_upper'))
        .regex(/[a-z]/, t('auth.register.password_lower'))
        .regex(/[0-9]/, t('auth.register.password_digit'))
        .regex(/[^A-Za-z0-9]/, t('auth.register.password_special')),
    confirmPassword: z.string(),
}).refine(
    (data) => data.password === data.confirmPassword,
    { message: t('auth.register.confirm_mismatch'), path: ['confirmPassword'] }
)

type FormData = z.infer<ReturnType<typeof createSchema>>

export function RegisterPage() {
    const { register: registerUser, isRegisterPending } = useAuth()
    const { t } = useTranslation()
    const schema = useMemo(() => createSchema(t), [t])

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
                            {t('auth.register.login_label')}
                        </label>
                        <Input
                            type="text"
                            placeholder={t('auth.register.login_placeholder')}
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
                            {t('auth.register.email_label')}
                        </label>
                        <Input
                            type="email"
                            placeholder={t('auth.register.email_placeholder')}
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
                            {t('auth.register.password_label')}
                        </label>
                        <Input
                            type="password"
                            placeholder={t('auth.register.password_placeholder')}
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
                            {t('auth.register.confirm_label')}
                        </label>
                        <Input
                            type="password"
                            placeholder={t('auth.register.confirm_placeholder')}
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
                        {isRegisterPending ? t('auth.register.submitting') : t('auth.register.submit')}
                    </Button>

                </div>

                {/* Ссылка на логин */}
                <div className="mt-5 text-center">
                    <Link
                        to="/login"
                        className="text-sm text-white/40 transition-colors hover:text-brand"
                    >
                        {t('auth.register.has_account')}
                    </Link>
                </div>
            </div>
        </AuthLayout>
    )
}