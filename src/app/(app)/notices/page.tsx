'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Bell,
  Search,
  Filter,
  Calendar,
  Building2,
  FileText,
  User,
  ExternalLink,
  ShieldCheck,
  Plus
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/empty-state'
import { useAppStore } from '@/lib/data/client-store'
import { formatDateTime } from '@/lib/utils'

export default function NoticesPage() {
  const { currentProfile, notices } = useAppStore()
  const [filterAudience, setFilterAudience] = useState<'all' | 'department' | 'semester'>('all')
  const [selectedSemester, setSelectedSemester] = useState<number | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter notices
  const filteredNotices = notices.filter((notice) => {
    // Only published
    if (notice.status !== 'published') return false

    // College check
    if (notice.collegeId !== currentProfile.collegeId) return false

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const matches =
        notice.title.toLowerCase().includes(q) ||
        notice.content.toLowerCase().includes(q)
      if (!matches) return false
    }

    // Audience filter
    if (filterAudience === 'department') {
      if (notice.audience !== 'department' && notice.audience !== 'department_semester') {
        return false
      }
    } else if (filterAudience === 'semester') {
      if (notice.audience !== 'semester' && notice.audience !== 'department_semester') {
        return false
      }
      if (selectedSemester !== 'all' && notice.targetSemester !== selectedSemester) {
        return false
      }
    }

    return true
  })

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Official Notices &amp; Bulletins
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Verified institutional updates for {currentProfile.college?.name}
          </p>
        </div>

        {currentProfile.role !== 'student' && (
          <Link href="/admin/notices">
            <Button size="sm" className="gap-1.5 text-xs">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Publish Notice
            </Button>
          </Link>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search announcements by title or content..."
            className="pl-9 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Audience Filter Dropdown */}
          <select
            value={filterAudience}
            onChange={(e) => setFilterAudience(e.target.value as 'all' | 'department' | 'semester')}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            aria-label="Filter notices by audience"
          >
            <option value="all">Audience: All Announcements</option>
            <option value="department">Department Notices</option>
            <option value="semester">Semester Notices</option>
          </select>

          {/* Semester Selector if semester filter active */}
          {filterAudience === 'semester' && (
            <select
              value={selectedSemester}
              onChange={(e) =>
                setSelectedSemester(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="h-9 rounded-md border border-input bg-background px-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              aria-label="Select specific semester"
            >
              <option value="all">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Notice Cards List */}
      <div className="space-y-4">
        {filteredNotices.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notices found"
            description="There are currently no active announcements matching your selected filters."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterAudience('all')
                  setSearchQuery('')
                  setSelectedSemester('all')
                }}
              >
                Reset Filters
              </Button>
            }
          />
        ) : (
          filteredNotices.map((notice) => (
            <Card key={notice.id} className="p-5 border shadow-card hover:border-primary/40 transition">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="default" className="text-2xs uppercase">
                      {notice.audience === 'all'
                        ? 'All Students'
                        : notice.audience === 'department'
                        ? 'Department Notice'
                        : `Semester ${notice.targetSemester || ''}`}
                    </Badge>
                    <span className="text-2xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" aria-hidden="true" />
                      {formatDateTime(notice.publishedAt || notice.createdAt)}
                    </span>
                  </div>

                  <Link href={`/notices/${notice.id}`}>
                    <h2 className="text-base font-bold text-foreground hover:text-primary transition-colors">
                      {notice.title}
                    </h2>
                  </Link>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {notice.content}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0">
                  <div className="text-2xs text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" aria-hidden="true" />
                    <span>{notice.author?.fullName || 'Academic Dean'}</span>
                  </div>

                  <Link href={`/notices/${notice.id}`}>
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                      Read Full Notice
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                  </Link>
                </div>
              </div>

              {notice.attachmentUrls && notice.attachmentUrls.length > 0 && (
                <div className="mt-3 pt-3 border-t flex items-center gap-2 text-2xs text-primary font-medium">
                  <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{notice.attachmentUrls.length} Official Document Attached</span>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
