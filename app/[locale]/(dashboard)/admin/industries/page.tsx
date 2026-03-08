import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { IndustriesManager } from '@/components/dashboard/admin/industries-manager'
import type { Database } from '@/lib/supabase/database.types'
import { getTranslations } from 'next-intl/server'
import { PageHeader } from '@/components/layout/page-header'

import { AddIndustryButton } from '@/components/dashboard/admin/add-industry-button'

type Profile = Database['public']['Tables']['profiles']['Row']

export default async function AdminIndustriesPage({ params }: { params: { locale: string } }) {
    const { locale } = await Promise.resolve(params)
    const t = await getTranslations('industries')
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect(`/${locale}/login`)

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single() as { data: { role: Profile['role'] } | null }

    if (!profile || !['admin', 'moderator'].includes(profile.role)) redirect(`/${locale}/dashboard`)

    const { data: industries } = await supabase
        .from('industries')
        .select('*')
        .eq('is_active', true)
        .eq('is_deleted', false)
        .order('order_index', { ascending: true })

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('title')}
                description={t('subtitle')}
            >
                <AddIndustryButton label={t('add')} />
            </PageHeader>
            <IndustriesManager initialIndustries={industries ?? []} />
        </div>
    )
}
