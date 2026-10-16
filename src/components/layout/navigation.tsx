'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  Home,
  Bell,
  BookOpen,
  Bus,
  Search,
  Inbox,
  ClipboardList,
  Users,
  FileText,
  HelpCircle,
  Building2,
  MoreHorizontal,
  X,
  LayoutGrid,
  Download,
  ShieldCheck,
  User,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserAvatar } from '@/components/shared/user-avatar'
import { DownloadAppButton } from '@/components/pwa/download-app-button'
import { usePwa } from '@/lib/pwa-context'
import { useAppStore } from '@/lib/data/client-store'
import { canAccessAdminPanel } from '@/lib/auth/roles'
import type { Profile } from '@/types'

// ─── Navigation Items ─────────────────────────────────────────────────────────

export const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/notices', label: 'Notices', icon: Bell },
  { href: '/academics', label: 'Academics', icon: BookOpen },
  { href: '/transport', label: 'Transport', icon: Bus },
  { href: '/lost-found', label: 'Lost & Found', icon: Search },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/notes', label: 'Notes', icon: FileText },
  { href: '/pyqs', label: 'PYQs', icon: ClipboardList },
] as const

const PRIMARY_MOBILE_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/notices', label: 'Notices', icon: Bell },
  { href: '/academics', label: 'Academics', icon: BookOpen },
  { href: '/transport', label: 'Transport', icon: Bus },
] as const

const SECONDARY_MOBILE_ITEMS = [
  { href: '/lost-found', label: 'Lost & Found', description: 'Recover missing items', icon: Search },
  { href: '/contacts', label: 'Contacts', description: 'Staff & peer directory', icon: Users },
  { href: '/notes', label: 'Study Notes', description: 'Course revision docs', icon: FileText },
  { href: '/pyqs', label: 'PYQ Papers', description: 'Past year exam archive', icon: ClipboardList },
  { href: '/ask-campus', label: 'Ask Campus', description: 'Community Q&A', icon: HelpCircle },
  { href: '/messages', label: 'Messages', description: 'Direct conversations', icon: Inbox },
  { href: '/admin/dashboard', label: 'Admin Console', description: 'Institutional controls', icon: ShieldCheck },
] as const

// ─── Desktop Sidebar ──────────────────────────────────────────────────────────

interface SidebarProps {
  profile: Profile
  unreadNotifications?: number
  unreadMessages?: number
}

export function Sidebar({ profile, unreadNotifications = 0, unreadMessages = 0 }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-60 h-screen max-h-screen border-r border-border/80 bg-card fixed inset-y-0 left-0 z-30 select-none">
      {/* Brand & Institution Badge */}
      <div className="flex items-center justify-between px-4 h-[58px] border-b border-border/80 shrink-0">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/unicon-logo.png"
            alt="UNICON"
            width={128}
            height={28}
            className="h-7 w-auto object-contain dark:brightness-110"
            style={{ height: '28px', width: 'auto' }}
            priority
          />
        </Link>
        <span className="text-3xs uppercase tracking-wider font-mono text-muted-foreground/80 bg-secondary/80 border border-border/60 px-1.5 py-0.5 rounded">
          v2.4
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 min-h-0 overflow-y-auto px-2.5 py-3 space-y-3.5" aria-label="Main navigation">
        <div>
          <p className="px-2.5 pb-1.5 text-3xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Core Utilities
          </p>
          <div className="space-y-0.5">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive = href === '/' ? pathname === '/' : (pathname === href || pathname.startsWith(href + '/'))
              return (
                <Link
                  key={href}
                  href={href}
                  prefetch={false}
                  className={cn(
                    'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-secondary text-foreground font-semibold shadow-subtle border border-border/70'
                      : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0 transition-colors',
                      isActive ? 'text-primary' : 'text-muted-foreground/80'
                    )}
                    aria-hidden="true"
                  />
                  <span>{label}</span>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="pt-2 border-t border-border/60">
          <p className="px-2.5 pb-1.5 text-3xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Campus Collaboration
          </p>
          <div className="space-y-0.5">
            <Link
              href="/messages"
              prefetch={false}
              className={cn(
                'flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors',
                pathname.startsWith('/messages')
                  ? 'bg-secondary text-foreground font-semibold shadow-subtle border border-border/70'
                  : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
              )}
            >
              <span className="flex items-center gap-2.5">
                <Inbox
                  className={cn(
                    'h-4 w-4 shrink-0',
                    pathname.startsWith('/messages') ? 'text-primary' : 'text-muted-foreground/80'
                  )}
                  aria-hidden="true"
                />
                Messages
              </span>
              {unreadMessages > 0 && (
                <span className="h-4 min-w-4 flex items-center justify-center rounded bg-primary/10 text-primary border border-primary/20 text-3xs px-1 font-semibold">
                  {unreadMessages > 99 ? '99+' : unreadMessages}
                </span>
              )}
            </Link>

            <Link
              href="/ask-campus"
              prefetch={false}
              className={cn(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors',
                pathname.startsWith('/ask-campus')
                  ? 'bg-secondary text-foreground font-semibold shadow-subtle border border-border/70'
                  : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
              )}
            >
              <HelpCircle
                className={cn(
                  'h-4 w-4 shrink-0',
                  pathname.startsWith('/ask-campus') ? 'text-primary' : 'text-muted-foreground/80'
                )}
                aria-hidden="true"
              />
              Ask Campus Q&amp;A
            </Link>
          </div>
        </div>

        {canAccessAdminPanel(profile) && (
          <div className="pt-2 border-t border-border/60">
            <p className="px-2.5 pb-1.5 text-3xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              Control Center
            </p>
            <div className="space-y-0.5">
              <Link
                href="/admin/dashboard"
                prefetch={false}
                className={cn(
                  'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors',
                  pathname.startsWith('/admin')
                    ? 'bg-secondary text-foreground font-semibold shadow-subtle border border-border/70'
                    : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                )}
              >
                <ShieldCheck
                  className={cn(
                    'h-4 w-4 shrink-0',
                    pathname.startsWith('/admin') ? 'text-primary' : 'text-muted-foreground/80'
                  )}
                  aria-hidden="true"
                />
                <span>Admin Console</span>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Download / Install App CTA */}
      <DownloadAppButton variant="sidebar" />

      {/* Profile Summary Footer */}
      <div className="p-2 border-t border-border/80 bg-secondary/20 shrink-0">
        <Link
          href={`/profile/${profile.username}`}
          prefetch={false}
          className="flex items-center gap-2.5 p-1.5 rounded-md hover:bg-secondary/80 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
        >
          <UserAvatar name={profile.fullName} avatarUrl={profile.avatarUrl} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-foreground truncate leading-tight">{profile.fullName}</p>
            <p className="text-2xs text-muted-foreground font-mono truncate mt-0.5">
              {profile.rollNumber ? `${profile.rollNumber}` : `@${profile.username}`}
            </p>
          </div>
        </Link>
      </div>
    </aside>
  )
}

// ─── Mobile Bottom Navigation ──────────────────────────────────────────────────

export function BottomNav() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)
  const { openInstallModal } = usePwa()
  const { currentProfile } = useAppStore()

  // Close sheet on route change
  useEffect(() => {
    setMoreOpen(false)
  }, [pathname])

  // Close on escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMoreOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const visibleMobileItems = SECONDARY_MOBILE_ITEMS.filter(
    (item) => item.href !== '/admin/dashboard' || canAccessAdminPanel(currentProfile)
  )

  const isMoreActive =
    moreOpen ||
    visibleMobileItems.some(
      (item) => pathname === item.href || pathname.startsWith(item.href + '/')
    )

  return (
    <>
      {/* Mobile More Sheet Drawer */}
      {moreOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setMoreOpen(false)}
            aria-hidden="true"
          />
          <div
            className="relative z-50 bg-card border-t border-border/80 rounded-t-xl p-4 pb-20 shadow-modal space-y-3 animate-slide-up max-h-[82vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="More campus services"
          >
            {/* Grab Handle */}
            <div className="w-8 h-1 rounded-full bg-muted-foreground/25 mx-auto -mt-1 mb-2" aria-hidden="true" />

            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-primary" aria-hidden="true" />
                <h3 className="font-semibold text-xs tracking-tight text-foreground uppercase">Campus Modules</h3>
              </div>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="h-7 w-7 rounded-md hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Profile summary in bottom nav drawer */}
            {currentProfile && (
              <div className="p-2.5 rounded-lg border border-border/70 bg-secondary/30 flex items-center justify-between">
                <Link
                  href={`/profile/${currentProfile.username}`}
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-2.5 min-w-0 flex-1"
                >
                  <UserAvatar name={currentProfile.fullName} avatarUrl={currentProfile.avatarUrl} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate">{currentProfile.fullName}</p>
                    <p className="text-3xs text-muted-foreground font-mono truncate">@{currentProfile.username}</p>
                  </div>
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setMoreOpen(false)}
                  className="text-xs text-primary font-medium px-2 py-1 rounded hover:bg-secondary transition-colors shrink-0"
                >
                  Settings
                </Link>
              </div>
            )}

            <div className="grid grid-cols-1 min-[340px]:grid-cols-2 gap-2 pt-1">
              {visibleMobileItems.map(({ href, label, description, icon: Icon }) => {
                const isActive = pathname === href || pathname.startsWith(href + '/')
                return (
                  <Link
                    key={href}
                    href={href}
                    prefetch={false}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      'flex items-start gap-2.5 p-2.5 rounded-lg border text-left transition-colors',
                      isActive
                        ? 'bg-secondary border-primary/40 text-foreground font-semibold shadow-subtle'
                        : 'bg-secondary/30 hover:bg-secondary border-border/60 text-foreground'
                    )}
                  >
                    <div
                      className={cn(
                        'h-8 w-8 rounded-md flex items-center justify-center shrink-0 border',
                        isActive
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card border-border/70 text-muted-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold leading-tight truncate">{label}</p>
                      <p className="text-3xs text-muted-foreground mt-0.5 truncate">{description}</p>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Install App CTA in Mobile Drawer */}
            <div className="pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={() => {
                  setMoreOpen(false)
                  openInstallModal()
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border/70 bg-secondary/40 hover:bg-secondary text-foreground transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-md bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                    <Download className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate">Install UNICON App</p>
                    <p className="text-3xs text-muted-foreground truncate">Offline access, instant alerts &amp; faster load</p>
                  </div>
                </div>
                <span className="text-2xs font-medium text-primary px-2 py-0.5 rounded border border-primary/20 bg-primary/10 shrink-0 ml-2">
                  Install
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Fixed 5-Item Bottom Bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-md border-t border-border/80 safe-bottom shadow-dropdown"
        aria-label="Mobile navigation"
      >
        <div className="flex items-stretch h-[60px]">
          {PRIMARY_MOBILE_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = href === '/' ? pathname === '/' : (pathname === href || pathname.startsWith(href + '/'))
            return (
              <Link
                key={href}
                href={href}
                prefetch={false}
                className={cn(
                  'flex flex-1 flex-col items-center justify-center gap-1 py-1.5 transition-colors min-w-0',
                  isActive ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
                )}
                aria-current={isActive ? 'page' : undefined}
                aria-label={label}
              >
                <Icon className={cn('h-4.5 w-4.5 shrink-0', isActive && 'stroke-[2.2]')} aria-hidden="true" />
                <span className="text-3xs tracking-tight truncate max-w-full px-0.5 leading-tight">
                  {label}
                </span>
              </Link>
            )
          })}

          {/* 5th Tab: More */}
          <button
            type="button"
            onClick={() => setMoreOpen(!moreOpen)}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-1.5 transition-colors min-w-0 cursor-pointer',
              isMoreActive ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
            )}
            aria-expanded={moreOpen}
            aria-label="More navigation options"
          >
            <div className="relative">
              <MoreHorizontal className={cn('h-4.5 w-4.5 shrink-0', isMoreActive && 'stroke-[2.2]')} aria-hidden="true" />
              {SECONDARY_MOBILE_ITEMS.some(
                (item) => pathname === item.href || pathname.startsWith(item.href + '/')
              ) && (
                <span className="absolute -top-0.5 -right-1 h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </div>
            <span className="text-3xs tracking-tight truncate max-w-full px-0.5 leading-tight">
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  )
}
