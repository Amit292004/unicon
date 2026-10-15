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
  ShieldCheck
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/data/client-store'

export default function AcademicsPage() {
  const {
    currentProfile,
    timetableSlots,
    examSchedules,
    calendarEvents,
    addTimetableSlot
  } = useAppStore()

  const [activeTab, setActiveTab] = useState<'timetable' | 'calendar' | 'exams'>('timetable')
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

  const isAdminOrFaculty = currentProfile.role === 'admin' || currentProfile.role === 'moderator' || currentProfile.role === 'faculty'

  // Filter slots for the selected day
  const dailySlots = timetableSlots.filter((slot) => slot.day === selectedDay)

  const filteredExams = examSchedules.filter((exam) => {
    if (!examSearch) return true
    const q = examSearch.toLowerCase()
    return exam.code.toLowerCase().includes(q) || exam.subject.toLowerCase().includes(q) || exam.hall.toLowerCase().includes(q)
  })

  const filteredCalendar = calendarEvents.filter((evt) => {
    if (calendarFilter === 'All') return true
    return evt.type === calendarFilter
  })

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault()
    if (!slotSubject.trim()) return

    addTimetableSlot({
      collegeId: currentProfile.collegeId,
      day: slotDay,
      time: slotTime.trim(),
      subject: slotSubject.trim(),
      room: slotRoom.trim() || 'Room 101',
      faculty: slotFaculty.trim() || currentProfile.fullName,
      departmentId: currentProfile.departmentId,
      semester: 4,
    })

    setSlotSubject('')
    setSlotFaculty('')
    setShowSlotModal(false)
    setSelectedDay(slotDay)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Academic Governance &amp; Timetable
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Curriculum schedules, departmental timetables, and examination calendar for {currentProfile.college?.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {currentProfile.department?.name || 'Computer Science'} &bull; Sem 4
          </Badge>
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8 gap-1"
            onClick={() => {
              if (typeof window !== 'undefined') window.print()
            }}
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Print Schedule
          </Button>
          <Button
            size="sm"
            className="text-xs h-8 gap-1"
            onClick={() => setShowSlotModal(true)}
          >
            Add Class Slot
          </Button>
          {isAdminOrFaculty && (
            <Link href="/admin/academics">
              <Button size="sm" variant="outline" className="text-xs h-8 gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Manage in Admin
              </Button>
            </Link>
          )}
        </div>
      </div>

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
          Weekly Timetable ({timetableSlots.length})
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
          Exam Timetable ({examSchedules.length})
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

      {/* Tab 1: Weekly Timetable */}
      {activeTab === 'timetable' && (
        <div className="space-y-4">
          {/* Day Selector */}
          <div className="flex gap-2">
            {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const).map((day) => {
              const countForDay = timetableSlots.filter((s) => s.day === day).length
              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`flex-1 py-2 text-xs rounded-md border font-medium transition flex flex-col items-center justify-center gap-0.5 ${
                    selectedDay === day
                      ? 'bg-primary text-primary-foreground border-primary font-semibold'
                      : 'bg-card hover:bg-accent text-foreground'
                  }`}
                >
                  <span>{day}</span>
                  <span className="text-2xs opacity-80">{countForDay} classes</span>
                </button>
              )
            })}
          </div>

          <Card className="border shadow-card divide-y">
            {dailySlots.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No scheduled lectures for {selectedDay}. Enjoy your study period or lab prep!
              </div>
            ) : (
              dailySlots.map((slot) => (
                <div key={slot.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Clock className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{slot.subject}</p>
                      <p className="text-muted-foreground mt-0.5">
                        Instructor: {slot.faculty} &bull; Location: {slot.room}
                      </p>
                    </div>
                  </div>

                  <Badge variant="secondary" className="font-mono text-2xs self-start sm:self-center">
                    {slot.time}
                  </Badge>
                </div>
              ))
            )}
          </Card>
        </div>
      )}

      {/* Tab 2: Exam Timetable */}
      {activeTab === 'exams' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search exams by subject or course code..."
              value={examSearch}
              onChange={(e) => setExamSearch(e.target.value)}
              className="h-9 px-3 rounded-md border border-input bg-background text-xs w-full max-w-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <Card className="border shadow-card divide-y">
            {filteredExams.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No examination schedules match your query.
              </div>
            ) : (
              filteredExams.map((exam) => (
                <div key={exam.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-2xs font-mono">
                        {exam.code}
                      </Badge>
                      <span className="font-semibold text-foreground text-sm">{exam.subject}</span>
                    </div>
                    <p className="text-muted-foreground text-2xs">
                      Assigned Seating: {exam.hall}
                    </p>
                  </div>

                  <div className="flex sm:flex-col sm:items-end justify-between items-center text-2xs gap-1 border-t sm:border-t-0 pt-2 sm:pt-0">
                    <span className="font-semibold text-foreground">{exam.date}</span>
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
                className={`px-3 py-1 text-xs rounded-full border transition ${
                  calendarFilter === type
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground hover:bg-accent'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <Card className="border shadow-card divide-y">
            {filteredCalendar.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No calendar milestones match the filter.
              </div>
            ) : (
              filteredCalendar.map((evt) => (
                <div key={evt.id} className="p-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md bg-secondary flex items-center justify-center shrink-0 text-muted-foreground">
                      <Calendar className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{evt.title}</p>
                      <p className="text-2xs text-muted-foreground">{evt.date}</p>
                    </div>
                  </div>

                  <Badge
                    variant={evt.type === 'Exam' ? 'destructive' : evt.type === 'Holiday' ? 'warning' : 'default'}
                    className="text-2xs uppercase"
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
      {showSlotModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 border shadow-modal">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base font-bold">Add Timetable Class Slot</CardTitle>
            </CardHeader>

            <form onSubmit={handleAddSlot} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Day of Week</label>
                  <select
                    value={slotDay}
                    onChange={(e) => setSlotDay(e.target.value as any)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
                  >
                    <option value="Mon">Monday</option>
                    <option value="Tue">Tuesday</option>
                    <option value="Wed">Wednesday</option>
                    <option value="Thu">Thursday</option>
                    <option value="Fri">Friday</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Timing</label>
                  <input
                    type="text"
                    value={slotTime}
                    onChange={(e) => setSlotTime(e.target.value)}
                    placeholder="09:00 - 10:00 AM"
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Course & Subject</label>
                <input
                  type="text"
                  value={slotSubject}
                  onChange={(e) => setSlotSubject(e.target.value)}
                  placeholder="e.g. Distributed Systems (CS406)"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Room / Lab</label>
                  <input
                    type="text"
                    value={slotRoom}
                    onChange={(e) => setSlotRoom(e.target.value)}
                    placeholder="Room 204"
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Faculty Instructor</label>
                  <input
                    type="text"
                    value={slotFaculty}
                    onChange={(e) => setSlotFaculty(e.target.value)}
                    placeholder="Prof. Jamir"
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowSlotModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Save Slot
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
