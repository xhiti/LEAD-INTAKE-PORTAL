'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
} from 'lucide-react'
import {
    format,
    addMonths,
    subMonths,
    addWeeks,
    subWeeks,
    addDays,
    subDays,
} from 'date-fns'
import { Button } from '@/components/ui/button'
import { MonthView, WeekView, DayView } from './calendar-views'
import type { CalendarEvent } from './calendar-views'

export type ViewType = 'monthly' | 'weekly' | 'daily'

interface Props {
    submissions: CalendarEvent[]
    locale: string
}

export function SubmissionsCalendar({ submissions, locale }: Props) {
    const [view, setView] = useState<ViewType>('monthly')
    const [currentDate, setCurrentDate] = useState(new Date())
    const [direction, setDirection] = useState(0)

    const next = () => {
        setDirection(1)
        if (view === 'monthly') setCurrentDate(d => addMonths(d, 1))
        else if (view === 'weekly') setCurrentDate(d => addWeeks(d, 1))
        else setCurrentDate(d => addDays(d, 1))
    }

    const prev = () => {
        setDirection(-1)
        if (view === 'monthly') setCurrentDate(d => subMonths(d, 1))
        else if (view === 'weekly') setCurrentDate(d => subWeeks(d, 1))
        else setCurrentDate(d => subDays(d, 1))
    }

    const today = () => {
        setDirection(0)
        setCurrentDate(new Date())
    }

    const variants = {
        enter: (dir: number) => ({ x: dir > 0 ? 100 : dir < 0 ? -100 : 0, opacity: 0, scale: 0.97 }),
        center: { x: 0, opacity: 1, scale: 1 },
        exit: (dir: number) => ({ x: dir > 0 ? -100 : dir < 0 ? 100 : 0, opacity: 0, scale: 0.97 }),
    }

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-xl border shadow-sm shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <CalendarIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">Submissions Calendar</h1>
                        <p className="text-sm text-muted-foreground">
                            {format(currentDate, view === 'daily' ? 'EEEE, MMMM do, yyyy' : 'MMMM yyyy')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center bg-muted rounded-lg p-1 mr-2">
                        {(['monthly', 'weekly', 'daily'] as ViewType[]).map((v) => (
                            <Button
                                key={v}
                                variant={view === v ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setView(v)}
                                className="text-xs h-8 px-3"
                            >
                                {v === 'monthly' ? 'Month' : v === 'weekly' ? 'Week' : 'Day'}
                            </Button>
                        ))}
                    </div>

                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" onClick={prev} className="h-9 w-9">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={today} className="h-9 px-4 font-medium">
                            Today
                        </Button>
                        <Button variant="outline" size="icon" onClick={next} className="h-9 w-9">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-[900px] relative overflow-hidden bg-card rounded-xl border shadow-md">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={`${view}-${currentDate.toISOString()}`}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: 'spring', stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 },
                        }}
                        className="h-full w-full absolute inset-0"
                    >
                        {view === 'monthly' && <MonthView date={currentDate} events={submissions} locale={locale} />}
                        {view === 'weekly' && <WeekView date={currentDate} events={submissions} locale={locale} />}
                        {view === 'daily' && <DayView date={currentDate} events={submissions} locale={locale} />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}
