'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { KanbanCard } from './kanban-card'
import { cn } from '@/lib/utils'
import { SubmissionDetail } from './submission-drawer'

interface Props {
    id: string
    title: string
    submissions: SubmissionDetail[]
    locale: string
    onCardClick: (submission: SubmissionDetail) => void
}

const STATUS_INDICATORS: Record<string, string> = {
    new: 'bg-blue-500 shadow-blue-500/40',
    reviewed: 'bg-purple-500 shadow-purple-500/40',
    in_progress: 'bg-amber-500 shadow-amber-500/40',
    closed: 'bg-emerald-500 shadow-emerald-500/40',
    archived: 'bg-slate-400 shadow-slate-400/40',
}

const STATUS_BORDER: Record<string, string> = {
    new: 'border-blue-500/20',
    reviewed: 'border-purple-500/20',
    in_progress: 'border-amber-500/20',
    closed: 'border-emerald-500/20',
    archived: 'border-slate-400/20',
}

export function KanbanColumn({ id, title, submissions, locale, onCardClick }: Props) {
    const { setNodeRef, isOver } = useDroppable({
        id,
    })

    const statusDot = STATUS_INDICATORS[id] || STATUS_INDICATORS.archived
    const statusBorder = STATUS_BORDER[id] || STATUS_BORDER.archived

    return (
        <div className="flex flex-col w-[290px] shrink-0">
            <div className={cn(
                "flex items-center justify-between px-3 py-2 mb-2 rounded-lg border bg-muted/20 backdrop-blur-sm",
                statusBorder
            )}>
                <div className="flex items-center gap-2.5">
                    <div className={cn("h-2 w-2 rounded-full shadow-[0_0_8px]", statusDot)} />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.12em] text-foreground/80">
                        {title}
                    </h3>
                </div>
                <span className="flex items-center justify-center min-w-[20px] h-[18px] px-1.5 text-[9px] font-black bg-background border border-border/40 text-muted-foreground/60 rounded-md">
                    {submissions.length}
                </span>
            </div>

            <div
                ref={setNodeRef}
                className={cn(
                    "flex-1 flex flex-col gap-2.5 p-1 rounded-b-xl transition-all duration-300 border border-transparent",
                    isOver && "bg-muted/30 border-dashed border-border/40"
                )}
            >
                <SortableContext items={submissions.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    {submissions.map((submission) => (
                        <KanbanCard
                            key={submission.id}
                            submission={submission}
                            locale={locale}
                            onClick={onCardClick}
                        />
                    ))}
                </SortableContext>

                {submissions.length === 0 && (
                    <div className="h-20 flex items-center justify-center border border-dashed border-border/20 rounded-xl opacity-20">
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Drop here</span>
                    </div>
                )}
            </div>
        </div>
    )
}
