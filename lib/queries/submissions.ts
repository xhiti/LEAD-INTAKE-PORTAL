import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

type DB = SupabaseClient<Database>
type SubmissionInsert = Database['public']['Tables']['submissions']['Insert']
type SubmissionUpdate = Database['public']['Tables']['submissions']['Update']

export function createSubmission(supabase: DB, data: SubmissionInsert) {
  return supabase
    .from('submissions')
    .insert(data)
    .select('id, ai_category, ai_summary, ai_model_used')
    .single()
}

export function getSubmissions(supabase: DB, options?: { userId?: string }) {
  let query = supabase
    .from('submissions')
    .select('*')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  if (options?.userId) {
    query = query.eq('submitted_by', options.userId)
  }

  return query
}

export function getRecentSubmissions(
  supabase: DB,
  options?: { userId?: string; limit?: number }
) {
  let query = supabase
    .from('submissions')
    .select('id, name, business_name, industry, ai_category, ai_summary, status, priority, created_at')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(options?.limit ?? 5)

  if (options?.userId) {
    query = query.eq('submitted_by', options.userId)
  }

  return query
}

export function getDashboardStats(supabase: DB) {
  return supabase.rpc('get_dashboard_stats')
}

export function updateSubmission(supabase: DB, id: string, data: SubmissionUpdate) {
  return supabase.from('submissions').update(data).eq('id', id).select().single()
}
