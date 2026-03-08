'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

interface LogDetailsModalProps {
    log: any | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function LogDetailsModal({ log, open, onOpenChange }: LogDetailsModalProps) {
    if (!log) return null

    const actionColor = (action: string) => {
        if (action.includes('CREATE') || action.includes('create')) return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/10 dark:text-emerald-400'
        if (action.includes('UPDATE') || action.includes('update')) return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/10 dark:text-blue-400'
        if (action.includes('DELETE') || action.includes('delete')) return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/10 dark:text-red-400'
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/10 dark:text-slate-400'
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-card/95 backdrop-blur-xl border-border/50">
                <DialogHeader className="px-6 py-5 border-b border-border/50 shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl">Audit Log Details</DialogTitle>
                            <DialogDescription className="mt-1 flex items-center gap-2">
                                <span className="text-muted-foreground">{log.id}</span>
                                <Badge variant="outline" className={`text-xs font-mono uppercase ${actionColor(log.action)}`}>
                                    {log.action}
                                </Badge>
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6">
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b border-border/40">
                            <div>
                                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Entity</p>
                                <p className="text-sm font-medium">{log.entity_type}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{log.entity_id || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Actor</p>
                                <p className="text-sm font-medium">{log.user_name}</p>
                                <p className="text-xs text-muted-foreground capitalize mt-0.5">{log.user_role}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">IP Address</p>
                                <p className="text-sm font-medium font-mono">{log.ip_address || 'Unknown'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Date</p>
                                <p className="text-sm font-medium">
                                    {new Date(log.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <p className="text-sm font-semibold flex items-center">
                                    <span className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                                    Old Data
                                </p>
                                <div className="bg-slate-950 rounded-lg p-4 overflow-x-auto border border-border/50">
                                    <pre className="text-xs font-mono text-red-400">
                                        {log.old_data ? JSON.stringify(log.old_data, null, 2) : 'null'}
                                    </pre>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-semibold flex items-center">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                                    New Data
                                </p>
                                <div className="bg-slate-950 rounded-lg p-4 overflow-x-auto border border-border/50">
                                    <pre className="text-xs font-mono text-emerald-400">
                                        {log.new_data ? JSON.stringify(log.new_data, null, 2) : 'null'}
                                    </pre>
                                </div>
                            </div>
                        </div>

                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <div className="space-y-2 pt-4">
                                <p className="text-sm font-semibold">Metadata / Request Context</p>
                                <div className="bg-muted/50 rounded-lg p-4 overflow-x-auto border border-border/50">
                                    <pre className="text-xs font-mono text-foreground/80">
                                        {JSON.stringify(log.metadata, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {log.user_agent && (
                            <div className="space-y-1 pt-2">
                                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">User Agent</p>
                                <p className="text-[11px] font-mono text-muted-foreground break-all">{log.user_agent}</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
