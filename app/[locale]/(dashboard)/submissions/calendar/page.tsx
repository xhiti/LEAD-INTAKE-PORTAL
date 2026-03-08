import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SubmissionsCalendar } from '@/components/dashboard/submissions-calendar'

export default async function SubmissionsCalendarPage({ params }: { params: { locale: string } }) {
    const { locale } = await Promise.resolve(params)
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect(`/${locale}/login`)

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single() as { data: { role: string } | null }
    const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator'

    const query = supabase
        .from('submissions')
        .select('id, name, email, business_name, status, industry, ai_category, ai_summary, help_request, created_at, submitted_by')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

    if (!isAdmin) {
        query.eq('submitted_by', user.id)
    }

    const { data: submissions } = await query

    return (
        <SubmissionsCalendar submissions={submissions ?? []} locale={locale} />
    )
}
