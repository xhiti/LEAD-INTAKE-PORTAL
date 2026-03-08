'use client'

import { useState, useEffect, useCallback, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
    Bell, Search, SlidersHorizontal, X, CheckCheck, Check,
    FileText, ShieldCheck, Sparkles, AlertCircle, UserCog, Star, AtSign, Info
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import { DatePicker } from '@/components/ui/date-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { DateCell } from '@/components/ui/date-cell'
import { useDebounce } from '@/hooks/use-debounce'
import { markNotificationsReadAction, markAllNotificationsReadAction } from '@/lib/actions/notifications'
import type { NotificationFilters } from '@/lib/actions/notifications'

type Notification = {
    id: string
    type: string
    title: string
    body: string
    channel: string
    is_read: boolean
    read_at: string | null
    action_url: string | null
    created_at: string
    data: any
}

interface Props {
    initialData: Notification[]
    totalCount: number
    currentPage: number
    initialFilters: NotificationFilters & { isRead: string }
    unreadTotal: number
}

const TYPE_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    new_submission: { label: 'New Submission', icon: FileText, color: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/10 dark:text-teal-400 dark:border-teal-800' },
    submission_reviewed: { label: 'Reviewed', icon: CheckCheck, color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-800' },
    submission_status_changed: { label: 'Status Changed', icon: Sparkles, color: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/10 dark:text-violet-400 dark:border-violet-800' },
    system_alert: { label: 'System Alert', icon: AlertCircle, color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/10 dark:text-red-400 dark:border-red-800' },
    account_update: { label: 'Account Update', icon: UserCog, color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/10 dark:text-amber-400 dark:border-amber-800' },
    welcome: { label: 'Welcome', icon: Star, color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-800' },
    role_changed: { label: 'Role Changed', icon: ShieldCheck, color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/10 dark:text-orange-400 dark:border-orange-800' },
    mention: { label: 'Mention', icon: AtSign, color: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/10 dark:text-pink-400 dark:border-pink-800' },
}

const CHANNEL_META: Record<string, string> = {
    in_app: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/10 dark:text-slate-400 dark:border-slate-700',
    web_push: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/10 dark:text-indigo-400 dark:border-indigo-800',
    email: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/10 dark:text-cyan-400 dark:border-cyan-800',
}

function stringToDate(s: string): Date | undefined {
    if (!s) return undefined
    const d = new Date(s)
    return isNaN(d.getTime()) ? undefined : d
}

export function NotificationsList({ initialData, totalCount, currentPage, initialFilters, unreadTotal }: Props) {
    const router = useRouter()
    const pathname = usePathname()
    const [isPending, startTransition] = useTransition()
    const { toast } = useToast()

    const [notifications, setNotifications] = useState<Notification[]>(initialData)
    const [filters, setFilters] = useState(initialFilters)
    const [fromDate, setFromDate] = useState<Date | undefined>(stringToDate(initialFilters.dateFrom ?? ''))
    const [toDate, setToDate] = useState<Date | undefined>(stringToDate(initialFilters.dateTo ?? ''))
    const [markingAll, setMarkingAll] = useState(false)
    const [markingIds, setMarkingIds] = useState<Set<string>>(new Set())

    const debouncedSearch = useDebounce(filters.search ?? '', 400)

    const buildQuery = useCallback((f: typeof initialFilters, page: number) => {
        const params = new URLSearchParams()
        if (f.search) params.set('search', f.search)
        if (f.type) params.set('type', f.type)
        if (f.isRead && f.isRead !== 'all') params.set('isRead', f.isRead)
        if (f.channel) params.set('channel', f.channel)
        if (f.dateFrom) params.set('dateFrom', f.dateFrom)
        if (f.dateTo) params.set('dateTo', f.dateTo)
        params.set('page', String(page))
        return params.toString()
    }, [])

    useEffect(() => {
        startTransition(() => {
            router.push(`${pathname}?${buildQuery(filters, 1)}`)
        })
    }, [debouncedSearch])

    useEffect(() => {
        setNotifications(initialData)
    }, [initialData])

    const applyFilter = (key: keyof typeof initialFilters, value: string) => {
        const next = { ...filters, [key]: value }
        setFilters(next)
        if (key !== 'search') {
            startTransition(() => router.push(`${pathname}?${buildQuery(next, 1)}`))
        }
    }

    const handleFromDate = (d: Date | undefined) => {
        setFromDate(d)
        const next = { ...filters, dateFrom: d ? d.toISOString().split('T')[0] : '' }
        setFilters(next)
        startTransition(() => router.push(`${pathname}?${buildQuery(next, 1)}`))
    }

    const handleToDate = (d: Date | undefined) => {
        setToDate(d)
        const next = { ...filters, dateTo: d ? d.toISOString().split('T')[0] : '' }
        setFilters(next)
        startTransition(() => router.push(`${pathname}?${buildQuery(next, 1)}`))
    }

    const resetFilters = () => {
        const empty = { search: '', type: '', isRead: 'all', channel: '', dateFrom: '', dateTo: '' }
        setFilters(empty)
        setFromDate(undefined)
        setToDate(undefined)
        startTransition(() => router.push(pathname))
    }

    const hasActiveFilters = (filters.search || filters.type || (filters.isRead && filters.isRead !== 'all') || filters.channel || filters.dateFrom || filters.dateTo)

    const handlePageChange = (page: number) => {
        startTransition(() => router.push(`${pathname}?${buildQuery(filters, page)}`))
    }

    async function markOneRead(id: string) {
        setMarkingIds(prev => new Set(prev).add(id))
        const res = await markNotificationsReadAction([id])
        if (res.error) {
            toast({ title: 'Failed to mark as read', variant: 'destructive' })
        } else {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n))
        }
        setMarkingIds(prev => { const s = new Set(prev); s.delete(id); return s })
    }

    async function handleMarkAllRead() {
        setMarkingAll(true)
        const res = await markAllNotificationsReadAction()
        if (res.error) {
            toast({ title: 'Failed to mark all as read', variant: 'destructive' })
        } else {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read_at: n.read_at ?? new Date().toISOString() })))
            toast({ title: 'All notifications marked as read' })
        }
        setMarkingAll(false)
    }

    const localUnread = notifications.filter(n => !n.is_read).length

    return (
        <>
            <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-4 space-y-3 mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            placeholder="Search title or message..."
                            value={filters.search ?? ''}
                            onChange={e => applyFilter('search', e.target.value)}
                            className="pl-9 h-10 bg-background/50 text-sm"
                        />
                    </div>

                    <Select value={filters.isRead ?? 'all'} onValueChange={v => applyFilter('isRead', v)}>
                        <SelectTrigger className="h-10 text-sm bg-background/50">
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="unread">
                                Unread
                                {unreadTotal > 0 && (
                                    <span className="ml-2 text-[10px] bg-primary/10 text-primary rounded-full px-1.5 py-0.5">{unreadTotal}</span>
                                )}
                            </SelectItem>
                            <SelectItem value="read">Read</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filters.type || '__all__'} onValueChange={v => applyFilter('type', v === '__all__' ? '' : v)}>
                        <SelectTrigger className="h-10 text-sm bg-background/50">
                            <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__all__">All types</SelectItem>
                            {Object.entries(TYPE_META).map(([k, v]) => (
                                <SelectItem key={k} value={k}>{v.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={filters.channel || '__all__'} onValueChange={v => applyFilter('channel', v === '__all__' ? '' : v)}>
                        <SelectTrigger className="h-10 text-sm bg-background/50">
                            <SelectValue placeholder="All channels" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__all__">All channels</SelectItem>
                            <SelectItem value="in_app">In-App</SelectItem>
                            <SelectItem value="web_push">Web Push</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <DatePicker date={fromDate} setDate={handleFromDate} placeholder="From date" className="w-full" />
                    <DatePicker date={toDate} setDate={handleToDate} placeholder="To date" className="w-full" />
                    <div className="hidden lg:block" />
                    <div className="flex items-center justify-end lg:justify-end">
                        {localUnread > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleMarkAllRead}
                                disabled={markingAll}
                                className="h-10 text-xs gap-2 w-full lg:w-auto"
                            >
                                <CheckCheck className="h-3.5 w-3.5" />
                                Mark all as read
                            </Button>
                        )}
                    </div>
                </div>

                {hasActiveFilters && (
                    <div className="flex items-center justify-between pt-1 border-t border-border/40">
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <SlidersHorizontal className="h-3.5 w-3.5" />
                            Filtered · {totalCount} result{totalCount !== 1 ? 's' : ''}
                        </span>
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground" onClick={resetFilters}>
                            <X className="h-3.5 w-3.5" />
                            Clear all
                        </Button>
                    </div>
                )}
            </div>

            <DataTable
                data={notifications}
                columns={[
                    {
                        id: 'status',
                        header: '',
                        className: 'w-4',
                        headerClassName: 'w-4',
                        cell: (n) => (
                            <div className="flex items-center justify-center">
                                {!n.is_read && (
                                    <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                                )}
                            </div>
                        ),
                    },
                    {
                        id: 'type',
                        header: 'Type',
                        cell: (n) => {
                            const meta = TYPE_META[n.type] ?? { label: n.type, icon: Info, color: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/10 dark:text-slate-400' }
                            const Icon = meta.icon
                            return (
                                <div className="flex items-center gap-2">
                                    <div className={`h-7 w-7 rounded-lg border flex items-center justify-center shrink-0 ${meta.color}`}>
                                        <Icon className="h-3.5 w-3.5" />
                                    </div>
                                    <Badge variant="outline" className={`text-[10px] whitespace-nowrap ${meta.color}`}>
                                        {meta.label}
                                    </Badge>
                                </div>
                            )
                        },
                    },
                    {
                        id: 'content',
                        header: 'Notification',
                        cell: (n) => (
                            <div className="min-w-0">
                                <p className={`text-sm truncate max-w-[280px] ${!n.is_read ? 'font-semibold' : 'font-medium'}`}>
                                    {n.title}
                                </p>
                                <p className="text-xs text-muted-foreground truncate max-w-[280px] mt-0.5">{n.body}</p>
                            </div>
                        ),
                    },
                    {
                        id: 'channel',
                        header: 'Channel',
                        className: 'hidden md:table-cell',
                        headerClassName: 'hidden md:table-cell',
                        cell: (n) => (
                            <Badge variant="outline" className={`text-[10px] capitalize ${CHANNEL_META[n.channel] ?? CHANNEL_META.in_app}`}>
                                {n.channel === 'in_app' ? 'In-App' : n.channel === 'web_push' ? 'Push' : 'Email'}
                            </Badge>
                        ),
                    },
                    {
                        id: 'read_status',
                        header: 'Read',
                        className: 'hidden lg:table-cell',
                        headerClassName: 'hidden lg:table-cell',
                        cell: (n) => n.is_read ? (
                            <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/10 dark:text-slate-400 dark:border-slate-700">
                                Read
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                                Unread
                            </Badge>
                        ),
                    },
                    {
                        id: 'date',
                        header: 'Date',
                        className: 'hidden sm:table-cell',
                        headerClassName: 'hidden sm:table-cell',
                        cell: (n) => <DateCell date={n.created_at} />,
                    },
                    {
                        id: 'actions',
                        header: '',
                        className: 'text-right',
                        headerClassName: 'text-right',
                        cell: (n) => (
                            <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                                {!n.is_read && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={markingIds.has(n.id)}
                                        onClick={() => markOneRead(n.id)}
                                        className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                                        title="Mark as read"
                                    >
                                        <Check className="h-3.5 w-3.5" />
                                        <span className="hidden lg:inline">Mark read</span>
                                    </Button>
                                )}
                                {n.action_url && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-xs"
                                        onClick={() => router.push(n.action_url!)}
                                    >
                                        View
                                    </Button>
                                )}
                            </div>
                        ),
                    },
                ]}
                keyExtractor={(n) => n.id}
                enableSelection={false}
                enableExport={false}
                emptyState={{
                    icon: <Bell className="h-10 w-10 text-muted-foreground/30" />,
                    title: 'No notifications',
                    description: hasActiveFilters ? 'Try adjusting your filters.' : 'You\'re all caught up!',
                }}
                serverSide={true}
                totalItems={totalCount}
                currentPage={currentPage}
                pageSize={20}
                onPageChange={handlePageChange}
                isLoading={isPending}
            />
        </>
    )
}
