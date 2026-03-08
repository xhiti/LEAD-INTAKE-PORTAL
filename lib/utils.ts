import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, locale = 'en-US') {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date) {
  const now = new Date()
  const then = new Date(date)
  const diff = now.getTime() - then.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(date)
}

export function parseUserAgent(ua: string) {
  const browser = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/)?.[1] ?? 'Unknown'
  const os = ua.match(/(Windows NT|Mac OS X|Linux|Android|iOS)/)?.[1] ?? 'Unknown'
  const isMobile = /Mobile|Android|iPhone|iPad/.test(ua)
  const isTablet = /iPad|Tablet/.test(ua)
  const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop'

  return { browser, os, deviceType: deviceType as 'desktop' | 'mobile' | 'tablet' | 'unknown' }
}

export function getStatusColor(status: string) {
  const map: Record<string, string> = {
    new: 'bg-blue-500/15 border-blue-500/20 text-blue-600 dark:text-blue-400',
    reviewed: 'bg-amber-500/15 border-amber-500/20 text-amber-600 dark:text-amber-400',
    in_progress: 'bg-indigo-500/15 border-indigo-500/20 text-indigo-600 dark:text-indigo-400',
    closed: 'bg-emerald-500/15 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    archived: 'bg-slate-500/15 border-slate-500/20 text-slate-600 dark:text-slate-400',
  }
  return map[status] ?? 'bg-slate-500/10 text-slate-600'
}

export function getPriorityColor(priority: string) {
  const map: Record<string, string> = {
    low: 'bg-slate-500/15 border-slate-500/20 text-slate-600 dark:text-slate-400',
    medium: 'bg-amber-500/15 border-amber-500/20 text-amber-600 dark:text-amber-400',
    high: 'bg-orange-500/15 border-orange-500/20 text-orange-600 dark:text-orange-400',
    urgent: 'bg-red-500/15 border-red-500/20 text-red-600 dark:text-red-400',
  }
  return map[priority] ?? 'bg-gray-500/10 text-gray-600'
}
