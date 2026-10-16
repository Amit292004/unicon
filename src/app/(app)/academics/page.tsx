'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Calendar,
  Clock,
  Building2,
  FileText,
  Download,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Plus,
  MapPin,
  X,
  Search,
  RotateCcw,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/lib/data/client-store'
import { isFacultyOrAdmin } from '@/lib/auth/roles'

export default function AcademicsPage() {
  const {
    currentProfile,
    timetableSlots,
    examSchedules,
    calendarEvents,
    addTimetableSlot,
  } = useAppStore()

  // User's default enrolled semester (from profile, or 4 for demo student Alex Chen)
  const userEnrolledSemester = currentProfile.semester || 4

  const [activeTab, setActiveTab] = useState<'timetable' | 'exams' | 'calendar'>('timetable')
  const [selectedSemester, setSelectedSemester] = useState<number | 'all'>(userEnrolledSemester)
  const [selectedDay, setSelectedDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'>('Mon')
  const [examSearch, setExamSearch] = useState('')
  const [calendarFilter, setCalendarFilter] = useState<string>('All')

  // Slot modal
  const [showSlotModal, setShowSlotModal] = useState(false)
  const [slotSubject, setSlotSubject] = useState('')
  const [slotTime, setSlotTime] = useState('09:00 - 10:00 AM')
  const [slotRoom, setSlotRoom] = useState('Room 204')
  const [slotFaculty, setSlotFaculty] = useState('')
  const [slotDay, setSlotDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'>('Mon')
  const [slotSemester, setSlotSemester] = useState<number>(
    selectedSemester !== 'all' ? selectedSemester : userEnrolledSemester
  )

  const isAdminOrFaculty = isFacultyOrAdmin(currentProfile)

  // Filter slots by selected semester
  const semesterSlots = timetableSlots.filter((slot) => {
    if (selectedSemester === 'all') return true
    return (slot.semester || 4) === selectedSemester
  })

  // Filter slots for the selected day
  const dailySlots = semesterSlots.filter((slot) => slot.day === selectedDay)

  // Filter exams by semester and search query
  const filteredExams = examSchedules.filter((exam) => {
    if (selectedSemester !== 'all' && (exam.semester || 4) !== selectedSemester) {
      return false
    }
    if (!examSearch) return true
    const q = examSearch.toLowerCase()
    return (
      exam.code.toLowerCase().includes(q) ||
      exam.subject.toLowerCase().includes(q) ||
      exam.hall.toLowerCase().includes(q)
    )
  })

  const filteredCalendar = calendarEvents.filter((evt) => {
    if (calendarFilter === 'All') return true
    return evt.type === calendarFilter
  })

  const handleOpenSlotModal = () => {
    if (!isAdminOrFaculty) return
    setSlotSemester(selectedSemester !== 'all' ? selectedSemester : userEnrolledSemester)
    setSlotDay(selectedDay)
    setShowSlotModal(true)
  }

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdminOrFaculty) return
    if (!slotSubject.trim()) return

    addTimetableSlot({
      collegeId: currentProfile.collegeId,
      day: slotDay,
      time: slotTime.trim(),
      subject: slotSubject.trim(),
      room: slotRoom.trim() || 'Room 101',
      faculty: slotFaculty.trim() || currentProfile.fullName,
      departmentId: currentProfile.departmentId,
      semester: Number(slotSemester),
    })

    setSlotSubject('')
    setSlotFaculty('')
    setShowSlotModal(false)
    setSelectedDay(slotDay)
    if (selectedSemester !== 'all' && selectedSemester !== Number(slotSemester)) {
      setSelectedSemester(Number(slotSemester))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Academic Governance &amp; Timetable
            </h1>
            <Badge variant="outline" className="text-3xs font-mono font-medium">
              {currentProfile.department?.name || 'Computer Science & Engineering'} &bull;{' '}
              {selectedSemester === 'all' ? 'All Semesters' : `Sem ${selectedSemester}`}
            </Badge>
            {selectedSemester === userEnrolledSemester && (
              <Badge variant="secondary" className="text-3xs font-sans text-primary bg-primary/10">
                Your Semester
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Curriculum schedules, departmental timetables, and examination calendar for{' '}
            {currentProfile.college?.name || 'Nagaland University'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8 gap-1.5 shadow-subtle"
            onClick={() => {
              if (typeof window !== 'undefined') window.print()
            }}
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Print Schedule
          </Button>
          {isAdminOrFaculty && (
            <Button
              size="sm"
              className="text-xs h-8 gap-1.5 shadow-subtle"
              onClick={handleOpenSlotModal}
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add Class Slot
            </Button>
          )}
          {isAdminOrFaculty && (
            <Link href="/admin/academics">
              <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5 shadow-subtle">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Admin Console
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="flex border-b border-border/80 space-x-2 text-xs font-medium overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('timetable')}
          className={`pb-2.5 px-3 border-b-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'timetable'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Weekly Timetable ({semesterSlots.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('exams')}
          className={`pb-2.5 px-3 border-b-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'exams'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Exam Timetable ({filteredExams.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`pb-2.5 px-3 border-b-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'calendar'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Academic Calendar ({calendarEvents.length})
        </button>
      </div>

      {/* Semester Switcher Navigation (Active for Timetable and Exam views) */}
      {(activeTab === 'timetable' || activeTab === 'exams') && (
        <div className="p-3 rounded-xl border border-border/70 bg-card/70 shadow-subtle space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
              <span className="text-xs font-semibold text-foreground">Select Semester:</span>
              <span className="text-2xs text-muted-foreground">
                Browse curriculum and schedules across all 8 degree semesters
              </span>
            </div>

            {selectedSemester !== userEnrolledSemester && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSemester(userEnrolledSemester)}
                className="h-7 text-2xs text-primary gap-1 self-start sm:self-auto hover:bg-primary/10"
              >
                <RotateCcw className="h-3 w-3" />
                Back to My Semester (Sem {userEnrolledSemester})
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {([1, 2, 3, 4, 5, 6, 7, 8] as const).map((sem) => {
              const isSelected = selectedSemester === sem
              const isUserSem = userEnrolledSemester === sem
              return (
                <button
                  key={sem}
                  type="button"
                  onClick={() => setSelectedSemester(sem)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-primary text-primary-foreground font-semibold shadow-subtle ring-1 ring-primary/30'
                      : 'bg-secondary/70 hover:bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>Sem {sem}</span>
                  {isUserSem && (
                    <span
                      className={`text-3xs px-1 py-0.2 rounded font-mono ${
                        isSelected
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : 'bg-primary/15 text-primary font-semibold'
                      }`}
                      title="Your enrolled semester"
                    >
                      You
                    </span>
                  )}
                </button>
              )
            })}

            <div className="h-4 w-px bg-border/80 mx-1 shrink-0" />

            <button
              type="button"
              onClick={() => setSelectedSemester('all')}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                selectedSemester === 'all'
                  ? 'bg-primary text-primary-foreground font-semibold shadow-subtle ring-1 ring-primary/30'
                  : 'bg-secondary/70 hover:bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              All Semesters
            </button>
          </div>
        </div>
      )}

      {/* Tab 1: Weekly Timetable */}
      {activeTab === 'timetable' && (
        <div className="space-y-4">
          {/* Day Selector Chips */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const).map((day) => {
              const countForDay = semesterSlots.filter((s) => s.day === day).length
              const isSelected = selectedDay === day
              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`py-2 px-1 sm:px-2 text-xs rounded-lg border text-center transition flex flex-col items-center justify-center gap-0.5 cursor-pointer min-w-0 ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary font-semibold shadow-subtle ring-1 ring-primary/20'
                      : 'bg-card border-border/70 hover:bg-secondary/60 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="font-semibold text-2xs sm:text-xs">{day}</span>
                  <span
                    className={`text-3xs font-mono ${
                      isSelected ? 'text-primary-foreground/90' : 'opacity-80'
                    }`}
                  >
                    {countForDay} <span className="hidden sm:inline">classes</span>
                  </span>
                </button>
              )
            })}
          </div>

          <Card className="border border-border/80 shadow-subtle divide-y divide-border/60 bg-card overflow-hidden">
            {dailySlots.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground space-y-1">
                <Clock className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2" aria-hidden="true" />
                <p className="font-medium text-foreground">
                  No scheduled lectures for {selectedDay} in{' '}
                  {selectedSemester === 'all' ? 'any semester' : `Semester ${selectedSemester}`}
                </p>
                <p className="text-2xs text-muted-foreground">
                  Self-study period, elective preparation, or laboratory session.
                </p>
                {isAdminOrFaculty && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleOpenSlotModal}
                    className="mt-3 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add Lecture Slot
                  </Button>
                )}
              </div>
            ) : (
              dailySlots.map((slot) => (
                <div
                  key={slot.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Clock className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-foreground text-sm">{slot.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        Instructor: <span className="text-foreground font-medium">{slot.faculty}</span>{' '}
                        &bull; Location:{' '}
                        <span className="font-medium text-foreground">{slot.room}</span>
                        {slot.semester && (
                          <span className="ml-1.5 text-3xs font-mono text-muted-foreground">
                            (Sem {slot.semester})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className="font-mono text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded border border-border/60">
                      {slot.time}
                    </span>
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>
      )}

      {/* Tab 2: Exam Timetable */}
      {activeTab === 'exams' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="relative max-w-sm flex-1">
              <Search
                className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="text"
                placeholder="Search exams by subject or course code..."
                value={examSearch}
                onChange={(e) => setExamSearch(e.target.value)}
                className="pl-9 h-9 text-xs bg-card"
              />
            </div>
            <p className="text-2xs text-muted-foreground">
              Showing exams for:{' '}
              <span className="font-semibold text-foreground">
                {selectedSemester === 'all' ? 'All Semesters' : `Semester ${selectedSemester}`}
              </span>
            </p>
          </div>

          <Card className="border border-border/80 shadow-subtle divide-y divide-border/60 bg-card overflow-hidden">
            {filteredExams.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground space-y-1">
                <FileText className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2" aria-hidden="true" />
                <p className="font-medium text-foreground">No examination schedules match your filter.</p>
                <p className="text-2xs text-muted-foreground">
                  Try clearing your search query or switching to another semester.
                </p>
              </div>
            ) : (
              filteredExams.map((exam) => (
                <div
                  key={exam.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-secondary/30 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-3xs font-mono font-semibold">
                        {exam.code}
                      </Badge>
                      <span className="font-semibold text-foreground text-sm">{exam.subject}</span>
                      {exam.semester && (
                        <Badge variant="secondary" className="text-3xs font-mono">
                          Sem {exam.semester}
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-primary shrink-0" />
                      <span>
                        Examination Hall:{' '}
                        <span className="font-semibold text-foreground">{exam.hall}</span>
                      </span>
                    </p>
                  </div>

                  <div className="flex sm:flex-col sm:items-end justify-between items-center text-2xs gap-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-border/50">
                    <span className="font-semibold text-foreground text-xs">{exam.date}</span>
                    <span className="text-muted-foreground font-mono">{exam.time}</span>
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>
      )}

      {/* Tab 3: Academic Calendar */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          <div className="flex gap-1.5 flex-wrap">
            {['All', 'Exam', 'Holiday', 'Academic', 'Evaluation'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setCalendarFilter(type)}
                className={`px-3 py-1 text-xs rounded border transition cursor-pointer ${
                  calendarFilter === type
                    ? 'bg-secondary text-foreground font-semibold border-border shadow-subtle'
                    : 'bg-card border-border/70 text-muted-foreground hover:text-foreground'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <Card className="border border-border/80 shadow-subtle divide-y divide-border/60 bg-card overflow-hidden">
            {filteredCalendar.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No calendar milestones match the filter.
              </div>
            ) : (
              filteredCalendar.map((evt) => (
                <div
                  key={evt.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded border border-border/70 bg-secondary/50 font-mono text-3xs font-semibold text-muted-foreground min-w-[85px] sm:min-w-[90px] text-center shrink-0">
                      {evt.date}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">{evt.title}</p>
                      <p className="text-2xs text-muted-foreground">Institutional Term Milestone</p>
                    </div>
                  </div>

                  <Badge
                    variant={
                      evt.type === 'Exam'
                        ? 'destructive'
                        : evt.type === 'Holiday'
                        ? 'warning'
                        : 'default'
                    }
                    className="text-3xs uppercase font-mono self-start sm:self-auto shrink-0"
                  >
                    {evt.type}
                  </Badge>
                </div>
              ))
            )}
          </Card>
        </div>
      )}

      {/* Add Class Slot Modal */}
      {showSlotModal && isAdminOrFaculty && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-4 sm:p-6 border border-border/80 shadow-dropdown bg-card space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <CardTitle className="text-sm font-bold text-foreground">Add Timetable Lecture Slot</CardTitle>
              <button
                type="button"
                onClick={() => setShowSlotModal(false)}
                className="h-7 w-7 rounded hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddSlot} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-2xs font-medium text-muted-foreground">Semester</label>
                  <select
                    value={slotSemester}
                    onChange={(e) => setSlotSemester(Number(e.target.value))}
                    className="h-9 w-full rounded-md border border-border bg-card px-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s} {s === userEnrolledSemester ? '(Your Semester)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-medium text-muted-foreground">Day of Week</label>
                  <select
                    value={slotDay}
                    onChange={(e) => setSlotDay(e.target.value as any)}
                    className="h-9 w-full rounded-md border border-border bg-card px-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <option value="Mon">Monday</option>
                    <option value="Tue">Tuesday</option>
                    <option value="Wed">Wednesday</option>
                    <option value="Thu">Thursday</option>
                    <option value="Fri">Friday</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-2xs font-medium text-muted-foreground">Course Subject</label>
                <Input
                  type="text"
                  value={slotSubject}
                  onChange={(e) => setSlotSubject(e.target.value)}
                  placeholder="e.g. Operating Systems (CS401)"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-2xs font-medium text-muted-foreground">Lecture Time</label>
                  <Input
                    type="text"
                    value={slotTime}
                    onChange={(e) => setSlotTime(e.target.value)}
                    placeholder="09:00 - 10:00 AM"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-medium text-muted-foreground">Room / Lab</label>
                  <Input
                    type="text"
                    value={slotRoom}
                    onChange={(e) => setSlotRoom(e.target.value)}
                    placeholder="e.g. Room 204 or Lab 3"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-2xs font-medium text-muted-foreground">Faculty In-Charge</label>
                <Input
                  type="text"
                  value={slotFaculty}
                  onChange={(e) => setSlotFaculty(e.target.value)}
                  placeholder="e.g. Prof. Sen"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSlotModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="shadow-subtle">
                  Save Lecture Slot
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
