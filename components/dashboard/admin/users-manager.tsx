'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ShieldCheck, User, Eye, Shield, UserX, UserCheck, Download, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DateCell } from '@/components/ui/date-cell'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/use-toast'
import { formatDate } from '@/lib/utils'
import { exportToCSV } from '@/lib/export-utils'
import { deleteAccountAction } from '@/lib/actions/auth'
import { updateUserRoleAction, toggleUserActiveAction, getUsersForExportAction } from '@/lib/actions/users'
import { ViewButton, DeleteButton } from '@/components/ui/actions'

const ROLES = ['user', 'moderator', 'admin', 'viewer'] as const
const STATUSES = ['active', 'inactive', 'deactivated', 'suspended', 'deleted'] as const

interface Profile {
    id: string
    name: string
    surname: string
    email: string
    phone?: string
    job_title?: string
    company?: string
    role: 'user' | 'admin' | 'moderator' | 'viewer'
    created_at: string
    last_login: string | null
    is_active: boolean
    status: string
    avatar_url?: string | null
    initials?: string
}

interface Props {
    users: Profile[]
    locale: string
    currentUserId: string
}

export function UsersManager({ users: initial, locale, currentUserId }: Props) {
    const router = useRouter()
    const { toast } = useToast()

    const [users, setUsers] = useState(initial)
    const [searchName, setSearchName] = useState('')
    const [searchSurname, setSearchSurname] = useState('')
    const [searchEmail, setSearchEmail] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [roleFilter, setRoleFilter] = useState('all')

    const [updating, setUpdating] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [deactivatingUser, setDeactivatingUser] = useState<Profile | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isExporting, setIsExporting] = useState(false)

    const filtered = useMemo(() => {
        return users.filter(u => {
            const name = u.name?.toLowerCase() || ''
            const surname = u.surname?.toLowerCase() || ''
            const email = u.email?.toLowerCase() || ''

            const matchName = !searchName || name.includes(searchName.toLowerCase())
            const matchSurname = !searchSurname || surname.includes(searchSurname.toLowerCase())
            const matchEmail = !searchEmail || email.includes(searchEmail.toLowerCase())
            const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? u.is_active : !u.is_active)
            const matchRole = roleFilter === 'all' || u.role === roleFilter
            const notDeleted = u.status !== 'deleted'

            return matchName && matchSurname && matchEmail && matchStatus && matchRole && notDeleted
        })
    }, [users, searchName, searchSurname, searchEmail, statusFilter, roleFilter])

    async function handleRoleChange(userId: string, newRole: Profile['role']) {
        setUpdating(userId)
        const res = await updateUserRoleAction(userId, newRole)
        if (res.success) {
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
            toast({ title: 'Role Updated', description: `User role changed to ${newRole}.` })
        } else {
            toast({ title: 'Error', description: res.error, variant: 'destructive' })
        }
        setUpdating(null)
    }

    async function toggleActive(user: Profile) {
        setUpdating(user.id)
        const res = await toggleUserActiveAction(user.id, user.is_active)
        if (res.success) {
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u))
            toast({ title: user.is_active ? 'User Deactivated' : 'User Activated' })
            setDeactivatingUser(null)
        } else {
            toast({ title: 'Error', description: res.error, variant: 'destructive' })
        }
        setUpdating(null)
    }

    async function handleDelete() {
        if (!deletingId) return
        setIsDeleting(true)
        try {
            const res = await deleteAccountAction(deletingId)
            if (res.success) {
                setUsers(prev => prev.filter(u => u.id !== deletingId))
                toast({ title: 'User Deleted', description: 'User account has been deleted permanently.' })
                setDeletingId(null)
            } else {
                throw new Error(res.error)
            }
        } catch (e: any) {
            toast({ title: 'Error', description: e.message || 'Failed to delete user', variant: 'destructive' })
        } finally {
            setIsDeleting(false)
        }
    }

    const exportToExcel = async () => {
        setIsExporting(true)
        try {
            const filters = { searchName, searchSurname, searchEmail, status: statusFilter, role: roleFilter }
            const result = await getUsersForExportAction(filters)

            if (result.error || !result.data) throw new Error(result.error || 'No data found')

            const headers = ['#', 'Name', 'Surname', 'Email', 'Role', 'Status', 'Last Login', 'Joined']
            const data = result.data.map((u: Profile, index: number) => [
                index + 1,
                u.name,
                u.surname,
                u.email,
                u.role,
                u.is_active ? 'Active' : 'Inactive',
                u.last_login ? formatDate(u.last_login, locale) : 'Never',
                formatDate(u.created_at, locale)
            ])

            exportToCSV({ filename: 'users_export', headers, data })
            toast({ title: 'Export Complete', description: `${result.data.length} users exported successfully.` })
        } catch (e: any) {
            toast({ title: 'Export Failed', description: e.message || 'Failed to generate export file.', variant: 'destructive' })
        } finally {
            setIsExporting(false)
        }
    }

    const roleIcon = (role: string) => {
        if (role === 'admin') return <ShieldCheck className="h-3.5 w-3.5" />
        if (role === 'moderator') return <Shield className="h-3.5 w-3.5" />
        if (role === 'viewer') return <Eye className="h-3.5 w-3.5" />
        return <User className="h-3.5 w-3.5" />
    }

    return (
        <>
            <Card className="mb-6 border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-4 gap-y-6">
                        <div className="space-y-2">
                            <Input
                                placeholder="Search by Name"
                                value={searchName}
                                onChange={e => setSearchName(e.target.value)}
                                className="h-10 bg-background/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                placeholder="Search by Surname"
                                value={searchSurname}
                                onChange={e => setSearchSurname(e.target.value)}
                                className="h-10 bg-background/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                placeholder="Search by Email"
                                value={searchEmail}
                                onChange={e => setSearchEmail(e.target.value)}
                                className="h-10 bg-background/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="h-10 bg-background/50">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    {STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="h-10 bg-background/50">
                                    <SelectValue placeholder="Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    {ROLES.map(r => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-between items-center mb-4">
                <p className="text-sm font-medium text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-lg border border-border/40">
                    Showing {filtered.length} users
                </p>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={exportToExcel}
                    disabled={isExporting}
                    className="h-10 px-6 gap-2 border-primary/20 hover:bg-primary/5 hover:border-primary/30 transition-all rounded-xl shadow-sm"
                >
                    <Download className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{isExporting ? 'Exporting...' : 'Export CSV'}</span>
                </Button>
            </div>

            <DataTable
                data={filtered}
                columns={[
                    {
                        id: 'name',
                        header: 'User',
                        cell: (u) => {
                            const fallback = u.initials || `${u.name?.[0] || ''}${u.surname?.[0] || ''}`.toUpperCase() || 'U'
                            return (
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={u.avatar_url || ''} alt={`${u.name} ${u.surname}`} />
                                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-medium">{fallback}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-sm leading-tight">{u.name} {u.surname}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{u.email}</p>
                                    </div>
                                </div>
                            )
                        },
                    },
                    {
                        id: 'phone',
                        header: 'Phone',
                        cell: (u) => (
                            <p className="text-xs text-muted-foreground">{u.phone || '—'}</p>
                        ),
                    },
                    {
                        id: 'company',
                        header: 'Company & Position',
                        cell: (u) => (
                            <div>
                                <p className="font-medium text-sm">{u.job_title || '—'}</p>
                                <p className="text-xs text-muted-foreground">{u.company || '—'}</p>
                            </div>
                        ),
                    }, {
                        id: 'role',
                        header: 'Role',
                        cell: (u) => (
                            <Select
                                value={u.role}
                                onValueChange={(v) => handleRoleChange(u.id, v as Profile['role'])}
                                disabled={updating === u.id || u.id === currentUserId}
                            >
                                <SelectTrigger className="h-8 w-32 text-xs bg-muted/30">
                                    <div className="flex items-center gap-1.5">
                                        <SelectValue />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    {ROLES.map(r => (
                                        <SelectItem key={r} value={r} className="text-xs capitalize">
                                            <div className="flex items-center gap-2">{roleIcon(r)} {r}</div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ),
                    },
                    {
                        id: 'status',
                        header: 'Status',
                        cell: (u) => {
                            const isGreen = u.status === 'active'
                            const isRed = u.status === 'suspended' || u.status === 'deactivated'
                            return (
                                <Badge variant="outline" className={`font-semibold text-[11px] capitalize ${isGreen ? 'text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10' :
                                    isRed ? 'text-destructive border-destructive/20 bg-destructive/10' :
                                        'text-slate-600 border-slate-200 bg-slate-50 dark:bg-slate-900/10 dark:text-slate-400 dark:border-slate-800'
                                    }`}>
                                    {u.status || 'unknown'}
                                </Badge>
                            )
                        },
                    },
                    {
                        id: 'last_login',
                        header: 'Last Login',
                        className: 'hidden lg:table-cell',
                        headerClassName: 'hidden lg:table-cell',
                        cell: (u) => u.last_login ? <DateCell date={u.last_login} /> : <span className="text-muted-foreground text-xs">—</span>,
                    },
                    {
                        id: 'created_at',
                        header: 'Joined',
                        className: 'hidden md:table-cell',
                        headerClassName: 'hidden md:table-cell',
                        cell: (u) => <DateCell date={u.created_at} />,
                    },
                    {
                        id: 'actions',
                        header: 'Actions',
                        className: 'text-center',
                        headerClassName: 'text-center',
                        cell: (u) => (
                            <div className="flex justify-center gap-1" onClick={e => e.stopPropagation()}>
                                <ViewButton
                                    onClick={() => router.push(`/${locale}/admin/users/${u.id}`)}
                                    title="View User"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-8 w-8 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${u.is_active ? 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 hover:text-orange-500' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 hover:text-emerald-500'}`}
                                    onClick={() => u.is_active ? setDeactivatingUser(u) : toggleActive(u)}
                                    title={u.is_active ? 'Deactivate user' : 'Activate user'}
                                    disabled={updating === u.id || isDeleting || u.id === currentUserId}
                                >
                                    {u.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                </Button>
                                <DeleteButton onClick={() => setDeletingId(u.id)} disabled={isDeleting || u.id === currentUserId} />
                            </div>
                        ),
                    },
                ]}
                enableExport={false}
                keyExtractor={(u) => u.id}
                emptyState={{ title: 'No users found.', description: 'Try adjusting your filters.' }}
                defaultPageSize={10}
                showPageInfo={true}
            />

            <ConfirmDialog
                open={!!deletingId}
                onOpenChange={(open) => !open && setDeletingId(null)}
                icon={<Trash2 className="h-6 w-6" />}
                title="Delete User"
                description="Are you absolutely sure you want to delete this user permanently? This action cannot be undone."
                confirmLabel="Delete User"
                cancelLabel="Cancel"
                variant="destructive"
                isLoading={isDeleting}
                onConfirm={handleDelete}
            >
                <div className="mt-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Type <span className="text-foreground font-bold select-none">'DELETE'</span> to confirm</p>
                    <Input
                        placeholder="DELETE"
                        onChange={(e) => {
                            const btn = document.getElementById('confirm-dialog-btn') as HTMLButtonElement
                            if (btn) btn.disabled = e.target.value !== 'DELETE'
                        }}
                    />
                </div>
            </ConfirmDialog>

            <ConfirmDialog
                open={!!deactivatingUser}
                onOpenChange={(open) => !open && setDeactivatingUser(null)}
                icon={<UserX className="h-6 w-6" />}
                title="Deactivate User"
                description={`Are you sure you want to deactivate ${deactivatingUser?.name} ${deactivatingUser?.surname}? They will no longer be able to log in to the platform.`}
                confirmLabel="Deactivate User"
                cancelLabel="Cancel"
                variant="warning"
                isLoading={updating === deactivatingUser?.id}
                onConfirm={() => { if (deactivatingUser) return toggleActive(deactivatingUser) }}
            />
        </>
    )
}
