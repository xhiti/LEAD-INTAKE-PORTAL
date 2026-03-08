'use client'

import { useState, useMemo } from 'react'
import { Monitor, Smartphone, Tablet, Globe, Loader2, Search, ShieldOff, Network, SlidersHorizontal, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { revokeSessionAction } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import { DateCell } from '@/components/ui/date-cell'
import { DatePicker } from '@/components/ui/date-picker'
import { ViewButton } from '@/components/ui/actions'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SessionDetailsModal } from '@/components/dashboard/session-details-modal'
import type { Database } from '@/lib/supabase/database.types'

type Session = Database['public']['Tables']['auth_sessions']['Row']

type StatusFilter = 'all' | 'active' | 'ended'

function DeviceIcon({ type }: { type: string | null }) {
    if (type === 'mobile') return <Smartphone className="h-4 w-4" />
    if (type === 'tablet') return <Tablet className="h-4 w-4" />
    return <Monitor className="h-4 w-4" />
}

function providerColor(provider: string | null) {
    if (provider === 'google') return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-800'
    if (provider === 'github') return 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/10 dark:text-violet-400 dark:border-violet-800'
    return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/10 dark:text-slate-400 dark:border-slate-800'
}

function sessionDuration(loginAt: string | null, logoutAt: string | null): string | null {
    if (!loginAt || !logoutAt) return null
    const ms = new Date(logoutAt).getTime() - new Date(loginAt).getTime()
    if (ms < 0) return null
    const h = Math.floor(ms / 3600000)
    const m = Math.floor((ms % 3600000) / 60000)
    return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export function SessionsTable({ sessions: initial, userId }: { sessions: Session[], userId: string }) {
    const [sessions, setSessions] = useState(initial)
    const [revoking, setRevoking] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState<StatusFilter>('all')
    const [provider, setProvider] = useState('')
    const [deviceType, setDeviceType] = useState('')
    const [fromDate, setFromDate] = useState<Date | undefined>(undefined)
    const [toDate, setToDate] = useState<Date | undefined>(undefined)
    const [selectedSession, setSelectedSession] = useState<Session | null>(null)
    const { toast } = useToast()
    const supabase = createClient()

    async function revokeSession(id: string) {
        setRevoking(id)
        try {
            const res = await revokeSessionAction(id, userId)
            if (res.error) throw new Error(res.error)
            setSessions(prev =>
                prev.map(s => s.id === id ? { ...s, is_active: false, logged_out_at: new Date().toISOString() } : s)
            )
            toast({ title: 'Session terminated' })
        } catch (err: any) {
            toast({ title: 'Failed to terminate session', description: err.message, variant: 'destructive' })
        } finally {
            setRevoking(null)
        }
    }

    const activeCount = sessions.filter(s => s.is_active).length

    const filtered = useMemo(() => {
        let list = sessions
        if (status === 'active') list = list.filter(s => s.is_active)
        if (status === 'ended') list = list.filter(s => !s.is_active)
        if (provider) list = list.filter(s => s.provider === provider)
        if (deviceType) list = list.filter(s => s.device_type === deviceType)
        if (fromDate) list = list.filter(s => s.logged_in_at && new Date(s.logged_in_at) >= fromDate)
        if (toDate) {
            const end = new Date(toDate)
            end.setDate(end.getDate() + 1)
            list = list.filter(s => s.logged_in_at && new Date(s.logged_in_at) < end)
        }
        if (search.trim()) {
            const q = search.toLowerCase()
            list = list.filter(s =>
                s.browser?.toLowerCase().includes(q) ||
                s.os?.toLowerCase().includes(q) ||
                s.ip_address?.toLowerCase().includes(q) ||
                s.device_type?.toLowerCase().includes(q) ||
                s.provider?.toLowerCase().includes(q)
            )
        }
        return list
    }, [sessions, status, provider, deviceType, fromDate, toDate, search])

    const hasActiveFilters = search || status !== 'all' || provider || deviceType || fromDate || toDate

    const resetFilters = () => {
        setSearch('')
        setStatus('all')
        setProvider('')
        setDeviceType('')
        setFromDate(undefined)
        setToDate(undefined)
    }

    return (
        <>
            <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-4 space-y-3 mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            placeholder="Search browser, OS, IP..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-9 h-10 bg-background/50 text-sm"
                        />
                    </div>

                    <Select value={status} onValueChange={v => setStatus(v as StatusFilter)}>
                        <SelectTrigger className="h-10 text-sm bg-background/50">
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="active">
                                Active
                                {activeCount > 0 && (
                                    <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-full px-1.5 py-0.5">
                                        {activeCount}
                                    </span>
                                )}
                            </SelectItem>
                            <SelectItem value="ended">Ended</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={provider || '__all__'} onValueChange={v => setProvider(v === '__all__' ? '' : v)}>
                        <SelectTrigger className="h-10 text-sm bg-background/50">
                            <SelectValue placeholder="All providers" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__all__">All providers</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="google">Google</SelectItem>
                            <SelectItem value="github">GitHub</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={deviceType || '__all__'} onValueChange={v => setDeviceType(v === '__all__' ? '' : v)}>
                        <SelectTrigger className="h-10 text-sm bg-background/50">
                            <SelectValue placeholder="All devices" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__all__">All devices</SelectItem>
                            <SelectItem value="desktop">Desktop</SelectItem>
                            <SelectItem value="mobile">Mobile</SelectItem>
                            <SelectItem value="tablet">Tablet</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <DatePicker
                        date={fromDate}
                        setDate={setFromDate}
                        placeholder="Login from date"
                        className="w-full"
                    />
                    <DatePicker
                        date={toDate}
                        setDate={setToDate}
                        placeholder="Login to date"
                        className="w-full"
                    />
                    <div className="hidden lg:block" />
                    <div className="hidden lg:block" />
                </div>

                {hasActiveFilters && (
                    <div className="flex items-center justify-between pt-1 border-t border-border/40">
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <SlidersHorizontal className="h-3.5 w-3.5" />
                            {filtered.length} of {sessions.length} session{sessions.length !== 1 ? 's' : ''}
                        </span>
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground" onClick={resetFilters}>
                            <X className="h-3.5 w-3.5" />
                            Clear all
                        </Button>
                    </div>
                )}
            </div>

            <DataTable
                data={filtered}
                columns={[
                    {
                        id: 'device',
                        header: 'Device',
                        cell: (s) => (
                            <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                                    <DeviceIcon type={s.device_type} />
                                </div>
                                <span className="text-xs capitalize text-muted-foreground">{s.device_type ?? 'desktop'}</span>
                            </div>
                        ),
                    },
                    {
                        id: 'browser',
                        header: 'Browser / OS',
                        cell: (s) => (
                            <div>
                                <p className="text-xs font-medium">{s.browser ?? 'Unknown browser'}</p>
                                <p className="text-[10px] text-muted-foreground">{s.os ?? 'Unknown OS'}</p>
                            </div>
                        ),
                    },
                    {
                        id: 'status',
                        header: 'Status',
                        cell: (s) => s.is_active ? (
                            <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-800">
                                Active
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/10 dark:text-slate-400 dark:border-slate-700">
                                Ended
                            </Badge>
                        ),
                    },
                    {
                        id: 'provider',
                        header: 'Provider',
                        cell: (s) => (
                            <Badge variant="outline" className={`text-[10px] capitalize ${providerColor(s.provider)}`}>
                                {s.provider ?? 'email'}
                            </Badge>
                        ),
                    },
                    {
                        id: 'ip',
                        header: 'IP Address',
                        className: 'hidden md:table-cell',
                        headerClassName: 'hidden md:table-cell',
                        cell: (s) => (
                            <span className="text-xs font-mono text-muted-foreground">{s.ip_address ?? '—'}</span>
                        ),
                    },
                    {
                        id: 'logged_in',
                        header: 'Logged in',
                        className: 'hidden lg:table-cell',
                        headerClassName: 'hidden lg:table-cell',
                        cell: (s) => <DateCell date={s.logged_in_at} />,
                    },
                    {
                        id: 'logged_out',
                        header: 'Ended',
                        className: 'hidden xl:table-cell',
                        headerClassName: 'hidden xl:table-cell',
                        cell: (s) => {
                            if (!s.logged_out_at) return <span className="text-xs text-muted-foreground">—</span>
                            const dur = sessionDuration(s.logged_in_at, s.logged_out_at)
                            return (
                                <div>
                                    <DateCell date={s.logged_out_at} />
                                    {dur && <p className="text-[10px] text-muted-foreground mt-0.5">{dur} session</p>}
                                </div>
                            )
                        },
                    },
                    {
                        id: 'actions',
                        header: '',
                        className: 'text-right',
                        headerClassName: 'text-right',
                        cell: (s) => (
                            <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                                <ViewButton onClick={() => setSelectedSession(s)} title="View details" />
                                {s.is_active && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => revokeSession(s.id)}
                                        disabled={revoking === s.id}
                                        className="h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive shrink-0"
                                    >
                                        {revoking === s.id
                                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            : <><ShieldOff className="h-3.5 w-3.5" />Terminate</>
                                        }
                                    </Button>
                                )}
                            </div>
                        ),
                    },
                ]}
                keyExtractor={(s) => s.id}
                onRowClick={(s) => setSelectedSession(s)}
                enableSelection={false}
                enableExport={false}
                emptyState={{
                    icon: <Globe className="h-10 w-10 text-muted-foreground/30" />,
                    title: 'No sessions found',
                    description: search ? 'Try a different search term' : 'No login sessions recorded yet',
                }}
            />

            <SessionDetailsModal
                session={selectedSession}
                open={!!selectedSession}
                onOpenChange={(open) => !open && setSelectedSession(null)}
            />
        </>
    )
}
