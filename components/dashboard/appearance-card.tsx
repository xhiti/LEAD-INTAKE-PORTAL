'use client'

import { useTheme } from 'next-themes'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor, Globe, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'

const LOCALES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'sq', label: 'Shqip', flag: '🇦🇱' },
]

const THEMES = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
]

export function AppearanceCard() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const params = useParams()
  const currentLocale = params.locale as string
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  function switchLocale(newLocale: string) {
    const path = window.location.pathname
    const segments = path.split('/')
    segments[1] = newLocale
    router.push(segments.join('/'))
  }

  const activeTheme = mounted ? (theme ?? 'system') : 'system'

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Theme row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
            <Palette className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium">Theme</p>
            <p className="text-xs text-muted-foreground">Interface appearance</p>
          </div>
        </div>
        <div className="flex rounded-lg border border-border overflow-hidden shrink-0 w-fit">
          {THEMES.map(({ value, label, Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium transition-colors border-r border-border last:border-r-0',
                activeTheme === value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border" />

      {/* Language row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
            <Globe className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium">Language</p>
            <p className="text-xs text-muted-foreground">Display language for the interface</p>
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap shrink-0">
          {LOCALES.map(({ code, label, flag }) => (
            <button
              key={code}
              onClick={() => switchLocale(code)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                currentLocale === code
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground'
              )}
            >
              <span>{flag}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
