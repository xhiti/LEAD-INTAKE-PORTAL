"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
    date?: Date
    setDate: (date?: Date) => void
    placeholder?: string
    className?: string
}

export function DatePicker({
    date,
    setDate,
    placeholder = "Select date",
    className,
}: DatePickerProps) {
    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "h-10 w-full justify-between text-left font-normal bg-background/50 border-input hover:bg-accent hover:text-accent-foreground transition-all px-3",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <span className="truncate">
                            {date ? format(date, "d MMM yyyy") : placeholder}
                        </span>
                        <div className="flex items-center gap-1.5 ml-2">
                            {date && (
                                <div
                                    role="button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setDate(undefined)
                                    }}
                                    className="rounded-full hover:bg-muted p-0.5 transition-colors group/clear"
                                >
                                    <X className="h-3.5 w-3.5 text-muted-foreground group-hover/clear:text-foreground" />
                                </div>
                            )}
                            <CalendarIcon className="h-4 w-4 text-muted-foreground opacity-70" />
                        </div>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-none shadow-2xl" align="start">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
