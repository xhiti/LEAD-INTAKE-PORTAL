"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    const [month, setMonth] = React.useState<Date>(props.month || props.defaultMonth || new Date())
    const [direction, setDirection] = React.useState(0)

    const handleMonthChange = (newMonth: Date) => {
        setDirection(newMonth > month ? 1 : -1)
        setMonth(newMonth)
        props.onMonthChange?.(newMonth)
    }

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 20 : -20,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            x: direction > 0 ? -20 : 20,
            opacity: 0,
        }),
    }

    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-0", className)}
            month={month}
            onMonthChange={handleMonthChange}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 p-1",
                month: "space-y-4 min-w-[280px] flex flex-col",
                month_caption: "hidden",
                nav: "hidden",
                month_grid: "w-full border-collapse space-y-1",
                weekdays: "flex",
                weekday:
                    "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                week: "flex w-full mt-2",
                day: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day_button: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-9 w-9 p-0 font-normal aria-selected:opacity-100 transition-all hover:scale-110 active:scale-95"
                ),
                range_end: "day-range-end",
                selected:
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-bold shadow-lg shadow-primary/30",
                today: "bg-accent text-accent-foreground ring-1 ring-primary/20",
                outside:
                    "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                disabled: "text-muted-foreground opacity-50",
                range_middle:
                    "aria-selected:bg-accent aria-selected:text-accent-foreground",
                hidden: "invisible",
                ...classNames,
            }}
            components={{
                Chevron: ({ ...props }) => props.orientation === "left" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />,
                Month: ({ className, children, ...props }) => {
                    const displayMonth = props.calendarMonth.date;
                    const monthName = format(displayMonth, "MMMM yyyy");

                    return (
                        <div className={cn("space-y-4 min-w-[260px]", className)}>
                            <div className="flex items-center justify-between h-10 mb-2 px-0">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 opacity-60 hover:opacity-100 hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleMonthChange(new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1, 1));
                                    }}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                <span className="text-base font-bold tracking-tight text-primary px-2 flex-1 text-center">
                                    {monthName}
                                </span>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 opacity-60 hover:opacity-100 hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleMonthChange(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1));
                                    }}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>

                            <AnimatePresence mode="popLayout" custom={direction} initial={false}>
                                <motion.div
                                    key={displayMonth.toISOString()}
                                    custom={direction}
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{
                                        x: { type: "spring", stiffness: 300, damping: 32 },
                                        opacity: { duration: 0.2 },
                                    }}
                                    className="w-full"
                                >
                                    {children}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    );
                },
            }}
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }
