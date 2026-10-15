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
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { UserAvatar } from '@/components/shared/user-avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/data/client-store'
import type { Profile } from '@/types'
import { useState, useRef, useEffect } from 'react'

interface HeaderProps {
  profile: Profile
  unreadNotifications?: number
}

export function Header({ profile, unreadNotifications = 0 }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { logout } = useAppStore()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {
      // Ignore if supabase not configured
    }
    logout()
    router.push('/login')
    router.refresh()
  }

  return (
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

      {/* Notifications */}
      <Link href="/notifications" className="relative">
        <Button variant="ghost" size="icon" aria-label={`Notifications${unreadNotifications > 0 ? `, ${unreadNotifications} unread` : ''}`}>
          <Bell className="h-4.5 w-4.5" aria-hidden="true" />
        </Button>
        {unreadNotifications > 0 && (
          <span
            className="absolute top-1 right-1 h-4 min-w-4 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-2xs px-0.5 font-bold"
            aria-hidden="true"
          >
            {unreadNotifications > 9 ? '9+' : unreadNotifications}
          </span>
        )}
      </Link>

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
  )
}
