import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export function getProfileById(supabase: SupabaseClient<Database>, id: string) {
  return supabase.from('profiles').select('*').eq('id', id).single()
}

export function getProfileRoleById(supabase: SupabaseClient<Database>, id: string) {
  return supabase.from('profiles').select('id, role').eq('id', id).single()
}

export function getAdminProfiles(supabase: SupabaseClient<Database>) {
  return supabase
    .from('profiles')
    .select('id')
    .in('role', ['admin', 'moderator'])
    .eq('is_active', true)
    .eq('is_deleted', false)
}

export function updateProfile(supabase: SupabaseClient<Database>, id: string, data: ProfileUpdate) {
  return supabase.from('profiles').update(data).eq('id', id)
}

export function updateProfileAvatar(supabase: SupabaseClient<Database>, id: string, avatarUrl: string) {
  return supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', id)
}

