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
  Plus,
  Trash2,
  ChevronRight,
  Pin,
  CheckCircle2,
  X,
  Send
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/empty-state'
import { NoticeAttachmentViewer } from '@/components/notices/notice-attachment-viewer'
import { NoticeAttachmentUploader } from '@/components/notices/notice-attachment-uploader'
import { useAppStore } from '@/lib/data/client-store'
import { formatDateTime, formatRelativeTime } from '@/lib/utils'
import { isAdmin, isFacultyOrAdmin } from '@/lib/auth/roles'
import type { NoticeAudience } from '@/types'

export default function NoticesPage() {
  const { currentProfile, loginAs, notices, departments, addNotice, deleteNotice } = useAppStore()
  const [filterAudience, setFilterAudience] = useState<'all' | 'department' | 'semester'>('all')
  const [selectedSemester, setSelectedSemester] = useState<number | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Quick Publish Modal state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [audience, setAudience] = useState<NoticeAudience>('all')
  const [targetDeptId, setTargetDeptId] = useState<string>(departments[0]?.id || '')
  const [targetSemester, setTargetSemester] = useState<number>(4)
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null)
  const [actionMsg, setActionMsg] = useState<string | null>(null)

  const canPublish = isFacultyOrAdmin(currentProfile)

  const handleOpenCreate = () => {
    if (!canPublish) return
    setTitle('')
    setContent('')
    setAudience('all')
    setTargetDeptId(departments[0]?.id || '')
    setTargetSemester(4)
    setAttachmentUrl(null)
    setShowCreateModal(true)
  }

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canPublish) return
    if (!title.trim() || !content.trim()) return

    addNotice({
      collegeId: currentProfile.collegeId,
      authorId: currentProfile.id,
      title: title.trim(),
      content: content.trim(),
      status: 'published',
      audience,
      targetDepartmentId: audience === 'department' || audience === 'department_semester' ? targetDeptId : null,
      targetSemester: audience === 'semester' || audience === 'department_semester' ? targetSemester : null,
      attachmentUrls: attachmentUrl ? [attachmentUrl] : null,
      publishedAt: new Date().toISOString(),
      expiresAt: null,
    })

    setShowCreateModal(false)
    setTitle('')
    setContent('')
    setAttachmentUrl(null)
    setActionMsg(`Notice "${title}" was published with attachment.`)
    setTimeout(() => setActionMsg(null), 4000)
  }

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Official Notices &amp; Circulars
            </h1>
            <Badge variant="outline" className="text-3xs font-mono">
              {filteredNotices.length} Published
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Authoritative announcements issued for {currentProfile.college?.name}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentProfile.role !== 'student' ? (
            <>
              <Button size="sm" onClick={handleOpenCreate} className="gap-1.5 text-xs shadow-subtle h-8">
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Publish Circular</span>
              </Button>
              <Link href="/admin/notices">
                <Button size="sm" variant="outline" className="gap-1 text-xs shadow-subtle h-8">
                  <span>Notices Engine</span>
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </Link>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs shadow-subtle h-8 border-primary/30 text-primary hover:bg-primary/5"
              onClick={() => loginAs('admin@demo.campusconnect.app')}
              title="Switch to Dr. Jamir (Dean Academic) to publish notices"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Switch to Dean Jamir (Admin)</span>
            </Button>
          )}
        </div>
      </div>

      {actionMsg && (
        <div className="p-3 text-xs rounded-md bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="Search announcements by keyword, topic, or circular title..."
              className="pl-9 text-xs h-9 bg-card"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Audience Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-md border border-border/70 bg-card overflow-x-auto no-scrollbar shadow-subtle text-xs">
            <button
              type="button"
              onClick={() => {
                setFilterAudience('all')
                setSelectedSemester('all')
              }}
              className={`px-3 py-1.5 rounded text-2xs font-medium transition cursor-pointer whitespace-nowrap ${
                filterAudience === 'all'
                  ? 'bg-secondary text-foreground font-semibold border border-border/80 shadow-subtle'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All Notices
            </button>
            <button
              type="button"
              onClick={() => {
                setFilterAudience('department')
                setSelectedSemester('all')
              }}
              className={`px-3 py-1.5 rounded text-2xs font-medium transition cursor-pointer whitespace-nowrap ${
                filterAudience === 'department'
                  ? 'bg-secondary text-foreground font-semibold border border-border/80 shadow-subtle'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Department Only
            </button>
            <button
              type="button"
              onClick={() => setFilterAudience('semester')}
              className={`px-3 py-1.5 rounded text-2xs font-medium transition cursor-pointer whitespace-nowrap ${
                filterAudience === 'semester'
                  ? 'bg-secondary text-foreground font-semibold border border-border/80 shadow-subtle'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Semester Scope
            </button>
          </div>
        </div>

        {/* Semester Selector Chips (When semester filter is active) */}
        {filterAudience === 'semester' && (
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
            <span className="text-3xs font-semibold uppercase tracking-wider text-muted-foreground mr-1">
              Filter Semester:
            </span>
            <button
              type="button"
              onClick={() => setSelectedSemester('all')}
              className={`px-2.5 py-1 rounded text-2xs font-mono transition cursor-pointer ${
                selectedSemester === 'all'
                  ? 'bg-primary text-primary-foreground font-semibold shadow-subtle'
                  : 'bg-card border border-border/70 text-muted-foreground hover:text-foreground'
              }`}
            >
              All Semesters
            </button>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <button
                key={sem}
                type="button"
                onClick={() => setSelectedSemester(sem)}
                className={`px-2.5 py-1 rounded text-2xs font-mono transition cursor-pointer ${
                  selectedSemester === sem
                    ? 'bg-primary text-primary-foreground font-semibold shadow-subtle'
                    : 'bg-card border border-border/70 text-muted-foreground hover:text-foreground'
                }`}
              >
                Sem {sem}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notice Cards List */}
      <div className="space-y-3.5">
        {filteredNotices.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notices found"
            description="There are currently no active announcements matching your query or selected scope."
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
            <Card
              key={notice.id}
              className="p-5 border border-border/80 shadow-subtle hover:border-border transition-all bg-card space-y-3 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="default" className="text-3xs uppercase font-mono">
                      {notice.audience === 'all'
                        ? 'All Students'
                        : notice.audience === 'department'
                        ? 'Department Notice'
                        : `Semester ${notice.targetSemester || ''}`}
                    </Badge>
                    <span className="text-3xs text-muted-foreground font-mono flex items-center gap-1">
                      <Calendar className="h-3 w-3" aria-hidden="true" />
                      {formatDateTime(notice.publishedAt || notice.createdAt)}
                    </span>
                    <span className="text-3xs text-muted-foreground font-mono">
                      &bull; Ref: {notice.id.slice(0, 8)}
                    </span>
                  </div>

                  <Link href={`/notices/${notice.id}`}>
                    <h2 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                      {notice.title}
                    </h2>
                  </Link>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {notice.content}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                  <div className="text-2xs text-muted-foreground flex items-center gap-1.5">
                    <User className="h-3 w-3 text-primary" aria-hidden="true" />
                    <span className="font-medium text-foreground">{notice.author?.fullName || 'Academic Dean'}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {(currentProfile.role === 'admin' || currentProfile.role === 'moderator' || currentProfile.id === notice.authorId) && (
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="h-7.5 w-7.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (typeof window !== 'undefined' && window.confirm(`Delete notice "${notice.title}"?`)) {
                            deleteNotice(notice.id)
                          }
                        }}
                        title="Delete Notice"
                        aria-label="Delete notice"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    )}
                    <Link href={`/notices/${notice.id}`}>
                      <Button variant="outline" size="sm" className="h-7.5 text-2xs gap-1 shadow-subtle">
                        <span>Read Circular</span>
                        <ChevronRight className="h-3 w-3" aria-hidden="true" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {notice.attachmentUrls && notice.attachmentUrls.length > 0 && (
                <div className="pt-1 border-t border-border/50">
                  {notice.attachmentUrls.map((url, idx) => (
                    <NoticeAttachmentViewer
                      key={idx}
                      url={url}
                      title={notice.title}
                      mode="card"
                    />
                  ))}
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Quick Publish Circular Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full p-6 border shadow-modal max-h-[90vh] overflow-y-auto">
            <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-foreground">
                Publish Official College Circular
              </CardTitle>
              <Button size="icon-sm" variant="ghost" onClick={() => setShowCreateModal(false)}>
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </CardHeader>

            <form onSubmit={handleCreateNotice} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="quick-nt-title">
                  Notice Headline *
                </label>
                <Input
                  id="quick-nt-title"
                  placeholder="e.g. Schedule of Laboratory Practical Examinations"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Audience Targeting Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="quick-nt-audience">
                    Target Audience
                  </label>
                  <select
                    id="quick-nt-audience"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value as NoticeAudience)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <option value="all">All College Students</option>
                    <option value="department">Specific Department</option>
                    <option value="semester">Specific Semester (All Depts)</option>
                    <option value="department_semester">Department + Semester Combination</option>
                  </select>
                </div>

                {(audience === 'department' || audience === 'department_semester') && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground" htmlFor="quick-nt-dept">
                      Target Department
                    </label>
                    <select
                      id="quick-nt-dept"
                      value={targetDeptId}
                      onChange={(e) => setTargetDeptId(e.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
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
                    <label className="text-xs font-medium text-foreground" htmlFor="quick-nt-sem">
                      Target Semester
                    </label>
                    <select
                      id="quick-nt-sem"
                      value={targetSemester}
                      onChange={(e) => setTargetSemester(Number(e.target.value))}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
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
                <label className="text-xs font-medium text-foreground" htmlFor="quick-nt-content">
                  Announcement Details &amp; Instructions *
                </label>
                <textarea
                  id="quick-nt-content"
                  placeholder="Complete text of notice including instructions, deadlines, or room venues..."
                  className="w-full min-h-[120px] rounded-md border border-input bg-background p-3 text-xs leading-relaxed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>

              {/* Attachment Picker for Image or PDF */}
              <NoticeAttachmentUploader
                attachmentUrl={attachmentUrl}
                onChange={setAttachmentUrl}
              />

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="gap-1.5 shadow-subtle">
                  <Send className="h-3.5 w-3.5" aria-hidden="true" />
                  Publish Circular
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
