import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { SubmissionManagement } from '@/components/dashboard/submission-management'
import { getSubmissionHistoryAction } from '@/lib/actions/submissions'
import type { Database } from '@/lib/supabase/database.types'

type Submission = Database['public']['Tables']['submissions']['Row']

export default async function SubmissionDetailPage({
    params
}: {
    params: { locale: string; id: string }
}) {
    const { locale, id } = params
    const t = await getTranslations('submissions')
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('id, role').eq('id', user!.id).single() as { data: { id: string, role: string } | null }
    const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator'

    const { data: submission } = await supabase
        .from('submissions')
        .select('*')
        .eq('id', id)
        .single() as { data: Submission | null }

    if (!submission) {
        notFound()
    }

    if (!isAdmin && submission.submitted_by !== user!.id) {
        notFound()
    }

    const historyRes = await getSubmissionHistoryAction(id)
    const history = historyRes.success ? historyRes.data : []

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('details')}
                description={`Submitted on ${new Date(submission.created_at).toLocaleDateString()}`}
                backHref={`/${locale}/submissions`}
                backText={t('backToSubmissions')}
            />

            <SubmissionManagement
                submission={submission}
                history={history}
                isAdmin={isAdmin}
                userId={user!.id}
                locale={locale}
            />
        </div>
    )
}
