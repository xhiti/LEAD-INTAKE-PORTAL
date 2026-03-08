import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

type DB = SupabaseClient<Database>
type SessionInsert = Database['public']['Tables']['auth_sessions']['Insert']

export function getSessionsByUser(supabase: DB, userId: string) {
  return supabase
    .from('auth_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .eq('is_deleted', false)
    .order('logged_in_at', { ascending: false })
    .limit(10)
}

export function createSession(supabase: DB, data: SessionInsert) {
  return supabase.from('auth_sessions').insert(data)
}

export function revokeSession(supabase: DB, id: string) {
  return supabase
    .from('auth_sessions')
    .update({ is_active: false, logged_out_at: new Date().toISOString() })
    .eq('id', id)
}
