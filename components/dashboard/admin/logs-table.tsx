'use client'

import { useState, useEffect, useCallback, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Search, SlidersHorizontal, X, User, Network, ArrowLeftRight, MonitorSmartphone, Info } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DateCell } from '@/components/ui/date-cell'
import { DatePicker } from '@/components/ui/date-picker'
import { ViewButton } from '@/components/ui/actions'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LogDetailsModal } from './log-details-modal'
import { useDebounce } from '@/hooks/use-debounce'

interface Filters {
    search: string
    action: string
    entityType: string
    dateFrom: string
    dateTo: string
    userSearch: string
    role: string
    ipSearch: string
}

interface Props {
    initialLogs: any[]
    totalCount: number
    currentPage: number
    initialFilters: Filters
}

const ACTION_OPTIONS = [
    { value: 'CREATE', label: 'Create' },
    { value: 'UPDATE', label: 'Update' },
    { value: 'DELETE', label: 'Delete' },
    { value: 'LOGIN', label: 'Login' },
    { value: 'LOGOUT', label: 'Logout' },
    { value: 'VIEW', label: 'View' },
]

const ENTITY_OPTIONS = [
    { value: 'profile', label: 'Profile' },
    { value: 'submission', label: 'Submission' },
    { value: 'auth_session', label: 'Auth Session' },
    { value: 'notification', label: 'Notification' },
    { value: 'user', label: 'User' },
]

const ROLE_OPTIONS = [
    { value: 'admin', label: 'Admin' },
    { value: 'moderator', label: 'Moderator' },
    { value: 'user', label: 'User' },
    { value: 'viewer', label: 'Viewer' },
]

function actionColor(action: string) {
    const a = action.toUpperCase()
    if (a.includes('CREATE')) return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-800'
    if (a.includes('UPDATE')) return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-800'
    if (a.includes('DELETE')) return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/10 dark:text-red-400 dark:border-red-800'
    if (a.includes('LOGIN')) return 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/10 dark:text-violet-400 dark:border-violet-800'
    if (a.includes('LOGOUT')) return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/10 dark:text-orange-400 dark:border-orange-800'
    return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/10 dark:text-slate-400 dark:border-slate-800'
}

function roleColor(role: string) {
    if (role === 'admin') return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/10 dark:text-rose-400 dark:border-rose-800'
    if (role === 'moderator') return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/10 dark:text-amber-400 dark:border-amber-800'
    if (role === 'viewer') return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/10 dark:text-sky-400 dark:border-sky-800'
    return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/10 dark:text-slate-400 dark:border-slate-800'
}

function stringToDate(s: string): Date | undefined {
    if (!s) return undefined
    const d = new Date(s)
    return isNaN(d.getTime()) ? undefined : d
}

export function LogsTable({ initialLogs, totalCount, currentPage, initialFilters }: Props) {
    const router = useRouter()
    const pathname = usePathname()
    const [isPending, startTransition] = useTransition()

    const [filters, setFilters] = useState<Filters>(initialFilters)
    const [fromDate, setFromDate] = useState<Date | undefined>(stringToDate(initialFilters.dateFrom))
    const [toDate, setToDate] = useState<Date | undefined>(stringToDate(initialFilters.dateTo))

    const debouncedSearch = useDebounce(filters.search, 400)
    const debouncedUserSearch = useDebounce(filters.userSearch, 400)
    const debouncedIpSearch = useDebounce(filters.ipSearch, 400)

    const [selectedLog, setSelectedLog] = useState<any | null>(null)

    const buildQuery = useCallback((f: Filters, page: number) => {
        const params = new URLSearchParams()
        if (f.search) params.set('search', f.search)
        if (f.action) params.set('action', f.action)
        if (f.entityType) params.set('entityType', f.entityType)
        if (f.dateFrom) params.set('dateFrom', f.dateFrom)
        if (f.dateTo) params.set('dateTo', f.dateTo)
        if (f.userSearch) params.set('userSearch', f.userSearch)
        if (f.role) params.set('role', f.role)
        if (f.ipSearch) params.set('ipSearch', f.ipSearch)
        params.set('page', String(page))
        return params.toString()
    }, [])

    useEffect(() => {
        startTransition(() => {
            router.push(`${pathname}?${buildQuery(filters, 1)}`)
        })
    }, [debouncedSearch, debouncedUserSearch, debouncedIpSearch]) // eslint-disable-line react-hooks/exhaustive-deps

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

    const applyFilter = (key: keyof Filters, value: string) => {
        const next = { ...filters, [key]: value }
        setFilters(next)
        if (key !== 'search' && key !== 'userSearch' && key !== 'ipSearch') {
            startTransition(() => router.push(`${pathname}?${buildQuery(next, 1)}`))
        }
    }

    const resetFilters = () => {
        const empty: Filters = { search: '', action: '', entityType: '', dateFrom: '', dateTo: '', userSearch: '', role: '', ipSearch: '' }
        setFilters(empty)
        setFromDate(undefined)
        setToDate(undefined)
        startTransition(() => router.push(pathname))
    }

    const hasActiveFilters = Object.values(filters).some(v => v !== '')

    const handlePageChange = (page: number) => {
        startTransition(() => router.push(`${pathname}?${buildQuery(filters, page)}`))
    }

    return (
        <>
            <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-4 space-y-3 mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            placeholder="Search action, entity, ID..."
                            value={filters.search}
                            onChange={e => applyFilter('search', e.target.value)}
                            className="pl-9 h-10 bg-background/50 text-sm"
                        />
                    </div>

                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            placeholder="Search user name or email..."
                            value={filters.userSearch}
                            onChange={e => applyFilter('userSearch', e.target.value)}
                            className="pl-9 h-10 bg-background/50 text-sm"
                        />
                    </div>

                    <DatePicker
                        date={fromDate}
                        setDate={handleFromDate}
                        placeholder="From date"
                        className="w-full"
                    />

                    <DatePicker
                        date={toDate}
                        setDate={handleToDate}
                        placeholder="To date"
                        className="w-full"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Select value={filters.role || '__all__'} onValueChange={v => applyFilter('role', v === '__all__' ? '' : v)}>
                        <SelectTrigger className="h-10 text-sm bg-background/50">
                            <SelectValue placeholder="All roles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__all__">All roles</SelectItem>
                            {ROLE_OPTIONS.map(o => (
                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={filters.action || '__all__'} onValueChange={v => applyFilter('action', v === '__all__' ? '' : v)}>
                        <SelectTrigger className="h-10 text-sm bg-background/50">
                            <SelectValue placeholder="All actions" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__all__">All actions</SelectItem>
                            {ACTION_OPTIONS.map(o => (
                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={filters.entityType || '__all__'} onValueChange={v => applyFilter('entityType', v === '__all__' ? '' : v)}>
                        <SelectTrigger className="h-10 text-sm bg-background/50">
                            <SelectValue placeholder="All entities" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__all__">All entities</SelectItem>
                            {ENTITY_OPTIONS.map(o => (
                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="relative">
                        <Network className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            placeholder="Filter by IP address..."
                            value={filters.ipSearch}
                            onChange={e => applyFilter('ipSearch', e.target.value)}
                            className="pl-9 h-10 bg-background/50 text-sm font-mono"
                        />
                    </div>
                </div>

                {hasActiveFilters && (
                    <div className="flex items-center justify-between pt-1 border-t border-border/40">
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <SlidersHorizontal className="h-3.5 w-3.5" />
                            {Object.values(filters).filter(v => v !== '').length} active filter(s)
                        </span>
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground" onClick={resetFilters}>
                            <X className="h-3.5 w-3.5" />
                            Clear all
                        </Button>
                    </div>
                )}
            </div>

            <DataTable
                data={initialLogs}
                columns={[
                    {
                        id: 'action',
                        header: 'Action',
                        cell: (l) => (
                            <Badge variant="outline" className={`text-[10px] font-mono uppercase tracking-wider whitespace-nowrap ${actionColor(l.action)}`}>
                                {l.action}
                            </Badge>
                        ),
                    },
                    {
                        id: 'entity',
                        header: 'Entity',
                        cell: (l) => (
                            <div>
                                <p className="text-xs font-semibold capitalize">{l.entity_type}</p>
                                {l.entity_id && (
                                    <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[130px]" title={l.entity_id}>{l.entity_id}</p>
                                )}
                            </div>
                        ),
                    },
                    {
                        id: 'actor',
                        header: 'Actor',
                        className: 'hidden md:table-cell',
                        headerClassName: 'hidden md:table-cell',
                        cell: (l) => (
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <p className="text-xs font-medium truncate max-w-[110px]">{l.user_name}</p>
                                </div>
                                {l.user_email && (
                                    <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">{l.user_email}</p>
                                )}
                            </div>
                        ),
                    },
                    {
                        id: 'changes',
                        header: 'Changes',
                        className: 'hidden lg:table-cell',
                        headerClassName: 'hidden lg:table-cell',
                        cell: (l) => {
                            const hasOld = l.old_data && Object.keys(l.old_data).length > 0
                            const hasNew = l.new_data && Object.keys(l.new_data).length > 0
                            const changedFields = hasNew ? Object.keys(l.new_data).length : 0
                            if (!hasOld && !hasNew) return <span className="text-xs text-muted-foreground">—</span>
                            return (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1">
                                        {hasOld && <span className="text-[10px] text-red-500 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded px-1.5 py-0.5 font-mono">old</span>}
                                        {hasOld && hasNew && <ArrowLeftRight className="h-2.5 w-2.5 text-muted-foreground shrink-0" />}
                                        {hasNew && <span className="text-[10px] text-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded px-1.5 py-0.5 font-mono">new</span>}
                                    </div>
                                    {changedFields > 0 && (
                                        <p className="text-[10px] text-muted-foreground">{changedFields} field{changedFields > 1 ? 's' : ''}</p>
                                    )}
                                </div>
                            )
                        }
                    },
                    {
                        id: 'context',
                        header: 'Context',
                        className: 'hidden xl:table-cell',
                        headerClassName: 'hidden xl:table-cell',
                        cell: (l) => {
                            const meta = l.metadata
                            if (!meta || Object.keys(meta).length === 0) return <span className="text-xs text-muted-foreground">—</span>
                            const isLoginEvent = l.action?.toUpperCase().includes('LOGIN')
                            if (isLoginEvent && (meta.browser || meta.os)) {
                                return (
                                    <div className="flex items-start gap-1.5">
                                        <MonitorSmartphone className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-xs font-medium">{meta.browser || '—'}</p>
                                            <p className="text-[10px] text-muted-foreground">{meta.os} · {meta.deviceType}</p>
                                        </div>
                                    </div>
                                )
                            }
                            const keys = Object.keys(meta)
                            return (
                                <div className="flex items-center gap-1.5">
                                    <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    <p className="text-[10px] text-muted-foreground">{keys.length} key{keys.length > 1 ? 's' : ''}</p>
                                </div>
                            )
                        }
                    },
                    {
                        id: 'ip',
                        header: 'IP Address',
                        className: 'hidden xl:table-cell',
                        headerClassName: 'hidden xl:table-cell',
                        cell: (l) => (
                            <span className="text-xs font-mono text-muted-foreground">{l.ip_address || '—'}</span>
                        ),
                    },
                    {
                        id: 'date',
                        header: 'Date',
                        cell: (l) => <DateCell date={l.created_at} />,
                    },
                    {
                        id: 'view',
                        header: '',
                        className: 'w-12',
                        headerClassName: 'w-12',
                        cell: (l) => (
                            <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                                <ViewButton onClick={() => setSelectedLog(l)} title="View details" />
                            </div>
                        )
                    }
                ]}
                keyExtractor={(l) => l.id}
                onRowClick={(l) => setSelectedLog(l)}
                enableSelection={false}
                enableExport={false}
                emptyState={{ title: 'No audit logs found.', description: 'Try adjusting your filters.' }}
                serverSide={true}
                totalItems={totalCount}
                currentPage={currentPage}
                pageSize={20}
                onPageChange={handlePageChange}
                isLoading={isPending}
            />

            <LogDetailsModal
                log={selectedLog}
                open={!!selectedLog}
                onOpenChange={(open) => !open && setSelectedLog(null)}
            />
        </>
    )
}
