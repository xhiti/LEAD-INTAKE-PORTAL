import { getAuditLogsAction } from '@/lib/actions/audit-logs'
import { LogsTable } from '@/components/dashboard/admin/logs-table'
import { PageHeader } from '@/components/layout/page-header'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

export default async function AuditLogsPage({
    params,
    searchParams
}: {
    params: { locale: string } | Promise<{ locale: string }>
    searchParams: {
        page?: string
        search?: string
        action?: string
        entityType?: string
        dateFrom?: string
        dateTo?: string
        userSearch?: string
        role?: string
        ipSearch?: string
    } | Promise<{
        page?: string
        search?: string
        action?: string
        entityType?: string
        dateFrom?: string
        dateTo?: string
        userSearch?: string
        role?: string
        ipSearch?: string
    }>
}) {
    const resolvedParams = await Promise.resolve(params)
    const { locale } = resolvedParams
    const resolvedSearch = await Promise.resolve(searchParams)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect(`/${locale}/login`)

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single() as { data: { role: string } | null }
    if (profile?.role !== 'admin' && profile?.role !== 'moderator') {
        redirect(`/${locale}/dashboard`)
    }

    const t = await getTranslations('nav')

    const page = Number(resolvedSearch.page) || 1
    const filters = {
        search: resolvedSearch.search || '',
        action: resolvedSearch.action || '',
        entityType: resolvedSearch.entityType || '',
        dateFrom: resolvedSearch.dateFrom || '',
        dateTo: resolvedSearch.dateTo || '',
        userSearch: resolvedSearch.userSearch || '',
        role: resolvedSearch.role || '',
        ipSearch: resolvedSearch.ipSearch || '',
    }

    const { data, count } = await getAuditLogsAction(page, 20, filters)

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('logs')}
                description="Monitor system activity and changes across the platform."
            />
            <LogsTable
                initialLogs={data}
                totalCount={count}
                currentPage={page}
                initialFilters={filters}
            />
        </div>
    )
}
