'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAction } from '@/lib/actions/audit'

async function requireAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { supabase, error: 'Unauthorized' as const }

    const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single() as { data: { role: string } | null }

    if (profile?.role !== 'admin') return { supabase, error: 'Only admins can manage industries' as const }
    return { supabase, error: null }
}

export async function getIndustriesAction() {
    const supabase = await createClient()
    const { data, error } = await (supabase as any)
        .from('industries')
        .select('*')
        .eq('is_active', true)
        .eq('is_deleted', false)
        .order('order_index', { ascending: true })

    if (error) return { success: false, error: error.message }
    return { success: true, data }
}

export async function createIndustryAction(data: {
    code: string
    title: string
    description?: string
    order_index?: number
}) {
    const { supabase, error: authError } = await requireAdmin()
    if (authError) return { success: false as const, error: authError, data: null }

    const { data: created, error } = await (supabase as any)
        .from('industries')
        .insert([data])
        .select()
        .single()

    if (error) return { success: false as const, error: error.message, data: null }

    await logAction({
        action: 'CREATE',
        entityType: 'industry',
        entityId: created.id,
        newData: created
    })

    revalidatePath('/[locale]/admin/industries', 'page')
    return { success: true as const, data: created, error: null }
}

export async function updateIndustryAction(id: string, data: {
    code?: string
    title?: string
    description?: string
    order_index?: number
    is_active?: boolean
}) {
    const { supabase, error: authError } = await requireAdmin()
    if (authError) return { success: false, error: authError }

    const { error } = await (supabase as any)
        .from('industries')
        .update(data)
        .eq('id', id)

    if (error) return { success: false, error: error.message }

    await logAction({
        action: 'UPDATE',
        entityType: 'industry',
        entityId: id,
        newData: data
    })

    revalidatePath('/[locale]/admin/industries', 'page')
    return { success: true }
}

export async function deleteIndustryAction(id: string) {
    const { supabase, error: authError } = await requireAdmin()
    if (authError) return { success: false, error: authError }

    const { error } = await (supabase as any)
        .from('industries')
        .update({ is_deleted: true, is_active: false })
        .eq('id', id)

    if (error) return { success: false, error: error.message }

    await logAction({
        action: 'DELETE',
        entityType: 'industry',
        entityId: id,
        newData: { is_deleted: true, is_active: false }
    })

    revalidatePath('/[locale]/admin/industries', 'page')
    return { success: true }
}
