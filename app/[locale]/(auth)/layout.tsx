import { Sparkles, Zap, BarChart3, Shield, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getTranslations } from 'next-intl/server'

const features = [
  {
    icon: Zap,
    title: 'Instant AI Classification',
    desc: 'Every lead auto-categorized in seconds with confidence scores',
  },
  {
    icon: BarChart3,
    title: 'Smart Analytics',
    desc: 'Full CRM dashboard with real-time charts and team management',
  },
  {
    icon: Shield,
    title: 'Secure & Compliant',
    desc: 'Enterprise-grade security with full audit logging',
  },
]

export default async function AuthLayout({
  children,
  params
}: {
  children: React.ReactNode,
  params: { locale: string }
}) {
  const { locale } = await Promise.resolve(params)
  const t = await getTranslations('auth')

  return (
    <div className="h-full overflow-y-auto grid lg:grid-cols-2">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-primary via-teal-700 to-teal-950 p-12 text-white">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/20 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-teal-400/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-lg font-bold leading-none">Lead Intake Portal</p>
            <p className="text-xs text-white/60 mt-0.5">AI-Powered CRM</p>
          </div>
        </div>

        {/* Features */}
        <div className="relative space-y-7">
          <p className="text-2xl font-bold leading-snug">
            Automate your lead intake.<br />
            <span className="text-teal-200">Close deals faster.</span>
          </p>
          <div className="space-y-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="h-9 w-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{title}</p>
                  <p className="text-sm text-white/60 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div className="relative border-l-2 border-white/20 pl-4">
          <p className="text-sm text-white/75 italic">
            "Automating our lead intake saved us 10+ hours per week and improved response time by 80%."
          </p>
          <p className="text-xs text-white/40 mt-2">— Smart Business Solutions</p>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-black relative min-h-screen lg:min-h-0">
        <div className="absolute top-4 left-4 lg:top-8 lg:left-8 z-10">
          <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground group">
            <Link href={`/${locale}`}>
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              {t('backToHome')}
            </Link>
          </Button>
        </div>

        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 text-lg font-bold lg:hidden mb-10">
            <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            Lead Intake Portal
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
