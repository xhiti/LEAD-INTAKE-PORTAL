'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  LayoutDashboard,
  FileText,
  User,
  Sparkles,
  ChevronRight,
  BarChart3,
  Calendar,
  Trello,
  MessageSquare,
  Users,
  Database,
  History,
  Settings,
  Bell,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface Props {
  locale: string
  role: string
}

export function DashboardSidebar({ locale, role }: Props) {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const isAdmin = role === 'admin' || role === 'moderator'

  const navigationGroups = [
    {
      id: 'menu',
      title: t('groups.menu'),
      items: [
        {
          href: `/${locale}/dashboard`,
          label: t('dashboard'),
          icon: LayoutDashboard,
          roles: ['user', 'admin', 'moderator', 'viewer'],
        },
        {
          href: `/${locale}/analytics`,
          label: t('analytics'),
          icon: BarChart3,
          roles: ['user', 'admin', 'moderator'],
        },
      ],
    },
    {
      id: 'submissions',
      title: t('groups.submissions'),
      items: [
        {
          href: `/${locale}/submissions/new`,
          label: t('registerSubmission'),
          icon: Sparkles,
          roles: ['user', 'admin', 'moderator'],
        },
        {
          href: `/${locale}/submissions/my`,
          label: t('mySubmissions'),
          icon: FileText,
          roles: ['user', 'admin', 'moderator'],
        },
        ...(isAdmin
          ? [
            {
              href: `/${locale}/submissions`,
              label: t('allSubmissions'),
              icon: ShieldCheck,
              roles: ['admin', 'moderator'],
            },
          ]
          : []),
        {
          href: `/${locale}/submissions/calendar`,
          label: t('calendar'),
          icon: Calendar,
          roles: ['user', 'admin', 'moderator', 'viewer'],
        },
        {
          href: `/${locale}/submissions/kanban`,
          label: t('kanban'),
          icon: Trello,
          roles: ['admin', 'moderator'],
        },
        {
          href: `/${locale}/assistant`,
          label: t('aiAssistant'),
          icon: MessageSquare,
          roles: ['user', 'admin', 'moderator'],
        },
      ],
    },
    {
      id: 'profile',
      title: t('groups.profile'),
      items: [
        {
          href: `/${locale}/profile`,
          label: t('account'),
          icon: User,
          roles: ['user', 'admin', 'moderator', 'viewer'],
        },
        {
          href: `/${locale}/profile/notifications`,
          label: t('notifications'),
          icon: Bell,
          roles: ['user', 'admin', 'moderator', 'viewer'],
        },
        {
          href: `/${locale}/profile/sessions`,
          label: t('activeSessions'),
          icon: History,
          roles: ['user', 'admin', 'moderator', 'viewer'],
        },

        {
          href: `/${locale}/profile/settings`,
          label: t('settings'),
          icon: Settings,
          roles: ['user', 'admin', 'moderator', 'viewer'],
        },
      ],
    },
    ...(isAdmin
      ? [
        {
          id: 'admin',
          title: t('groups.admin'),
          items: [
            {
              href: `/${locale}/admin/users`,
              label: t('users'),
              icon: Users,
              roles: ['admin', 'moderator'],
            },
            {
              href: `/${locale}/admin/industries`,
              label: t('industries'),
              icon: Database,
              roles: ['admin', 'moderator'],
            },
            {
              href: `/${locale}/admin/logs`,
              label: t('logs'),
              icon: History,
              roles: ['admin', 'moderator'],
            },
          ],
        },
      ]
      : []),
  ]

  return (
    <motion.aside
      initial={{ x: -16, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="hidden md:flex w-[240px] flex-col bg-white dark:bg-card border-r border-gray-100 dark:border-neutral-900 shrink-0"
    >
      <div className="shrink-0 flex items-center gap-2.5 px-4 py-[14px] border-b border-gray-100 dark:border-gray-800/60 h-[64px]">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-md shadow-teal-500/20 shrink-0">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="font-bold text-[14px] leading-none tracking-tight">Lead Intake Portal</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">AI-Powered System</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto min-h-0 px-2.5 py-3 space-y-4">
        {navigationGroups.map((group) => {
          const visibleItems = group.items.filter((item) => item.roles.includes(role))
          if (visibleItems.length === 0) return null

          return (
            <div key={group.id}>
              <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-2.5 mb-1">
                {group.title}
              </p>
              <div className="space-y-0.5">
                {visibleItems.map(({ href, label, icon: Icon }) => {
                  const isActive =
                    pathname === href ||
                    (href !== `/${locale}/dashboard` &&
                      pathname.startsWith(href + '/') &&
                      !navigationGroups.flatMap((g) => g.items).some(
                        (item) => item.href !== href && pathname.startsWith(item.href) && item.href.length > href.length
                      ))
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        'group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
                          : 'text-muted-foreground hover:bg-gray-50 dark:hover:bg-neutral-900 hover:text-foreground'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-[15px] w-[15px] shrink-0 transition-transform duration-200',
                          isActive ? 'text-primary-foreground' : 'group-hover:scale-110'
                        )}
                      />
                      <span className="flex-1 truncate">{label}</span>
                      {isActive && <ChevronRight className="h-3 w-3 opacity-60 shrink-0" />}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      <div className="shrink-0 px-2.5 py-3 border-t border-gray-100 dark:border-gray-800/60">
        <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/50">
          <div className="h-5 w-5 rounded-md bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center shrink-0">
            <Sparkles className="h-3 w-3 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-teal-700 dark:text-teal-300">AI-Powered</p>
            <p className="text-[9px] text-teal-600/80 dark:text-teal-400/80 leading-tight">Auto-classification on</p>
          </div>
        </div>
      </div>
    </motion.aside>
  )
}
