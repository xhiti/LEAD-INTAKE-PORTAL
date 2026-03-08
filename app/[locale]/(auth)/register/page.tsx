'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { FormLabel } from '@/components/ui/form-label'
import { useToast } from '@/components/ui/use-toast'
import { registerUserAction } from '@/lib/actions/auth'

const registerSchema = z.object({
  name: z.string().min(2, 'Must be at least 2 characters'),
  surname: z.string().min(2, 'Must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const t = useTranslations()
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const { toast } = useToast()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const supabase = createClient()

  async function onSubmit(data: RegisterForm) {
    const { error } = await registerUserAction({
      email: data.email,
      password: data.password,
      name: data.name,
      surname: data.surname,
      locale: locale,
    })

    if (error) {
      toast({ title: 'Registration failed', description: error, variant: 'destructive' })
      return
    }

    toast({
      title: 'Account created!',
      description: 'Please check your email to verify your account.',
    })
    router.push(`/${locale}/login`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('auth.registerTitle')}</h1>
        <p className="text-muted-foreground mt-1">{t('auth.registerSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <FormLabel htmlFor="name" required>{t('auth.name')}</FormLabel>
            <Input id="name" placeholder="John" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <FormLabel htmlFor="surname" required>{t('auth.surname')}</FormLabel>
            <Input id="surname" placeholder="Doe" {...register('surname')} />
            {errors.surname && <p className="text-sm text-destructive">{errors.surname.message}</p>}
          </div>
        </div>
        <div className="space-y-2">
          <FormLabel htmlFor="email" required>{t('auth.email')}</FormLabel>
          <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <FormLabel htmlFor="password" required>{t('auth.password')}</FormLabel>
          <PasswordInput id="password" {...register('password')} />
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>
        <div className="space-y-2">
          <FormLabel htmlFor="confirmPassword" required>{t('auth.confirmPassword')}</FormLabel>
          <PasswordInput id="confirmPassword" {...register('confirmPassword')} />
          {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('auth.registerButton')}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t('auth.haveAccount')}{' '}
        <Link href={`/${locale}/login`} className="text-primary hover:underline font-medium">
          {t('auth.loginButton')}
        </Link>
      </p>
    </div>
  )
}
