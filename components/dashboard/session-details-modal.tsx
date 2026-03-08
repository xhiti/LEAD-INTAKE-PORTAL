'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Monitor, Smartphone, Tablet, Globe, Clock, LogOut, Network, ShieldCheck, ShieldOff } from 'lucide-react'

interface SessionDetailsModalProps {
    session: any | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

function DeviceIcon({ type }: { type: string | null }) {
    if (type === 'mobile') return <Smartphone className="h-5 w-5" />
    if (type === 'tablet') return <Tablet className="h-5 w-5" />
    return <Monitor className="h-5 w-5" />
}

function InfoRow({ label, value, mono }: { label: string; value: string | null | undefined; mono?: boolean }) {
    return (
        <div className="flex items-start justify-between gap-4 py-2.5 border-b border-border/40 last:border-0">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider shrink-0 w-28">{label}</p>
            <p className={`text-xs text-right break-all ${mono ? 'font-mono' : 'font-medium'}`}>{value || '—'}</p>
        </div>
    )
}

export function SessionDetailsModal({ session, open, onOpenChange }: SessionDetailsModalProps) {
    if (!session) return null

    const duration = session.logged_out_at && session.logged_in_at
        ? (() => {
            const ms = new Date(session.logged_out_at).getTime() - new Date(session.logged_in_at).getTime()
            const h = Math.floor(ms / 3600000)
            const m = Math.floor((ms % 3600000) / 60000)
            return h > 0 ? `${h}h ${m}m` : `${m}m`
        })()
        : null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg flex flex-col p-0 overflow-hidden bg-card/95 backdrop-blur-xl border-border/50">
                <DialogHeader className="px-6 py-5 border-b border-border/50 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                            <DeviceIcon type={session.device_type} />
                        </div>
                        <div className="min-w-0">
                            <DialogTitle className="text-base truncate">
                                {session.browser ?? 'Unknown browser'} on {session.os ?? 'Unknown OS'}
                            </DialogTitle>
                            <DialogDescription className="mt-0.5 flex items-center gap-2">
                                <span className="capitalize text-muted-foreground">{session.device_type ?? 'desktop'}</span>
                                {session.is_active ? (
                                    <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-800">
                                        <ShieldCheck className="h-2.5 w-2.5 mr-1" />Active
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-[9px] bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/10 dark:text-slate-400 dark:border-slate-700">
                                        <ShieldOff className="h-2.5 w-2.5 mr-1" />Ended
                                    </Badge>
                                )}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 max-h-[60vh]">
                    <div className="px-6 py-4 space-y-6">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Device &amp; Network</p>
                            <div>
                                <InfoRow label="Browser" value={session.browser} />
                                <InfoRow label="OS" value={session.os} />
                                <InfoRow label="Device type" value={session.device_type} />
                                <InfoRow label="IP Address" value={session.ip_address} mono />
                                <InfoRow label="Provider" value={session.provider} />
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Timeline</p>
                            <div>
                                <InfoRow
                                    label="Logged in"
                                    value={session.logged_in_at ? new Date(session.logged_in_at).toLocaleString() : null}
                                />
                                <InfoRow
                                    label="Ended"
                                    value={session.logged_out_at ? new Date(session.logged_out_at).toLocaleString() : null}
                                />
                                {duration && <InfoRow label="Duration" value={duration} />}
                            </div>
                        </div>

                        {session.user_agent && (
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">User Agent</p>
                                <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
                                    <p className="text-[10px] font-mono text-muted-foreground break-all leading-relaxed">{session.user_agent}</p>
                                </div>
                            </div>
                        )}

                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Session ID</p>
                            <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
                                <p className="text-[10px] font-mono text-muted-foreground break-all">{session.id}</p>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
