'use client'

import React, { useState } from 'react'
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
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Plus,
  Users,
  ChevronDown,
  Image as ImageIcon
} from 'lucide-react'
import { PostComposer } from '@/components/feed/post-composer'
import { PostCard } from '@/components/feed/post-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/lib/data/client-store'
import { formatRelativeTime } from '@/lib/utils'
import { isPdfAttachment } from '@/lib/notices'

export default function PortalHomePage() {
  const { currentProfile, loginAs, notices, posts, lostFoundReports, routes, buses } = useAppStore()
  const [showPersonas, setShowPersonas] = useState(false)

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

  const activeTransitRoute = routes[0]

  return (
    <div className="space-y-6">
      {/* College Institutional Greeting Banner */}
      <div className="rounded-lg border border-border/80 bg-card p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-3xs font-semibold uppercase tracking-wider text-primary font-mono">
              Verified Student Portal
            </span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Building2 className="h-3 w-3 text-muted-foreground/75" aria-hidden="true" />
              {currentProfile.college?.name}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Welcome back, {currentProfile.fullName.split(' ')[0]}
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            Roll: {currentProfile.rollNumber || 'STU-2023-01'} &bull; Dept: {currentProfile.department?.name || 'Computer Science'} &bull; Semester 4
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowPersonas(!showPersonas)}
            className="text-xs h-8 gap-1 border border-border/70"
            title="Switch demo persona"
          >
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Switch Persona</span>
            <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${showPersonas ? 'rotate-180' : ''}`} />
          </Button>
          {currentProfile.role !== 'student' && (
            <Link href="/admin/dashboard">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Admin Console
              </Button>
            </Link>
          )}
          <Link href="/notices">
            <Button size="sm" className="gap-1.5 text-xs h-8 shadow-subtle">
              <Bell className="h-3.5 w-3.5" aria-hidden="true" />
              Official Notices
            </Button>
          </Link>
        </div>
      </div>

      {/* 1-Click Evaluator Personas (collapsible quick switcher for judges & evaluators) */}
      {showPersonas && (
        <div className="p-4 rounded-lg border border-primary/30 bg-primary/5 space-y-2.5 animate-fade-in">
          <div className="flex items-center justify-between">
            <p className="text-3xs font-semibold uppercase tracking-wider text-primary font-mono">
              1-Click Evaluator Personas (Live Simulated Data)
            </p>
            <span className="text-3xs text-muted-foreground font-mono">No password required</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
            <button
              type="button"
              onClick={() => {
                loginAs('student@demo.campusconnect.app')
                setShowPersonas(false)
              }}
              className="p-2.5 rounded-lg border border-border/70 bg-card hover:bg-secondary/70 hover:border-primary/40 transition shadow-subtle text-left group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">Alex Chen</p>
                <span className="text-3xs text-primary font-mono opacity-0 group-hover:opacity-100 transition-opacity">&rarr;</span>
              </div>
              <p className="text-2xs text-muted-foreground mt-0.5">Student &bull; CSE Sem 4</p>
            </button>
            <button
              type="button"
              onClick={() => {
                loginAs('priya@demo.campusconnect.app')
                setShowPersonas(false)
              }}
              className="p-2.5 rounded-lg border border-border/70 bg-card hover:bg-secondary/70 hover:border-primary/40 transition shadow-subtle text-left group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">Priya Sharma</p>
                <span className="text-3xs text-primary font-mono opacity-0 group-hover:opacity-100 transition-opacity">&rarr;</span>
              </div>
              <p className="text-2xs text-muted-foreground mt-0.5">Student &bull; Contributor</p>
            </button>
            <button
              type="button"
              onClick={() => {
                loginAs('admin@demo.campusconnect.app')
                setShowPersonas(false)
              }}
              className="p-2.5 rounded-lg border border-border/70 bg-card hover:bg-secondary/70 hover:border-primary/40 transition shadow-subtle text-left group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">Dr. Jamir</p>
                <span className="text-3xs text-primary font-mono opacity-0 group-hover:opacity-100 transition-opacity">&rarr;</span>
              </div>
              <p className="text-2xs text-muted-foreground mt-0.5">Dean Academic &bull; Admin</p>
            </button>
            <button
              type="button"
              onClick={() => {
                loginAs('transport@demo.campusconnect.app')
                setShowPersonas(false)
              }}
              className="p-2.5 rounded-lg border border-border/70 bg-card hover:bg-secondary/70 hover:border-primary/40 transition shadow-subtle text-left group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">Vikram Singh</p>
                <span className="text-3xs text-primary font-mono opacity-0 group-hover:opacity-100 transition-opacity">&rarr;</span>
              </div>
              <p className="text-2xs text-muted-foreground mt-0.5">Fleet Logistics Manager</p>
            </button>
          </div>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Feed */}
        <div className="lg:col-span-2 space-y-5">
          {/* Post Composer */}
          <PostComposer />

          {/* Feed List */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Campus Community Stream
                </h2>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </div>
              <span className="text-3xs text-muted-foreground font-mono">
                Real-time updates
              </span>
            </div>

            {posts.length === 0 ? (
              <div className="p-8 text-center border border-dashed rounded-lg bg-card/60 text-muted-foreground text-xs space-y-1">
                <p className="font-medium text-foreground">No updates shared yet</p>
                <p className="text-2xs text-muted-foreground">Be the first student to post an academic question or project update.</p>
              </div>
            ) : (
              posts.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </div>
        </div>

        {/* Right 1 Column: Contextual Utility Column */}
        <div className="space-y-5">
          {/* 1. Live Transit Quick-Check */}
          {activeTransitRoute && (
            <Card className="border border-border/80 shadow-subtle overflow-hidden">
              <CardHeader className="p-4 pb-2 border-b border-border/60 bg-secondary/30 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bus className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Campus Transit
                  </CardTitle>
                </div>
                <Badge variant="success" className="text-3xs uppercase font-mono">
                  Operational
                </Badge>
              </CardHeader>
              <CardContent className="p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-foreground">{activeTransitRoute.routeName}</p>
                    <p className="text-3xs text-muted-foreground font-mono">
                      {activeTransitRoute.bus?.busNumber} &bull; Departs {activeTransitRoute.departureTime}
                    </p>
                  </div>
                  <Link href="/transport" className="text-2xs text-primary font-medium hover:underline flex items-center gap-0.5">
                    <span>Full Stops</span>
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="text-3xs text-muted-foreground bg-secondary/40 border border-border/60 p-2 rounded flex items-center justify-between font-mono">
                  <span>Terminal Arrival: {activeTransitRoute.arrivalTime}</span>
                  <span>{activeTransitRoute.stops.length} Checkpoints</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 2. Priority Official Bulletins */}
          <Card className="border border-border/80 shadow-subtle overflow-hidden">
            <CardHeader className="p-4 pb-2 border-b border-border/60 bg-secondary/30 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Official Bulletins
                </CardTitle>
              </div>
              <Link href="/notices" className="text-2xs text-primary font-medium hover:underline">
                View All
              </Link>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5">
              {recentNotices.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2 text-center">No active announcements.</p>
              ) : (
                recentNotices.map((n) => (
                  <Link
                    key={n.id}
                    href={`/notices/${n.id}`}
                    className="block p-2.5 rounded border border-border/60 bg-card hover:bg-secondary/60 hover:border-border transition space-y-1 group"
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Badge variant="outline" className="text-3xs uppercase font-mono shrink-0">
                          {n.audience === 'all' ? 'All College' : n.audience}
                        </Badge>
                        {n.attachmentUrls && n.attachmentUrls.length > 0 && (
                          <span
                            className="inline-flex items-center gap-0.5 text-3xs font-medium text-muted-foreground"
                            title={isPdfAttachment(n.attachmentUrls[0]) ? 'PDF Document attached' : 'Image Poster attached'}
                          >
                            {isPdfAttachment(n.attachmentUrls[0]) ? (
                              <FileText className="h-3 w-3 text-red-500 shrink-0" />
                            ) : (
                              <ImageIcon className="h-3 w-3 text-primary shrink-0" />
                            )}
                          </span>
                        )}
                      </div>
                      <span className="text-3xs text-muted-foreground font-mono shrink-0">
                        {formatRelativeTime(n.publishedAt || n.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {n.title}
                    </p>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {/* 3. Lost & Found Quick Hub */}
          <Card className="border border-border/80 shadow-subtle overflow-hidden">
            <CardHeader className="p-4 pb-2 border-b border-border/60 bg-secondary/30 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Lost &amp; Found
                </CardTitle>
              </div>
              <Link href="/lost-found" className="text-2xs text-primary font-medium hover:underline">
                Registry ({lostFoundReports.filter((r) => r.status === 'active').length})
              </Link>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5">
              {activeLostFound.map((item) => (
                <Link
                  key={item.id}
                  href="/lost-found"
                  className="flex items-center justify-between gap-2 p-2 rounded border border-border/60 hover:bg-secondary/60 text-xs transition group"
                >
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {item.itemName}
                    </p>
                    <p className="text-3xs text-muted-foreground truncate flex items-center gap-1">
                      <MapPin className="h-2.5 w-2.5" />
                      {item.location || 'Campus Center'}
                    </p>
                  </div>
                  <Badge
                    variant={item.type === 'lost' ? 'destructive' : 'success'}
                    className="text-3xs uppercase font-mono"
                  >
                    {item.type}
                  </Badge>
                </Link>
              ))}

              <div className="pt-2 border-t border-border/60">
                <Link href="/lost-found">
                  <Button variant="outline" size="sm" className="w-full text-xs h-7.5 gap-1 text-muted-foreground hover:text-foreground">
                    <Plus className="h-3 w-3" />
                    Report Missing or Found Item
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
