import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

type DB = SupabaseClient<Database>
type NotificationInsert = Database['public']['Tables']['notifications']['Insert']

export function getNotifications(supabase: DB, userId: string) {
  return supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', false)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(50)
}

export function insertNotifications(supabase: DB, notifications: NotificationInsert[]) {
  return supabase.from('notifications').insert(notifications)
}

export function markNotificationsRead(supabase: DB, ids: string[], userId: string) {
  return supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .in('id', ids)
    .eq('user_id', userId)
}

export function markAllNotificationsRead(supabase: DB, userId: string) {
  return supabase.rpc('mark_all_notifications_read', { p_user_id: userId })
}
