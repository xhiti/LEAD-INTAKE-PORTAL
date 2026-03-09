import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { SubmissionsTable } from '@/components/dashboard/submissions-table'
import { PageHeader } from '@/components/layout/page-header'
import { getSubmissionsAction } from '@/lib/actions/submissions'
import { getIndustriesAction } from '@/lib/actions/industries'
import type { Database } from '@/lib/supabase/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

export default async function NewSubmissionsInboxPage({
  params,
  searchParams,
}: {
  params: { locale: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const { locale } = await Promise.resolve(params)
  const sParams = await Promise.resolve(searchParams || {})

  const page = Number(sParams.page) || 1
  const pageSize = Number(sParams.pageSize) || 10

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user!.id)
    .single() as { data: Profile | null }

  const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator'
  if (!isAdmin) redirect(`/${locale}/dashboard`)

  const submissionsResult = await getSubmissionsAction({
    page,
    pageSize,
    filters: { status: 'new' },
    isAdmin: true,
    userId: user!.id,
  })

  const industriesResult = await getIndustriesAction()
  const industries: string[] = industriesResult.success
    ? industriesResult.data.map((i: any) => i.title)
    : ['Healthcare', 'Real Estate', 'Legal', 'Finance', 'Professional Services', 'Other']

  const t = await getTranslations('nav')

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('newSubmissions')}
        description="Unreviewed submissions awaiting action"
      />
      <SubmissionsTable
        submissions={submissionsResult.success ? submissionsResult.data : []}
        totalCount={submissionsResult.success ? submissionsResult.totalCount : 0}
        totalPages={submissionsResult.success ? submissionsResult.totalPages : 0}
        currentPage={page}
        isAdmin={true}
        locale={locale}
        userId={user!.id}
        industries={industries}
        hideStatusFilter
      />
    </div>
  )
}
