'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Bell,
  Plus,
  Edit3,
  Archive,
  CheckCircle2,
  Calendar,
  Building2,
  Users,
  Send,
  Eye,
  ArrowLeft
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/lib/data/client-store'
import { SEEDED_DEPARTMENTS } from '@/lib/data/store'
import { formatDateTime } from '@/lib/utils'
import type { NoticeAudience, NoticeStatus } from '@/types'

export default function AdminNoticesPage() {
  const { currentProfile, notices, addNotice, updateNoticeStatus } = useAppStore()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [audience, setAudience] = useState<NoticeAudience>('all')
  const [targetDeptId, setTargetDeptId] = useState<string>(SEEDED_DEPARTMENTS[0].id)
  const [targetSemester, setTargetSemester] = useState<number>(4)
  const [status, setStatus] = useState<NoticeStatus>('published')
  const [actionMsg, setActionMsg] = useState<string | null>(null)
  const [showComposer, setShowComposer] = useState(false)

  const collegeNotices = notices.filter((n) => n.collegeId === currentProfile.collegeId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    addNotice({
      collegeId: currentProfile.collegeId,
      authorId: currentProfile.id,
      title: title.trim(),
      content: content.trim(),
      status,
      audience,
      targetDepartmentId: audience === 'department' || audience === 'department_semester' ? targetDeptId : null,
      targetSemester: audience === 'semester' || audience === 'department_semester' ? targetSemester : null,
      attachmentUrls: null,
      publishedAt: status === 'published' ? new Date().toISOString() : null,
      expiresAt: null,
    })

    setActionMsg(`Notice "${title}" saved with status: ${status}.`)
    setTitle('')
    setContent('')
    setShowComposer(false)
    setTimeout(() => setActionMsg(null), 4000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Notice Targeting &amp; Publishing Engine
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Create, target, and archive institutional announcements for {currentProfile.college?.name}
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setShowComposer(!showComposer)}
          className="gap-1.5 text-xs"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {showComposer ? 'Close Composer' : 'Create New Notice'}
        </Button>
      </div>

      {actionMsg && (
        <div className="p-3 text-xs rounded-md bg-success-50 text-success-600 border border-success-500/20 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Notice Composer Modal / Card */}
      {showComposer && (
        <Card className="p-6 border shadow-card space-y-4">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-base font-bold">Compose Targeted Notice</CardTitle>
          </CardHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground" htmlFor="nt-title">
                Notice Headline
              </label>
              <Input
                id="nt-title"
                placeholder="e.g. Schedule of Laboratory Practical Examinations"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Audience Targeting Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="nt-audience">
                  Target Audience
                </label>
                <select
                  id="nt-audience"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value as NoticeAudience)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                >
                  <option value="all">All College Students</option>
                  <option value="department">Specific Department</option>
                  <option value="semester">Specific Semester (All Depts)</option>
                  <option value="department_semester">Department + Semester Combination</option>
                </select>
              </div>

              {(audience === 'department' || audience === 'department_semester') && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="nt-dept">
                    Target Department
                  </label>
                  <select
                    id="nt-dept"
                    value={targetDeptId}
                    onChange={(e) => setTargetDeptId(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    {SEEDED_DEPARTMENTS.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(audience === 'semester' || audience === 'department_semester') && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="nt-sem">
                    Target Semester
                  </label>
                  <select
                    id="nt-sem"
                    value={targetSemester}
                    onChange={(e) => setTargetSemester(Number(e.target.value))}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground" htmlFor="nt-content">
                Announcement Content
              </label>
              <textarea
                id="nt-content"
                placeholder="Complete text of notice including instructions, deadlines, or room venues..."
                className="w-full min-h-[110px] rounded-md border border-input bg-background p-3 text-xs leading-relaxed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={status === 'published' ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setStatus('published')}
                >
                  Publish Immediately
                </Button>
                <Button
                  type="button"
                  variant={status === 'draft' ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setStatus('draft')}
                >
                  Save as Draft
                </Button>
              </div>

              <Button type="submit" size="sm" className="h-8 text-xs gap-1">
                <Send className="h-3.5 w-3.5" aria-hidden="true" />
                Commit Notice
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Notices Table / List */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          College Announcements Registry ({collegeNotices.length})
        </h2>

        <div className="divide-y border rounded-lg bg-card shadow-card">
          {collegeNotices.map((n) => (
            <div key={n.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant={n.status === 'published' ? 'success' : n.status === 'draft' ? 'warning' : 'outline'}
                    className="text-2xs uppercase"
                  >
                    {n.status}
                  </Badge>

                  <Badge variant="outline" className="text-2xs">
                    Audience: {n.audience}
                  </Badge>

                  {n.targetSemester && (
                    <Badge variant="secondary" className="text-2xs">
                      Sem {n.targetSemester}
                    </Badge>
                  )}

                  <span className="text-2xs text-muted-foreground">
                    {formatDateTime(n.publishedAt || n.createdAt)}
                  </span>
                </div>

                <p className="font-bold text-sm text-foreground">{n.title}</p>
                <p className="text-muted-foreground line-clamp-1">{n.content}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {n.status === 'published' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-2xs"
                    onClick={() => {
                      updateNoticeStatus(n.id, 'archived')
                      setActionMsg(`Notice "${n.title}" has been archived.`)
                    }}
                  >
                    Archive
                  </Button>
                ) : n.status === 'archived' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-2xs"
                    onClick={() => {
                      updateNoticeStatus(n.id, 'published')
                      setActionMsg(`Notice "${n.title}" restored to published.`)
                    }}
                  >
                    Restore
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="h-7 text-2xs"
                    onClick={() => {
                      updateNoticeStatus(n.id, 'published')
                      setActionMsg(`Draft notice "${n.title}" published to student portal.`)
                    }}
                  >
                    Publish
                  </Button>
                )}

                <Link href={`/notices/${n.id}`}>
                  <Button size="icon-sm" variant="ghost" aria-label="Preview notice">
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
