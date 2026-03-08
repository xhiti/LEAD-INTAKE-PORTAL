'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    eachHourOfInterval,
    startOfDay,
    endOfDay,
    parseISO,
} from 'date-fns'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
    ChevronRight, Clock, Mail, Building2, Sparkles,
    ExternalLink, User, CalendarDays
} from 'lucide-react'
import { SubmissionDrawer, type SubmissionDetail } from './submission-drawer'

export type CalendarEvent = SubmissionDetail

interface ViewProps {
    date: Date
    events: CalendarEvent[]
}

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'new': return 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400'
        case 'reviewed': return 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400'
        case 'in_progress': return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:text-indigo-400'
        case 'closed': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400'
        case 'archived': return 'bg-muted text-muted-foreground border-border'
        default: return 'bg-muted text-muted-foreground border-border'
    }
}

const getStatusDot = (status: string) => {
    switch (status.toLowerCase()) {
        case 'new': return 'bg-blue-500'
        case 'reviewed': return 'bg-amber-500'
        case 'in_progress': return 'bg-indigo-500'
        case 'closed': return 'bg-emerald-500'
        case 'archived': return 'bg-muted-foreground'
        default: return 'bg-muted-foreground'
    }
}

function EventCard({
    event,
    compact = false,
    onSelect,
}: {
    event: CalendarEvent
    compact?: boolean
    onSelect: (e: CalendarEvent) => void
}) {
    if (compact) {
        return (
            <TooltipProvider delayDuration={200}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={() => onSelect(event)}
                            className={cn(
                                'w-full text-left px-2 py-1 rounded text-[10px] font-bold truncate border shadow-sm cursor-pointer transition-all hover:translate-x-0.5',
                                getStatusColor(event.status)
                            )}
                        >
                            <span className="mr-1">{format(parseISO(event.created_at), 'HH:mm')}</span>
                            {event.name} – {event.business_name}
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="p-3 max-w-[220px] bg-card border shadow-xl">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className={cn('h-2 w-2 rounded-full', getStatusDot(event.status))} />
                                <Badge variant="outline" className={cn('text-[9px] h-4', getStatusColor(event.status))}>
                                    {event.status.replace('_', ' ').toUpperCase()}
                                </Badge>
                            </div>
                            <p className="font-bold text-xs">{event.name}</p>
                            <p className="text-[10px] text-muted-foreground">{event.business_name}</p>
                            <div className="flex items-center gap-1 pt-1 text-[9px] font-medium text-muted-foreground border-t">
                                <Clock className="h-3 w-3" /> {format(parseISO(event.created_at), 'h:mm a')}
                            </div>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }

    return (
        <button
            onClick={() => onSelect(event)}
            className={cn(
                'w-full text-left rounded-xl border p-5 shadow-sm transition-all hover:shadow-md group relative overflow-hidden',
                getStatusColor(event.status)
            )}
        >
            <div className="flex items-start justify-between relative z-10">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-0.5', getStatusColor(event.status))}>
                            {event.status.replace('_', ' ')}
                        </Badge>
                    </div>
                    <div>
                        <h4 className="font-bold text-base group-hover:text-primary transition-colors">{event.name}</h4>
                        <p className="text-xs font-semibold opacity-60 mt-0.5">{event.business_name}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium">
                        <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" /> {format(parseISO(event.created_at), 'h:mm a')}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5" /> {event.industry}
                        </span>
                    </div>
                </div>
                <div className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ChevronRight className="h-4 w-4" />
                </div>
            </div>
            <div className={cn(
                'absolute -right-4 -bottom-4 h-24 w-24 rounded-full opacity-5 transition-transform group-hover:scale-110',
                getStatusDot(event.status)
            )} />
        </button>
    )
}

export function MonthView({ date, events, locale }: ViewProps & { locale: string }) {
    const [selected, setSelected] = useState<CalendarEvent | null>(null)
    const monthStart = startOfMonth(date)
    const calendarDays = eachDayOfInterval({
        start: startOfWeek(monthStart),
        end: endOfWeek(endOfMonth(monthStart)),
    })
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
        <>
            <div className="flex flex-col h-full bg-card">
                <div className="grid grid-cols-7 border-b bg-muted/30 shrink-0">
                    {weekDays.map((day) => (
                        <div key={day} className="p-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 flex-1 overflow-auto">
                    {calendarDays.map((day, idx) => {
                        const dayEvents = events.filter((e) => isSameDay(parseISO(e.created_at), day))
                        const isCurrentMonth = isSameMonth(day, monthStart)
                        const MAX = 3

                        return (
                            <div
                                key={day.toISOString()}
                                className={cn(
                                    'min-h-[180px] p-2 border-r border-b transition-colors group relative',
                                    !isCurrentMonth ? 'bg-muted/10' : 'bg-card hover:bg-muted/5',
                                    idx % 7 === 6 && 'border-r-0'
                                )}
                            >
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className={cn(
                                        'inline-flex items-center justify-center w-7 h-7 text-sm font-semibold rounded-full',
                                        isToday(day) ? 'bg-primary text-primary-foreground shadow-sm'
                                            : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/40'
                                    )}>
                                        {format(day, 'd')}
                                    </span>
                                    {dayEvents.length > 0 && (
                                        <span className="text-[10px] text-muted-foreground font-medium pr-1">
                                            {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    {dayEvents.slice(0, MAX).map((event) => (
                                        <EventCard key={event.id} event={event} compact onSelect={setSelected} />
                                    ))}
                                    {dayEvents.length > MAX && (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button className="text-[10px] font-bold text-primary hover:underline px-1 py-0.5 rounded w-full text-left transition-colors">
                                                    + {dayEvents.length - MAX} more
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-80 p-0 shadow-2xl border-primary/20" align="start">
                                                <div className="p-4 border-b bg-muted/30">
                                                    <h3 className="font-bold text-sm">{format(day, 'MMMM do, yyyy')}</h3>
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                                        {dayEvents.length} total events
                                                    </p>
                                                </div>
                                                <div className="p-4 space-y-2 max-h-[350px] overflow-y-auto">
                                                    {dayEvents.map((event) => (
                                                        <EventCard key={event.id} event={event} compact onSelect={(e) => { setSelected(e) }} />
                                                    ))}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            <SubmissionDrawer submission={selected} locale={locale} onClose={() => setSelected(null)} />
        </>
    )
}

export function WeekView({ date, events, locale }: ViewProps & { locale: string }) {
    const [selected, setSelected] = useState<CalendarEvent | null>(null)
    const weekDays = eachDayOfInterval({ start: startOfWeek(date), end: endOfWeek(date) })
    const hours = eachHourOfInterval({ start: startOfDay(date), end: endOfDay(date) })

    return (
        <>
            <div className="flex flex-col h-full overflow-hidden bg-card">
                <div className="grid grid-cols-[80px_1fr] border-b bg-muted/30 shrink-0">
                    <div className="border-r p-3" />
                    <div className="grid grid-cols-7">
                        {weekDays.map((day) => (
                            <div key={day.toISOString()} className="p-3 text-center border-r last:border-r-0">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{format(day, 'EEE')}</p>
                                <p className={cn(
                                    'text-lg font-bold mt-1 inline-flex items-center justify-center w-8 h-8 rounded-full',
                                    isToday(day) ? 'bg-primary text-primary-foreground' : 'text-foreground'
                                )}>
                                    {format(day, 'd')}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="grid grid-cols-[80px_1fr] relative">
                        <div className="flex flex-col border-r bg-muted/5">
                            {hours.map((hour) => (
                                <div key={hour.toISOString()} className="h-32 border-b p-2 text-right">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                                        {format(hour, 'ha')}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 relative">
                            {weekDays.map((day) => (
                                <div key={day.toISOString()} className="relative border-r last:border-r-0">
                                    {hours.map((hour) => (
                                        <div key={hour.toISOString()} className="h-32 border-b border-muted hover:bg-muted/5 transition-colors" />
                                    ))}
                                    <div className="absolute inset-x-1 top-0 space-y-1 pt-1">
                                        {events
                                            .filter((e) => isSameDay(parseISO(e.created_at), day))
                                            .map((event) => {
                                                const d = parseISO(event.created_at)
                                                const top = (d.getHours() * 128) + (d.getMinutes() / 60 * 128)
                                                return (
                                                    <button
                                                        key={event.id}
                                                        onClick={() => setSelected(event)}
                                                        className={cn(
                                                            'absolute left-1 right-1 rounded-lg border p-2 text-left cursor-pointer transition-all hover:shadow-md z-10',
                                                            getStatusColor(event.status)
                                                        )}
                                                        style={{ top: `${top}px`, minHeight: '52px' }}
                                                    >
                                                        <div className="flex items-center gap-1.5 mb-0.5">
                                                            <div className={cn('h-1.5 w-1.5 rounded-full shrink-0', getStatusDot(event.status))} />
                                                            <span className="text-[9px] font-bold uppercase tracking-widest opacity-70">
                                                                {format(d, 'h:mm a')}
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] font-bold truncate">{event.name}</p>
                                                        <p className="text-[9px] opacity-60 truncate">{event.business_name}</p>
                                                    </button>
                                                )
                                            })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </ScrollArea>
            </div>
            <SubmissionDrawer submission={selected} locale={locale} onClose={() => setSelected(null)} />
        </>
    )
}

export function DayView({ date, events, locale }: ViewProps & { locale: string }) {
    const [selected, setSelected] = useState<CalendarEvent | null>(null)
    const dayEvents = events.filter((e) => isSameDay(parseISO(e.created_at), date))
    const sorted = [...dayEvents].sort(
        (a, b) => parseISO(a.created_at).getTime() - parseISO(b.created_at).getTime()
    )

    return (
        <>
            <div className="flex flex-col h-full bg-card">
                <Tabs defaultValue="timeline" className="flex-1 flex flex-col">
                    <div className="px-6 py-4 border-b bg-muted/10 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <span className="text-lg font-bold text-primary">{format(date, 'd')}</span>
                            </div>
                            <div>
                                <h2 className="font-bold text-lg">{format(date, 'EEEE')}</h2>
                                <p className="text-xs text-muted-foreground">{format(date, 'MMMM yyyy')}</p>
                            </div>
                        </div>
                        <TabsList className="bg-muted">
                            <TabsTrigger value="timeline" className="text-xs px-4">Timeline</TabsTrigger>
                            <TabsTrigger value="list" className="text-xs px-4">List View</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="timeline" className="flex-1 m-0 p-0 overflow-auto">
                        <div className="relative p-6">
                            <div className="absolute left-[135px] top-0 bottom-0 w-[1px] bg-border" />
                            <div className="space-y-8 relative">
                                {sorted.length > 0 ? (
                                    sorted.map((event) => (
                                        <div key={event.id} className="flex gap-8 group">
                                            <div className="w-24 pt-4 text-right">
                                                <p className="text-sm font-bold">{format(parseISO(event.created_at), 'h:mm a')}</p>
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                                                    {format(parseISO(event.created_at), 'aaa')}
                                                </p>
                                            </div>
                                            <div className="relative mt-5">
                                                <div className={cn('h-3 w-3 rounded-full border-2 border-background z-10 relative', getStatusDot(event.status))} />
                                            </div>
                                            <div className="flex-1">
                                                <EventCard event={event} onSelect={setSelected} />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center">
                                        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CalendarDays className="h-8 w-8 text-muted-foreground/30" />
                                        </div>
                                        <h3 className="text-lg font-semibold">No submissions today</h3>
                                        <p className="text-sm text-muted-foreground">Switch to a different day to view events.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="list" className="flex-1 m-0 p-6 overflow-auto">
                        {sorted.length > 0 ? (
                            <div className="max-w-3xl mx-auto space-y-4">
                                {sorted.map((event) => <EventCard key={event.id} event={event} onSelect={setSelected} />)}
                            </div>
                        ) : (
                            <div className="py-20 text-center text-muted-foreground">No submissions on this day.</div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
            <SubmissionDrawer submission={selected} locale={locale} onClose={() => setSelected(null)} />
        </>
    )
}
