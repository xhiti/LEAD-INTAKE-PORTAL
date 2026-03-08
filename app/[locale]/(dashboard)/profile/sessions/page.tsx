import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SessionsTable } from '@/components/dashboard/sessions-table'
import { PageHeader } from '@/components/layout/page-header'

export default async function SessionsPage({ params }: { params: { locale: string } }) {
    const { locale } = await Promise.resolve(params)
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect(`/${locale}/login`)

    const serviceClient = await createServiceClient()
    const { data: sessions } = await serviceClient
        .from('auth_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('logged_in_at', { ascending: false })

    return (
        <div className="w-full pb-20 space-y-6">
            <PageHeader
                title="Active Sessions"
                description="All devices and browsers where you are logged in. Terminate any session you don't recognize."
            />
            <SessionsTable sessions={sessions ?? []} userId={user.id} />
        </div>
    )
}
