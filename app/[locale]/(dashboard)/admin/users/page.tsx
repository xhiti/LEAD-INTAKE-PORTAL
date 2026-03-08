import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UsersManager } from '@/components/dashboard/admin/users-manager'

export default async function AdminUsersPage({ params }: { params: { locale: string } }) {
    const { locale } = await Promise.resolve(params)
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect(`/${locale}/login`)

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    if (!profile || (profile as any).role !== 'admin') redirect(`/${locale}/dashboard`)

    const { data: users } = await supabase
        .from('profiles')
        .select('id, name, surname, email, role, created_at, last_login, is_active, phone, job_title, company, status, avatar_url, initials')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Users</h1>
                <p className="text-muted-foreground text-sm mt-1">Manage platform users and their roles</p>
            </div>
            <UsersManager users={users ?? []} locale={locale} currentUserId={user.id} />
        </div>
    )
}
