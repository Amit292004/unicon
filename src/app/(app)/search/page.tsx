'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Bell,
  FileText,
  ClipboardList,
  Compass,
  Users,
  Bus,
  ExternalLink,
  ArrowRight
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/empty-state'
import { UserAvatar } from '@/components/shared/user-avatar'
import { useAppStore } from '@/lib/data/client-store'

export default function UnifiedSearchPage() {
  const { currentProfile, notices, notes, pyqs, projects, profiles, routes, lostFoundReports } = useAppStore()
  const [query, setQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'notices' | 'notes' | 'pyqs' | 'students' | 'transport'>('all')

  const q = query.toLowerCase().trim()

  // College-scoped searches
  const matchedNotices = q
    ? notices.filter(
        (n) =>
          n.collegeId === currentProfile.collegeId &&
          (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
      )
    : []

  const matchedNotes = q
    ? notes.filter(
        (n) =>
          n.collegeId === currentProfile.collegeId &&
          (n.title.toLowerCase().includes(q) || n.subject.toLowerCase().includes(q))
      )
    : []

  const matchedPYQs = q
    ? pyqs.filter(
        (p) =>
          p.collegeId === currentProfile.collegeId &&
          (p.title.toLowerCase().includes(q) || p.subject.toLowerCase().includes(q))
      )
    : []

  const matchedProjects = q
    ? projects.filter(
        (p) =>
          p.collegeId === currentProfile.collegeId &&
          (p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
      )
    : []

  const matchedStudents = q
    ? profiles.filter(
        (s) =>
          s.collegeId === currentProfile.collegeId &&
          (s.fullName.toLowerCase().includes(q) || s.username.toLowerCase().includes(q))
      )
    : []

  const matchedRoutes = q
    ? routes.filter(
        (r) =>
          r.collegeId === currentProfile.collegeId &&
          (r.routeName.toLowerCase().includes(q) ||
            r.stops.some((st) => st.stopName.toLowerCase().includes(q)))
      )
    : []

  const totalResults =
    matchedNotices.length +
    matchedNotes.length +
    matchedPYQs.length +
    matchedProjects.length +
    matchedStudents.length +
    matchedRoutes.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Unified Campus Search
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Federated index across notices, notes, exams, transit schedules, and student directory
        </p>
      </div>

      {/* Main Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" aria-hidden="true" />
        <Input
          placeholder="Search for exam timetables, notes, transit stops, or peers..."
          className="h-12 pl-11 text-sm shadow-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-1.5 text-xs">
        <button
          type="button"
          onClick={() => setSelectedFilter('all')}
          className={`px-3 py-1 rounded-full border transition ${
            selectedFilter === 'all'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'hover:bg-accent text-muted-foreground'
          }`}
        >
          All Categories
        </button>
        <button
          type="button"
          onClick={() => setSelectedFilter('notices')}
          className={`px-3 py-1 rounded-full border transition ${
            selectedFilter === 'notices'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'hover:bg-accent text-muted-foreground'
          }`}
        >
          Notices ({matchedNotices.length})
        </button>
        <button
          type="button"
          onClick={() => setSelectedFilter('notes')}
          className={`px-3 py-1 rounded-full border transition ${
            selectedFilter === 'notes'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'hover:bg-accent text-muted-foreground'
          }`}
        >
          Notes ({matchedNotes.length})
        </button>
        <button
          type="button"
          onClick={() => setSelectedFilter('pyqs')}
          className={`px-3 py-1 rounded-full border transition ${
            selectedFilter === 'pyqs'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'hover:bg-accent text-muted-foreground'
          }`}
        >
          PYQs ({matchedPYQs.length})
        </button>
        <button
          type="button"
          onClick={() => setSelectedFilter('students')}
          className={`px-3 py-1 rounded-full border transition ${
            selectedFilter === 'students'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'hover:bg-accent text-muted-foreground'
          }`}
        >
          Students ({matchedStudents.length})
        </button>
      </div>

      {/* Results View */}
      {!q ? (
        <div className="p-12 text-center text-xs text-muted-foreground">
          Type a search term above to instantly query across all campus databases.
        </div>
      ) : totalResults === 0 ? (
        <EmptyState
          icon={Search}
          title="No results found"
          description={`No announcements, notes, or records matched "${query}".`}
        />
      ) : (
        <div className="space-y-6">
          {/* Notices Results */}
          {(selectedFilter === 'all' || selectedFilter === 'notices') && matchedNotices.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Bell className="h-3.5 w-3.5" aria-hidden="true" />
                Notices ({matchedNotices.length})
              </h2>
              <div className="space-y-2">
                {matchedNotices.map((n) => (
                  <Link key={n.id} href={`/notices/${n.id}`} className="block">
                    <Card className="p-3.5 border shadow-card hover:bg-accent/40 transition flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground truncate">{n.title}</p>
                        <p className="text-2xs text-muted-foreground line-clamp-1 mt-0.5">{n.content}</p>
                      </div>
                      <Badge variant="outline" className="text-2xs shrink-0 ml-3">
                        Notice
                      </Badge>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Notes Results */}
          {(selectedFilter === 'all' || selectedFilter === 'notes') && matchedNotes.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                Course Notes ({matchedNotes.length})
              </h2>
              <div className="space-y-2">
                {matchedNotes.map((note) => (
                  <Link key={note.id} href="/notes" className="block">
                    <Card className="p-3.5 border shadow-card hover:bg-accent/40 transition flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground truncate">{note.title}</p>
                        <p className="text-2xs text-muted-foreground mt-0.5 truncate">
                          {note.subject} &bull; Semester {note.semester}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-2xs shrink-0 ml-3">
                        Note
                      </Badge>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* PYQ Results */}
          {(selectedFilter === 'all' || selectedFilter === 'pyqs') && matchedPYQs.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />
                Question Papers ({matchedPYQs.length})
              </h2>
              <div className="space-y-2">
                {matchedPYQs.map((pyq) => (
                  <Link key={pyq.id} href="/pyqs" className="block">
                    <Card className="p-3.5 border shadow-card hover:bg-accent/40 transition flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground truncate">{pyq.title}</p>
                        <p className="text-2xs text-muted-foreground mt-0.5 truncate">
                          {pyq.subject} &bull; Year {pyq.examYear}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-2xs shrink-0 ml-3">
                        PYQ
                      </Badge>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Student Peer Results */}
          {(selectedFilter === 'all' || selectedFilter === 'students') && matchedStudents.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" aria-hidden="true" />
                Student Directory ({matchedStudents.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {matchedStudents.map((student) => (
                  <Link key={student.id} href={`/profile/${student.username}`} className="block">
                    <Card className="p-3.5 border shadow-card hover:bg-accent/40 transition flex items-center gap-3 text-xs">
                      <UserAvatar name={student.fullName} avatarUrl={student.avatarUrl} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground truncate">{student.fullName}</p>
                        <p className="text-2xs text-muted-foreground truncate">
                          @{student.username} &bull; {student.department?.code || 'Student'}
                        </p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
