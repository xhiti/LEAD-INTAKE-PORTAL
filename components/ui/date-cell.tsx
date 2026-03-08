import { formatDate, formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface DateCellProps {
    date: string | Date | null
    className?: string
    showDistance?: boolean
    variant?: "default" | "destructive" | "outline"
}

export function DateCell({
    date,
    className,
    variant = "default",
    showDistance = true
}: DateCellProps) {
    const dateObj = typeof date === 'string' ? new Date(date) : date

    return (
        <div className={cn("flex flex-col gap-0.5", className)}>
            <span className={cn(
                "text-xs font-bold tracking-tight",
                variant === "destructive" ? "text-red-500" : "text-foreground"
            )}>
                {dateObj ? formatDate(dateObj, 'dd MMM yyyy | HH:mm') : "-"}
            </span>
            {showDistance && (
                <span className={cn(
                    "text-[10px] tracking-tight leading-none font-medium text-nowrap",
                    variant === "destructive" ? "text-red-400/80" : "text-muted-foreground"
                )}>
                    {dateObj ? formatDistanceToNow(dateObj, { addSuffix: true }) : "-"}
                </span>
            )}
        </div>
    )
}
