'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Bell, BellOff, Mail, Smartphone, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Database } from '@/lib/supabase/database.types'

type Prefs = Database['public']['Tables']['notification_preferences']['Row']

interface Props {
  prefs: Prefs | null
  userId: string
}

interface PrefToggle {
  key: keyof Prefs
  label: string
  description: string
}

const IN_APP_PREFS: PrefToggle[] = [
  { key: 'in_app_new_submission', label: 'New Submissions', description: 'Get notified when a new lead is submitted' },
  { key: 'in_app_status_changes', label: 'Status Changes', description: 'Get notified when submission status changes' },
  { key: 'in_app_system_alerts', label: 'System Alerts', description: 'Important system notifications' },
  { key: 'in_app_account_updates', label: 'Account Updates', description: 'Account-related notifications' },
]

const PUSH_PREFS: PrefToggle[] = [
  { key: 'push_new_submission', label: 'New Submissions', description: 'Push notification for new leads' },
  { key: 'push_status_changes', label: 'Status Changes', description: 'Push notification for status updates' },
  { key: 'push_system_alerts', label: 'System Alerts', description: 'Push notification for system alerts' },
]

const EMAIL_PREFS: PrefToggle[] = [
  { key: 'email_new_submission', label: 'New Submissions', description: 'Email for every new submission' },
  { key: 'email_status_changes', label: 'Status Changes', description: 'Email when submission status changes' },
  { key: 'email_weekly_digest', label: 'Weekly Digest', description: 'Weekly summary email' },
]

const defaultPrefs: Partial<Prefs> = {
  in_app_new_submission: true,
  in_app_status_changes: true,
  in_app_system_alerts: true,
  in_app_account_updates: true,
  push_enabled: false,
  push_new_submission: true,
  push_status_changes: true,
  push_system_alerts: true,
  email_new_submission: false,
  email_status_changes: true,
  email_weekly_digest: false,
  dnd_enabled: false,
}

export function NotificationPrefs({ prefs: initialPrefs, userId }: Props) {
  const t = useTranslations('profile')
  const { toast } = useToast()
  const supabase = createClient()
  const [prefs, setPrefs] = useState<Partial<Prefs>>(initialPrefs ?? defaultPrefs)
  const [saving, setSaving] = useState(false)
  const [pushLoading, setPushLoading] = useState(false)

  async function updatePref(key: keyof Prefs, value: boolean) {
    const updated = { ...prefs, [key]: value }
    setPrefs(updated)
    setSaving(true)
    try {
      const client = supabase as any
      const { error } = await client
        .from('notification_preferences')
        .upsert({ user_id: userId, [key]: value }, { onConflict: 'user_id' })
      if (error) throw error
    } catch {
      toast({ title: 'Failed to save preference', variant: 'destructive' })
      setPrefs(prefs)
    } finally {
      setSaving(false)
    }
  }

  async function enablePushNotifications() {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      toast({ title: 'Push not supported', description: 'Your browser does not support push notifications.', variant: 'destructive' })
      return
    }
    setPushLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        toast({ title: 'Permission denied', description: 'Please allow notifications in your browser settings.', variant: 'destructive' })
        return
      }
      const registration = await navigator.serviceWorker.register('/sw.js')
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })
      const client = supabase as any
      await client
        .from('notification_preferences')
        .upsert({ user_id: userId, push_enabled: true, push_subscription: subscription.toJSON() }, { onConflict: 'user_id' })
      setPrefs(p => ({ ...p, push_enabled: true, push_subscription: subscription.toJSON() as any }))
      toast({ title: 'Push notifications enabled!' })
    } catch (error) {
      toast({ title: 'Failed to enable push', description: String(error), variant: 'destructive' })
    } finally {
      setPushLoading(false)
    }
  }

  async function disablePushNotifications() {
    const client = supabase as any
    await client
      .from('notification_preferences')
      .update({ push_enabled: false, push_subscription: null })
      .eq('user_id', userId)
    setPrefs(p => ({ ...p, push_enabled: false, push_subscription: null }))
    toast({ title: 'Push notifications disabled' })
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">

      {/* In-App section */}
      <GroupHeader icon={Bell} label="In-App" description="Notifications inside the dashboard" />

      {IN_APP_PREFS.map(({ key, label, description }) => (
        <ToggleRow
          key={key}
          label={label}
          description={description}
          checked={!!(prefs[key] as boolean)}
          onCheckedChange={v => updatePref(key, v)}
          disabled={saving}
        />
      ))}

      <GroupHeader icon={Smartphone} label="Push Notifications" description="Browser push, even when app is closed" />

      <div className="flex items-center justify-between px-5 py-4">
        <div className="min-w-0">
          <p className="text-sm font-medium">Enable Push</p>
          <p className="text-xs text-muted-foreground">Receive notifications even when the app is closed</p>
        </div>
        {prefs.push_enabled ? (
          <Button variant="outline" size="sm" onClick={disablePushNotifications} className="shrink-0 ml-4">
            <BellOff className="h-3.5 w-3.5" />
            Disable
          </Button>
        ) : (
          <Button size="sm" onClick={enablePushNotifications} disabled={pushLoading} className="shrink-0 ml-4">
            {pushLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bell className="h-3.5 w-3.5" />}
            Enable
          </Button>
        )}
      </div>

      {prefs.push_enabled && PUSH_PREFS.map(({ key, label, description }) => (
        <ToggleRow
          key={key}
          label={label}
          description={description}
          checked={!!(prefs[key] as boolean)}
          onCheckedChange={v => updatePref(key, v)}
          disabled={saving}
          indent
        />
      ))}

      {/* Email section */}
      <GroupHeader icon={Mail} label="Email" description="Email notification preferences" />

      {EMAIL_PREFS.map(({ key, label, description }) => (
        <ToggleRow
          key={key}
          label={label}
          description={description}
          checked={!!(prefs[key] as boolean)}
          onCheckedChange={v => updatePref(key, v)}
          disabled={saving}
        />
      ))}

      {/* Do Not Disturb */}
      <GroupHeader icon={BellOff} label="Do Not Disturb" description="Silence all notifications" />

      <ToggleRow
        label="Enable Do Not Disturb"
        description="Pause all notifications until you turn this off"
        checked={!!(prefs.dnd_enabled as boolean)}
        onCheckedChange={v => updatePref('dnd_enabled', v)}
        disabled={saving}
      />
    </div>
  )
}

function GroupHeader({ icon: Icon, label, description }: { icon: React.ElementType; label: string; description: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 bg-muted/40">
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <div>
        <p className="text-xs font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
  indent,
}: {
  label: string
  description: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
  disabled: boolean
  indent?: boolean
}) {
  return (
    <div className={cn('flex items-center justify-between gap-4 px-5 py-4', indent && 'pl-9')}>
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="shrink-0"
      />
    </div>
  )
}
