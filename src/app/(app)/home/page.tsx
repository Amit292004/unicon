'use client'

import React from 'react'
import Link from 'next/link'
import {
  Bell,
  Bus,
  Search,
  BookOpen,
  FileText,
  ClipboardList,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Building2,
  Calendar
} from 'lucide-react'
import { PostComposer } from '@/components/feed/post-composer'
import { PostCard } from '@/components/feed/post-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/lib/data/client-store'
import { formatRelativeTime } from '@/lib/utils'

export default function HomePage() {
  const { currentProfile, notices, posts, lostFoundReports, buses } = useAppStore()

  // Filter notices relevant to current student's college & department
  const recentNotices = notices
    .filter(
      (n) =>
        n.collegeId === currentProfile.collegeId &&
        n.status === 'published' &&
        (n.audience === 'all' ||
          n.targetDepartmentId === currentProfile.departmentId ||
          n.targetSemester === 4)
    )
    .slice(0, 3)

  const activeLostFound = lostFoundReports
    .filter((r) => r.collegeId === currentProfile.collegeId && r.status === 'active')
    .slice(0, 3)

  return (
    <div className="space-y-6">
      {/* College Welcome Banner */}
      <div className="rounded-xl border bg-card p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Institutional Dashboard
            </span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {currentProfile.college?.name}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Welcome back, {currentProfile.fullName.split(' ')[0]}
          </h1>
          <p className="text-xs text-muted-foreground">
            Roll: {currentProfile.rollNumber} &bull; Dept: {currentProfile.department?.name || 'General'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentProfile.role !== 'student' && (
            <Link href="/admin/dashboard">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Admin Portal
              </Button>
            </Link>
          )}
          <Link href="/notices">
            <Button size="sm" className="gap-1.5 text-xs">
              <Bell className="h-3.5 w-3.5" aria-hidden="true" />
              Notices Board
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Post Composer */}
          <PostComposer />

          {/* Feed List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Campus Community Stream
              </h2>
              <span className="text-2xs text-muted-foreground">
                Showing newest updates
              </span>
            </div>

            {posts.length === 0 ? (
              <div className="p-8 text-center border rounded-lg bg-card text-muted-foreground text-xs">
                No posts shared yet. Be the first to share an academic update!
              </div>
            ) : (
              posts.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </div>
        </div>

        {/* Right 1 Column: Contextual Sidebar */}
        <div className="space-y-6">
          {/* Quick Shortcuts Grid */}
          <Card className="border shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Essential Campus Services
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Link
                href="/notices"
                className="p-3 rounded-lg border bg-background hover:bg-accent transition text-left flex flex-col gap-1.5"
              >
                <Bell className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="text-xs font-semibold text-foreground">Notices</span>
                <span className="text-2xs text-muted-foreground">Exam &amp; dept alerts</span>
              </Link>

              <Link
                href="/transport"
                className="p-3 rounded-lg border bg-background hover:bg-accent transition text-left flex flex-col gap-1.5"
              >
                <Bus className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="text-xs font-semibold text-foreground">Transport</span>
                <span className="text-2xs text-muted-foreground">Bus routes &amp; timing</span>
              </Link>

              <Link
                href="/notes"
                className="p-3 rounded-lg border bg-background hover:bg-accent transition text-left flex flex-col gap-1.5"
              >
                <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="text-xs font-semibold text-foreground">Notes</span>
                <span className="text-2xs text-muted-foreground">Subject study packs</span>
              </Link>

              <Link
                href="/lost-found"
                className="p-3 rounded-lg border bg-background hover:bg-accent transition text-left flex flex-col gap-1.5"
              >
                <Search className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="text-xs font-semibold text-foreground">Lost &amp; Found</span>
                <span className="text-2xs text-muted-foreground">Match &amp; claim items</span>
              </Link>
            </CardContent>
          </Card>

          {/* Urgent Notices Widget */}
          <Card className="border shadow-card">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Latest Announcements
              </CardTitle>
              <Link href="/notices" className="text-2xs font-semibold text-primary hover:underline">
                View All
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentNotices.length === 0 ? (
                <p className="text-xs text-muted-foreground">No recent announcements.</p>
              ) : (
                recentNotices.map((n) => (
                  <Link
                    key={n.id}
                    href={`/notices/${n.id}`}
                    className="block p-2.5 rounded-md border bg-background hover:bg-accent/60 transition"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Badge variant="outline" className="text-2xs uppercase">
                        {n.audience === 'all' ? 'All College' : n.audience}
                      </Badge>
                      <span className="text-2xs text-muted-foreground ml-auto">
                        {formatRelativeTime(n.publishedAt || n.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-foreground line-clamp-1">{n.title}</p>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {/* Active Lost & Found Reports */}
          <Card className="border shadow-card">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Recent Missing / Found
              </CardTitle>
              <Link href="/lost-found" className="text-2xs font-semibold text-primary hover:underline">
                View Board
              </Link>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {activeLostFound.map((item) => (
                <Link
                  key={item.id}
                  href="/lost-found"
                  className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 text-xs transition border"
                >
                  <div className="space-y-0.5 truncate max-w-[180px]">
                    <p className="font-medium text-foreground truncate">{item.itemName}</p>
                    <p className="text-2xs text-muted-foreground">{item.location || 'Campus'}</p>
                  </div>
                  <Badge
                    variant={item.type === 'lost' ? 'destructive' : 'success'}
                    className="text-2xs uppercase"
                  >
                    {item.type}
                  </Badge>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
