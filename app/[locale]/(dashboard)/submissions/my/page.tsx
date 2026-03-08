import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { SubmissionsTable } from '@/components/dashboard/submissions-table'
import { getIndustriesAction } from '@/lib/actions/industries'
import { getSubmissionsAction } from '@/lib/actions/submissions'

export default async function MySubmissionsPage({
    params,
    searchParams
}: {
    params: { locale: string },
    searchParams?: { [key: string]: string | string[] | undefined }
}) {
    const { locale } = await Promise.resolve(params)
    const sParams = await Promise.resolve(searchParams || {})

    const page = Number(sParams.page) || 1
    const pageSize = Number(sParams.pageSize) || 10

    const filters = {
        searchCompany: sParams.searchCompany as string,
        status: sParams.status as string,
        category: sParams.category as string,
        industry: sParams.industry as string,
        priority: sParams.priority as string,
    }

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

    const submissionsResult = await getSubmissionsAction({
        page,
        pageSize,
        filters,
        isAdmin: false,
        userId: user.id
    })

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
                submissions={submissionsResult.success ? submissionsResult.data : []}
                totalCount={submissionsResult.success ? submissionsResult.totalCount : 0}
                totalPages={submissionsResult.success ? submissionsResult.totalPages : 0}
                currentPage={page}
                isMySubmissions={true}
                isAdmin={false}
                locale={locale}
                userId={user.id}
                industries={industries}
            />
        </div>
    )
}
