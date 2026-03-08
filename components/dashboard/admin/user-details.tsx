'use client'

import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataTable } from '@/components/ui/data-table'
import { DateCell } from '@/components/ui/date-cell'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ShieldCheck, User, Eye, Shield, Activity, ShieldAlert, KeyRound, Mail, Phone, Briefcase, Globe, CalendarDays, ExternalLink } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

interface UserDetailsProps {
    user: any
    sessions: any[]
    logs: any[]
    locale: string
}

export function UserDetails({ user, sessions, logs, locale }: UserDetailsProps) {
    const roleIcon = (role: string) => {
        if (role === 'admin') return <ShieldCheck className="h-4 w-4" />
        if (role === 'moderator') return <Shield className="h-4 w-4" />
        if (role === 'viewer') return <Eye className="h-4 w-4" />
        return <User className="h-4 w-4" />
    }

    const actionColor = (action: string) => {
        if (action.includes('CREATE') || action.includes('create')) return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/10 dark:text-emerald-400'
        if (action.includes('UPDATE') || action.includes('update')) return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/10 dark:text-blue-400'
        if (action.includes('DELETE') || action.includes('delete')) return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/10 dark:text-red-400'
        if (action.includes('LOGIN') || action.includes('LOGOUT')) return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/10 dark:text-purple-400'
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/10 dark:text-slate-400'
    }

    const fallback = user.initials || `${user.name?.[0] || ''}${user.surname?.[0] || ''}`.toUpperCase() || 'U'

    return (
        <Tabs defaultValue="profile" className="w-full">
            <TabsList className="w-full sm:w-auto overflow-x-auto justify-start h-auto p-1 bg-muted/30 border border-border/50 mb-6 flex-wrap sm:flex-nowrap">
                <TabsTrigger value="profile" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 text-sm font-medium">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                </TabsTrigger>
                <TabsTrigger value="sessions" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 text-sm font-medium">
                    <KeyRound className="h-4 w-4 mr-2" />
                    Login History
                </TabsTrigger>
                <TabsTrigger value="activity" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 text-sm font-medium">
                    <Activity className="h-4 w-4 mr-2" />
                    Recent Activity
                </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="m-0 focus-visible:outline-none space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
                            <div className="h-24 bg-gradient-to-br from-primary/20 via-primary/5 to-background border-b border-border/50 relative"></div>
                            <CardContent className="px-6 pb-6 -mt-10">
                                <Avatar className="h-20 w-20 border-4 border-background shadow-md ring-1 ring-border/50 mb-4 bg-background">
                                    <AvatarImage src={user.avatar_url || ''} className="object-cover" />
                                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                                        {fallback}
                                    </AvatarFallback>
                                </Avatar>

                                <h2 className="text-xl font-bold tracking-tight">{user.name} {user.surname}</h2>
                                <p className="text-sm text-muted-foreground mb-3">{user.job_title || 'No title set'}</p>

                                <Badge variant="outline" className="gap-1.5 text-xs font-semibold px-2.5 py-0.5 text-primary border-primary/20 bg-primary/10">
                                    {roleIcon(user.role)}
                                    <span className="capitalize">{user.role}</span>
                                </Badge>
                            </CardContent>
                        </Card>

                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
                            <CardHeader className="pb-3 pt-4 px-5">
                                <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Account Info</CardTitle>
                            </CardHeader>
                            <CardContent className="px-5 pb-5 space-y-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="font-medium">{user.email}</span>
                                </div>
                                {user.phone && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <span className="font-medium">{user.phone}</span>
                                    </div>
                                )}
                                {(user.company || user.job_title) && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <span className="font-medium">{[user.job_title, user.company].filter(Boolean).join(' @ ')}</span>
                                    </div>
                                )}
                                {user.timezone && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <span className="font-medium">{user.timezone}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-sm text-muted-foreground pt-2 border-t border-border/40 mt-2">
                                    <CalendarDays className="h-4 w-4 shrink-0" />
                                    <span>Joined {formatDate(user.created_at, locale)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
                            <CardHeader className="pb-3 pt-4 px-5 border-b border-border/50 bg-muted/20">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <ShieldAlert className="h-4 w-4 text-primary" />
                                    Administrative Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-5 py-5 space-y-6">
                                <div>
                                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Account State</p>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className={`font-medium ${user.is_active ? 'text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10' : 'text-slate-600 border-slate-200 bg-slate-50 dark:bg-slate-900/10 dark:text-slate-400 dark:border-slate-800'}`}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                        <Badge variant="outline" className={`font-medium capitalize ${user.status === 'active' ? 'text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900/10' : user.status === 'suspended' || user.status === 'deactivated' ? 'text-destructive border-destructive/20 bg-destructive/10' : 'text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-900/10'}`}>
                                            {user.status || 'unknown'}
                                        </Badge>
                                    </div>
                                    <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
                                        Manage status and roles directly from the main <Link href={`/${locale}/admin/users`} className="text-primary hover:underline inline-flex items-center">Users table <ExternalLink className="ml-0.5 h-3 w-3" /></Link>.
                                    </p>
                                </div>
                                <div className="pt-4 border-t border-border/50">
                                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Last Login Activity</p>
                                    <p className="text-sm font-medium">
                                        {user.last_login ? formatDistanceToNow(new Date(user.last_login), { addSuffix: true }) : 'Never logged in'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="sessions" className="m-0 focus-visible:outline-none">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
                    <CardHeader className="border-b border-border/50 bg-muted/20 px-6 py-4">
                        <CardTitle className="text-lg">Authentication Sessions</CardTitle>
                        <CardDescription>Recent logins from this account across different devices.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <DataTable
                            data={sessions}
                            columns={[
                                {
                                    id: 'date',
                                    header: 'Time',
                                    cell: (s) => <DateCell date={s.logged_in_at} />
                                },
                                {
                                    id: 'device',
                                    header: 'Device',
                                    cell: (s) => (
                                        <div>
                                            <p className="font-medium text-sm">{s.device_type} • {s.os}</p>
                                            <p className="text-[10px] text-muted-foreground">{s.browser}</p>
                                        </div>
                                    )
                                },
                                {
                                    id: 'ip',
                                    header: 'IP Address',
                                    cell: (s) => <code className="text-[11px] font-mono bg-muted/50 px-1.5 py-0.5 rounded text-muted-foreground">{s.ip_address}</code>
                                },
                                {
                                    id: 'provider',
                                    header: 'Provider',
                                    cell: (s) => <Badge variant="secondary" className="capitalize text-[10px]">{s.provider}</Badge>
                                }
                            ]}
                            keyExtractor={s => s.id}
                            emptyState={{ title: 'No login sessions recorded.', description: 'This user has not logged in yet.' }}
                            className="border-0 rounded-none shadow-none"
                            enableExport={false}
                        />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="activity" className="m-0 focus-visible:outline-none">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
                    <CardHeader className="border-b border-border/50 bg-muted/20 px-6 py-4">
                        <CardTitle className="text-lg">Audit Trail</CardTitle>
                        <CardDescription>Recent actions performed by or affecting this user.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <DataTable
                            data={logs}
                            columns={[
                                {
                                    id: 'action',
                                    header: 'Action',
                                    cell: (l) => (
                                        <Badge variant="outline" className={`text-[10px] font-mono uppercase ${actionColor(l.action)}`}>
                                            {l.action}
                                        </Badge>
                                    ),
                                },
                                {
                                    id: 'entity',
                                    header: 'Target',
                                    cell: (l) => <span className="text-xs font-semibold uppercase text-muted-foreground">{l.entity_type}</span>,
                                },
                                {
                                    id: 'date',
                                    header: 'Time',
                                    cell: (l) => <DateCell date={l.created_at} />
                                }
                            ]}
                            keyExtractor={l => l.id}
                            emptyState={{ title: 'No recent activity.', description: 'No actions have been logged yet.' }}
                            className="border-0 rounded-none shadow-none"
                            enableExport={false}
                        />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}
