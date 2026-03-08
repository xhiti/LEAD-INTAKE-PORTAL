import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NotificationPrefs } from '@/components/dashboard/notification-prefs'
import { AccountDangerZone } from '@/components/dashboard/account-danger-zone'
import { AppearanceCard } from '@/components/dashboard/appearance-card'
import { Palette, Bell, ShieldAlert } from 'lucide-react'

export default async function SettingsPage({ params }: { params: { locale: string } }) {
    const { locale } = await Promise.resolve(params)
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect(`/${locale}/login`)

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    const { data: prefs } = await supabase.from('notification_preferences').select('*').eq('user_id', user.id).single()

    if (!profile) redirect(`/${locale}/login`)

    return (
        <div className="w-full pb-20 space-y-10">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage your appearance, notifications, and account security.
                </p>
            </div>

            <section className="space-y-3">
                <SectionLabel icon={Palette} label="Appearance" />
                <AppearanceCard />
            </section>

            <section className="space-y-3">
                <SectionLabel icon={Bell} label="Notifications" />
                <NotificationPrefs prefs={prefs} userId={user.id} />
            </section>

            <section className="space-y-3">
                <SectionLabel icon={ShieldAlert} label="Danger Zone" danger />
                <AccountDangerZone userId={user.id} />
            </section>
        </div>
    )
}

function SectionLabel({
    icon: Icon,
    label,
    danger,
}: {
    icon: React.ElementType
    label: string
    danger?: boolean
}) {
    return (
        <div className="flex items-center gap-2">
            <Icon className={`h-3.5 w-3.5 ${danger ? 'text-destructive' : 'text-muted-foreground'}`} />
            <span className={`text-xs font-semibold uppercase tracking-widest ${danger ? 'text-destructive' : 'text-muted-foreground'}`}>
                {label}
            </span>
        </div>
    )
}
