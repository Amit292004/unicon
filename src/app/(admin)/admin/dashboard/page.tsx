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
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Activity
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/data/client-store'

export default function AdminDashboardPage() {
  const {
    currentProfile,
    profiles,
    notices,
    lostFoundReports,
    buses,
    routes,
    complaints,
    notes,
    pyqs
  } = useAppStore()

  // Real database metrics calculation
  const totalStudents = profiles.filter((p) => p.role === 'student').length
  const publishedNotices = notices.filter((n) => n.status === 'published').length
  const activeLostFound = lostFoundReports.filter((r) => r.status === 'active').length
  const pendingClaims = lostFoundReports.reduce(
    (acc, curr) => acc + (curr.claims?.filter((c) => c.status === 'pending').length || 0),
    0
  )
  const openComplaints = complaints.filter((c) => c.status === 'open' || c.status === 'in_progress').length
  const totalNotes = notes.length
  const totalPYQs = pyqs.length

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
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-2xs uppercase">
              {currentProfile.college?.name}
            </Badge>
            <span className="text-2xs text-muted-foreground">&bull; Live System Metrics</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Administrative Operations Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/notices">
            <Button size="sm" className="h-8 text-xs gap-1">
              <Bell className="h-3.5 w-3.5" aria-hidden="true" />
              Compose Notice
            </Button>
          </Link>
          <Link href="/admin/transport">
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
              <Bus className="h-3.5 w-3.5" aria-hidden="true" />
              Fleet Status
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border shadow-card space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-2xs font-semibold uppercase tracking-wider">Enrolled Students</span>
            <Users className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
          <p className="text-2xl font-bold text-foreground">{totalStudents}</p>
          <p className="text-2xs text-muted-foreground">Verified accounts</p>
        </Card>

        <Card className="p-4 border shadow-card space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-2xs font-semibold uppercase tracking-wider">Published Notices</span>
            <Bell className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
          <p className="text-2xl font-bold text-foreground">{publishedNotices}</p>
          <p className="text-2xs text-muted-foreground">Active bulletins</p>
        </Card>

        <Card className="p-4 border shadow-card space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-2xs font-semibold uppercase tracking-wider">Missing Items</span>
            <Search className="h-4 w-4 text-warning-600" aria-hidden="true" />
          </div>
          <p className="text-2xl font-bold text-foreground">{activeLostFound}</p>
          <p className="text-2xs text-warning-600 font-medium">{pendingClaims} claims pending</p>
        </Card>

        <Card className="p-4 border shadow-card space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-2xs font-semibold uppercase tracking-wider">Transit Complaints</span>
            <AlertCircle className="h-4 w-4 text-destructive-600" aria-hidden="true" />
          </div>
          <p className="text-2xl font-bold text-foreground">{openComplaints}</p>
          <p className="text-2xs text-muted-foreground">Requiring investigation</p>
        </Card>
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
                <div key={log.id} className="p-3.5 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground">{log.action}</p>
                    <p className="text-2xs text-muted-foreground">{log.detail}</p>
                  </div>
                  <div className="text-right text-2xs text-muted-foreground">
                    <span className="font-medium text-foreground block">{log.user}</span>
                    <span>{log.time}</span>
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
              Academic Resources Inventory
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
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
