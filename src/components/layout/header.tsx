'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
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
  ArrowRight,
  X,
  MessageCircle,
  FileText,
  Bus,
  Download,
  Building2,
  ShieldCheck,
  Menu,
  Home,
  BookOpen,
  ClipboardList,
  Users,
  HelpCircle,
  LayoutGrid,
} from 'lucide-react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { UserAvatar } from '@/components/shared/user-avatar'
import { Button } from '@/components/ui/button'
import { cn, formatRelativeTime } from '@/lib/utils'
import { useAppStore } from '@/lib/data/client-store'
import { subscribeRealtime } from '@/lib/realtime'
import { usePwa } from '@/lib/pwa-context'
import { DownloadAppButton } from '@/components/pwa/download-app-button'
import type { Profile, Notification } from '@/types'
import { useState, useRef, useEffect } from 'react'
import { canAccessAdminPanel } from '@/lib/auth/roles'

export const TOP_NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/notices', label: 'Notices', icon: Bell },
  { href: '/academics', label: 'Academics', icon: BookOpen },
  { href: '/transport', label: 'Transport', icon: Bus },
  { href: '/lost-found', label: 'Lost & Found', icon: Search },
  { href: '/notes', label: 'Notes', icon: FileText },
  { href: '/pyqs', label: 'PYQs', icon: ClipboardList },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/ask-campus', label: 'Ask Campus', icon: HelpCircle },
  { href: '/messages', label: 'Messages', icon: Inbox },
] as const

interface HeaderProps {
  profile?: Profile
  unreadNotifications?: number
}

export function Header({ profile, unreadNotifications = 0 }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [liveToast, setLiveToast] = useState<{ title: string; body: string } | null>(null)
  const [ringAnimation, setRingAnimation] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    addNotification,
    logout,
    currentProfile,
  } = useAppStore()

  const { openInstallModal } = usePwa()

  // Gracefully fallback profile to prevent any runtime issues
  const activeProfile = profile || currentProfile || {
    id: 'user-001',
    fullName: 'Student User',
    username: 'student',
    email: 'student@campus.edu',
    role: 'student' as const,
    collegeId: 'col-001',
    avatarUrl: null,
    rollNumber: 'STU-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  // Real-time notifications for the current profile
  const userNotifications = notifications.filter((n) => n.userId === activeProfile.id)
  const unreadCount = userNotifications.filter((n) => !n.isRead).length

  // Listen for real-time events across tabs/actions
  useEffect(() => {
    const unsubscribe = subscribeRealtime((event) => {
      if (event.type === 'NOTIFICATION_ADDED') {
        const { title, body, userId } = event.payload
        if (!userId || userId === activeProfile.id) {
          setRingAnimation(true)
          setLiveToast({ title, body })
          setTimeout(() => setRingAnimation(false), 2000)
          setTimeout(() => setLiveToast(null), 4500)
        }
      }
    })
    return () => unsubscribe()
  }, [activeProfile.id])

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setMenuOpen(false)
    setNotifOpen(false)
  }, [pathname])

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
      userId: activeProfile.id,
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
        <div className="fixed top-3 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-sm sm:w-full z-50 bg-card/95 border border-border/80 shadow-dropdown rounded-lg p-3 flex items-start gap-3 backdrop-blur-md animate-fade-in">
          <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
            <Bell className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0 space-y-0.5">
            <p className="text-xs font-semibold text-foreground leading-tight flex items-center gap-1.5">
              <span>{liveToast.title}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </p>
            <p className="text-2xs text-muted-foreground line-clamp-2 leading-relaxed">
              {liveToast.body}
            </p>
          </div>
          <button
            onClick={() => setLiveToast(null)}
            className="text-muted-foreground hover:text-foreground shrink-0 p-1 rounded hover:bg-secondary transition-colors cursor-pointer"
            aria-label="Dismiss alert"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Main Header Container with Top Row + Nav Bar */}
      <header
        className="sticky top-0 z-30 border-b border-border/80 bg-card/90 backdrop-blur-md"
        role="banner"
      >
        {/* Top Header Row */}
        <div className="h-[56px] sm:h-[58px] flex items-center justify-between px-3 sm:px-6 gap-2">
          {/* Left: Mobile Drawer Trigger + Brand + College */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 min-w-0">
            {/* Mobile Hamburger Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 -ml-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
              aria-label="Open campus navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* Mobile & Tablet UNICON Logo (Visible when desktop sidebar is hidden) */}
            <Link href="/" className="lg:hidden flex items-center gap-1.5 shrink-0">
              <Image
                src="/unicon-logo.png"
                alt="UNICON"
                width={110}
                height={26}
                className="h-6 sm:h-7 w-auto object-contain dark:brightness-110"
                style={{ height: '24px', width: 'auto' }}
                priority
              />
            </Link>

            {/* College Badge */}
            <div className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground border border-border/70 bg-secondary/40 rounded-md px-2.5 py-1 truncate max-w-[160px] md:max-w-[220px]">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" aria-hidden="true" />
              <span className="truncate">{activeProfile.college?.name ?? 'My College'}</span>
            </div>
          </div>

          {/* Center: Desktop Navigation Quick Links */}
          <nav className="hidden xl:flex items-center gap-1 min-w-0 px-2" aria-label="Desktop quick navigation">
            {TOP_NAV_ITEMS.slice(0, 5).map(({ href, label, icon: Icon }) => {
              const isActive = href === '/' ? pathname === '/' : (pathname === href || pathname.startsWith(href))
              return (
                <Link
                  key={href}
                  href={href}
                  prefetch={false}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap',
                    isActive
                      ? 'bg-secondary text-foreground font-semibold border border-border/70 shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                  )}
                >
                  <Icon className={cn('h-3.5 w-3.5', isActive ? 'text-primary' : 'text-muted-foreground')} />
                  <span>{label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right Action Items: Download App, Search, Notifications, Messages, Profile (Always visible, shrink-0) */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <DownloadAppButton variant="header" showWhenInstalled className="hidden sm:inline-flex" />

            {/* Search */}
            <Link href="/search" className="shrink-0">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Search"
                className="h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-foreground"
              >
                <Search className="h-4 w-4 sm:h-4.5 sm:w-4.5" aria-hidden="true" />
              </Button>
            </Link>

            {/* Real-Time Interactive Notifications Dropdown */}
            <div className="relative shrink-0" ref={notifRef}>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-foreground"
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                aria-expanded={notifOpen}
              >
                <Bell className="h-4 w-4 sm:h-4.5 sm:w-4.5" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span
                    className="absolute top-0.5 right-0.5 h-3.5 min-w-3.5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-3xs px-1 font-bold shadow-subtle"
                    aria-hidden="true"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>

              {/* Mobile backdrop for notifications */}
              {notifOpen && (
                <div
                  className="sm:hidden fixed inset-0 z-40 bg-black/25 backdrop-blur-2xs"
                  onClick={() => setNotifOpen(false)}
                  aria-hidden="true"
                />
              )}

              {/* Real-Time Dropdown Popover */}
              {notifOpen && (
                <div
                  className="fixed sm:absolute top-[60px] sm:top-full left-2 right-2 sm:left-auto sm:right-0 mt-0 sm:mt-2 w-auto sm:w-96 max-w-[calc(100vw-16px)] sm:max-w-none rounded-lg border border-border/80 bg-card shadow-dropdown z-50 overflow-hidden"
                  role="region"
                  aria-label="Notifications center"
                >
                  {/* Dropdown Header */}
                  <div className="p-3 border-b flex items-center justify-between bg-muted/20">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-semibold text-foreground">Notifications</h3>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-3xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Live
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
                      className="text-3xs text-muted-foreground/75 hover:text-foreground transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-secondary font-mono"
                      title="Simulate incoming real-time alert for testing"
                    >
                      <Bell className="h-3 w-3 text-primary/70" />
                      Test Live Push
                    </button>

                    <Link
                      href="/notifications"
                      onClick={() => setNotifOpen(false)}
                      className="font-medium text-primary hover:underline flex items-center gap-1 px-2 py-1 text-xs"
                    >
                      All Alerts ({userNotifications.length})
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Messages Inbox */}
            <Link href="/messages" className="shrink-0">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Messages"
                className="relative h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-foreground"
              >
                <Inbox className="h-4 w-4 sm:h-4.5 sm:w-4.5" aria-hidden="true" />
              </Button>
            </Link>

            {/* Profile Menu: PROMINENT, ACCESSIBLE & NEVER REMOVED */}
            <div className="relative shrink-0 pl-0.5" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={cn(
                  'flex items-center gap-1 sm:gap-1.5 rounded-full p-0.5 sm:px-1 sm:py-0.5 hover:bg-secondary transition-colors border border-transparent hover:border-border/70',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer shrink-0'
                )}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="User profile menu"
                title={`${activeProfile.fullName} (@${activeProfile.username})`}
              >
                <UserAvatar
                  name={activeProfile.fullName}
                  avatarUrl={activeProfile.avatarUrl}
                  size="sm"
                  className="h-7.5 w-7.5 sm:h-8 sm:w-8 ring-1 ring-border/80"
                />
                <ChevronDown
                  className={cn(
                    'h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground transition-transform duration-150',
                    menuOpen && 'rotate-180'
                  )}
                  aria-hidden="true"
                />
              </button>

              {/* Mobile backdrop for profile menu */}
              {menuOpen && (
                <div
                  className="sm:hidden fixed inset-0 z-40 bg-black/25 backdrop-blur-2xs"
                  onClick={() => setMenuOpen(false)}
                  aria-hidden="true"
                />
              )}

              {menuOpen && (
                <div
                  className="fixed sm:absolute top-[60px] sm:top-full right-2 sm:right-0 mt-0 sm:mt-2 w-64 sm:w-56 max-w-[calc(100vw-16px)] rounded-lg border border-border/80 bg-card shadow-dropdown animate-fade-in z-50 overflow-hidden"
                  role="menu"
                  aria-label="Profile options"
                >
                  {/* Profile info */}
                  <div className="px-3.5 py-3 border-b bg-secondary/30">
                    <p className="text-xs font-semibold text-foreground truncate">{activeProfile.fullName}</p>
                    <p className="text-3xs text-muted-foreground font-mono mt-0.5 truncate">
                      @{activeProfile.username} &bull; {activeProfile.rollNumber || 'Student'}
                    </p>
                  </div>

                  {/* Menu items */}
                  <div className="py-1 px-1 space-y-0.5">
                    <Link
                      href={`/profile/${activeProfile.username}`}
                      className="flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary rounded-md transition-colors"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                    >
                      <User className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                      My Campus Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary rounded-md transition-colors"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Settings className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                      Account Settings
                    </Link>
                    <Link
                      href="/saved"
                      className="flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary rounded-md transition-colors"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Bookmark className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                      Saved Posts &amp; Notes
                    </Link>
                    {canAccessAdminPanel(activeProfile) && (
                      <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary rounded-md transition-colors"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                        Admin Console
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false)
                        openInstallModal()
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary rounded-md transition-colors text-left cursor-pointer"
                      role="menuitem"
                    >
                      <Download className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                      Install Web App
                    </button>
                  </div>

                  <div className="border-t py-1 px-1">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-destructive-600 hover:bg-destructive-50 dark:hover:bg-destructive-950/40 rounded-md transition-colors cursor-pointer"
                      role="menuitem"
                    >
                      <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer (Accessible from the hamburger Menu button in the top header) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            className="relative z-50 bg-card border-t border-border/80 rounded-t-2xl p-4 pb-8 safe-bottom shadow-modal space-y-3 animate-slide-up max-h-[85dvh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Campus modules menu"
          >
            {/* Grab Handle */}
            <div className="w-9 h-1 rounded-full bg-muted-foreground/30 mx-auto -mt-1 mb-2" aria-hidden="true" />

            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-primary" aria-hidden="true" />
                <h3 className="font-semibold text-xs tracking-tight text-foreground uppercase">Campus Navigation</h3>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="h-7 w-7 rounded-md hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* User Profile summary in drawer */}
            <div className="p-2.5 rounded-lg border border-border/70 bg-secondary/30 flex items-center justify-between">
              <Link
                href={`/profile/${activeProfile.username}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 min-w-0 flex-1"
              >
                <UserAvatar name={activeProfile.fullName} avatarUrl={activeProfile.avatarUrl} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground truncate">{activeProfile.fullName}</p>
                  <p className="text-3xs text-muted-foreground font-mono truncate">@{activeProfile.username}</p>
                </div>
              </Link>
              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs text-primary font-medium px-2 py-1 rounded hover:bg-secondary transition-colors shrink-0"
              >
                Settings
              </Link>
            </div>

            <div className="grid grid-cols-1 min-[340px]:grid-cols-2 gap-2 pt-1">
              {TOP_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const isActive = href === '/' ? pathname === '/' : (pathname === href || pathname.startsWith(href))
                return (
                  <Link
                    key={href}
                    href={href}
                    prefetch={false}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-lg border text-left transition-colors',
                      isActive
                        ? 'bg-secondary border-primary/40 text-foreground font-semibold shadow-subtle'
                        : 'bg-secondary/30 hover:bg-secondary border-border/60 text-foreground'
                    )}
                  >
                    <div
                      className={cn(
                        'h-7 w-7 rounded-md flex items-center justify-center shrink-0 border',
                        isActive
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card border-border/70 text-muted-foreground'
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-medium truncate">{label}</span>
                  </Link>
                )
              })}
            </div>

            {/* Install CTA in drawer */}
            <div className="pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  openInstallModal()
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border/70 bg-secondary/40 hover:bg-secondary text-foreground transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-7 w-7 rounded-md bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                    <Download className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate">Install UNICON App</p>
                    <p className="text-3xs text-muted-foreground truncate">Offline notices &amp; real-time alerts</p>
                  </div>
                </div>
                <span className="text-3xs font-medium text-primary px-2 py-0.5 rounded border border-primary/20 bg-primary/10 shrink-0">
                  Install
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
