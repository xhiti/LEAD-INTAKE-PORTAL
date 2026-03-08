import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { SubmissionsTable } from '@/components/dashboard/submissions-table'
import { getIndustriesAction } from '@/lib/actions/industries'

export default async function MySubmissionsPage({ params }: { params: { locale: string } }) {
    const { locale } = await Promise.resolve(params)
    const t = await getTranslations('submissions')
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect(`/${locale}/login`)

    const { data: profile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', user.id)
        .maybeSingle()

    if (!profile) redirect(`/${locale}/login`)

    const { data: submissions } = await supabase
        .from('submissions')
        .select('*')
        .eq('submitted_by', user.id)
        .eq('is_active', true)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

    const industriesResult = await getIndustriesAction()
    const industries: string[] = industriesResult.success
        ? industriesResult.data.map((i: any) => i.title)
        : ['Healthcare', 'Real Estate', 'Legal', 'Finance', 'Professional Services', 'Other']

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">{t('mySubmissions')}</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    {t('mySubmissionsSubtitle')}
                </p>
            </div>
            <SubmissionsTable
                submissions={submissions ?? []}
                isMySubmissions={true}
                isAdmin={false}
                locale={locale}
                userId={user.id}
                industries={industries}
            />
        </div>
    )
}
