import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { SubmissionForm } from '@/components/dashboard/submission-form'
import { getIndustriesAction } from '@/lib/actions/industries'

interface Props {
    params: {
        locale: string
        id: string
    }
}

export default async function EditSubmissionPage({ params }: Props) {
    const { locale, id } = await Promise.resolve(params)
    const t = await getTranslations('submissions')
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect(`/${locale}/login`)

    const { data: submission } = await (supabase as any)
        .from('submissions')
        .select('*')
        .eq('id', id)
        .single()

    if (!submission) return notFound()

    const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (submission.submitted_by !== user.id && profile?.role !== 'admin') {
        redirect(`/${locale}/submissions`)
    }

    const industriesResult = await getIndustriesAction()
    const industries: string[] = industriesResult.success
        ? industriesResult.data.map((i: any) => i.title)
        : ['Healthcare', 'Real Estate', 'Legal', 'Finance', 'Professional Services', 'Other']

    return (
        <SubmissionForm
            userId={user.id}
            locale={locale}
            submissionId={submission.id}
            title={t('edit.title') || 'Edit Submission'}
            description={t('edit.subtitle') || 'Update the lead information'}
            industries={industries}
            initialData={{
                name: submission.name,
                email: submission.email,
                business_name: submission.business_name,
                industry: submission.industry,
                help_request: submission.help_request,
                ai_summary: submission.ai_summary,
                ai_category: submission.ai_category,
                ai_confidence_score: submission.ai_confidence_score,
                ai_model_used: submission.ai_model_used
            }}
        />
    )
}
