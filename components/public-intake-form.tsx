'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Bot, Sun, Moon, Monitor, Globe, ArrowRight, Loader2, CheckCircle2, Sparkles, Copy } from 'lucide-react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormLabel } from '@/components/ui/form-label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'

const schema = z.object({
  name: z.string().min(2, 'Must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  business_name: z.string().min(2, 'Must be at least 2 characters'),
  industry: z.string().min(1, 'Please select an industry'),
  help_request: z.string().min(20, 'Please provide at least 20 characters of detail'),
})

type FormData = z.infer<typeof schema>

interface SubmissionResult {
  id: string
  ai_category: string
  ai_summary: string
  ai_model_used: string
}

interface AIInsight {
  summary: string
  category: string
  confidence_score: number
  model_used: string
}

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const } },
}

const LOCALES = [
  { code: 'en', label: '🇺🇸 English' },
  { code: 'fr', label: '🇫🇷 Français' },
  { code: 'es', label: '🇪🇸 Español' },
  { code: 'sq', label: '🇦🇱 Shqip' },
]

interface Props {
  industries: string[]
}

export function PublicIntakeForm({ industries }: Props) {
  const t = useTranslations()
  const params = useParams()
  const locale = params.locale as string
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [submitted, setSubmitted] = useState<SubmissionResult | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const industry = watch('industry')
  const helpRequestText = watch('help_request')

  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  /* 
  useEffect(() => {
    if (!helpRequestText || helpRequestText.length < 20) {
      setAiInsight(null)
      return
    }

    setIsAnalyzing(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: helpRequestText }),
        })
        if (res.ok) {
          const data = await res.json()
          setAiInsight(data)
        }
      } catch (e) {
        console.error('AI preview failed', e)
      } finally {
        setIsAnalyzing(false)
      }
    }, 1200)

    return () => clearTimeout(timer)
  }, [helpRequestText])
  */

  async function onSubmit(data: FormData) {
    try {
      const payload = { ...data, ai_prefetched: aiInsight || undefined }
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error ?? 'Submission failed')
      }
      const result = await response.json()
      setSubmitted(result)
      reset()
    } catch (error) {
      toast({
        title: 'Submission failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      })
    }
  }

  function copyId() {
    if (submitted?.id) {
      navigator.clipboard.writeText(submitted.id)
      toast({ title: 'Copied!', description: 'Submission ID copied to clipboard.' })
    }
  }

  function switchLocale(newLocale: string) {
    const path = window.location.pathname
    const segments = path.split('/')
    segments[1] = newLocale
    window.location.href = segments.join('/')
  }

  const ThemeIcon = !mounted ? Monitor : (theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor)

  return (
    <div className="h-full overflow-y-auto relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-black dark:via-neutral-950 dark:to-black" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-teal-400/10 dark:bg-teal-500/5 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-400/10 dark:bg-teal-500/5 rounded-full blur-3xl translate-y-1/2" />

      <motion.header
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="relative border-b border-gray-200/60 dark:border-neutral-900/60 bg-white/70 dark:bg-black/70 backdrop-blur-md sticky top-0 z-10"
      >
        <div className="container max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-sm">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-[15px]">Lead Intake Portal</span>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground">
                  <ThemeIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuRadioGroup value={theme ?? 'system'} onValueChange={setTheme}>
                  <DropdownMenuRadioItem value="light"><Sun className="mr-2 h-3.5 w-3.5" /> Light</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark"><Moon className="mr-2 h-3.5 w-3.5" /> Dark</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system"><Monitor className="mr-2 h-3.5 w-3.5" /> System</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground">
                  <Globe className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Language</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {LOCALES.map(l => (
                  <DropdownMenuItem key={l.code} onClick={() => switchLocale(l.code)} className={`text-sm ${locale === l.code ? 'font-semibold text-primary' : ''}`}>
                    {l.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href={`/${locale}/login`}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" size="sm" className="rounded-xl font-medium gap-1.5 ml-2">
                  {t('nav.login')}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.header>

      <main className="relative container max-w-3xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <Card className="border border-gray-100 dark:border-neutral-900 shadow-xl shadow-gray-200/50 dark:shadow-black/20 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-400" />
                <CardHeader className="text-center pt-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                    className="flex justify-center mb-4"
                  >
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 flex items-center justify-center">
                      <CheckCircle2 className="h-11 w-11 text-green-500 dark:text-green-400" />
                    </div>
                  </motion.div>
                  <CardTitle className="text-2xl font-bold">{t('success.title')}</CardTitle>
                  <CardDescription className="text-sm mt-1">{t('success.message')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pb-8">
                  <div className="rounded-xl bg-gray-50 dark:bg-neutral-900/50 border border-gray-100 dark:border-neutral-800/50 p-4 space-y-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{t('success.submissionId')}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <code className="text-sm font-mono truncate text-foreground">{submitted.id}</code>
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 rounded-lg" onClick={copyId}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {submitted.ai_category && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">AI Category</p>
                        <Badge className="mt-1.5 rounded-lg">{submitted.ai_category}</Badge>
                      </div>
                    )}
                    {submitted.ai_summary && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">AI Summary</p>
                        <p className="text-sm mt-1.5 text-foreground">{submitted.ai_summary}</p>
                      </div>
                    )}
                    {submitted.ai_model_used && (
                      <p className="text-[10px] font-mono text-muted-foreground/60">Model: {submitted.ai_model_used}</p>
                    )}
                  </div>
                  <Button variant="outline" className="w-full h-11 rounded-xl font-medium" onClick={() => setSubmitted(null)}>
                    {t('success.newSubmission')}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div key="form" variants={stagger} initial="hidden" animate="show" exit={{ opacity: 0, y: -10 }}>
              <motion.div variants={fadeUp} className="text-center mb-10">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}>
                  <Badge className="mb-4 gap-1.5 rounded-full px-3 py-1 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800 hover:bg-teal-100">
                    <Sparkles className="h-3 w-3" />
                    {t('home.badge')}
                  </Badge>
                </motion.div>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  {t('home.title')}
                </h1>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
                  {t('home.subtitle')}
                </p>
              </motion.div>

              <motion.div variants={fadeUp}>
                <Card className="border border-gray-100 dark:border-neutral-900/70 shadow-xl shadow-gray-200/60 dark:shadow-black/20 overflow-hidden">
                  <div className="h-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-400" />
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Tell us about your needs</CardTitle>
                    <CardDescription>Our AI will instantly categorize your request and our team will follow up.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <motion.div variants={fadeUp} className="space-y-2">
                          <FormLabel htmlFor="name" required className="text-sm font-medium">{t('form.name')}</FormLabel>
                          <Input id="name" placeholder={t('form.namePlaceholder')} className="h-10 rounded-xl" {...register('name')} />
                          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                        </motion.div>
                        <motion.div variants={fadeUp} className="space-y-2">
                          <FormLabel htmlFor="email" required className="text-sm font-medium">{t('form.email')}</FormLabel>
                          <Input id="email" type="email" placeholder={t('form.emailPlaceholder')} className="h-10 rounded-xl" {...register('email')} />
                          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                        </motion.div>
                      </motion.div>

                      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <motion.div variants={fadeUp} className="space-y-2">
                          <FormLabel htmlFor="business_name" required className="text-sm font-medium">{t('form.businessName')}</FormLabel>
                          <Input id="business_name" placeholder={t('form.businessNamePlaceholder')} className="h-10 rounded-xl" {...register('business_name')} />
                          {errors.business_name && <p className="text-xs text-destructive">{errors.business_name.message}</p>}
                        </motion.div>
                        <motion.div variants={fadeUp} className="space-y-2">
                          <FormLabel required className="text-sm font-medium">{t('form.industry')}</FormLabel>
                          <Select onValueChange={v => setValue('industry', v)} value={industry}>
                            <SelectTrigger className="h-10 rounded-xl">
                              <SelectValue placeholder={t('form.industryPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                              {industries.map(ind => (
                                <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.industry && <p className="text-xs text-destructive">{errors.industry.message}</p>}
                        </motion.div>
                      </motion.div>

                      <motion.div variants={fadeUp} className="space-y-2">
                        <FormLabel htmlFor="help_request" required className="text-sm font-medium">{t('form.helpRequest')}</FormLabel>
                        <Textarea
                          id="help_request"
                          placeholder={t('form.helpRequestPlaceholder')}
                          className="min-h-[130px] rounded-xl resize-y"
                          {...register('help_request')}
                        />
                        {errors.help_request && <p className="text-xs text-destructive">{errors.help_request.message}</p>}
                      </motion.div>


                      <motion.div variants={fadeUp} whileTap={{ scale: 0.99 }} className="pt-2">
                        <Button
                          type="submit"
                          size="lg"
                          className="w-full h-12 rounded-xl font-semibold bg-primary hover:bg-primary/90 shadow-md shadow-primary/25 gap-2"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <><Loader2 className="h-4 w-4 animate-spin" />{t('form.submitting')}</>
                          ) : (
                            <><Sparkles className="h-4 w-4" />{t('form.submit')}</>
                          )}
                        </Button>
                      </motion.div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.p variants={fadeUp} className="text-center text-xs text-muted-foreground mt-5">
                Your information is secure and will only be used to process your request.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
