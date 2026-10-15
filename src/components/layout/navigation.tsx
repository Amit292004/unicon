'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserAvatar } from '@/components/shared/user-avatar'
import type { Profile } from '@/types'

// ─── Navigation Items ─────────────────────────────────────────────────────────

export const NAV_ITEMS = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/notices', label: 'Notices', icon: Bell },
  { href: '/academics', label: 'Academics', icon: BookOpen },
  { href: '/transport', label: 'Transport', icon: Bus },
  { href: '/lost-found', label: 'Lost & Found', icon: Search },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/notes', label: 'Notes', icon: FileText },
  { href: '/pyqs', label: 'PYQs', icon: ClipboardList },
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
    <aside className="hidden lg:flex flex-col w-60 min-h-screen border-r bg-card fixed left-0 top-0 z-30">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 h-[60px] border-b">
        <Link href="/home" className="flex items-center gap-2.5">
          <Image
            src="/unicon-logo.png"
            alt="UNICON"
            width={120}
            height={26}
            className="h-7 w-auto object-contain dark:brightness-110"
            priority
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1" aria-label="Main navigation">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                isActive
                  ? 'bg-accent text-accent-foreground font-semibold'
                  : 'text-muted-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
              {label}
            </Link>
          )
        })}

        <div className="pt-2 border-t mt-2">
          <Link
            href="/messages"
            className={cn(
              'flex items-center justify-between gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              pathname.startsWith('/messages')
                ? 'bg-accent text-accent-foreground font-semibold'
                : 'text-muted-foreground'
            )}
          >
            <span className="flex items-center gap-3">
              <Inbox className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
              Messages
            </span>
            {unreadMessages > 0 && (
              <span className="h-5 min-w-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs px-1">
                {unreadMessages > 99 ? '99+' : unreadMessages}
              </span>
            )}
          </Link>

          <Link
            href="/ask-campus"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              pathname.startsWith('/ask-campus')
                ? 'bg-accent text-accent-foreground font-semibold'
                : 'text-muted-foreground'
            )}
          >
            <HelpCircle className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
            Ask Campus
          </Link>
        </div>
      </nav>

      {/* Profile Summary */}
      <div className="px-3 py-3 border-t">
        <Link
          href={`/profile/${profile.username}`}
          className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent transition-colors"
        >
          <UserAvatar name={profile.fullName} avatarUrl={profile.avatarUrl} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">{profile.fullName}</p>
            <p className="text-xs text-muted-foreground truncate">@{profile.username}</p>
          </div>
        </Link>
      </div>
    </aside>
  )
}

// ─── Mobile Bottom Navigation ──────────────────────────────────────────────────

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t safe-bottom"
      aria-label="Mobile navigation"
    >
      <div className="flex items-stretch h-16">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors min-w-0',
                'hover:bg-accent',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
              aria-label={label}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="text-2xs font-medium truncate max-w-full px-0.5 leading-tight">
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
