'use client'

import React from 'react'
import Link from 'next/link'
import {
  Users,
  Bell,
  Search,
  Bus,
  FileText,
  ClipboardList,
  AlertCircle,
  ArrowRight,
  Activity,
  BookOpen,
  Phone,
  Settings,
  Building2,
  Calendar
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/data/client-store'

export default function AdminDashboardPage() {
  const {
    currentProfile,
    college,
    departments,
    profiles,
    notices,
    lostFoundReports,
    buses,
    routes,
    complaints,
    notes,
    pyqs,
    timetableSlots,
    examSchedules,
    calendarEvents,
    campusContacts
  } = useAppStore()

  // Real database metrics calculation
  const totalStudents = profiles.filter((p) => p.role === 'student').length
  const totalFaculty = profiles.filter((p) => p.role === 'faculty').length
  const publishedNotices = notices.filter((n) => n.status === 'published').length
  const activeLostFound = lostFoundReports.filter((r) => r.status === 'active').length
  const pendingClaims = lostFoundReports.reduce(
    (acc, curr) => acc + (curr.claims?.filter((c) => c.status === 'pending').length || 0),
    0
  )
  const openComplaints = complaints.filter((c) => c.status === 'open' || c.status === 'in_progress').length
  const totalNotes = notes.length
  const totalPYQs = pyqs.length

  const managementModules = [
    {
      title: 'Notices Engine',
      href: '/admin/notices',
      icon: Bell,
      stat: `${publishedNotices} Published`,
      desc: 'Publish, draft, edit & archive institutional announcements',
      color: 'text-primary',
    },
    {
      title: 'Transit & Fleet',
      href: '/admin/transport',
      icon: Bus,
      stat: `${buses.length} Buses, ${routes.length} Routes`,
      desc: 'Vehicle telemetry, route schedules, driver assignments & complaints',
      color: 'text-brand-600',
    },
    {
      title: 'Students & Users',
      href: '/admin/students',
      icon: Users,
      stat: `${profiles.length} Accounts`,
      desc: 'Enrollment verification, role permissions & directory management',
      color: 'text-orange-600',
    },
    {
      title: 'Lost & Found Hub',
      href: '/admin/lost-found',
      icon: Search,
      stat: `${activeLostFound} Active (${pendingClaims} Claims)`,
      desc: 'Item moderation, automated claim verification & handovers',
      color: 'text-amber-600',
    },
    {
      title: 'Timetable & Exams',
      href: '/admin/academics',
      icon: BookOpen,
      stat: `${timetableSlots.length} Classes, ${examSchedules.length} Exams`,
      desc: 'Weekly class grids, exam hall allocations & academic milestones',
      color: 'text-emerald-600',
    },
    {
      title: 'Notes & PYQ Archive',
      href: '/admin/resources',
      icon: FileText,
      stat: `${totalNotes} Notes, ${totalPYQs} PYQs`,
      desc: 'Course materials repository & previous years question papers',
      color: 'text-sky-600',
    },
    {
      title: 'Campus Contacts',
      href: '/admin/contacts',
      icon: Phone,
      stat: `${campusContacts.length} Listings`,
      desc: 'Helplines, emergency responders, health unit & office directory',
      color: 'text-rose-600',
    },
    {
      title: 'College & Depts',
      href: '/admin/settings',
      icon: Settings,
      stat: `${departments.length} Departments`,
      desc: 'Campus metadata, portal domain & department configurations',
      color: 'text-purple-600',
    },
  ]

  const auditLogs = [
    { id: '1', action: 'Notice Published', detail: 'Spring 2026 Mid-Semester Timetable', time: '1 hour ago', user: 'Dean Academic' },
    { id: '2', action: 'Claim Resolved', detail: 'Casio fx-991EX Calculator claim accepted', time: '3 hours ago', user: 'Alex Chen' },
    { id: '3', action: 'Transit Route Updated', detail: 'Route 1 timetable adjusted', time: '5 hours ago', user: 'Vikram Singh' },
    { id: '4', action: 'Student Registered', detail: 'Priya Sharma completed profile', time: '1 day ago', user: 'System Auth' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant="outline" className="text-2xs uppercase">
              {college?.name || currentProfile.college?.name}
            </Badge>
            <span className="text-2xs text-muted-foreground">&bull; Live System Metrics</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Administrative Operations Dashboard
          </h1>
          <p className="text-xs text-muted-foreground">
            Centralized portal management across academics, fleet operations, student affairs, and institutional records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/notices">
            <Button size="sm" className="h-8 text-xs gap-1">
              <Bell className="h-3.5 w-3.5" aria-hidden="true" />
              Compose Notice
            </Button>
          </Link>
          <Link href="/admin/students">
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              Add User
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border shadow-card hover:shadow-card-hover transition-all space-y-1.5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-2xs font-semibold uppercase tracking-wider">Enrolled Students</span>
            <Users className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums">{totalStudents}</p>
          <p className="text-2xs text-muted-foreground font-mono">{totalFaculty} verified faculty accounts</p>
        </Card>

        <Card className="p-4 border shadow-card hover:shadow-card-hover transition-all space-y-1.5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-2xs font-semibold uppercase tracking-wider">Published Bulletins</span>
            <Bell className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums">{publishedNotices}</p>
          <p className="text-2xs text-muted-foreground font-mono">Active institutional circulars</p>
        </Card>

        <Card className="p-4 border shadow-card hover:shadow-card-hover transition-all space-y-1.5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-2xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Active Missing Items
            </span>
            <Search className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums">{activeLostFound}</p>
          <p className="text-2xs text-amber-600 dark:text-amber-400 font-medium font-mono">{pendingClaims} claims pending review</p>
        </Card>

        <Card className="p-4 border shadow-card hover:shadow-card-hover transition-all space-y-1.5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-2xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Transit Complaints
            </span>
            <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" aria-hidden="true" />
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums">{openComplaints}</p>
          <p className="text-2xs text-rose-600 dark:text-rose-400 font-medium font-mono">Open tickets in queue</p>
        </Card>
      </div>

      {/* Administrative Operations Hub Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Management Consoles &amp; Controls
          </h2>
          <span className="text-2xs text-muted-foreground font-mono">8 Operational Subsystems</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {managementModules.map((m) => {
            const Icon = m.icon
            return (
              <Link key={m.href} href={m.href} className="group">
                <Card className="p-4 border shadow-card hover:shadow-card-hover hover:border-primary/50 transition-all flex flex-col justify-between h-full bg-card group-hover:bg-accent/[0.25]">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-md bg-muted/60 border border-border/70 ${m.color}`}>
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <Badge variant="outline" className="text-2xs font-mono">
                        {m.stat}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-xs text-foreground group-hover:text-primary transition flex items-center justify-between">
                        <span>{m.title}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                      </h3>
                      <p className="text-2xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {m.desc}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Secondary Metrics & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Activity & Audit Trail */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border shadow-card">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" aria-hidden="true" />
                Administrative Activity &amp; Audit Log
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y p-0">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-muted/30 transition-colors">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-semibold text-foreground truncate">{log.action}</p>
                      <p className="text-2xs text-muted-foreground truncate">{log.detail}</p>
                    </div>
                  </div>
                  <div className="text-right text-2xs text-muted-foreground shrink-0 pl-3">
                    <span className="font-medium text-foreground block">{log.user}</span>
                    <span className="font-mono">{log.time}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Academic Repository Counters */}
        <div className="space-y-4">
          <Card className="p-5 border shadow-card space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Repository Quick Stats
            </h2>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-md border bg-secondary/30 text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span className="font-medium">Uploaded Course Notes</span>
                </div>
                <Badge variant="default" className="text-2xs font-mono">
                  {totalNotes}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-md border bg-secondary/30 text-xs">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span className="font-medium">Archived PYQ Papers</span>
                </div>
                <Badge variant="default" className="text-2xs font-mono">
                  {totalPYQs}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-md border bg-secondary/30 text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span className="font-medium">Calendar Milestones</span>
                </div>
                <Badge variant="default" className="text-2xs font-mono">
                  {calendarEvents.length}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
