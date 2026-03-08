import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { PageHeader } from '@/components/layout/page-header'
import { DashboardView } from '@/components/dashboard/dashboard-view'
import { subDays, subMonths, subYears, startOfDay, format, startOfWeek } from 'date-fns'
import { PeriodSelector } from '@/components/dashboard/period-selector'


export type Period = '7d' | '30d' | '3m' | '6m' | '1y'

function getPeriodStart(period: Period): Date {
  const now = new Date()
  switch (period) {
    case '7d': return startOfDay(subDays(now, 6))
    case '30d': return startOfDay(subDays(now, 29))
    case '3m': return startOfDay(subMonths(now, 3))
    case '6m': return startOfDay(subMonths(now, 6))
    case '1y': return startOfDay(subYears(now, 1))
  }
}

type Bucket = { date: string; submissions: number; _key: string }

function getBuckets(period: Period, start: Date): Bucket[] {
  const now = new Date()
  const buckets: Bucket[] = []

  if (period === '7d' || period === '30d') {
    let cur = new Date(start)
    while (cur <= now) {
      const key = format(cur, 'yyyy-MM-dd')
      const label = format(cur, 'MMM d')
      buckets.push({ date: label, submissions: 0, _key: key })
      cur = new Date(cur.getTime() + 86400000)
    }
  } else if (period === '3m' || period === '6m') {
    let cur = startOfWeek(new Date(start), { weekStartsOn: 1 })
    while (cur <= now) {
      const key = format(cur, 'yyyy-ww')
      const label = format(cur, 'MMM d')
      buckets.push({ date: label, submissions: 0, _key: key })
      cur = new Date(cur.getTime() + 7 * 86400000)
    }
  } else {
    let cur = new Date(start.getFullYear(), start.getMonth(), 1)
    while (cur <= now) {
      const key = format(cur, 'yyyy-MM')
      const label = format(cur, 'MMM yy')
      buckets.push({ date: label, submissions: 0, _key: key })
      const next = new Date(cur)
      next.setMonth(next.getMonth() + 1)
      cur = next
    }
  }
  return buckets
}

function getSubKey(period: Period, dateStr: string): string {
  const d = new Date(dateStr)
  if (period === '7d' || period === '30d') return format(d, 'yyyy-MM-dd')
  if (period === '3m' || period === '6m') return format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-ww')
  return format(d, 'yyyy-MM')
}

type Props = {
  params: { locale: string }
  searchParams: { period?: string }
}

export default async function DashboardPage({ params, searchParams }: Props) {
  const { locale } = await Promise.resolve(params)
  const t = await getTranslations('dashboard')
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await (supabase as any)
    .from('profiles').select('role, name, surname, avatar_url, initials').eq('id', user!.id).single()

  const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator'
  const period = (['7d', '30d', '3m', '6m', '1y'].includes(searchParams?.period ?? '') ? searchParams.period : '7d') as Period
  const periodStart = getPeriodStart(period)
  const periodStartISO = periodStart.toISOString()

  const client = supabase as any

  const base = () => {
    return client.from('submissions').select('*', { count: 'exact', head: true }).eq('is_deleted', false).eq('submitted_by', user!.id)
  }

  const [totalAllTime, totalInPeriod, pendingCount, resolvedInPeriod] = await Promise.all([
    base().then((r: any) => r.count ?? 0),
    base().gte('created_at', periodStartISO).then((r: any) => r.count ?? 0),
    base().in('status', ['pending', 'new']).then((r: any) => r.count ?? 0),
    base().gte('created_at', periodStartISO).in('status', ['resolved', 'closed', 'completed']).then((r: any) => r.count ?? 0),
  ])

  let chartQ = client.from('submissions')
    .select('id, status, priority, industry, ai_category, created_at')
    .eq('is_active', true)
    .eq('is_deleted', false)
    .gte('created_at', periodStartISO)
    .order('created_at', { ascending: true })
    .eq('submitted_by', user!.id)
  const { data: allInPeriod = [] } = await chartQ

  const rawBuckets = getBuckets(period, periodStart)
  const bucketMap = new Map(rawBuckets.map(b => [b._key, b]))
  for (const sub of allInPeriod ?? []) {
    const key = getSubKey(period, sub.created_at)
    const bucket = bucketMap.get(key)
    if (bucket) bucket.submissions++
  }
  const timeSeries = rawBuckets.map(b => ({ date: b.date, submissions: b.submissions }))

  const byStatus: Record<string, number> = {}
  const byCategory: Record<string, number> = {}
  const byIndustry: Record<string, number> = {}
  for (const sub of allInPeriod ?? []) {
    if (sub.status) byStatus[sub.status] = (byStatus[sub.status] ?? 0) + 1
    if (sub.ai_category) byCategory[sub.ai_category] = (byCategory[sub.ai_category] ?? 0) + 1
    if (sub.industry) byIndustry[sub.industry] = (byIndustry[sub.industry] ?? 0) + 1
  }

  let recentQ = client.from('submissions')
    .select('id, name, business_name, industry, ai_category, ai_summary, status, priority, created_at')
    .eq('is_active', true)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .eq('submitted_by', user!.id)
    .limit(8)
  const { data: recentSubmissions = [] } = await recentQ

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={`Welcome back, ${profile?.name ?? 'there'}! Here's your overview.`}
      >
        <PeriodSelector current={period} />
      </PageHeader>
      <DashboardView
        period={period}
        locale={locale}
        isAdmin={isAdmin}
        stats={{ totalAllTime, totalInPeriod, pendingCount, resolvedInPeriod }}
        timeSeries={timeSeries}
        byStatus={byStatus}
        byCategory={byCategory}
        byIndustry={byIndustry}
        recentSubmissions={recentSubmissions ?? []}
      />
    </div>
  )
}
