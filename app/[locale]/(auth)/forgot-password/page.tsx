'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Loader2, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

const schema = z.object({ email: z.string().email() })
type Form = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const t = useTranslations()
  const params = useParams()
  const locale = params.locale as string
  const { toast } = useToast()
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  const supabase = createClient()

  async function onSubmit(data: Form) {
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/${locale}/reset-password`,
    })

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
        <h1 className="text-2xl font-bold">Check your email</h1>
        <p className="text-muted-foreground">{t('auth.checkEmail')}</p>
        <Link href={`/${locale}/login`} className="text-primary hover:underline text-sm">
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('auth.forgotPasswordTitle')}</h1>
        <p className="text-muted-foreground mt-1">{t('auth.forgotPasswordSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t('auth.email')}</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('auth.sendResetLink')}
        </Button>
      </form>

      <p className="text-center text-sm">
        <Link href={`/${locale}/login`} className="text-primary hover:underline">
          {t('common.back')} to login
        </Link>
      </p>
    </div>
  )
}
