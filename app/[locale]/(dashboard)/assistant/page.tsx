import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AiAssistant } from '@/components/dashboard/ai-assistant'
import { buildSubmissionContext } from '@/lib/ai/assistant'

export default async function AssistantPage({ params }: { params: { locale: string } }) {
    const { locale } = await Promise.resolve(params)
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect(`/${locale}/login`)

    const { data: profile } = await supabase
        .from('profiles')
        .select('id, name, role')
        .eq('id', user.id)
        .single() as { data: { id: string; name: string; role: string } | null }

    const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator'

    // Fetch submissions for context
    const query = supabase
        .from('submissions')
        .select('id, name, business_name, email, status, industry, ai_category, ai_summary, help_request, created_at')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

    if (!isAdmin) query.eq('submitted_by', user.id)

    const { data: submissions } = await query as { data: any[] | null }

    const subs = submissions ?? []
    const userName = profile?.name ?? 'User'

    // Compute stats
    const stats = {
        total: subs.length,
        new: subs.filter(s => s.status === 'new').length,
        reviewed: subs.filter(s => s.status === 'reviewed').length,
        in_progress: subs.filter(s => s.status === 'in_progress').length,
        closed: subs.filter(s => s.status === 'closed').length,
        archived: subs.filter(s => s.status === 'archived').length,
        topIndustry: (() => {
            const map: Record<string, number> = {}
            for (const s of subs) if (s.industry) map[s.industry] = (map[s.industry] || 0) + 1
            const sorted = Object.entries(map).sort((a, b) => b[1] - a[1])
            return sorted[0]?.[0] ?? null
        })(),
    }

    const systemContext = buildSubmissionContext(subs, userName)

    return (
        <div className="h-full flex flex-col">
            <AiAssistant
                userName={userName}
                userId={user.id}
                systemContext={systemContext}
                stats={stats}
            />
        </div>
    )
}
