import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { DashboardTopbar } from '@/components/layout/dashboard-topbar'
import { NotificationProvider } from '@/components/notifications/notification-provider'

type Profile = Database['public']['Tables']['profiles']['Row']

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string } | Promise<{ locale: string }>
}) {
  const resolvedParams = await Promise.resolve(params)
  const { locale } = resolvedParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login?error=unauthorized`)

  let { data: profile, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, avatar_url, initials, role')
    .eq('id', user.id)
    .single() as { data: Profile | null, error: any }

  // If profile is missing (PGRST116), attempt to create it using service role
  // This handles edge cases where the db trigger failed or the profile was deleted manually
  if (error && error.code === 'PGRST116') {
    const serviceClient = await createServiceClient()
    const { data: newProfile, error: insertError } = await (serviceClient as any)
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email || `${user.id}@no-email.internal`,
        name: user.user_metadata?.given_name || user.email?.split('@')[0] || 'User',
        surname: user.user_metadata?.family_name || '',
        role: 'user',
        status: 'active',
        email_verified: true,
      })
      .select('id, full_name, email, avatar_url, initials, role')
      .single() as { data: Profile | null, error: any }

    if (!insertError && newProfile) {
      profile = newProfile
      error = null
    } else {
      console.error('Failed to auto-create missing profile:', insertError)
    }
  }

  if (error || !profile) {
    console.error('Profile fetch error:', error)
    redirect(`/${locale}/login?error=profile_not_found`)
    return null
  }

  const isAdmin = profile.role === 'admin' || profile.role === 'moderator'
  let newSubmissionsCount = 0
  if (isAdmin) {
    const { count } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new')
      .eq('is_active', true)
      .eq('is_deleted', false)
    newSubmissionsCount = count ?? 0
  }

  return (
    <NotificationProvider userId={user.id}>
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-black">
        <DashboardSidebar locale={locale} role={profile.role} newSubmissionsCount={newSubmissionsCount} />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <DashboardTopbar profile={profile} locale={locale} />
          <main className="flex-1 overflow-y-auto text-foreground">
            <div className="p-6 pb-20">
              {children}
            </div>
          </main>
        </div>
      </div>
    </NotificationProvider>
  )
}
