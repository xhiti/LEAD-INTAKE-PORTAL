'use server'

import { createClient } from '@/lib/supabase/server'

export interface NotificationFilters {
    search?: string
    type?: string
    isRead?: string   // 'all' | 'read' | 'unread'
    channel?: string
    dateFrom?: string
    dateTo?: string
}

export async function getNotificationsAction(
    page: number = 1,
    pageSize: number = 20,
    filters: NotificationFilters = {}
) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthenticated', data: [], count: 0 }

    let query = (supabase as any)
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('is_active', true)
        .eq('is_deleted', false)

    if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,body.ilike.%${filters.search}%`)
    }
    if (filters.type) {
        query = query.eq('type', filters.type)
    }
    if (filters.isRead === 'read') {
        query = query.eq('is_read', true)
    } else if (filters.isRead === 'unread') {
        query = query.eq('is_read', false)
    }
    if (filters.channel) {
        query = query.eq('channel', filters.channel)
    }
    if (filters.dateFrom) {
        query = query.gte('created_at', new Date(filters.dateFrom).toISOString())
    }
    if (filters.dateTo) {
        const to = new Date(filters.dateTo)
        to.setDate(to.getDate() + 1)
        query = query.lt('created_at', to.toISOString())
    }

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to)

    if (error) {
        console.error('Error fetching notifications:', error)
        return { success: false, error: error.message, data: [], count: 0 }
    }

    return { success: true, data: data ?? [], count: count ?? 0 }
}

export async function markNotificationsReadAction(ids: string[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthenticated' }

    const { error } = await (supabase as any)
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in('id', ids)
        .eq('user_id', user.id)

    if (error) return { error: error.message }
    return { success: true }
}

export async function markAllNotificationsReadAction() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthenticated' }

    const { error } = await (supabase as any)
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_read', false)

    if (error) return { error: error.message }
    return { success: true }
}
