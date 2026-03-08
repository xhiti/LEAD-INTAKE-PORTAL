'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor, LogOut, User, Globe } from 'lucide-react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { logoutAndClearSessionsAction } from '@/lib/actions/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
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
import { NotificationBell } from '@/components/notifications/notification-bell'
import { DynamicBreadcrumbs } from '@/components/layout/dynamic-breadcrumbs'
import { cn } from '@/lib/utils'
import type { Database } from '@/lib/supabase/database.types'

type Profile = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'full_name' | 'email' | 'avatar_url' | 'initials' | 'role'
>

const LOCALES = [
  { code: 'en', label: '🇺🇸 English' },
  { code: 'fr', label: '🇫🇷 Français' },
  { code: 'es', label: '🇪🇸 Español' },
  { code: 'sq', label: '🇦🇱 Shqip' },
]

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400',
  moderator: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
  user: 'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400',
  viewer: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

interface Props {
  profile: Profile
  locale: string
}

export function DashboardTopbar({ profile, locale }: Props) {
  const t = useTranslations('nav')
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const supabase = createClient()
  const [mounted, setMounted] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string>('')

  useEffect(() => {
    setMounted(true)

    // Resolve relative avatar URLs (custom uploads) vs absolute URLs (Google OAuth)
    if (profile.avatar_url) {
      if (profile.avatar_url.startsWith('http')) {
        setAvatarPreview(profile.avatar_url)
      } else {
        const { data } = supabase.storage.from('avatars').getPublicUrl(profile.avatar_url)
        setAvatarPreview(data.publicUrl)
      }
    }
  }, [profile.avatar_url, supabase])

  async function handleLogout() {
    await logoutAndClearSessionsAction()
    router.push(`/${locale}/login`)
    router.refresh()
  }

  function switchLocale(newLocale: string) {
    const path = window.location.pathname
    const segments = path.split('/')
    segments[1] = newLocale
    router.push(segments.join('/'))
  }

  // Prevent hydration mismatch on SVG icons by rendering null or a default until mounted
  const ThemeIcon = !mounted ? Monitor : (theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor)

  return (
    <motion.header
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="bg-white/80 dark:bg-background/80 backdrop-blur-md border-b border-gray-100 dark:border-neutral-900 px-6 flex items-center justify-between shrink-0 z-10 h-[64px]"
    >
      <div className="flex items-center gap-4">
        <span className="md:hidden font-bold text-sm">Lead Portal</span>
        <div className="hidden md:block">
          <DynamicBreadcrumbs />
        </div>
      </div>

      <div className="flex items-center gap-1">
        <NotificationBell />

        {/* Theme toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground">
              <ThemeIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuRadioGroup value={theme ?? 'system'} onValueChange={setTheme}>
              <DropdownMenuRadioItem value="light">
                <Sun className="mr-2 h-3.5 w-3.5" /> Light
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">
                <Moon className="mr-2 h-3.5 w-3.5" /> Dark
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system">
                <Monitor className="mr-2 h-3.5 w-3.5" /> System
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Language */}
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
              <DropdownMenuItem
                key={l.code}
                onClick={() => switchLocale(l.code)}
                className={cn('text-sm', locale === l.code && 'font-semibold text-primary')}
              >
                {l.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 gap-2 px-2 rounded-xl ml-1">
              <Avatar className="h-7 w-7">
                <AvatarImage src={avatarPreview} alt={profile.full_name || 'User avatar'} className="object-cover" />
                <AvatarFallback className="text-[10px] font-bold bg-gradient-to-br from-teal-500 to-emerald-600 text-white">
                  {profile.initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start min-w-[120px] max-w-[160px] ml-1 text-left">
                <span className="text-sm font-semibold truncate w-full">{profile.full_name}</span>
                <span className="text-[11px] text-muted-foreground truncate w-full">{profile.email}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel className="font-normal py-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={avatarPreview} alt={profile.full_name || 'User avatar'} className="object-cover" />
                  <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-teal-500 to-emerald-600 text-white">
                    {profile.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{profile.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                  <span className={cn('inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold mt-1', ROLE_COLORS[profile.role] ?? ROLE_COLORS.viewer)}>
                    {profile.role}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/${locale}/profile`} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                {t('profile')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              {t('logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header >
  )
}
