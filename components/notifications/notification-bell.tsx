'use client'

import { useState } from 'react'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { useNotifications } from './notification-provider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead, loading } = useNotifications()
  const [open, setOpen] = useState(false)

  function handleOpen(isOpen: boolean) {
    setOpen(isOpen)
    if (isOpen) {
      const unreadIds = notifications
        .filter(n => !n.is_read)
        .slice(0, 20)
        .map(n => n.id)
      if (unreadIds.length > 0) {
        markRead(unreadIds)
      }
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[480px] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3">
          <DropdownMenuLabel className="p-0 font-semibold">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllRead}>
              <CheckCheck className="mr-1 h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />

        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No notifications yet
            </div>
          ) : (
            notifications.slice(0, 20).map(notification => (
              <div
                key={notification.id}
                className={cn(
                  'px-4 py-3 border-b last:border-0 hover:bg-accent/50 transition-colors cursor-default',
                  !notification.is_read && 'bg-primary/5'
                )}
              >
                <div className="flex items-start gap-2">
                  {!notification.is_read && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                  <div className={cn('flex-1 min-w-0', notification.is_read && 'ml-4')}>
                    <p className="text-sm font-medium leading-tight truncate">{notification.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.body}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      {formatRelativeTime(notification.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
