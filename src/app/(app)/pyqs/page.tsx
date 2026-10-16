'use client'

import React, { useState } from 'react'
import {
  ClipboardList,
  Search,
  Download,
  Plus,
  Calendar,
  Building2,
  CheckCircle2,
  Award,
  Trash2
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/empty-state'
import { ResourceFileIcon } from '@/components/shared/resource-file-icon'
import { useAppStore } from '@/lib/data/client-store'
import { formatFileSize } from '@/lib/utils'
import type { ExamType } from '@/types'

export default function PYQsPage() {
  const { currentProfile, pyqs, addPYQ, deletePYQ } = useAppStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all')
  const [selectedSemester, setSelectedSemester] = useState<number | 'all'>('all')
  const [selectedExamType, setSelectedExamType] = useState<ExamType | 'all'>('all')

  // Upload state
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [semester, setSemester] = useState<number>(4)
  const [examYear, setExamYear] = useState<number>(2025)
  const [examType, setExamType] = useState<ExamType>('end_semester')
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)

  const collegePYQs = pyqs.filter((p) => p.collegeId === currentProfile.collegeId)

  const filteredPYQs = collegePYQs.filter((pyq) => {
    if (selectedYear !== 'all' && pyq.examYear !== selectedYear) return false
    if (selectedSemester !== 'all' && pyq.semester !== selectedSemester) return false
    if (selectedExamType !== 'all' && pyq.examType !== selectedExamType) return false

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const matches =
        pyq.title.toLowerCase().includes(q) ||
        pyq.subject.toLowerCase().includes(q)
      if (!matches) return false
    }

    return true
  })

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !subject.trim()) return

    const actualFileName = `${subject.toLowerCase().replace(/\s+/g, '_')}_${examType}_${examYear}.pdf`

    addPYQ({
      collegeId: currentProfile.collegeId,
      authorId: currentProfile.id,
      departmentId: currentProfile.departmentId,
      title: title.trim(),
      subject: subject.trim(),
      semester,
      examYear,
      examType,
      fileUrl: `/docs/samples/${actualFileName}`,
      fileName: actualFileName,
      fileSize: 920000,
    })

    setUploadSuccess(`Previous question paper "${title}" published.`)
    setTitle('')
    setSubject('')
    setShowUploadModal(false)
    setTimeout(() => setUploadSuccess(null), 4000)
  }

  const getExamTypeLabel = (type: ExamType | null) => {
    switch (type) {
      case 'end_semester':
        return 'End Semester'
      case 'mid_semester':
        return 'Mid Semester'
      case 'internal':
        return 'Internal Exam'
      case 'supplementary':
        return 'Supplementary'
      default:
        return 'University Exam'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Previous Year Question Papers (PYQs)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Archived examinations repository for revision and exam pattern analysis at {currentProfile.college?.name}
          </p>
        </div>

        <Button size="sm" onClick={() => setShowUploadModal(true)} className="gap-1.5 text-xs">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Contribute PYQ
        </Button>
      </div>

      {uploadSuccess && (
        <div className="p-3 text-xs rounded-md bg-success-50 text-success-600 border border-success-500/20 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Search and Multi-Filter Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="Search PYQs by subject name or keywords..."
              className="pl-9 text-xs h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Year Filter */}
            <select
              value={selectedYear}
              onChange={(e) =>
                setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="h-9 rounded-md border border-input bg-background px-3 text-xs shadow-subtle focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              aria-label="Filter by exam year"
            >
              <option value="all">All Exam Years</option>
              {[2025, 2024, 2023, 2022, 2021].map((yr) => (
                <option key={yr} value={yr}>
                  Year {yr}
                </option>
              ))}
            </select>

            {/* Exam Type Filter */}
            <select
              value={selectedExamType}
              onChange={(e) => setSelectedExamType(e.target.value as ExamType | 'all')}
              className="h-9 rounded-md border border-input bg-background px-3 text-xs shadow-subtle focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              aria-label="Filter by exam type"
            >
              <option value="all">All Exam Formats</option>
              <option value="end_semester">End Semester Exams</option>
              <option value="mid_semester">Mid Semester Tests</option>
              <option value="internal">Internal Assessments</option>
            </select>
          </div>
        </div>

        {/* Semester Filter Pills */}
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
            All Semesters ({collegePYQs.length})
          </button>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => {
            const count = collegePYQs.filter((p) => p.semester === s).length
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedSemester(s)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition shrink-0 flex items-center gap-1.5 ${
                  selectedSemester === s
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span>Sem {s}</span>
                {count > 0 && (
                  <span
                    className={`text-3xs font-mono px-1 rounded ${
                      selectedSemester === s ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* PYQ Grid */}
      {filteredPYQs.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No question papers found"
          description="No question papers match the selected criteria. You can be the first to upload this year's paper!"
          action={
            <Button size="sm" onClick={() => setShowUploadModal(true)}>
              Upload Question Paper
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPYQs.map((pyq) => (
            <Card
              key={pyq.id}
              className="p-5 border shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted/60 border border-border/70 shrink-0">
                    <ResourceFileIcon mimeType="application/pdf" fileName={pyq.fileName} size="md" />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="default" className="text-2xs font-normal">
                        {pyq.subject}
                      </Badge>
                      <Badge variant="outline" className="text-2xs font-mono font-bold">
                        {pyq.examYear}
                      </Badge>
                      {pyq.semester && (
                        <Badge variant="secondary" className="text-2xs font-mono">
                          Sem {pyq.semester}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-3xs capitalize text-muted-foreground">
                        {getExamTypeLabel(pyq.examType)}
                      </Badge>
                    </div>

                    <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2">
                      {pyq.title}
                    </h3>
                  </div>
                </div>

                <div className="text-2xs text-muted-foreground border-t border-border/60 pt-2.5 flex items-center justify-between">
                  <span>Term: {getExamTypeLabel(pyq.examType)}</span>
                  <span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-3xs border border-border/50">
                    {pyq.fileSize ? formatFileSize(pyq.fileSize) : '920 KB'}
                  </span>
                </div>
              </div>

              <div className="border-t border-border/60 pt-3 flex items-center justify-between gap-2">
                <span className="text-2xs text-muted-foreground">
                  Contributor: {pyq.author?.fullName || 'Student Contributor'}
                </span>

                <div className="flex items-center gap-1.5">
                  {(currentProfile.id === pyq.authorId || currentProfile.role === 'admin' || currentProfile.role === 'moderator') && (
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        if (typeof window !== 'undefined' && window.confirm(`Delete question paper "${pyq.title}"?`)) {
                          deletePYQ(pyq.id)
                        }
                      }}
                      title="Delete Question Paper"
                      aria-label="Delete question paper"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                  )}
                  <a
                    href={pyq.fileUrl}
                    download={pyq.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs font-medium shadow-xs">
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      Download PDF
                    </Button>
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload PYQ Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 border shadow-modal">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base font-bold">Contribute Previous Year Question Paper</CardTitle>
            </CardHeader>

            <form onSubmit={handleUploadSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="pyq-title">
                  Paper Title
                </label>
                <Input
                  id="pyq-title"
                  placeholder="e.g. Data Structures End-Sem Exam 2025"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="pyq-subj">
                    Subject Name
                  </label>
                  <Input
                    id="pyq-subj"
                    placeholder="Data Structures"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="pyq-year">
                    Exam Year
                  </label>
                  <Input
                    id="pyq-year"
                    type="number"
                    min={2000}
                    max={2030}
                    value={examYear}
                    onChange={(e) => setExamYear(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="pyq-sem">
                    Semester
                  </label>
                  <select
                    id="pyq-sem"
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

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="pyq-type">
                    Examination Type
                  </label>
                  <select
                    id="pyq-type"
                    value={examType}
                    onChange={(e) => setExamType(e.target.value as ExamType)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <option value="end_semester">End Semester</option>
                    <option value="mid_semester">Mid Semester</option>
                    <option value="internal">Internal Exam</option>
                    <option value="supplementary">Supplementary</option>
                  </select>
                </div>
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
                  Publish to Archive
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
