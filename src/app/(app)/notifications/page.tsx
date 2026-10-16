'use client'

import React from 'react'
import Link from 'next/link'
import {
  Bell,
  CheckCircle2,
  Search,
  MessageCircle,
  FileText,
  Bus,
  CheckCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/empty-state'
import { useAppStore } from '@/lib/data/client-store'
import { formatRelativeTime } from '@/lib/utils'

export default function NotificationsPage() {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, currentProfile } = useAppStore()

  const userNotifications = notifications.filter((n) => n.userId === currentProfile.id)
  const unreadCount = userNotifications.filter((n) => !n.isRead).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'notice':
        return <Bell className="h-4 w-4 text-primary" aria-hidden="true" />
      case 'lost_found_match':
        return <Search className="h-4 w-4 text-warning-600" aria-hidden="true" />
      case 'message':
        return <MessageCircle className="h-4 w-4 text-primary" aria-hidden="true" />
      case 'transport':
        return <Bus className="h-4 w-4 text-primary" aria-hidden="true" />
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
    }
  }

  const getDestinationLink = (n: typeof notifications[0]) => {
    if (n.resourceType === 'notice') return `/notices/${n.resourceId}`
    if (n.resourceType === 'lost_found') return '/lost-found'
    if (n.resourceType === 'transport') return '/transport'
    if (n.resourceType === 'message') return '/messages'
    return '/'
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Notification Center
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Institutional alerts, item matches, and academic updates ({unreadCount} unread)
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="outline"
            className="text-xs gap-1.5"
            onClick={markAllNotificationsAsRead}
          >
            <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Mark all read
          </Button>
        )}
      </div>

      {userNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="All caught up"
          description="You have no notifications at this time. Important examination and campus notices will appear here."
        />
      ) : (
        <div className="space-y-3">
          {userNotifications.map((notif) => (
            <Card
              key={notif.id}
              className={`p-4 border shadow-card hover:shadow-card-hover transition-all flex items-start gap-3.5 ${
                !notif.isRead
                  ? 'border-l-4 border-l-primary bg-primary/[0.02] border-border'
                  : 'bg-card border-border/80'
              }`}
            >
              <div className="p-2 rounded-md bg-muted/60 border border-border/70 shrink-0 mt-0.5">
                {getNotificationIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {!notif.isRead && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    )}
                    <p className="text-xs font-bold text-foreground leading-snug">
                      {notif.title}
                    </p>
                  </div>
                  <span className="text-2xs text-muted-foreground shrink-0 font-mono">
                    {formatRelativeTime(notif.createdAt)}
                  </span>
                </div>

                {notif.body && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {notif.body}
                  </p>
                )}

                <div className="flex items-center gap-3 pt-1">
                  <Link
                    href={getDestinationLink(notif)}
                    onClick={() => markNotificationAsRead(notif.id)}
                    className="text-2xs font-semibold text-primary hover:underline"
                  >
                    View Details &rarr;
                  </Link>

                  {!notif.isRead && (
                    <button
                      type="button"
                      onClick={() => markNotificationAsRead(notif.id)}
                      className="text-2xs text-muted-foreground hover:text-foreground font-medium"
                    >
                      Dismiss as read
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
