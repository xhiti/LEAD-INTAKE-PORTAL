import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { UserDetails } from '@/components/dashboard/admin/user-details'

export default async function UserDetailsPage({
    params
}: {
    params: { locale: string; id: string } | Promise<{ locale: string; id: string }>
}) {
    const resolvedParams = await Promise.resolve(params)
    const { locale, id } = resolvedParams
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect(`/${locale}/login`)

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single() as { data: { role: string } | null }
    if (profile?.role !== 'admin' && profile?.role !== 'moderator') {
        redirect(`/${locale}/dashboard`)
    }

    const { data: targetUser } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single() as { data: any | null }

    if (!targetUser) {
        notFound()
    }

    const { data: sessions } = await supabase
        .from('auth_sessions')
        .select('*')
        .eq('user_id', id)
        .order('logged_in_at', { ascending: false })
        .limit(10)

    const { data: auditLogs } = await supabase
        .from('audit_logs')
        .select('*')
        .or(`user_id.eq.${id},entity_id.eq.${id}`)
        .order('created_at', { ascending: false })
        .limit(20)

    return (
        <div className="space-y-6">
            <PageHeader
                title="User Details"
                description={`Viewing detailed information for ${targetUser.name} ${targetUser.surname}`}
                backHref={`/${locale}/admin/users`}
                backText="Back to Users"
            />

            <UserDetails
                user={targetUser}
                sessions={sessions || []}
                logs={auditLogs || []}
                locale={locale}
            />
        </div>
    )
}
