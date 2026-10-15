'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Bell,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  Calendar,
  Building2,
  Users,
  Send,
  Eye,
  Filter,
  X
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/lib/data/client-store'
import { formatDateTime } from '@/lib/utils'
import type { Notice, NoticeAudience, NoticeStatus } from '@/types'

export default function AdminNoticesPage() {
  const { currentProfile, notices, departments, addNotice, updateNotice, deleteNotice, updateNoticeStatus } = useAppStore()

  // Composer / Edit state
  const [showModal, setShowModal] = useState(false)
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null)

  // Form fields
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [audience, setAudience] = useState<NoticeAudience>('all')
  const [targetDeptId, setTargetDeptId] = useState<string>(departments[0]?.id || '')
  const [targetSemester, setTargetSemester] = useState<number>(4)
  const [status, setStatus] = useState<NoticeStatus>('published')
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft' | 'archived'>('all')
  const [actionMsg, setActionMsg] = useState<string | null>(null)

  const collegeNotices = notices.filter((n) => n.collegeId === currentProfile.collegeId)
  const filteredNotices = collegeNotices.filter((n) => {
    if (filterStatus !== 'all' && n.status !== filterStatus) return false
    return true
  })

  const handleOpenAdd = () => {
    setEditingNotice(null)
    setTitle('')
    setContent('')
    setAudience('all')
    setTargetDeptId(departments[0]?.id || '')
    setTargetSemester(4)
    setStatus('published')
    setShowModal(true)
  }

  const handleOpenEdit = (notice: Notice) => {
    setEditingNotice(notice)
    setTitle(notice.title)
    setContent(notice.content)
    setAudience(notice.audience)
    setTargetDeptId(notice.targetDepartmentId || departments[0]?.id || '')
    setTargetSemester(notice.targetSemester || 4)
    setStatus(notice.status)
    setShowModal(true)
  }

  const handleDelete = (id: string, noticeTitle: string) => {
    if (typeof window !== 'undefined' && !window.confirm(`Are you sure you want to delete notice "${noticeTitle}"?`)) {
      return
    }
    deleteNotice(id)
    setActionMsg(`Notice "${noticeTitle}" was permanently deleted.`)
    setTimeout(() => setActionMsg(null), 4000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    if (editingNotice) {
      updateNotice(editingNotice.id, {
        title: title.trim(),
        content: content.trim(),
        status,
        audience,
        targetDepartmentId: audience === 'department' || audience === 'department_semester' ? targetDeptId : null,
        targetSemester: audience === 'semester' || audience === 'department_semester' ? targetSemester : null,
      })
      setActionMsg(`Notice "${title}" was updated successfully.`)
    } else {
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
      setActionMsg(`Notice "${title}" created and saved.`)
    }

    setShowModal(false)
    setEditingNotice(null)
    setTitle('')
    setContent('')
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
            Add, update, target, or delete institutional announcements for {currentProfile.college?.name}
          </p>
        </div>

        <Button size="sm" onClick={handleOpenAdd} className="gap-1.5 text-xs">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Create New Notice
        </Button>
      </div>

      {actionMsg && (
        <div className="p-3 text-xs rounded-md bg-success-50 text-success-600 border border-success-500/20 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex rounded-md border p-1 bg-muted/40 gap-1 text-xs w-fit">
        {(['all', 'published', 'draft', 'archived'] as const).map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded font-medium capitalize transition ${
              filterStatus === st ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
            }`}
          >
            {st} ({st === 'all' ? collegeNotices.length : collegeNotices.filter((n) => n.status === st).length})
          </button>
        ))}
      </div>

      {/* Notices Table / List */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          College Announcements Registry ({filteredNotices.length})
        </h2>

        {filteredNotices.length === 0 ? (
          <div className="p-12 text-center border rounded-lg bg-card text-muted-foreground text-xs">
            No notices found under this filter.
          </div>
        ) : (
          <div className="divide-y border rounded-lg bg-card shadow-card">
            {filteredNotices.map((n) => (
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
                  <p className="text-muted-foreground line-clamp-2 leading-relaxed">{n.content}</p>
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
                        setActionMsg(`Draft notice "${n.title}" published.`)
                      }}
                    >
                      Publish
                    </Button>
                  )}

                  {/* Edit Notice Button */}
                  <Button
                    size="icon-sm"
                    variant="outline"
                    onClick={() => handleOpenEdit(n)}
                    aria-label={`Edit notice ${n.title}`}
                    title="Edit notice details"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-foreground" aria-hidden="true" />
                  </Button>

                  {/* Delete Notice Button */}
                  <Button
                    size="icon-sm"
                    variant="outline"
                    onClick={() => handleDelete(n.id, n.title)}
                    className="text-destructive-600 hover:bg-destructive-50"
                    aria-label={`Delete notice ${n.title}`}
                    title="Delete notice"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>

                  <Link href={`/notices/${n.id}`}>
                    <Button size="icon-sm" variant="ghost" aria-label="Preview notice" title="Preview notice">
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Notice Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full p-6 border shadow-modal max-h-[90vh] overflow-y-auto">
            <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">
                {editingNotice ? 'Edit Institutional Notice' : 'Compose Targeted Notice'}
              </CardTitle>
              <Button size="icon-sm" variant="ghost" onClick={() => setShowModal(false)}>
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
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
                      {departments.map((dept) => (
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

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="nt-status">
                    Status
                  </label>
                  <select
                    id="nt-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as NoticeStatus)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="nt-content">
                  Announcement Content
                </label>
                <textarea
                  id="nt-content"
                  placeholder="Complete text of notice including instructions, deadlines, or room venues..."
                  className="w-full min-h-[140px] rounded-md border border-input bg-background p-3 text-xs leading-relaxed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="gap-1.5">
                  <Send className="h-3.5 w-3.5" aria-hidden="true" />
                  {editingNotice ? 'Update Notice' : 'Publish Notice'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
