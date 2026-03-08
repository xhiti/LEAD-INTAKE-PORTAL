import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SubmissionForm } from '@/components/dashboard/submission-form'
import { getIndustriesAction } from '@/lib/actions/industries'

export default async function NewSubmissionPage({ params }: { params: { locale: string } }) {
    const { locale } = await Promise.resolve(params)
    const t = await getTranslations('submissions')
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect(`/${locale}/login`)

    const [profileResult, industriesResult] = await Promise.all([
        (supabase as any).from('profiles').select('full_name, email, company').eq('id', user.id).single(),
        getIndustriesAction(),
    ])

    const profile = profileResult.data
    const industries: string[] = industriesResult.success
        ? industriesResult.data.map((i: any) => i.title)
        : ['Healthcare', 'Real Estate', 'Legal', 'Finance', 'Professional Services', 'Other']

    return (
        <SubmissionForm
            userId={user.id}
            locale={locale}
            title={t('new.title')}
            description={t('new.subtitle')}
            industries={industries}
            initialData={{
                name: profile?.full_name || '',
                email: profile?.email || '',
                business_name: profile?.company || ''
            }}
        />
    )
}
