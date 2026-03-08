'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'AI_ANALYSIS'
export type EntityType = 'submission' | 'user' | 'profile' | 'industry' | 'auth_session' | 'notification'

interface LogParams {
    userId?: string
    action: AuditAction
    entityType: EntityType
    entityId?: string
    oldData?: Record<string, any>
    newData?: Record<string, any>
    metadata?: Record<string, any>
}

/**
 * Logs an action to the audit_logs table.
 * Does not throw errors to prevent failing the primary action, but logs to console on failure.
 */
export async function logAction(params: LogParams): Promise<void> {
    try {
        const supabase = await createClient()

        // Get user ID if not provided, assuming we have an active session
        let finalUserId = params.userId
        if (!finalUserId) {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                finalUserId = user.id
            }
        }

        // Extract IP and User-Agent from headers
        const headersList = headers()
        const userAgent = headersList.get('user-agent') || 'Unknown'
        // Common headers for IP address
        const ipAddress =
            headersList.get('x-forwarded-for')?.split(',')[0].trim() ||
            headersList.get('x-real-ip') ||
            headersList.get('cf-connecting-ip') || // Cloudflare
            'Unknown'

        const { error } = await (supabase as any).from('audit_logs').insert({
            user_id: finalUserId || null,
            action: params.action,
            entity_type: params.entityType,
            entity_id: params.entityId || null,
            old_data: params.oldData || null,
            new_data: params.newData || null,
            metadata: params.metadata || {},
            ip_address: ipAddress !== 'Unknown' ? ipAddress : null,
            user_agent: userAgent !== 'Unknown' ? userAgent : null,
        })

        if (error) {
            console.error('[Audit Log Error]: Failed to write log', error)
        }
    } catch (error) {
        console.error('[Audit Log Error]: Exception during logging', error)
    }
}
