'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadialBarChart, RadialBar,
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts'
import { FileText, TrendingUp, Clock, CheckCircle2, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { DateCell } from '@/components/ui/date-cell'
import type { Period } from '@/app/[locale]/(dashboard)/dashboard/page'



const STATUS_COLORS: Record<string, string> = {
    reviewed: '#f59e0b',
    archived: '#6b7280',
    pending: '#f59e0b',
    new: '#3b82f6',
    in_progress: '#8b5cf6',
    resolved: '#10b981',
    closed: '#10b981',
    completed: '#10b981',
    rejected: '#ef4444',
}

const PALETTE = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#f43f5e', '#a855f7']



function AnimatedNumber({ value }: { value: number }) {
    const [display, setDisplay] = useState(0)
    const rafRef = useRef<number>()
    useEffect(() => {
        const start = 0
        const end = value
        const duration = 800
        const startTime = performance.now()
        const step = (now: number) => {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3) // cubic ease-out
            setDisplay(Math.round(start + (end - start) * eased))
            if (progress < 1) rafRef.current = requestAnimationFrame(step)
        }
        rafRef.current = requestAnimationFrame(step)
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
    }, [value])
    return <>{display.toLocaleString()}</>
}

interface Props {
    period: Period
    locale: string
    isAdmin: boolean
    stats: {
        totalAllTime: number
        totalInPeriod: number
        pendingCount: number
        resolvedInPeriod: number
    }
    timeSeries: { date: string; submissions: number }[]
    byStatus: Record<string, number>
    byCategory: Record<string, number>
    byIndustry: Record<string, number>

    recentSubmissions: any[]
    userTimeSeries?: { date: string; count: number }[]
}

const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
        pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400',
        new: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400',
        'in-progress': 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400',
        in_progress: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400',
        resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400',
        completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400',
        closed: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400',
        rejected: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400',
    }
    return colors[status] ?? 'bg-slate-50 text-slate-600 border-slate-200'
}

const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
        low: 'bg-slate-50 text-slate-600 border-slate-200',
        medium: 'bg-blue-50 text-blue-700 border-blue-200',
        high: 'bg-amber-50 text-amber-700 border-amber-200',
        urgent: 'bg-red-50 text-red-700 border-red-200 font-semibold',
    }
    return colors[priority] ?? 'bg-slate-50 text-slate-600'
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-background/95 backdrop-blur border border-border/60 rounded-xl shadow-xl px-4 py-3">
            <p className="text-xs font-semibold text-muted-foreground mb-1">{label}</p>
            {payload.map((p: any, i: number) => (
                <p key={i} className="text-sm font-bold" style={{ color: p.color ?? p.fill }}>
                    {p.name}: <span>{p.value}</span>
                </p>
            ))}
        </div>
    )
}

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.07, ease: [0.25, 0.46, 0.45, 0.94] as const } }),
}

export function DashboardView({ period, locale, isAdmin, stats, timeSeries, byStatus, byCategory, byIndustry, recentSubmissions, userTimeSeries }: Props) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const statCards = [
        {
            title: 'Total Submissions',
            value: stats.totalAllTime,
            sub: `+${stats.totalInPeriod} this period`,
            icon: FileText,
            color: 'from-blue-500 to-blue-600',
            up: stats.totalInPeriod > 0,
        },
        {
            title: 'New This Period',
            value: stats.totalInPeriod,
            sub: 'All incoming leads',
            icon: TrendingUp,
            color: 'from-violet-500 to-violet-600',
            up: true,
        },
        {
            title: 'Pending Review',
            value: stats.pendingCount,
            sub: 'Waiting on action',
            icon: Clock,
            color: 'from-amber-500 to-amber-600',
            up: stats.pendingCount === 0,
        },
        {
            title: 'Resolved',
            value: stats.resolvedInPeriod,
            sub: 'Completed this period',
            icon: CheckCircle2,
            color: 'from-emerald-500 to-emerald-600',
            up: true,
        },
    ]

    const statusData = Object.entries(byStatus).map(([name, value]) => ({ name: name.replace('_', ' '), value, fill: STATUS_COLORS[name] ?? '#6b7280' }))
    const categoryData = Object.entries(byCategory).map(([name, value]) => ({ name, value }))
    const industryData = Object.entries(byIndustry).map(([name, value]) => ({ name, value }))


    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, i) => (
                    <motion.div key={card.title} custom={i} variants={fadeUp} initial="hidden" animate="show">
                        <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color}`} />
                            <CardContent className="pt-5 pb-4 px-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-sm`}>
                                        <card.icon className="h-5 w-5 text-white" />
                                    </div>
                                    <span className={`flex items-center gap-1 text-[11px] font-semibold ${card.up ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                        {card.up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                                    </span>
                                </div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">{card.title}</p>
                                <p className="text-3xl font-bold tracking-tight"><AnimatedNumber value={card.value} /></p>
                                <p className="text-[11px] text-muted-foreground mt-1">{card.sub}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show">
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Submissions Over Time</CardTitle>
                        <CardDescription className="text-xs">Daily submission volume for the selected period</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={230}>
                            <AreaChart data={timeSeries} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                                <defs>
                                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="submissions" name="Submissions" stroke="#3b82f6" strokeWidth={2} fill="url(#areaGrad)" dot={false} activeDot={{ r: 5, fill: '#3b82f6' }} isAnimationActive animationDuration={900} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </motion.div>

            {userTimeSeries && (
                <motion.div custom={4.5} variants={fadeUp} initial="hidden" animate="show">
                    <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base text-violet-600 dark:text-violet-400">Registered Users Over Time</CardTitle>
                            <CardDescription className="text-xs">New user registrations for the selected period</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={userTimeSeries} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                                    <defs>
                                        <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
                                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                                    <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="count" name="Registered Users" stroke="#8b5cf6" strokeWidth={2} fill="url(#userGrad)" dot={false} activeDot={{ r: 5, fill: '#8b5cf6' }} isAnimationActive animationDuration={1000} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <motion.div custom={5} variants={fadeUp} initial="hidden" animate="show">
                    <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-sm h-full">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">By AI Category</CardTitle>
                            <CardDescription className="text-xs">How submissions are categorized by AI</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {categoryData.length === 0 ? (
                                <div className="h-[220px] flex flex-col items-center justify-center text-muted-foreground gap-2">
                                    <FileText className="h-8 w-8 opacity-30" />
                                    <p className="text-sm">No data in this period</p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={categoryData} margin={{ top: 0, right: 8, bottom: 30, left: -20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} vertical={false} />
                                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" />
                                        <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="value" name="Count" radius={[5, 5, 0, 0]} isAnimationActive animationDuration={800}>
                                            {categoryData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div custom={6} variants={fadeUp} initial="hidden" animate="show">
                    <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-sm h-full">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">By Status</CardTitle>
                            <CardDescription className="text-xs">Distribution across submission statuses</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {statusData.length === 0 ? (
                                <div className="h-[220px] flex flex-col items-center justify-center text-muted-foreground gap-2">
                                    <FileText className="h-8 w-8 opacity-30" />
                                    <p className="text-sm">No data in this period</p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" isAnimationActive animationDuration={900}>
                                            {statusData.map((entry, i) => <Cell key={i} fill={entry.fill} strokeWidth={0} />)}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-[11px] text-muted-foreground capitalize">{v}</span>} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <motion.div custom={7} variants={fadeUp} initial="hidden" animate="show">
                    <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-sm h-full">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">By Industry</CardTitle>
                            <CardDescription className="text-xs">Sector breakdown of submissions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {industryData.length === 0 ? (
                                <div className="h-[220px] flex flex-col items-center justify-center text-muted-foreground gap-2">
                                    <FileText className="h-8 w-8 opacity-30" />
                                    <p className="text-sm">No data in this period</p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie data={industryData} cx="50%" cy="50%" outerRadius={90} paddingAngle={2} dataKey="value" nameKey="name" isAnimationActive animationDuration={900}
                                            label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                            {industryData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} strokeWidth={0} />)}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend iconType="square" iconSize={8} formatter={(v) => <span className="text-[11px] text-muted-foreground">{v}</span>} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div custom={8} variants={fadeUp} initial="hidden" animate="show">
                    <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-sm h-full max-h-[352px] overflow-hidden">
                        <CardHeader className="py-2.5 px-4 border-b border-border/50 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-bold">Recent Submissions</CardTitle>
                                <CardDescription className="text-[10px] mt-0.5">The latest incoming leads</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2" onClick={() => router.push(`/${locale}/submissions`)}>
                                View All
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0 overflow-y-auto max-h-[300px]">
                            {!recentSubmissions || recentSubmissions.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground text-xs">
                                    <FileText className="h-6 w-6 mx-auto mb-2 opacity-30" />
                                    No submissions yet.
                                </div>
                            ) : (
                                <div className="divide-y divide-border/50">
                                    {recentSubmissions.map((sub, i) => (
                                        <motion.div
                                            key={sub.id}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.04, duration: 0.3 }}
                                            className="flex items-start justify-between gap-3 px-4 py-3 hover:bg-muted/40 transition-colors cursor-pointer"
                                            onClick={() => router.push(`/${locale}/submissions?id=${sub.id}`)}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="font-semibold text-xs truncate max-w-[120px]">{sub.name}</span>
                                                    {sub.industry && <Badge variant="secondary" className="text-[9px] rounded-md px-1 py-0 h-3.5">{sub.industry}</Badge>}
                                                </div>
                                                <div className="mt-1">
                                                    <DateCell date={sub.created_at} className="text-[10px] p-0" showDistance />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[9px] capitalize ${getStatusColor(sub.status)}`}>
                                                    {sub.status?.split('_').join(' ')}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}
