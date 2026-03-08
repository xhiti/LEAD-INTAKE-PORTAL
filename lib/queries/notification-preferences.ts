import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

type DB = SupabaseClient<Database>

export function getNotificationPrefs(supabase: DB, userId: string) {
  return supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()
}

export function upsertNotificationPref(
  supabase: DB,
  userId: string,
  key: string,
  value: boolean
) {
  return supabase
    .from('notification_preferences')
    .upsert({ user_id: userId, [key]: value } as any)
    .eq('user_id', userId)
}

export function getPushPrefsForUsers(supabase: DB, userIds: string[]) {
  return supabase
    .from('notification_preferences')
    .select('user_id, push_subscription, push_new_submission')
    .in('user_id', userIds)
    .eq('push_enabled', true)
    .eq('push_new_submission', true)
}

export function enablePushNotifications(
  supabase: DB,
  userId: string,
  subscription: Database['public']['Tables']['notification_preferences']['Insert']['push_subscription']
) {
  return supabase
    .from('notification_preferences')
    .upsert({ user_id: userId, push_enabled: true, push_subscription: subscription })
    .eq('user_id', userId)
}

export function disablePushNotifications(supabase: DB, userId: string) {
  return supabase
    .from('notification_preferences')
    .update({ push_enabled: false, push_subscription: null })
    .eq('user_id', userId)
}
