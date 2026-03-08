import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getNotificationsAction } from '@/lib/actions/notifications'
import { NotificationsList } from '@/components/dashboard/notifications-list'
import { PageHeader } from '@/components/layout/page-header'

export default async function NotificationsPage({
    params,
    searchParams,
}: {
    params: { locale: string } | Promise<{ locale: string }>
    searchParams: {
        page?: string
        search?: string
        type?: string
        isRead?: string
        channel?: string
        dateFrom?: string
        dateTo?: string
    } | Promise<{
        page?: string
        search?: string
        type?: string
        isRead?: string
        channel?: string
        dateFrom?: string
        dateTo?: string
    }>
}) {
    const { locale } = await Promise.resolve(params)
    const resolvedSearch = await Promise.resolve(searchParams)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect(`/${locale}/login`)

    const page = Number(resolvedSearch.page) || 1
    const filters = {
        search: resolvedSearch.search || '',
        type: resolvedSearch.type || '',
        isRead: resolvedSearch.isRead || 'all',
        channel: resolvedSearch.channel || '',
        dateFrom: resolvedSearch.dateFrom || '',
        dateTo: resolvedSearch.dateTo || '',
    }

    const [pageResult, unreadResult] = await Promise.all([
        getNotificationsAction(page, 20, filters),
        getNotificationsAction(1, 1, { isRead: 'unread' }),
    ])

    return (
        <div className="w-full pb-20 space-y-6">
            <PageHeader
                title="Notifications"
                description="All your notifications in one place. Mark them as read or jump to related content."
            />
            <NotificationsList
                initialData={pageResult.data}
                totalCount={pageResult.count}
                currentPage={page}
                initialFilters={filters}
                unreadTotal={unreadResult.count}
            />
        </div>
    )
}
