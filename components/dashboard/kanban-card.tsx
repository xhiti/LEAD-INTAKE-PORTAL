'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { SubmissionDetail } from './submission-drawer'

const PRIORITY_THEMES: Record<string, {
    dot: string,
    bg: string,
    text: string
}> = {
    urgent: { dot: 'bg-red-500', bg: 'bg-red-500/10', text: 'text-red-600' },
    high: { dot: 'bg-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-600' },
    medium: { dot: 'bg-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-600' },
    low: { dot: 'bg-slate-400', bg: 'bg-slate-400/10', text: 'text-slate-500' },
}

interface Props {
    submission: SubmissionDetail
    locale: string
    onClick: (submission: SubmissionDetail) => void
}

export function KanbanCard({ submission, locale, onClick }: Props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: submission.id,
        data: {
            type: 'Submission',
            submission,
        },
    })

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    }

    const priority = PRIORITY_THEMES[submission.priority?.toLowerCase()] || PRIORITY_THEMES.medium

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group relative select-none touch-none",
                isDragging && "opacity-30 scale-[1.02] z-50 px-1"
            )}
        >
            <Card
                onClick={() => onClick(submission)}
                {...attributes}
                {...listeners}
                className="relative overflow-hidden border-border/40 bg-card hover:border-primary/40 hover:shadow-md active:scale-[0.98] active:shadow-sm transition-all duration-200 cursor-grab active:cursor-grabbing rounded-lg"
            >
                <CardContent className="p-3 pt-3.5 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-[13px] leading-tight tracking-tight text-foreground truncate flex-1">
                            {submission.name}
                        </h4>
                        <div className={cn("h-1.5 w-1.5 rounded-full shrink-0 shadow-sm", priority.dot)} />
                    </div>

                    <div className="space-y-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 truncate leading-none">
                            {submission.business_name}
                        </p>

                        {submission.ai_summary && (
                            <p className="text-[11px] font-medium leading-normal text-muted-foreground/80 line-clamp-1 italic border-l-2 border-primary/20 pl-2">
                                {submission.ai_summary}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-0.5 pointer-events-none">
                        <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className={cn("text-[8px] px-1 h-4 font-black uppercase tracking-tighter border-none", priority.bg, priority.text)}>
                                {submission.priority}
                            </Badge>
                            {submission.ai_category && (
                                <Badge variant="secondary" className="text-[8px] px-1 h-4 font-bold uppercase tracking-tighter bg-primary/5 text-primary border-none">
                                    {submission.ai_category}
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground/40 shrink-0">
                            <Clock className="h-2.5 w-2.5 opacity-60" />
                            {format(parseISO(submission.created_at), "MMM d")}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
