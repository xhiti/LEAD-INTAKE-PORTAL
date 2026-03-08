'use client'

import { useState } from 'react'
import { Monitor, Smartphone, Tablet, Globe, AlertCircle, Loader2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Database } from '@/lib/supabase/database.types'

type Session = Database['public']['Tables']['auth_sessions']['Row']

interface Props {
  sessions: Session[]
}

const DeviceIcon = ({ type }: { type: string | null }) => {
  if (type === 'mobile') return <Smartphone className="h-4 w-4" />
  if (type === 'tablet') return <Tablet className="h-4 w-4" />
  return <Monitor className="h-4 w-4" />
}

export function SessionsTab({ sessions: initial }: Props) {
  const [sessions, setSessions] = useState(initial)
  const [revoking, setRevoking] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  async function revokeSession(id: string) {
    setRevoking(id)
    try {
      const client = supabase as any
      await client
        .from('auth_sessions')
        .update({ is_active: false, logged_out_at: new Date().toISOString() })
        .eq('id', id)

      setSessions(prev => prev.filter(s => s.id !== id))
      toast({ title: 'Session revoked' })
    } catch {
      toast({ title: 'Failed to revoke session', variant: 'destructive' })
    } finally {
      setRevoking(null)
    }
  }

  const activeSessions = sessions.filter(s => s.is_active)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Active Sessions</CardTitle>
        <CardDescription>
          {activeSessions.length} active session{activeSessions.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <Globe className="h-8 w-8 mx-auto mb-2 opacity-30" />
            No sessions recorded yet
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map(session => (
              <div
                key={session.id}
                className="flex items-start justify-between gap-4 p-4 rounded-lg border"
              >
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <DeviceIcon type={session.device_type} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">
                        {session.browser ?? 'Unknown browser'} on {session.os ?? 'Unknown OS'}
                      </span>
                      {session.is_active && (
                        <Badge className="text-[10px] py-0 h-4 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 hover:bg-green-100">
                          Active
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10px] py-0 h-4 capitalize">
                        {session.provider}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 space-y-0.5">
                      {session.ip_address && <p>IP: {session.ip_address}</p>}
                      <p>Logged in: {formatDate(session.logged_in_at)}</p>
                      {session.logged_out_at && <p>Logged out: {formatDate(session.logged_out_at)}</p>}
                    </div>
                  </div>
                </div>
                {session.is_active && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive shrink-0"
                    onClick={() => revokeSession(session.id)}
                    disabled={revoking === session.id}
                  >
                    {revoking === session.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Revoke'}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
