'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'
import { motion, type Variants } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { FormLabel } from '@/components/ui/form-label'
import { useToast } from '@/components/ui/use-toast'
import { Separator } from '@/components/ui/separator'
import { sendWelcomeEmailAction, trackLoginSessionAction } from '@/lib/actions/auth'
import { getProfileById } from '@/lib/queries/profiles'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

type LoginForm = z.infer<typeof loginSchema>

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay, ease: "easeOut" },
  }),
}

export default function LoginPage() {
  const t = useTranslations()
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const { toast } = useToast()
  const [googleLoading, setGoogleLoading] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const supabase = createClient()

  async function onSubmit(data: LoginForm) {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    if (error) {
      toast({ title: 'Login failed', description: error.message, variant: 'destructive' })
      return
    }

    // Attempt to send welcome email in background
    if (authData.user) {
      (async () => {
        try {
          const { data: profile } = await getProfileById(supabase as any, authData.user!.id)
          if (profile) {
            await sendWelcomeEmailAction(profile.email, profile.name)
          }
        } catch (err) {
          console.error('Welcome email error:', err)
        }
      })()

      // Track Login Session
      try {
        await trackLoginSessionAction(navigator.userAgent, 'email', authData.user.id)
      } catch (err) {
        console.error('Failed to track login session', err)
      }
    }

    router.push(`/${locale}/dashboard`)
    router.refresh()
  }

  async function signInWithGoogle() {
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/${locale}/dashboard`,
      },
    })
    if (error) {
      toast({ title: 'Google login failed', description: error.message, variant: 'destructive' })
      setGoogleLoading(false)
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={fadeUp} custom={0}>
        <h1 className="text-2xl font-bold tracking-tight">{t('auth.loginTitle')}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t('auth.loginSubtitle')}</p>
      </motion.div>

      <motion.div variants={fadeUp} custom={0.08}>
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Button
            variant="outline"
            className="w-full h-11 rounded-xl border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 gap-2 font-medium"
            onClick={signInWithGoogle}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            {t('auth.loginWithGoogle')}
          </Button>
        </motion.div>
      </motion.div>

      <motion.div variants={fadeUp} custom={0.14} className="flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">{t('auth.orContinueWith')}</span>
        <Separator className="flex-1" />
      </motion.div>

      <motion.form
        variants={fadeUp}
        custom={0.2}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div className="space-y-2">
          <FormLabel htmlFor="email" className="text-sm font-medium" required>{t('auth.email')}</FormLabel>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="h-11 rounded-xl"
            {...register('email')}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <FormLabel htmlFor="password" className="text-sm font-medium" required>{t('auth.password')}</FormLabel>
            <span className="text-xs text-muted-foreground cursor-not-allowed opacity-50">
              {t('auth.forgotPassword')}
            </span>
          </div>
          <PasswordInput
            id="password"
            placeholder="••••••••"
            className="h-11 rounded-xl"
            {...register('password')}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>
        <motion.div whileTap={{ scale: 0.99 }}>
          <Button
            type="submit"
            className="w-full h-11 rounded-xl font-semibold bg-primary hover:bg-primary/90 shadow-sm shadow-primary/20"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('auth.loginButton')}
          </Button>
        </motion.div>
      </motion.form>

      <motion.p variants={fadeUp} custom={0.28} className="text-center text-sm text-muted-foreground">
        {t('auth.noAccount')}{' '}
        <Link href={`/${locale}/register`} className="text-primary hover:text-primary/80 font-semibold transition-colors">
          {t('auth.registerButton')}
        </Link>
      </motion.p>
    </motion.div>
  )
}
