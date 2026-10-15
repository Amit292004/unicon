'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Bell,
  Search,
  Settings,
  LogOut,
  User,
  Bookmark,
  ChevronDown,
  Inbox,
  CheckCheck,
  Sparkles,
  ArrowRight,
  X,
  MessageCircle,
  FileText,
  Bus,
} from 'lucide-react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { UserAvatar } from '@/components/shared/user-avatar'
import { Button } from '@/components/ui/button'
import { cn, formatRelativeTime } from '@/lib/utils'
import { useAppStore } from '@/lib/data/client-store'
import { subscribeRealtime } from '@/lib/realtime'
import type { Profile, Notification } from '@/types'
import { useState, useRef, useEffect } from 'react'

interface HeaderProps {
  profile: Profile
  unreadNotifications?: number
}

export function Header({ profile, unreadNotifications = 0 }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [liveToast, setLiveToast] = useState<{ title: string; body: string } | null>(null)
  const [ringAnimation, setRingAnimation] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    addNotification,
    logout,
  } = useAppStore()

  // Real-time notifications for the current profile
  const userNotifications = notifications.filter((n) => n.userId === profile.id)
  const unreadCount = userNotifications.filter((n) => !n.isRead).length

  // Listen for real-time events across tabs/actions
  useEffect(() => {
    const unsubscribe = subscribeRealtime((event) => {
      if (event.type === 'NOTIFICATION_ADDED') {
        const { title, body, userId } = event.payload
        if (!userId || userId === profile.id) {
          setRingAnimation(true)
          setLiveToast({ title, body })
          setTimeout(() => setRingAnimation(false), 2000)
          setTimeout(() => setLiveToast(null), 4500)
        }
      }
    })
    return () => unsubscribe()
  }, [profile.id])

  // Close menus on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient()
        await supabase.auth.signOut()
      }
    } catch {
      // Ignore if supabase not configured
    }
    logout()
    router.push('/login')
    router.refresh()
  }

  const getDestinationLink = (n: Notification) => {
    if (n.resourceType === 'notice') return `/notices/${n.resourceId}`
    if (n.resourceType === 'lost_found') return '/lost-found'
    if (n.resourceType === 'transport') return '/transport'
    if (n.resourceType === 'message') return '/messages'
    return '/notifications'
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'notice':
        return <Bell className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
      case 'lost_found_match':
      case 'claim_received':
      case 'claim_accepted':
        return <Search className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
      case 'message':
        return <MessageCircle className="h-3.5 w-3.5 text-blue-500" aria-hidden="true" />
      case 'transport':
        return <Bus className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
      default:
        return <FileText className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
    }
  }

  const handleSimulateAlert = () => {
    const alerts = [
      {
        title: 'Transit Alert: Bus CC-01 Delay',
        body: 'Morning transport dispatch reports a 10 min hold at Circuit House stop.',
        type: 'transport',
        resourceType: 'transport',
        resourceId: 'bus-001',
      },
      {
        title: 'New Exam Cell Circular',
        body: 'Revised schedule for Unit 3 evaluation published on the notice board.',
        type: 'notice',
        resourceType: 'notice',
        resourceId: 'not-001',
      },
      {
        title: 'Lost Item Match Verified',
        body: 'A student uploaded a potential match for the Casio fx-991EX calculator.',
        type: 'lost_found_match',
        resourceType: 'lost_found',
        resourceId: 'lf-002',
      },
    ]
    const randomAlert = alerts[Math.floor(Math.random() * alerts.length)]
    addNotification({
      userId: profile.id,
      title: randomAlert.title,
      body: randomAlert.body,
      type: randomAlert.type,
      resourceType: randomAlert.resourceType,
      resourceId: randomAlert.resourceId,
    })
  }

  return (
    <>
      {/* Live Toast Banner for real-time notifications */}
      {liveToast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-card/95 border border-primary/30 shadow-modal rounded-xl p-3.5 flex items-start gap-3 backdrop-blur-md animate-in slide-in-from-top-3 duration-300">
          <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0">
            <Bell className="h-4 w-4 animate-bounce" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0 space-y-0.5">
            <p className="text-xs font-bold text-foreground leading-tight flex items-center gap-1.5">
              <span>{liveToast.title}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
            </p>
            <p className="text-2xs text-muted-foreground line-clamp-2 leading-relaxed">
              {liveToast.body}
            </p>
          </div>
          <button
            onClick={() => setLiveToast(null)}
            className="text-muted-foreground hover:text-foreground shrink-0 p-1"
            aria-label="Dismiss alert"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <header
        className="h-[60px] border-b bg-card/80 backdrop-blur-sm sticky top-0 z-20 flex items-center px-4 gap-3"
        role="banner"
      >
        {/* Mobile brand */}
        <Link href="/home" className="lg:hidden flex items-center gap-2">
          <Image
            src="/unicon-logo.png"
            alt="UNICON"
            width={110}
            height={24}
            className="h-6 w-auto object-contain dark:brightness-110"
            priority
          />
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* College badge */}
        <span className="hidden sm:block text-xs text-muted-foreground border rounded-full px-3 py-1 truncate max-w-[180px]">
          {profile.college?.name ?? 'My College'}
        </span>

        {/* Search */}
        <Link href="/search">
          <Button variant="ghost" size="icon" aria-label="Search">
            <Search className="h-4.5 w-4.5" aria-hidden="true" />
          </Button>
        </Link>

        {/* Real-Time Interactive Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotifOpen(!notifOpen)}
            className={cn('relative', ringAnimation && 'animate-wiggle')}
            aria-label={`Real-time notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            aria-expanded={notifOpen}
          >
            <Bell className={cn('h-4.5 w-4.5', ringAnimation && 'text-primary')} aria-hidden="true" />
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 h-4 min-w-4 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-2xs px-1 font-bold animate-pulse shadow-sm"
                aria-hidden="true"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>

          {/* Real-Time Dropdown Popover */}
          {notifOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border bg-card/95 backdrop-blur-md shadow-modal animate-in fade-in slide-in-from-top-2 duration-150 z-50 overflow-hidden"
              role="region"
              aria-label="Real-time notifications center"
            >
              {/* Dropdown Header */}
              <div className="p-3 border-b flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-foreground">Notifications</h3>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-3xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Live Sync
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-2xs text-primary hover:underline font-medium flex items-center gap-1"
                    >
                      <CheckCheck className="h-3 w-3" />
                      Mark all read
                    </button>
                  )}
                </div>
              </div>

              {/* Notification List */}
              <div className="max-h-[340px] overflow-y-auto divide-y divide-border/60">
                {userNotifications.length === 0 ? (
                  <div className="p-6 text-center space-y-1">
                    <p className="text-xs font-medium text-foreground">All caught up</p>
                    <p className="text-2xs text-muted-foreground">
                      No notifications right now. New campus alerts will appear here in real-time.
                    </p>
                  </div>
                ) : (
                  userNotifications.slice(0, 6).map((notif) => {
                    const destination = getDestinationLink(notif)
                    return (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationAsRead(notif.id)
                          setNotifOpen(false)
                          router.push(destination)
                        }}
                        className={cn(
                          'p-3 flex items-start gap-2.5 hover:bg-accent/60 transition-colors cursor-pointer text-left',
                          !notif.isRead && 'bg-primary/5'
                        )}
                      >
                        <div className="p-1.5 rounded-full bg-secondary shrink-0 mt-0.5">
                          {getNotificationIcon(notif.type)}
                        </div>

                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-foreground truncate">
                              {notif.title}
                            </p>
                            <span className="text-3xs text-muted-foreground shrink-0 font-mono">
                              {formatRelativeTime(notif.createdAt)}
                            </span>
                          </div>
                          {notif.body && (
                            <p className="text-2xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {notif.body}
                            </p>
                          )}
                        </div>

                        {!notif.isRead && (
                          <span
                            className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5"
                            title="Unread"
                          />
                        )}
                      </div>
                    )
                  })
                )}
              </div>

              {/* Dropdown Footer */}
              <div className="p-2 border-t bg-muted/20 flex items-center justify-between text-2xs">
                <button
                  onClick={handleSimulateAlert}
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-accent"
                  title="Simulate incoming real-time alert"
                >
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  Simulate Live Alert
                </button>

                <Link
                  href="/notifications"
                  onClick={() => setNotifOpen(false)}
                  className="font-semibold text-primary hover:underline flex items-center gap-1 px-2 py-1"
                >
                  View All ({userNotifications.length})
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Messages (mobile) */}
        <Link href="/messages" className="lg:hidden">
          <Button variant="ghost" size="icon" aria-label="Messages">
            <Inbox className="h-4.5 w-4.5" aria-hidden="true" />
          </Button>
        </Link>

        {/* Profile Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={cn(
              'flex items-center gap-1.5 rounded-full pl-0.5 pr-2 py-0.5 hover:bg-accent transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Profile menu"
          >
            <UserAvatar name={profile.fullName} avatarUrl={profile.avatarUrl} size="sm" />
            <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', menuOpen && 'rotate-180')} aria-hidden="true" />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-52 rounded-lg border bg-card shadow-modal animate-fade-in z-50"
              role="menu"
              aria-label="Profile options"
            >
              {/* Profile info */}
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-semibold text-foreground">{profile.fullName}</p>
                <p className="text-xs text-muted-foreground">@{profile.username}</p>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <Link
                  href={`/profile/${profile.username}`}
                  className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent transition-colors"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                >
                  <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  View Profile
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent transition-colors"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                >
                  <Settings className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  Settings
                </Link>
                <Link
                  href="/saved"
                  className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent transition-colors"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                >
                  <Bookmark className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  Saved Items
                </Link>
              </div>

              <div className="border-t py-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-destructive-600 hover:bg-destructive-50 transition-colors"
                  role="menuitem"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  )
}
