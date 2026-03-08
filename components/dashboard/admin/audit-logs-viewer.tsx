'use client'

import { useState } from 'react'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { DateCell } from '@/components/ui/date-cell'
import { Search } from 'lucide-react'

interface AuditLog {
    id: string
    user_id: string | null
    action: string
    table_name: string | null
    record_id: string | null
    old_data: any
    new_data: any
    created_at: string
}

interface Props {
    logs: AuditLog[]
}

export function AuditLogsViewer({ logs }: Props) {
    const [search, setSearch] = useState('')

    const filtered = logs.filter(l =>
        !search ||
        l.action.toLowerCase().includes(search.toLowerCase()) ||
        (l.table_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (l.record_id ?? '').toLowerCase().includes(search.toLowerCase())
    )

    const actionColor = (action: string) => {
        if (action.includes('INSERT') || action.includes('create')) return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/10 dark:text-emerald-400'
        if (action.includes('UPDATE') || action.includes('update')) return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/10 dark:text-blue-400'
        if (action.includes('DELETE') || action.includes('delete')) return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/10 dark:text-red-400'
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search logs by action, table, or record ID..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-9 h-10 bg-background/50"
                />
            </div>

            <DataTable
                data={filtered}
                columns={[
                    {
                        id: 'action',
                        header: 'Action',
                        cell: (l) => (
                            <Badge variant="outline" className={`text-[10px] font-mono ${actionColor(l.action)}`}>
                                {l.action}
                            </Badge>
                        ),
                    },
                    {
                        id: 'table',
                        header: 'Table',
                        cell: (l) => <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{l.table_name ?? '—'}</code>,
                    },
                    {
                        id: 'record',
                        header: 'Record ID',
                        className: 'hidden md:table-cell',
                        headerClassName: 'hidden md:table-cell',
                        cell: (l) => <p className="text-xs text-muted-foreground font-mono truncate max-w-[120px]">{l.record_id ?? '—'}</p>,
                    },
                    {
                        id: 'user',
                        header: 'User',
                        className: 'hidden lg:table-cell',
                        headerClassName: 'hidden lg:table-cell',
                        cell: (l) => <p className="text-xs text-muted-foreground font-mono truncate max-w-[120px]">{l.user_id ?? 'System'}</p>,
                    },
                    {
                        id: 'date',
                        header: 'Date',
                        cell: (l) => <DateCell date={l.created_at} />,
                    },
                ]}
                keyExtractor={(l) => l.id}
                emptyState={{ title: 'No audit logs found.' }}
                defaultPageSize={10}
            />
        </div>
    )
}
