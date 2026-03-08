'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAction } from '@/lib/actions/audit'

async function requireAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single() as { data: { role: string } | null }
    if (profile?.role !== 'admin') throw new Error('Requires admin privileges')
    return { user, profile }
}

export async function updateUserRoleAction(userId: string, newRole: string) {
    const { user: adminUser } = await requireAdmin()
    const serviceClient = await createServiceClient()

    const { data: oldUser } = await (serviceClient as any).from('profiles').select('role').eq('id', userId).single() as { data: { role: string } | null }

    const { error } = await (serviceClient as any).from('profiles').update({ role: newRole }).eq('id', userId)

    if (error) return { success: false, error: error.message }

    await logAction({
        userId: adminUser.id,
        action: 'UPDATE',
        entityType: 'user',
        entityId: userId,
        oldData: { role: oldUser?.role },
        newData: { role: newRole }
    })

    revalidatePath('/[locale]/admin/users', 'page')
    return { success: true }
}

export async function toggleUserActiveAction(userId: string, currentActiveState: boolean) {
    const { user: adminUser } = await requireAdmin()
    const serviceClient = await createServiceClient()

    const { error } = await (serviceClient as any).from('profiles').update({ is_active: !currentActiveState }).eq('id', userId)

    if (error) return { success: false, error: error.message }

    await logAction({
        userId: adminUser.id,
        action: 'UPDATE',
        entityType: 'user',
        entityId: userId,
        oldData: { is_active: currentActiveState },
        newData: { is_active: !currentActiveState }
    })

    revalidatePath('/[locale]/admin/users', 'page')
    return { success: true }
}

export async function getUsersForExportAction(filters: any) {
    await requireAdmin()
    const serviceClient = await createServiceClient()

    let query = (serviceClient as any).from('profiles').select('*')

    if (filters.status && filters.status !== 'all') {
        query = query.eq('is_active', filters.status === 'active')
    }
    if (filters.role && filters.role !== 'all') {
        query = query.eq('role', filters.role)
    }

    const { data, error } = await query

    if (error) return { success: false, error: error.message, data: null }

    // Filter in memory for text fields
    let filtered = data
    if (filters.searchName) {
        filtered = filtered.filter((u: any) => u.name?.toLowerCase().includes(filters.searchName.toLowerCase()))
    }
    if (filters.searchSurname) {
        filtered = filtered.filter((u: any) => u.surname?.toLowerCase().includes(filters.searchSurname.toLowerCase()))
    }
    if (filters.searchEmail) {
        filtered = filtered.filter((u: any) => u.email?.toLowerCase().includes(filters.searchEmail.toLowerCase()))
    }

    return { success: true, data: filtered, error: null }
}
