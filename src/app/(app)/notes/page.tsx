'use client'

import React, { useState, useRef } from 'react'
import {
  FileText,
  Search,
  Download,
  Plus,
  CheckCircle2,
  Trash2,
  Upload,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/empty-state'
import { ResourceFileIcon } from '@/components/shared/resource-file-icon'
import { useAppStore } from '@/lib/data/client-store'
import { formatFileSize, formatDate } from '@/lib/utils'

export default function NotesPage() {
  const { currentProfile, notes, addNote, deleteNote, updateNote } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSemester, setSelectedSemester] = useState<number | 'all'>('all')

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [semester, setSemester] = useState<number>(4)
  const [description, setDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFileError(null)
    if (file) {
      const allowed = ['application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain', 'image/png', 'image/jpeg']
      if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|ppt|pptx|txt|png|jpg|jpeg)$/i)) {
        setFileError('Please select a PDF, Word, PowerPoint, text, or image file.')
        setSelectedFile(null)
        return
      }
      if (file.size > 20 * 1024 * 1024) {
        setFileError('File size must be under 20 MB.')
        setSelectedFile(null)
        return
      }
    }
    setSelectedFile(file)
  }

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !subject.trim()) return
    if (!selectedFile) {
      setFileError('Please select a file to upload.')
      return
    }

    // Create an object URL so the browser can download it in-session
    const objectUrl = URL.createObjectURL(selectedFile)

    addNote({
      collegeId: currentProfile.collegeId,
      authorId: currentProfile.id,
      departmentId: currentProfile.departmentId,
      title: title.trim(),
      description: description.trim() || null,
      subject: subject.trim(),
      semester,
      fileUrl: objectUrl,
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      mimeType: selectedFile.type || 'application/octet-stream',
      isPublic: true,
    })

    setUploadSuccess(`"${title}" uploaded successfully and is ready to download.`)
    setTitle('')
    setSubject('')
    setDescription('')
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    setShowUploadModal(false)
    setTimeout(() => setUploadSuccess(null), 5000)
  }

  /**
   * Handles download for both seeded notes (static /docs/samples/ paths)
   * and user-uploaded notes (blob: object URLs).
   * Also increments the download counter in the store.
   */
  const handleDownload = (note: (typeof notes)[0]) => {
    // Increment download count
    updateNote(note.id, { downloadCount: (note.downloadCount ?? 0) + 1 })

    const link = document.createElement('a')
    link.href = note.fileUrl
    link.download = note.fileName
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCloseModal = () => {
    setShowUploadModal(false)
    setTitle('')
    setSubject('')
    setDescription('')
    setSelectedFile(null)
    setFileError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
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
        <div className="p-3 text-xs rounded-md bg-green-50 text-green-700 border border-green-200 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Search & Semester Pills */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search notes by title, topic, or subject..."
            className="pl-9 text-xs h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setSelectedSemester('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition shrink-0 ${
              selectedSemester === 'all'
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            All Semesters ({collegeNotes.length})
          </button>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
            const semCount = collegeNotes.filter((n) => n.semester === sem).length
            return (
              <button
                key={sem}
                type="button"
                onClick={() => setSelectedSemester(sem)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition shrink-0 flex items-center gap-1.5 ${
                  selectedSemester === sem
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span>Sem {sem}</span>
                {semCount > 0 && (
                  <span
                    className={`text-3xs font-mono px-1 rounded ${
                      selectedSemester === sem ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {semCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>
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
            <Card
              key={note.id}
              className="p-5 border shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted/60 border border-border/70 shrink-0">
                    <ResourceFileIcon mimeType={note.mimeType} fileName={note.fileName} size="md" />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="default" className="text-2xs font-normal">
                        {note.subject}
                      </Badge>
                      {note.semester && (
                        <Badge variant="outline" className="text-2xs font-mono">
                          Sem {note.semester}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2">
                      {note.title}
                    </h3>
                  </div>
                </div>

                {note.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {note.description}
                  </p>
                )}

                <div className="text-2xs text-muted-foreground border-t border-border/60 pt-2.5 flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-1">
                    <span className="text-muted-foreground">Author:</span>
                    <span className="font-medium text-foreground">{note.author?.fullName || 'Student'}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-3xs border border-border/50">
                      {note.fileSize ? formatFileSize(note.fileSize) : '—'}
                    </span>
                    {(note.downloadCount ?? 0) > 0 && (
                      <span className="text-3xs text-muted-foreground">
                        {note.downloadCount} download{note.downloadCount === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-border/60 pt-3 flex items-center justify-between gap-2">
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
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5 text-xs font-medium shadow-xs"
                    onClick={() => handleDownload(note)}
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    Download
                  </Button>
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
                  Resource Title <span className="text-destructive">*</span>
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
                    Subject Name <span className="text-destructive">*</span>
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

              {/* Real file picker */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="note-file">
                  File <span className="text-destructive">*</span>
                  <span className="ml-1 font-normal text-muted-foreground">(PDF, Word, PPT, image — max 20 MB)</span>
                </label>
                <div
                  className={`flex items-center gap-3 border rounded-md px-3 py-2 cursor-pointer hover:bg-muted/40 transition ${
                    fileError ? 'border-destructive' : 'border-input'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                  <span className={`text-xs truncate flex-1 ${selectedFile ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {selectedFile ? selectedFile.name : 'Click to browse and select a file…'}
                  </span>
                  {selectedFile && (
                    <span className="text-3xs font-mono text-muted-foreground shrink-0">
                      {formatFileSize(selectedFile.size)}
                    </span>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  id="note-file"
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="sr-only"
                />
                {fileError && (
                  <p className="text-2xs text-destructive">{fileError}</p>
                )}
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
                  onClick={handleCloseModal}
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
