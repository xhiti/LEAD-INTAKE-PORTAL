import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SubmissionsKanban } from '@/components/dashboard/submissions-kanban'

export default async function SubmissionsKanbanPage({ params }: { params: { locale: string } }) {
    const { locale } = await Promise.resolve(params)
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect(`/${locale}/login`)

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single() as { data: { role: 'admin' | 'moderator' | 'user' } | null }
    const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator'

    if (!isAdmin) {
        redirect(`/${locale}/dashboard`)
    }

    const query = supabase
        .from('submissions')
        .select(`
            id, name, business_name, email, status, priority, industry, 
            help_request, ai_summary, ai_category, ai_confidence_score, 
            ai_model_used, ai_processed_at, created_at, submitted_by
        `)
        .eq('is_active', true)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

    if (!isAdmin) {
        query.eq('submitted_by', user.id)
    }

    const { data: submissions } = await query

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Status Board</h1>
                <p className="text-muted-foreground text-sm mt-1">Visualize submissions by their current status</p>
            </div>
            <SubmissionsKanban
                submissions={submissions ?? []}
                locale={locale}
                isAdmin={isAdmin}
                userId={user.id}
            />
        </div>
    )
}
