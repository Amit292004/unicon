'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  ShieldCheck,
  LayoutDashboard,
  Bell,
  Bus,
  Search,
  Users,
  LogOut,
  ArrowLeft,
  Building2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/shared/user-avatar'
import { useAppStore } from '@/lib/data/client-store'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { currentProfile, theme } = useAppStore()

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  const navLinks = [
    { href: '/admin/dashboard', label: 'Overview Metrics', icon: LayoutDashboard },
    { href: '/admin/notices', label: 'Notice Targeting', icon: Bell },
    { href: '/admin/transport', label: 'Fleet & Transit Logistics', icon: Bus },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full lg:w-64 border-r bg-card flex flex-col justify-between shrink-0">
        <div>
          {/* Brand & Role Badge */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-md bg-brand-600 text-white flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-foreground block">
                  CampusConnect
                </span>
                <span className="text-2xs text-brand-600 font-semibold uppercase tracking-wider">
                  Admin Console
                </span>
              </div>
            </div>

            <Link href="/home">
              <Button size="icon-sm" variant="ghost" aria-label="Return to student portal">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition ${
                    isActive
                      ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Current Admin User Summary */}
        <div className="p-4 border-t space-y-2">
          <div className="flex items-center gap-2.5">
            <UserAvatar name={currentProfile.fullName} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-xs text-foreground truncate">{currentProfile.fullName}</p>
              <p className="text-2xs text-muted-foreground capitalize">
                {currentProfile.role.replace('_', ' ')}
              </p>
            </div>
          </div>

          <Link href="/home" className="block w-full">
            <Button size="sm" variant="outline" className="w-full text-xs h-8">
              Return to Student View
            </Button>
          </Link>
        </div>
      </aside>

      {/* Admin Content Area */}
      <main className="flex-1 p-6 max-w-6xl w-full mx-auto overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
