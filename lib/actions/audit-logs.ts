'use server'

import { createClient } from '@/lib/supabase/server'

export interface AuditLogsFilters {
    search?: string
    action?: string
    entityType?: string
    dateFrom?: string
    dateTo?: string
    userSearch?: string
    role?: string
    ipSearch?: string
}

export async function getAuditLogsAction(
    page: number = 1,
    pageSize: number = 10,
    filters: AuditLogsFilters = {}
) {
    const supabase = await createClient()

    // If filtering by user name/email or role, resolve matching user IDs first
    let filteredUserIds: string[] | null = null
    if (filters.userSearch || filters.role) {
        let profileQuery = (supabase as any)
            .from('profiles')
            .select('id')

        if (filters.userSearch) {
            const q = `%${filters.userSearch}%`
            profileQuery = profileQuery.or(`name.ilike.${q},surname.ilike.${q},email.ilike.${q}`)
        }
        if (filters.role) {
            profileQuery = profileQuery.eq('role', filters.role)
        }

        const { data: profiles } = await profileQuery
        filteredUserIds = (profiles?.map((p: any) => p.id) ?? []) as string[]

        if (filteredUserIds.length === 0) {
            return { success: true, data: [], count: 0 }
        }
    }

    let query = (supabase as any)
        .from('audit_logs')
        .select(`
            *,
            profiles:user_id ( name, surname, email, role )
        `, { count: 'exact' })

    if (filters.search) {
        query = query.or(
            `action.ilike.%${filters.search}%,entity_type.ilike.%${filters.search}%,entity_id.ilike.%${filters.search}%`
        )
    }
    if (filters.action) {
        query = query.eq('action', filters.action)
    }
    if (filters.entityType) {
        query = query.eq('entity_type', filters.entityType)
    }
    if (filters.dateFrom) {
        query = query.gte('created_at', new Date(filters.dateFrom).toISOString())
    }
    if (filters.dateTo) {
        const to = new Date(filters.dateTo)
        to.setDate(to.getDate() + 1)
        query = query.lt('created_at', to.toISOString())
    }
    if (filteredUserIds !== null) {
        query = query.in('user_id', filteredUserIds)
    }
    if (filters.ipSearch) {
        query = query.ilike('ip_address', `%${filters.ipSearch}%`)
    }

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data: logs, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to)

    if (error) {
        console.error('Error fetching audit logs:', error)
        return { success: false, error: error.message, data: [], count: 0 }
    }

    const formattedLogs = logs.map((log: any) => {
        const profile = log.profiles as any
        const fullName = profile ? `${profile.name} ${profile.surname || ''}`.trim() : 'System'
        return {
            ...log,
            user_name: fullName,
            user_email: profile?.email ?? null,
            user_role: profile?.role ?? 'system',
        }
    })

    return { success: true, data: formattedLogs, count: count ?? 0 }
}
