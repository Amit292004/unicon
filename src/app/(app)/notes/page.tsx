'use client'

import React, { useState } from 'react'
import {
  FileText,
  Search,
  Download,
  Plus,
  BookOpen,
  Calendar,
  User,
  CheckCircle2,
  Filter,
  Trash2
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/empty-state'
import { ResourceFileIcon } from '@/components/shared/resource-file-icon'
import { useAppStore } from '@/lib/data/client-store'
import { formatFileSize, formatDate } from '@/lib/utils'

export default function NotesPage() {
  const { currentProfile, notes, addNote, deleteNote } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSemester, setSelectedSemester] = useState<number | 'all'>('all')

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [semester, setSemester] = useState<number>(4)
  const [description, setDescription] = useState('')
  const [fileName, setFileName] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)

  const collegeNotes = notes.filter((n) => n.collegeId === currentProfile.collegeId)

  const filteredNotes = collegeNotes.filter((note) => {
    if (selectedSemester !== 'all' && note.semester !== selectedSemester) {
      return false
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const matches =
        note.title.toLowerCase().includes(q) ||
        note.subject.toLowerCase().includes(q) ||
        (note.description && note.description.toLowerCase().includes(q))
      if (!matches) return false
    }
    return true
  })

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !subject.trim()) return

    const actualFileName = fileName.trim() || `${subject.toLowerCase().replace(/\s+/g, '_')}_notes.pdf`

    addNote({
      collegeId: currentProfile.collegeId,
      authorId: currentProfile.id,
      departmentId: currentProfile.departmentId,
      title: title.trim(),
      description: description.trim() || null,
      subject: subject.trim(),
      semester,
      fileUrl: `/docs/samples/${actualFileName}`,
      fileName: actualFileName,
      fileSize: 1850000,
      mimeType: 'application/pdf',
      isPublic: true,
    })

    setUploadSuccess(`Note "${title}" uploaded successfully.`)
    setTitle('')
    setSubject('')
    setDescription('')
    setFileName('')
    setShowUploadModal(false)
    setTimeout(() => setUploadSuccess(null), 4000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Academic Course Notes
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Peer-contributed study materials and lecture outlines for {currentProfile.college?.name}
          </p>
        </div>

        <Button size="sm" onClick={() => setShowUploadModal(true)} className="gap-1.5 text-xs">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Share Study Notes
        </Button>
      </div>

      {uploadSuccess && (
        <div className="p-3 text-xs rounded-md bg-success-50 text-success-600 border border-success-500/20 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search notes by title, topic, or subject..."
            className="pl-9 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          value={selectedSemester}
          onChange={(e) =>
            setSelectedSemester(e.target.value === 'all' ? 'all' : Number(e.target.value))
          }
          className="h-9 rounded-md border border-input bg-background px-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          aria-label="Filter notes by semester"
        >
          <option value="all">All Semesters</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
            <option key={sem} value={sem}>
              Semester {sem}
            </option>
          ))}
        </select>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No course notes found"
          description="No study materials match your search filters. Be the first to share notes for this subject!"
          action={
            <Button size="sm" onClick={() => setShowUploadModal(true)}>
              Upload First Note
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="p-5 border shadow-card flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <ResourceFileIcon mimeType={note.mimeType} fileName={note.fileName} size="md" />
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="default" className="text-2xs font-normal">
                        {note.subject}
                      </Badge>
                      {note.semester && (
                        <Badge variant="outline" className="text-2xs">
                          Sem {note.semester}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-foreground leading-snug">
                      {note.title}
                    </h3>
                  </div>
                </div>

                {note.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {note.description}
                  </p>
                )}

                <div className="text-2xs text-muted-foreground border-t pt-2 flex flex-wrap items-center justify-between gap-2">
                  <span>Author: {note.author?.fullName || 'Student'}</span>
                  <span>Size: {note.fileSize ? formatFileSize(note.fileSize) : '1.8 MB'}</span>
                </div>
              </div>

              <div className="border-t pt-3 flex items-center justify-between gap-2">
                <span className="text-2xs text-muted-foreground">
                  {formatDate(note.createdAt)}
                </span>

                <div className="flex items-center gap-1.5">
                  {(currentProfile.id === note.authorId || currentProfile.role === 'admin' || currentProfile.role === 'moderator') && (
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        if (typeof window !== 'undefined' && window.confirm(`Delete note "${note.title}"?`)) {
                          deleteNote(note.id)
                        }
                      }}
                      title="Delete Note"
                      aria-label="Delete note"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                  )}
                  <a
                    href={note.fileUrl}
                    download={note.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      Download File
                    </Button>
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 border shadow-modal">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base font-bold">Share Course Notes</CardTitle>
            </CardHeader>

            <form onSubmit={handleUploadSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="note-title">
                  Resource Title
                </label>
                <Input
                  id="note-title"
                  placeholder="e.g. Operating Systems — Paging & TLB"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="note-subject">
                    Subject Name
                  </label>
                  <Input
                    id="note-subject"
                    placeholder="Operating Systems"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="note-sem">
                    Semester
                  </label>
                  <select
                    id="note-sem"
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="note-filename">
                  Document Filename
                </label>
                <Input
                  id="note-filename"
                  placeholder="os_lecture_notes_unit2.pdf"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="note-desc">
                  Summary &amp; Topics Covered
                </label>
                <textarea
                  id="note-desc"
                  placeholder="Key concepts, diagrams, formula sheets included..."
                  className="w-full min-h-[70px] rounded-md border border-input bg-background p-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Publish to Library
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
