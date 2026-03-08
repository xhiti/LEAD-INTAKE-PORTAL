'use client'

import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import {
    Mail, Building2, Sparkles, ExternalLink,
    CalendarDays
} from 'lucide-react'

export interface SubmissionDetail {
    id: string
    name: string
    business_name: string
    email: string
    status: string
    industry: string
    priority: string
    ai_category: string | null
    ai_summary: string | null
    help_request: string
    created_at: string
}

interface Props {
    submission: SubmissionDetail | null
    locale: string
    onClose: () => void
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

export function SubmissionDrawer({ submission, locale, onClose }: Props) {
    const router = useRouter()

    return (
        <Sheet open={!!submission} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="w-[420px] max-w-full p-0 flex flex-col">
                {submission && (
                    <>
                        <div className="flex-1 overflow-y-auto">
                            <div className={cn('p-6 border-b', getStatusColor(submission.status))}>
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-lg leading-tight">{submission.name}</p>
                                        <p className="text-sm text-muted-foreground mt-0.5">{submission.business_name}</p>
                                    </div>
                                    <Badge variant="outline" className={cn('text-[11px] font-bold border shrink-0', getStatusColor(submission.status))}>
                                        <span className={cn('h-1.5 w-1.5 rounded-full mr-1.5 inline-block', getStatusDot(submission.status))} />
                                        {submission.status.replace('_', ' ').toUpperCase()}
                                    </Badge>
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                    <CalendarDays className="inline h-3 w-3 mr-1" />
                                    Submitted {format(parseISO(submission.created_at), "EEEE, MMMM do, yyyy 'at' h:mm a")}
                                </p>
                            </div>

                            <div className="p-6 space-y-5">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 bg-muted/30 rounded-xl px-4 py-3">
                                        <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Email</p>
                                            <p className="text-sm font-medium truncate">{submission.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-muted/30 rounded-xl px-4 py-3">
                                        <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Industry</p>
                                            <p className="text-sm font-medium">{submission.industry}</p>
                                        </div>
                                    </div>
                                    {submission.ai_category && (
                                        <div className="flex items-center gap-3 bg-muted/30 rounded-xl px-4 py-3">
                                            <Sparkles className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">AI Category</p>
                                                <p className="text-sm font-medium">{submission.ai_category}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {submission.help_request && (
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">Request</p>
                                        <div className="bg-muted/30 rounded-xl px-4 py-3 border-l-2 border-primary/40">
                                            <p className="text-sm leading-relaxed">{submission.help_request}</p>
                                        </div>
                                    </div>
                                )}

                                {submission.ai_summary && (
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">AI Summary</p>
                                        <div className="bg-muted/30 rounded-xl px-4 py-3 border-l-2 border-emerald-500/40">
                                            <p className="text-sm leading-relaxed text-muted-foreground italic">{submission.ai_summary}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="shrink-0 p-4 border-t bg-background">
                            <Button
                                variant="secondary"
                                onClick={() => router.push(`/${locale}/submissions/${submission.id}`)}
                                className="w-full gap-2"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Open Full Details
                            </Button>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    )
}
