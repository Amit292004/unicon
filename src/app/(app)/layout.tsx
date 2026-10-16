'use client'

import React, { useEffect } from 'react'
import { Sidebar, BottomNav } from '@/components/layout/navigation'
import { Header } from '@/components/layout/header'
import { useAppStore } from '@/lib/data/client-store'
import { isSupabaseConfigured, createClient } from '@/lib/supabase/client'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { currentProfile, notifications, messages, theme } = useAppStore()

  // Apply theme class on body
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  // Ensure auth cookies match the active profile in store so server middleware and client remain synchronized
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (currentProfile?.email) {
      document.cookie = `cc_demo_user=${currentProfile.email}; path=/; max-age=86400; SameSite=Lax`
      document.cookie = `cc_user_role=${currentProfile.role}; path=/; max-age=86400; SameSite=Lax`
    }
  }, [currentProfile?.email, currentProfile?.role])

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead && n.userId === currentProfile.id).length
  const unreadMessagesCount = 0 // In-app active demo count

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Desktop Sidebar (Fixed Left) */}
      <Sidebar
        profile={currentProfile}
        unreadNotifications={unreadNotificationsCount}
        unreadMessages={unreadMessagesCount}
      />

      {/* Main Content Area (Offset by sidebar width on desktop) */}
      <div className="lg:ml-60 flex-1 flex flex-col min-h-screen">
        {/* Sticky App Header */}
        <Header
          profile={currentProfile}
          unreadNotifications={unreadNotificationsCount}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 max-w-6xl w-full mx-auto main-content-mobile">
          {children}
        </main>

        {/* Mobile Fixed 8-Item Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  )
}
