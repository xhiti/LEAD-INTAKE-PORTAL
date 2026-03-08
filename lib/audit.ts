import { createClient } from '@supabase/supabase-js'
import type { Database, Json } from '@/lib/supabase/database.types'

interface AuditLogParams {
  userId?: string | null
  action: string
  entityType: string
  entityId?: string | null
  oldData?: unknown
  newData?: unknown
  metadata?: Record<string, unknown>
  ipAddress?: string | null
  userAgent?: string | null
}

function getServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function logAudit(params: AuditLogParams): Promise<void> {
  try {
    const supabase = getServiceClient()
    await supabase.from('audit_logs').insert({
      user_id: params.userId ?? null,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId ?? null,
      old_data: params.oldData ?? null,
      new_data: params.newData ?? null,
      metadata: params.metadata ?? {},
      ip_address: params.ipAddress ?? null,
      user_agent: params.userAgent ?? null,
    } as any)
  } catch (error) {
    console.error('Audit log failed:', error)
  }
}

export function extractRequestInfo(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    null
  const userAgent = request.headers.get('user-agent') ?? null
  return { ip, userAgent }
}
