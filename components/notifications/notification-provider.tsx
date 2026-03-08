'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import type { Database } from '@/lib/supabase/database.types'

type Notification = Database['public']['Tables']['notifications']['Row']

interface NotificationContextValue {
  notifications: Notification[]
  unreadCount: number
  markRead: (ids: string[]) => Promise<void>
  markAllRead: () => Promise<void>
  loading: boolean
}

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  unreadCount: 0,
  markRead: async () => { },
  markAllRead: async () => { },
  loading: true,
})

export function useNotifications() {
  return useContext(NotificationContext)
}

interface Props {
  userId: string
  children: ReactNode
}

export function NotificationProvider({ userId, children }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  const fetchNotifications = useCallback(async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(50)

    setNotifications(data ?? [])
    setLoading(false)
  }, [userId, supabase])

  useEffect(() => {
    fetchNotifications()

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification
          setNotifications(prev => [newNotif, ...prev])

          toast({
            title: newNotif.title,
            description: newNotif.body,
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, fetchNotifications, supabase, toast])

  const markRead = useCallback(async (ids: string[]) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    })
    setNotifications(prev =>
      prev.map(n => ids.includes(n.id) ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
    )
  }, [])

  const markAllRead = useCallback(async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true }),
    })
    setNotifications(prev =>
      prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
    )
  }, [])

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, loading }}>
      {children}
    </NotificationContext.Provider>
  )
}
