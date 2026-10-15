'use client'

import React, { useState } from 'react'
import {
  FileText,
  ClipboardList,
  Search,
  Plus,
  Edit3,
  Trash2,
  Download,
  Filter,
  CheckCircle2,
  X,
  Building2,
  Calendar,
  ExternalLink
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/lib/data/client-store'
import type { Note, PYQ, ExamType } from '@/types'

export default function AdminResourcesPage() {
  const {
    currentProfile,
    departments,
    notes,
    pyqs,
    addNote,
    updateNote,
    deleteNote,
    addPYQ,
    updatePYQ,
    deletePYQ,
  } = useAppStore()

  const [activeTab, setActiveTab] = useState<'notes' | 'pyqs'>('notes')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all')
  const [actionMsg, setActionMsg] = useState<string | null>(null)

  // Note Modal State
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteSubject, setNoteSubject] = useState('')
  const [noteDescription, setNoteDescription] = useState('')
  const [noteDeptId, setNoteDeptId] = useState('')
  const [noteSemester, setNoteSemester] = useState(4)
  const [noteFileName, setNoteFileName] = useState('')
  const [noteFileUrl, setNoteFileUrl] = useState('')

  // PYQ Modal State
  const [showPyqModal, setShowPyqModal] = useState(false)
  const [editingPyq, setEditingPyq] = useState<PYQ | null>(null)
  const [pyqTitle, setPyqTitle] = useState('')
  const [pyqSubject, setPyqSubject] = useState('')
  const [pyqDeptId, setPyqDeptId] = useState('')
  const [pyqSemester, setPyqSemester] = useState(4)
  const [pyqExamYear, setPyqExamYear] = useState(2025)
  const [pyqExamType, setPyqExamType] = useState<ExamType>('midsem')
  const [pyqFileName, setPyqFileName] = useState('')
  const [pyqFileUrl, setPyqFileUrl] = useState('')

  // Filtered lists
  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.author?.fullName && n.author.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesDept = selectedDeptFilter === 'all' || n.departmentId === selectedDeptFilter
    return matchesSearch && matchesDept
  })

  const filteredPyqs = pyqs.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.author?.fullName && p.author.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesDept = selectedDeptFilter === 'all' || p.departmentId === selectedDeptFilter
    return matchesSearch && matchesDept
  })

  // Handlers for Notes
  const handleOpenAddNote = () => {
    setEditingNote(null)
    setNoteTitle('')
    setNoteSubject('')
    setNoteDescription('')
    setNoteDeptId(departments[0]?.id || '')
    setNoteSemester(4)
    setNoteFileName('lecture-notes.pdf')
    setNoteFileUrl('https://example.com/files/lecture-notes.pdf')
    setShowNoteModal(true)
  }

  const handleOpenEditNote = (note: Note) => {
    setEditingNote(note)
    setNoteTitle(note.title)
    setNoteSubject(note.subject)
    setNoteDescription(note.description || '')
    setNoteDeptId(note.departmentId || departments[0]?.id || '')
    setNoteSemester(note.semester || 4)
    setNoteFileName(note.fileName)
    setNoteFileUrl(note.fileUrl)
    setShowNoteModal(true)
  }

  const handleDeleteNote = (id: string, title: string) => {
    if (typeof window !== 'undefined' && !window.confirm(`Delete course note "${title}"?`)) return
    deleteNote(id)
    setActionMsg(`Note "${title}" has been deleted.`)
    setTimeout(() => setActionMsg(null), 3000)
  }

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteTitle.trim() || !noteSubject.trim()) return

    const deptObj = departments.find((d) => d.id === noteDeptId)

    if (editingNote) {
      updateNote(editingNote.id, {
        title: noteTitle.trim(),
        subject: noteSubject.trim(),
        description: noteDescription.trim() || null,
        departmentId: noteDeptId || null,
        department: deptObj,
        semester: Number(noteSemester),
        fileName: noteFileName.trim() || 'notes.pdf',
        fileUrl: noteFileUrl.trim() || 'https://example.com/notes.pdf',
      })
      setActionMsg(`Note "${noteTitle}" updated successfully.`)
    } else {
      addNote({
        collegeId: currentProfile.collegeId,
        authorId: currentProfile.id,
        title: noteTitle.trim(),
        subject: noteSubject.trim(),
        description: noteDescription.trim() || null,
        departmentId: noteDeptId || null,
        department: deptObj,
        semester: Number(noteSemester),
        fileName: noteFileName.trim() || 'notes.pdf',
        fileUrl: noteFileUrl.trim() || 'https://example.com/notes.pdf',
        fileSize: 2048576,
        mimeType: 'application/pdf',
      })
      setActionMsg(`Note "${noteTitle}" uploaded to repository.`)
    }

    setShowNoteModal(false)
    setTimeout(() => setActionMsg(null), 3000)
  }

  // Handlers for PYQs
  const handleOpenAddPyq = () => {
    setEditingPyq(null)
    setPyqTitle('')
    setPyqSubject('')
    setPyqDeptId(departments[0]?.id || '')
    setPyqSemester(4)
    setPyqExamYear(2025)
    setPyqExamType('midsem')
    setPyqFileName('question-paper.pdf')
    setPyqFileUrl('https://example.com/files/question-paper.pdf')
    setShowPyqModal(true)
  }

  const handleOpenEditPyq = (pyq: PYQ) => {
    setEditingPyq(pyq)
    setPyqTitle(pyq.title)
    setPyqSubject(pyq.subject)
    setPyqDeptId(pyq.departmentId || departments[0]?.id || '')
    setPyqSemester(pyq.semester || 4)
    setPyqExamYear(pyq.examYear || 2025)
    setPyqExamType(pyq.examType || 'midsem')
    setPyqFileName(pyq.fileName)
    setPyqFileUrl(pyq.fileUrl)
    setShowPyqModal(true)
  }

  const handleDeletePyq = (id: string, title: string) => {
    if (typeof window !== 'undefined' && !window.confirm(`Delete question paper "${title}"?`)) return
    deletePYQ(id)
    setActionMsg(`Question paper "${title}" has been deleted.`)
    setTimeout(() => setActionMsg(null), 3000)
  }

  const handleSavePyq = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pyqTitle.trim() || !pyqSubject.trim()) return

    const deptObj = departments.find((d) => d.id === pyqDeptId)

    if (editingPyq) {
      updatePYQ(editingPyq.id, {
        title: pyqTitle.trim(),
        subject: pyqSubject.trim(),
        departmentId: pyqDeptId || null,
        department: deptObj,
        semester: Number(pyqSemester),
        examYear: Number(pyqExamYear),
        examType: pyqExamType,
        fileName: pyqFileName.trim() || 'pyq.pdf',
        fileUrl: pyqFileUrl.trim() || 'https://example.com/pyq.pdf',
      })
      setActionMsg(`Question paper "${pyqTitle}" updated successfully.`)
    } else {
      addPYQ({
        collegeId: currentProfile.collegeId,
        authorId: currentProfile.id,
        title: pyqTitle.trim(),
        subject: pyqSubject.trim(),
        departmentId: pyqDeptId || null,
        department: deptObj,
        semester: Number(pyqSemester),
        examYear: Number(pyqExamYear),
        examType: pyqExamType,
        fileName: pyqFileName.trim() || 'pyq.pdf',
        fileUrl: pyqFileUrl.trim() || 'https://example.com/pyq.pdf',
        fileSize: 1548576,
      })
      setActionMsg(`Question paper "${pyqTitle}" added to archive.`)
    }

    setShowPyqModal(false)
    setTimeout(() => setActionMsg(null), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-2xs uppercase">
              {currentProfile.college?.name}
            </Badge>
            <span className="text-2xs text-muted-foreground">&bull; Academic Repository</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Notes &amp; PYQ Moderation Console
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage course materials, lecture notes, syllabus references, and university examination archives.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'notes' ? (
            <Button size="sm" onClick={handleOpenAddNote} className="gap-1.5 text-xs">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Upload Note
            </Button>
          ) : (
            <Button size="sm" onClick={handleOpenAddPyq} className="gap-1.5 text-xs">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Archive PYQ
            </Button>
          )}
        </div>
      </div>

      {/* Action Notification */}
      {actionMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-md text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {actionMsg}
          </span>
          <Button size="icon-sm" variant="ghost" onClick={() => setActionMsg(null)} aria-label="Dismiss message">
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </div>
      )}

      {/* Tabs & Search Filter Header */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex items-center gap-2 border p-1 rounded-lg bg-card w-fit">
          <Button
            size="sm"
            variant={activeTab === 'notes' ? 'default' : 'ghost'}
            className="text-xs gap-1.5 h-8"
            onClick={() => setActiveTab('notes')}
          >
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            Course Notes ({notes.length})
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'pyqs' ? 'default' : 'ghost'}
            className="text-xs gap-1.5 h-8"
            onClick={() => setActiveTab('pyqs')}
          >
            <ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />
            Previous Year Questions ({pyqs.length})
          </Button>
        </div>

        <div className="flex flex-1 max-w-md items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, subject, or author..."
              className="pl-8 text-xs h-8"
            />
          </div>

          <div className="w-40">
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="w-full h-8 text-xs rounded-md border border-input bg-card px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {activeTab === 'notes' ? (
        <Card className="border shadow-card overflow-hidden">
          <CardHeader className="py-3 px-4 border-b bg-muted/20">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Verified Course Notes Repository</span>
              <span className="font-mono text-2xs">{filteredNotes.length} Document(s)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredNotes.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No course notes found matching current filters.
              </div>
            ) : (
              <div className="divide-y">
                {filteredNotes.map((note) => (
                  <div key={note.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-muted/10 transition">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-foreground">{note.title}</span>
                        <Badge variant="outline" className="text-2xs font-mono">
                          {note.subject}
                        </Badge>
                        <Badge variant="secondary" className="text-2xs">
                          Sem {note.semester}
                        </Badge>
                        {note.department && (
                          <Badge variant="secondary" className="text-2xs bg-primary/10 text-primary border-primary/20">
                            {note.department.name}
                          </Badge>
                        )}
                      </div>
                      {note.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{note.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-2xs text-muted-foreground pt-0.5">
                        <span>By {note.author?.fullName || 'Academic Faculty'}</span>
                        <span>&bull;</span>
                        <span className="font-mono">{note.fileName}</span>
                        <span>&bull;</span>
                        <span>{note.downloadCount} downloads</span>
                        <span>&bull;</span>
                        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <a href={note.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex">
                        <Button size="icon-sm" variant="ghost" title="View Source File" aria-label="View source file">
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </Button>
                      </a>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => handleOpenEditNote(note)}
                        title="Edit Note Details"
                        aria-label="Edit note"
                      >
                        <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteNote(note.id, note.title)}
                        title="Delete Note"
                        aria-label="Delete note"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border shadow-card overflow-hidden">
          <CardHeader className="py-3 px-4 border-b bg-muted/20">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>University Question Papers Archive (PYQ)</span>
              <span className="font-mono text-2xs">{filteredPyqs.length} Paper(s)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredPyqs.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No past papers found matching current filters.
              </div>
            ) : (
              <div className="divide-y">
                {filteredPyqs.map((pyq) => (
                  <div key={pyq.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-muted/10 transition">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-foreground">{pyq.title}</span>
                        <Badge variant="outline" className="text-2xs font-mono">
                          {pyq.subject}
                        </Badge>
                        <Badge variant="secondary" className="text-2xs">
                          {pyq.examYear}
                        </Badge>
                        <Badge variant="secondary" className="text-2xs uppercase">
                          {pyq.examType || 'Regular'}
                        </Badge>
                        {pyq.department && (
                          <Badge variant="secondary" className="text-2xs bg-primary/10 text-primary border-primary/20">
                            {pyq.department.name}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-2xs text-muted-foreground pt-0.5">
                        <span>Sem {pyq.semester || 'N/A'}</span>
                        <span>&bull;</span>
                        <span className="font-mono">{pyq.fileName}</span>
                        <span>&bull;</span>
                        <span>{pyq.downloadCount} downloads</span>
                        <span>&bull;</span>
                        <span>Archived by {pyq.author?.fullName || 'Exam Cell'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <a href={pyq.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex">
                        <Button size="icon-sm" variant="ghost" title="View Question Paper" aria-label="View question paper">
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </Button>
                      </a>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => handleOpenEditPyq(pyq)}
                        title="Edit Paper Details"
                        aria-label="Edit question paper"
                      >
                        <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeletePyq(pyq.id, pyq.title)}
                        title="Delete Question Paper"
                        aria-label="Delete question paper"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
          <div className="bg-card border rounded-lg shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
                {editingNote ? 'Modify Course Note' : 'Upload Course Note'}
              </h2>
              <Button size="icon-sm" variant="ghost" onClick={() => setShowNoteModal(false)} aria-label="Close dialog">
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Document Title *</label>
                <Input
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g. Unit 3: Process Synchronization & Deadlocks"
                  required
                  className="text-xs h-8"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Subject Name *</label>
                  <Input
                    value={noteSubject}
                    onChange={(e) => setNoteSubject(e.target.value)}
                    placeholder="Operating Systems"
                    required
                    className="text-xs h-8"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Semester *</label>
                  <Input
                    type="number"
                    min={1}
                    max={8}
                    value={noteSemester}
                    onChange={(e) => setNoteSemester(Number(e.target.value))}
                    required
                    className="text-xs h-8"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Academic Department</label>
                <select
                  value={noteDeptId}
                  onChange={(e) => setNoteDeptId(e.target.value)}
                  className="w-full h-8 text-xs rounded-md border border-input bg-card px-2 text-foreground"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Summary &amp; Topics Covered</label>
                <Input
                  value={noteDescription}
                  onChange={(e) => setNoteDescription(e.target.value)}
                  placeholder="Brief syllabus topics included in this file"
                  className="text-xs h-8"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">File Name</label>
                  <Input
                    value={noteFileName}
                    onChange={(e) => setNoteFileName(e.target.value)}
                    placeholder="os-unit3.pdf"
                    className="text-xs h-8"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">File / Cloud URL</label>
                  <Input
                    value={noteFileUrl}
                    onChange={(e) => setNoteFileUrl(e.target.value)}
                    placeholder="https://example.com/file.pdf"
                    className="text-xs h-8"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowNoteModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  {editingNote ? 'Save Changes' : 'Upload Note'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PYQ Modal */}
      {showPyqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
          <div className="bg-card border rounded-lg shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-primary" aria-hidden="true" />
                {editingPyq ? 'Modify Question Paper' : 'Archive Question Paper (PYQ)'}
              </h2>
              <Button size="icon-sm" variant="ghost" onClick={() => setShowPyqModal(false)} aria-label="Close dialog">
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>

            <form onSubmit={handleSavePyq} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Examination Title *</label>
                <Input
                  value={pyqTitle}
                  onChange={(e) => setPyqTitle(e.target.value)}
                  placeholder="e.g. End Semester Examination - 2025"
                  required
                  className="text-xs h-8"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Subject Name *</label>
                  <Input
                    value={pyqSubject}
                    onChange={(e) => setPyqSubject(e.target.value)}
                    placeholder="Database Management Systems"
                    required
                    className="text-xs h-8"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Semester *</label>
                  <Input
                    type="number"
                    min={1}
                    max={8}
                    value={pyqSemester}
                    onChange={(e) => setPyqSemester(Number(e.target.value))}
                    required
                    className="text-xs h-8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Exam Year *</label>
                  <Input
                    type="number"
                    min={2015}
                    max={2030}
                    value={pyqExamYear}
                    onChange={(e) => setPyqExamYear(Number(e.target.value))}
                    required
                    className="text-xs h-8"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Exam Type *</label>
                  <select
                    value={pyqExamType}
                    onChange={(e) => setPyqExamType(e.target.value as ExamType)}
                    className="w-full h-8 text-xs rounded-md border border-input bg-card px-2 text-foreground"
                  >
                    <option value="midsem">Mid Semester</option>
                    <option value="endsem">End Semester</option>
                    <option value="quiz">Quiz / Unit Test</option>
                    <option value="supplementary">Supplementary</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Department</label>
                <select
                  value={pyqDeptId}
                  onChange={(e) => setPyqDeptId(e.target.value)}
                  className="w-full h-8 text-xs rounded-md border border-input bg-card px-2 text-foreground"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">File Name</label>
                  <Input
                    value={pyqFileName}
                    onChange={(e) => setPyqFileName(e.target.value)}
                    placeholder="dbms-endsem-2025.pdf"
                    className="text-xs h-8"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">File / Cloud URL</label>
                  <Input
                    value={pyqFileUrl}
                    onChange={(e) => setPyqFileUrl(e.target.value)}
                    placeholder="https://example.com/pyq.pdf"
                    className="text-xs h-8"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowPyqModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  {editingPyq ? 'Save Changes' : 'Archive PYQ'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
