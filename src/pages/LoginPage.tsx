// src/pages/LoginPage.tsx
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
    email: z.string().check(z.email(t('auth.login.email_invalid'))),
    password: z.string().min(8, t('auth.login.password_min')),
})

type FormData = z.infer<ReturnType<typeof createSchema>>

export function LoginPage() {
    const {login, isLoginPending} = useAuth()
    const { t } = useTranslation()
    const schema = useMemo(() => createSchema(t), [t])

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
                            {t('auth.login.email_label')}
                        </label>
                        <Input
                            type="email"
                            placeholder={t('auth.login.email_placeholder')}
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
                            {t('auth.login.password_label')}
                        </label>
                        <Input
                            type="password"
                            placeholder={t('auth.login.password_placeholder')}
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
                        {isLoginPending ? t('auth.login.submitting') : t('auth.login.submit')}
                    </Button>

                </div>

                {/* Ссылка на регистрацию */}
                <div className="mt-5 text-center">
                    <Link
                        to="/register"
                        className="text-sm text-white/40 transition-colors hover:text-brand"
                    >
                        {t('auth.login.no_account')}
                    </Link>
                </div>
            </div>
        </AuthLayout>
    )
}