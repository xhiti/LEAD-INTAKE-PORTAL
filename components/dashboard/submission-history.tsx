'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, MessageSquare, ArrowRight, AlertCircle, Clock, Inbox, Eye, Loader2, XCircle, Archive, type LucideIcon } from 'lucide-react'
import { formatDate, getStatusColor, getPriorityColor, cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'

interface HistoryItem {
    id: string
    old_status: string | null
    new_status: string | null
    old_priority: string | null
    new_priority: string | null
    note: string | null
    created_at: string
    profiles: {
        name: string
        surname: string
        role: string
    } | null
}

interface Props {
    history: HistoryItem[]
}

export function SubmissionHistory({ history }: Props) {
    const t = useTranslations('submissions')

    if (history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Clock className="h-8 w-8 mb-3 opacity-20" />
                <p className="text-xs tracking-widest opacity-40">{t('noHistory')}</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-primary/30 before:via-border/20 before:to-transparent">
            {history.map((item, index) => {
                const isStatusChange = !!item.new_status
                const isPriorityChange = !!item.new_priority

                type DotMeta = { icon: React.ReactElement; ring: string; bg: string }
                const statusDot: Record<string, DotMeta> = {
                    new: { icon: <Inbox className="h-4 w-4" />, ring: 'ring-sky-500/10 border-sky-400/40', bg: 'bg-sky-500/10 text-sky-500' },
                    reviewed: { icon: <Eye className="h-4 w-4" />, ring: 'ring-violet-500/10 border-violet-400/40', bg: 'bg-violet-500/10 text-violet-500' },
                    in_progress: { icon: <Loader2 className="h-4 w-4" />, ring: 'ring-amber-500/10 border-amber-400/40', bg: 'bg-amber-500/10 text-amber-500' },
                    closed: { icon: <CheckCircle2 className="h-4 w-4" />, ring: 'ring-emerald-500/10 border-emerald-400/40', bg: 'bg-emerald-500/10 text-emerald-500' },
                    archived: { icon: <Archive className="h-4 w-4" />, ring: 'ring-slate-500/10 border-slate-400/40', bg: 'bg-slate-500/10 text-slate-400' },
                }
                const dot = isStatusChange
                    ? (statusDot[item.new_status!] ?? { icon: <CheckCircle2 className="h-4 w-4" />, ring: 'ring-primary/10 border-primary/30', bg: 'bg-primary/10 text-primary' })
                    : { icon: <MessageSquare className="h-4 w-4" />, ring: 'border-border', bg: 'bg-muted/30 text-muted-foreground/70' }

                return (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05, duration: 0.4 }}
                        className="relative pl-12 group"
                    >
                        <div className={cn(
                            "absolute left-0 top-0.5 h-[34px] w-[34px] rounded-full border bg-background flex items-center justify-center z-10 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-105",
                            `ring-4 ${dot.ring}`
                        )}>
                            <span className={cn('flex items-center justify-center', dot.bg, 'rounded-full h-full w-full')}>
                                {dot.icon}
                            </span>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-foreground/90 leading-tight">
                                        {item.profiles ? `${item.profiles.name} ${item.profiles.surname}` : t('systemUser')}
                                    </span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-tighter px-1.5 py-0 h-4 bg-primary/5 border-primary/10 text-primary/70">
                                            {item.profiles?.role || 'SYSTEM'}
                                        </Badge>
                                        <span className="text-[10px] text-muted-foreground/60 font-medium">
                                            {formatDate(item.created_at)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-1 shrink-0">
                                    {isStatusChange && (
                                        <div className="flex items-center gap-1.5">
                                            <span className={cn("text-[11px] font-semibold text-muted-foreground/60")}>
                                                {t(`status.${item.old_status}`)}
                                            </span>
                                            <ArrowRight className="h-3 w-3 text-muted-foreground/40" />
                                            <Badge variant="outline" className={cn("text-[11px] font-bold border", getStatusColor(item.new_status!))}>
                                                {t(`status.${item.new_status}`)}
                                            </Badge>
                                        </div>
                                    )}
                                    {isPriorityChange && (
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[11px] font-semibold text-muted-foreground/60">
                                                {t(`priority.${item.old_priority}`)}
                                            </span>
                                            <ArrowRight className="h-3 w-3 text-muted-foreground/40" />
                                            <Badge variant="outline" className={cn("text-[11px] font-bold border", getPriorityColor(item.new_priority!))}>
                                                {t(`priority.${item.new_priority}`)}
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {item.note && (
                                <div className="relative pl-4 py-0.5">
                                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary/20 rounded-full" />
                                    <p className="text-[13px] leading-relaxed text-foreground/70 whitespace-pre-wrap">
                                        {item.note}
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )
            })}
        </div>
    )
}
