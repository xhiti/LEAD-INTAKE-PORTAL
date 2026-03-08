import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SubmissionsTable } from '@/components/dashboard/submissions-table'
import { PageHeader } from '@/components/layout/page-header'
import { getSubmissionsAction, deleteSubmissionAction } from '@/lib/actions/submissions'
import { getIndustriesAction } from '@/lib/actions/industries'
import type { Database } from '@/lib/supabase/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type Submission = Database['public']['Tables']['submissions']['Row']

export default async function SubmissionsPage({
  params,
  searchParams
}: {
  params: { locale: string },
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const { locale } = await Promise.resolve(params)
  // Ensure searchParams is handled safely in Next.js 15
  const sParams = await Promise.resolve(searchParams || {})

  const page = Number(sParams.page) || 1
  const pageSize = Number(sParams.pageSize) || 10

  const filters = {
    searchName: sParams.searchName as string,
    searchSurname: sParams.searchSurname as string,
    searchCompany: sParams.searchCompany as string,
    status: sParams.status as string,
    category: sParams.category as string,
    industry: sParams.industry as string,
    priority: sParams.priority as string,
    fromDate: sParams.fromDate as string,
    toDate: sParams.toDate as string,
  }

  const t = await getTranslations('submissions')
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('id, role').eq('id', user!.id).single() as { data: Profile | null }

  const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator'

  const submissionsResult = await getSubmissionsAction({
    page,
    pageSize,
    filters,
    isAdmin,
    userId: user!.id
  })

  const industriesResult = await getIndustriesAction()
  const industries: string[] = industriesResult.success
    ? industriesResult.data.map((i: any) => i.title)
    : ['Healthcare', 'Real Estate', 'Legal', 'Finance', 'Professional Services', 'Other']

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={isAdmin ? 'All submissions across the platform' : 'Your submitted requests'}
      >
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
          <Link href={`/${locale}/submissions/new`}>
            <Plus className="h-4 w-4" />
            {t('new.button')}
          </Link>
        </Button>
      </PageHeader>
      <SubmissionsTable
        submissions={submissionsResult.success ? submissionsResult.data : []}
        totalCount={submissionsResult.success ? submissionsResult.totalCount : 0}
        totalPages={submissionsResult.success ? submissionsResult.totalPages : 0}
        currentPage={page}
        isAdmin={isAdmin}
        locale={locale}
        userId={user!.id}
        industries={industries}
      />
    </div>
  )
}
