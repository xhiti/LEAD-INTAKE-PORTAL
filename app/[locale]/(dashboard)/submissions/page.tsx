import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SubmissionsTable } from '@/components/dashboard/submissions-table'
import { PageHeader } from '@/components/layout/page-header'
import { getIndustriesAction } from '@/lib/actions/industries'
import type { Database } from '@/lib/supabase/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type Submission = Database['public']['Tables']['submissions']['Row']

export default async function SubmissionsPage({ params }: { params: { locale: string } }) {
  const { locale } = await Promise.resolve(params)
  const t = await getTranslations('submissions')
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('id, role').eq('id', user!.id).single() as { data: Profile | null }

  const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator'

  let query = supabase
    .from('submissions')
    .select('*')
    .eq('is_active', true)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  if (!isAdmin) {
    query = query.eq('submitted_by', user!.id)
  }

  const { data: submissions } = await query as { data: Submission[] | null }

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
        submissions={submissions ?? []}
        isAdmin={isAdmin}
        locale={locale}
        userId={user!.id}
        industries={industries}
      />
    </div>
  )
}
