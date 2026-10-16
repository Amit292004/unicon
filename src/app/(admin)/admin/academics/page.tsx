'use client'

import React, { useState } from 'react'
import {
  BookOpen,
  Calendar,
  Clock,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  Building2,
  FileText,
  X
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/lib/data/client-store'
import type { TimetableSlot, ExamScheduleItem, AcademicCalendarEvent } from '@/types'

export default function AdminAcademicsPage() {
  const {
    currentProfile,
    departments,
    timetableSlots,
    examSchedules,
    calendarEvents,
    addTimetableSlot,
    updateTimetableSlot,
    deleteTimetableSlot,
    addExamSchedule,
    updateExamSchedule,
    deleteExamSchedule,
    addCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
  } = useAppStore()

  const [activeTab, setActiveTab] = useState<'timetable' | 'exams' | 'calendar'>('timetable')
  const [selectedDay, setSelectedDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'>('Mon')
  const [adminSemester, setAdminSemester] = useState<number | 'all'>('all')
  const [actionMsg, setActionMsg] = useState<string | null>(null)

  // Timetable Modal State
  const [showTimetableModal, setShowTimetableModal] = useState(false)
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null)
  const [ttDay, setTtDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'>('Mon')
  const [ttTime, setTtTime] = useState('09:00 - 10:00 AM')
  const [ttSubject, setTtSubject] = useState('')
  const [ttRoom, setTtRoom] = useState('Room 204')
  const [ttFaculty, setTtFaculty] = useState('Prof. Sen')
  const [ttDeptId, setTtDeptId] = useState<string>(departments[0]?.id || '')
  const [ttSemester, setTtSemester] = useState<number>(4)

  // Exam Modal State
  const [showExamModal, setShowExamModal] = useState(false)
  const [editingExam, setEditingExam] = useState<ExamScheduleItem | null>(null)
  const [exCode, setExCode] = useState('CS401')
  const [exSubject, setExSubject] = useState('')
  const [exDate, setExDate] = useState('Oct 20, 2026')
  const [exTime, setExTime] = useState('10:00 AM - 12:00 PM')
  const [exHall, setExHall] = useState('Academic Block 1 - Hall A')
  const [exDeptId, setExDeptId] = useState<string>(departments[0]?.id || '')
  const [exSemester, setExSemester] = useState<number>(4)

  // Calendar Modal State
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<AcademicCalendarEvent | null>(null)
  const [calDate, setCalDate] = useState('Oct 20, 2026')
  const [calTitle, setCalTitle] = useState('')
  const [calType, setCalType] = useState<AcademicCalendarEvent['type']>('Exam')

  // Timetable Handlers
  const handleOpenAddTimetable = () => {
    setEditingSlot(null)
    setTtDay(selectedDay)
    setTtTime('09:00 - 10:00 AM')
    setTtSubject('')
    setTtRoom('Room 204')
    setTtFaculty('')
    setTtDeptId(departments[0]?.id || '')
    setTtSemester(adminSemester !== 'all' ? adminSemester : 4)
    setShowTimetableModal(true)
  }

  const handleOpenEditTimetable = (slot: TimetableSlot) => {
    setEditingSlot(slot)
    setTtDay(slot.day)
    setTtTime(slot.time)
    setTtSubject(slot.subject)
    setTtRoom(slot.room)
    setTtFaculty(slot.faculty)
    setTtDeptId(slot.departmentId || departments[0]?.id || '')
    setTtSemester(slot.semester || 4)
    setShowTimetableModal(true)
  }

  const handleDeleteTimetable = (id: string, subject: string) => {
    if (typeof window !== 'undefined' && !window.confirm(`Delete class period for "${subject}"?`)) return
    deleteTimetableSlot(id)
    setActionMsg(`Class slot "${subject}" removed.`)
    setTimeout(() => setActionMsg(null), 4000)
  }

  const handleTimetableSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ttSubject.trim()) return

    if (editingSlot) {
      updateTimetableSlot(editingSlot.id, {
        day: ttDay,
        time: ttTime.trim(),
        subject: ttSubject.trim(),
        room: ttRoom.trim(),
        faculty: ttFaculty.trim(),
        departmentId: ttDeptId || null,
        semester: Number(ttSemester),
      })
      setActionMsg(`Period for "${ttSubject}" updated.`)
    } else {
      addTimetableSlot({
        collegeId: currentProfile.collegeId,
        day: ttDay,
        time: ttTime.trim(),
        subject: ttSubject.trim(),
        room: ttRoom.trim(),
        faculty: ttFaculty.trim(),
        departmentId: ttDeptId || null,
        semester: Number(ttSemester),
      })
      setActionMsg(`Period for "${ttSubject}" added to timetable.`)
    }

    setShowTimetableModal(false)
    setEditingSlot(null)
    setTimeout(() => setActionMsg(null), 4000)
  }

  // Exam Handlers
  const handleOpenAddExam = () => {
    setEditingExam(null)
    setExCode('CS401')
    setExSubject('')
    setExDate('Oct 20, 2026')
    setExTime('10:00 AM - 12:00 PM')
    setExHall('Academic Block 1 - Hall A')
    setExDeptId(departments[0]?.id || '')
    setExSemester(adminSemester !== 'all' ? adminSemester : 4)
    setShowExamModal(true)
  }

  const handleOpenEditExam = (exam: ExamScheduleItem) => {
    setEditingExam(exam)
    setExCode(exam.code)
    setExSubject(exam.subject)
    setExDate(exam.date)
    setExTime(exam.time)
    setExHall(exam.hall)
    setExDeptId(exam.departmentId || departments[0]?.id || '')
    setExSemester(exam.semester || 4)
    setShowExamModal(true)
  }

  const handleDeleteExam = (id: string, code: string) => {
    if (typeof window !== 'undefined' && !window.confirm(`Delete exam schedule for "${code}"?`)) return
    deleteExamSchedule(id)
    setActionMsg(`Exam schedule for "${code}" removed.`)
    setTimeout(() => setActionMsg(null), 4000)
  }

  const handleExamSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!exCode.trim() || !exSubject.trim()) return

    if (editingExam) {
      updateExamSchedule(editingExam.id, {
        code: exCode.trim().toUpperCase(),
        subject: exSubject.trim(),
        date: exDate.trim(),
        time: exTime.trim(),
        hall: exHall.trim(),
        departmentId: exDeptId || null,
        semester: Number(exSemester),
      })
      setActionMsg(`Exam schedule for "${exCode}" updated.`)
    } else {
      addExamSchedule({
        collegeId: currentProfile.collegeId,
        code: exCode.trim().toUpperCase(),
        subject: exSubject.trim(),
        date: exDate.trim(),
        time: exTime.trim(),
        hall: exHall.trim(),
        departmentId: exDeptId || null,
        semester: Number(exSemester),
      })
      setActionMsg(`Exam "${exCode}" scheduled.`)
    }

    setShowExamModal(false)
    setEditingExam(null)
    setTimeout(() => setActionMsg(null), 4000)
  }

  // Calendar Event Handlers
  const handleOpenAddCalendar = () => {
    setEditingEvent(null)
    setCalDate('Oct 20, 2026')
    setCalTitle('')
    setCalType('Exam')
    setShowCalendarModal(true)
  }

  const handleOpenEditCalendar = (evt: AcademicCalendarEvent) => {
    setEditingEvent(evt)
    setCalDate(evt.date)
    setCalTitle(evt.title)
    setCalType(evt.type)
    setShowCalendarModal(true)
  }

  const handleDeleteCalendar = (id: string, title: string) => {
    if (typeof window !== 'undefined' && !window.confirm(`Delete event "${title}"?`)) return
    deleteCalendarEvent(id)
    setActionMsg(`Calendar event "${title}" removed.`)
    setTimeout(() => setActionMsg(null), 4000)
  }

  const handleCalendarSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!calTitle.trim()) return

    if (editingEvent) {
      updateCalendarEvent(editingEvent.id, {
        date: calDate.trim(),
        title: calTitle.trim(),
        type: calType,
      })
      setActionMsg(`Milestone "${calTitle}" updated.`)
    } else {
      addCalendarEvent({
        collegeId: currentProfile.collegeId,
        date: calDate.trim(),
        title: calTitle.trim(),
        type: calType,
      })
      setActionMsg(`Milestone "${calTitle}" added to calendar.`)
    }

    setShowCalendarModal(false)
    setEditingEvent(null)
    setTimeout(() => setActionMsg(null), 4000)
  }

  const adminSemesterSlots = timetableSlots.filter(
    (s) => adminSemester === 'all' || (s.semester || 4) === adminSemester
  )
  const daySlots = adminSemesterSlots.filter((s) => s.day === selectedDay)

  const adminSemesterExams = examSchedules.filter(
    (e) => adminSemester === 'all' || (e.semester || 4) === adminSemester
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Academic Schedules &amp; Governance
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add, update, or remove departmental weekly timetables, exam room seatings, and milestone events
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'timetable' && (
            <Button size="sm" onClick={handleOpenAddTimetable} className="gap-1.5 text-xs">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Period Slot
            </Button>
          )}
          {activeTab === 'exams' && (
            <Button size="sm" onClick={handleOpenAddExam} className="gap-1.5 text-xs">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Schedule Exam
            </Button>
          )}
          {activeTab === 'calendar' && (
            <Button size="sm" onClick={handleOpenAddCalendar} className="gap-1.5 text-xs">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Event / Milestone
            </Button>
          )}
        </div>
      </div>

      {actionMsg && (
        <div className="p-3 text-xs rounded-md bg-success-50 text-success-600 border border-success-500/20 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b space-x-2 text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab('timetable')}
          className={`pb-2.5 px-3 border-b-2 transition ${
            activeTab === 'timetable'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Weekly Timetable ({adminSemesterSlots.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('exams')}
          className={`pb-2.5 px-3 border-b-2 transition ${
            activeTab === 'exams'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Exam Timetable ({adminSemesterExams.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`pb-2.5 px-3 border-b-2 transition ${
            activeTab === 'calendar'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Academic Calendar ({calendarEvents.length})
        </button>
      </div>

      {/* Admin Semester Filter Bar */}
      {(activeTab === 'timetable' || activeTab === 'exams') && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg border bg-card text-xs shadow-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Filter by Semester:</span>
            <span className="text-muted-foreground text-2xs">
              {adminSemester === 'all' ? 'All Semesters' : `Semester ${adminSemester}`}
            </span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {([1, 2, 3, 4, 5, 6, 7, 8] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setAdminSemester(s)}
                className={`px-2.5 py-1 rounded text-2xs font-medium transition cursor-pointer ${
                  adminSemester === s
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'bg-secondary/70 hover:bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                Sem {s}
              </button>
            ))}
            <div className="h-3 w-px bg-border mx-0.5" />
            <button
              type="button"
              onClick={() => setAdminSemester('all')}
              className={`px-2.5 py-1 rounded text-2xs font-medium transition cursor-pointer ${
                adminSemester === 'all'
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'bg-secondary/70 hover:bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              All
            </button>
          </div>
        </div>
      )}

      {/* Tab 1: Weekly Timetable */}
      {activeTab === 'timetable' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const).map((day) => (
              <button
                type="button"
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex-1 py-2 text-xs rounded-md border font-medium transition ${
                  selectedDay === day
                    ? 'bg-primary text-primary-foreground border-primary font-semibold'
                    : 'bg-card hover:bg-accent text-foreground'
                }`}
              >
                {day} ({adminSemesterSlots.filter((s) => s.day === day).length})
              </button>
            ))}
          </div>

          {daySlots.length === 0 ? (
            <div className="p-12 text-center border rounded-lg bg-card text-muted-foreground text-xs space-y-2">
              <Clock className="h-8 w-8 mx-auto text-muted-foreground" aria-hidden="true" />
              <p className="font-semibold text-foreground">No lecture periods scheduled for {selectedDay}</p>
              <Button size="sm" onClick={handleOpenAddTimetable}>
                Add Class Period
              </Button>
            </div>
          ) : (
            <Card className="border shadow-card divide-y">
              {daySlots.map((slot) => (
                <div key={slot.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Clock className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{slot.subject}</p>
                      <p className="text-muted-foreground mt-0.5">
                        Instructor: <span className="font-medium text-foreground">{slot.faculty}</span> &bull; Room: {slot.room}
                        {slot.semester && ` &bull; Sem ${slot.semester}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono text-2xs">
                      {slot.time}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-2xs gap-1"
                      onClick={() => handleOpenEditTimetable(slot)}
                    >
                      <Edit3 className="h-3 w-3" aria-hidden="true" />
                      Edit
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="outline"
                      className="h-7 w-7 text-destructive-600 hover:bg-destructive-50"
                      onClick={() => handleDeleteTimetable(slot.id, slot.subject)}
                      title="Delete slot"
                    >
                      <Trash2 className="h-3 w-3" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}

      {/* Tab 2: Exam Timetable */}
      {activeTab === 'exams' && (
        <div className="space-y-3">
          {adminSemesterExams.length === 0 ? (
            <div className="p-12 text-center border rounded-lg bg-card text-muted-foreground text-xs space-y-2">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground" aria-hidden="true" />
              <p className="font-semibold text-foreground">
                No examination schedules found for {adminSemester === 'all' ? 'any semester' : `Semester ${adminSemester}`}
              </p>
              <Button size="sm" onClick={handleOpenAddExam}>
                Schedule Exam
              </Button>
            </div>
          ) : (
            <Card className="border shadow-card divide-y">
              {adminSemesterExams.map((exam) => (
                <div key={exam.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-2xs font-mono font-bold">
                        {exam.code}
                      </Badge>
                      <span className="font-bold text-foreground text-sm">{exam.subject}</span>
                      {exam.semester && (
                        <Badge variant="secondary" className="text-2xs">
                          Sem {exam.semester}
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-2xs">
                      Exam Date: <span className="font-medium text-foreground">{exam.date}</span> ({exam.time}) &bull; Hall: {exam.hall}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-2xs gap-1"
                      onClick={() => handleOpenEditExam(exam)}
                    >
                      <Edit3 className="h-3 w-3" aria-hidden="true" />
                      Edit
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="outline"
                      className="h-7 w-7 text-destructive-600 hover:bg-destructive-50"
                      onClick={() => handleDeleteExam(exam.id, exam.code)}
                      title="Delete exam"
                    >
                      <Trash2 className="h-3 w-3" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}

      {/* Tab 3: Academic Calendar */}
      {activeTab === 'calendar' && (
        <div className="space-y-3">
          <Card className="border shadow-card divide-y">
            {calendarEvents.map((evt) => (
              <div key={evt.id} className="p-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-secondary flex items-center justify-center shrink-0 text-muted-foreground">
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{evt.title}</p>
                    <p className="text-2xs text-muted-foreground font-mono">{evt.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={evt.type === 'Exam' ? 'destructive' : evt.type === 'Holiday' ? 'warning' : 'default'}
                    className="text-2xs uppercase"
                  >
                    {evt.type}
                  </Badge>

                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-2xs gap-1"
                    onClick={() => handleOpenEditCalendar(evt)}
                  >
                    <Edit3 className="h-3 w-3" aria-hidden="true" />
                    Edit
                  </Button>

                  <Button
                    size="icon-sm"
                    variant="outline"
                    className="h-7 w-7 text-destructive-600 hover:bg-destructive-50"
                    onClick={() => handleDeleteCalendar(evt.id, evt.title)}
                    title="Delete event"
                  >
                    <Trash2 className="h-3 w-3" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* Timetable Period Modal */}
      {showTimetableModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 border shadow-modal">
            <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">
                {editingSlot ? 'Edit Class Period' : 'Add Class Period'}
              </CardTitle>
              <Button size="icon-sm" variant="ghost" onClick={() => setShowTimetableModal(false)}>
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </CardHeader>

            <form onSubmit={handleTimetableSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="tt-day">
                    Day of Week
                  </label>
                  <select
                    id="tt-day"
                    value={ttDay}
                    onChange={(e) => setTtDay(e.target.value as any)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <option value="Mon">Monday</option>
                    <option value="Tue">Tuesday</option>
                    <option value="Wed">Wednesday</option>
                    <option value="Thu">Thursday</option>
                    <option value="Fri">Friday</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="tt-sem">
                    Semester
                  </label>
                  <select
                    id="tt-sem"
                    value={ttSemester}
                    onChange={(e) => setTtSemester(Number(e.target.value))}
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
                <label className="text-xs font-medium text-foreground" htmlFor="tt-subj">
                  Course / Subject Title
                </label>
                <Input
                  id="tt-subj"
                  placeholder="e.g. Operating Systems (CS401)"
                  value={ttSubject}
                  onChange={(e) => setTtSubject(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="tt-time">
                    Time Interval
                  </label>
                  <Input
                    id="tt-time"
                    placeholder="09:00 - 10:00 AM"
                    value={ttTime}
                    onChange={(e) => setTtTime(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="tt-room">
                    Room / Lab
                  </label>
                  <Input
                    id="tt-room"
                    placeholder="Room 204"
                    value={ttRoom}
                    onChange={(e) => setTtRoom(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="tt-fac">
                  Instructor / Faculty
                </label>
                <Input
                  id="tt-fac"
                  placeholder="Prof. Ananya Sen"
                  value={ttFaculty}
                  onChange={(e) => setTtFaculty(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowTimetableModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  {editingSlot ? 'Save Changes' : 'Add Period'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Exam Modal */}
      {showExamModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 border shadow-modal">
            <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">
                {editingExam ? 'Edit Exam Seating & Timing' : 'Schedule New Examination'}
              </CardTitle>
              <Button size="icon-sm" variant="ghost" onClick={() => setShowExamModal(false)}>
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </CardHeader>

            <form onSubmit={handleExamSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="ex-code">
                    Course Code
                  </label>
                  <Input
                    id="ex-code"
                    placeholder="CS401"
                    className="uppercase"
                    value={exCode}
                    onChange={(e) => setExCode(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="ex-sem">
                    Semester
                  </label>
                  <select
                    id="ex-sem"
                    value={exSemester}
                    onChange={(e) => setExSemester(Number(e.target.value))}
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
                <label className="text-xs font-medium text-foreground" htmlFor="ex-subj">
                  Course Subject
                </label>
                <Input
                  id="ex-subj"
                  placeholder="Operating Systems"
                  value={exSubject}
                  onChange={(e) => setExSubject(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="ex-date">
                    Exam Date
                  </label>
                  <Input
                    id="ex-date"
                    placeholder="Oct 20, 2026"
                    value={exDate}
                    onChange={(e) => setExDate(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="ex-time">
                    Exam Timing
                  </label>
                  <Input
                    id="ex-time"
                    placeholder="10:00 AM - 12:00 PM"
                    value={exTime}
                    onChange={(e) => setExTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="ex-hall">
                  Assigned Examination Hall
                </label>
                <Input
                  id="ex-hall"
                  placeholder="Academic Block 1 - Hall A"
                  value={exHall}
                  onChange={(e) => setExHall(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowExamModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  {editingExam ? 'Save Changes' : 'Schedule Exam'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Calendar Event Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 border shadow-modal">
            <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">
                {editingEvent ? 'Edit Milestone Event' : 'Add Academic Milestone'}
              </CardTitle>
              <Button size="icon-sm" variant="ghost" onClick={() => setShowCalendarModal(false)}>
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </CardHeader>

            <form onSubmit={handleCalendarSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="cal-date">
                    Event Date
                  </label>
                  <Input
                    id="cal-date"
                    placeholder="Nov 04, 2026"
                    value={calDate}
                    onChange={(e) => setCalDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="cal-type">
                    Classification
                  </label>
                  <select
                    id="cal-type"
                    value={calType}
                    onChange={(e) => setCalType(e.target.value as any)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <option value="Exam">Exam Period</option>
                    <option value="Holiday">Institutional Holiday</option>
                    <option value="Academic">Academic Schedule</option>
                    <option value="Evaluation">Evaluation / Viva</option>
                    <option value="Event">Campus Event</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="cal-title">
                  Event Title / Milestone Description
                </label>
                <Input
                  id="cal-title"
                  placeholder="e.g. Mid-Semester Examinations Conclude"
                  value={calTitle}
                  onChange={(e) => setCalTitle(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowCalendarModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  {editingEvent ? 'Save Event' : 'Add Event'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
