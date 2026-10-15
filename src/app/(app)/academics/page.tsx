'use client'

import React, { useState } from 'react'
import {
  BookOpen,
  Calendar,
  Clock,
  Building2,
  FileText,
  Download,
  GraduationCap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/data/client-store'

export default function AcademicsPage() {
  const { currentProfile } = useAppStore()
  const [activeTab, setActiveTab] = useState<'timetable' | 'calendar' | 'exams' | 'curriculum'>('timetable')
  const [selectedDay, setSelectedDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'>('Mon')

  const scheduleSlots = [
    { time: '09:00 - 10:00 AM', subject: 'Operating Systems (CS401)', room: 'Room 204', faculty: 'Prof. Sen' },
    { time: '10:15 - 11:15 AM', subject: 'Database Management Systems (CS402)', room: 'Room 204', faculty: 'Dr. Jamir' },
    { time: '11:30 - 12:30 PM', subject: 'Computer Networks (CS403)', room: 'Room 204', faculty: 'Prof. Ao' },
    { time: '01:30 - 04:30 PM', subject: 'Operating Systems Lab (CS491)', room: 'Software Lab 2', faculty: 'Prof. Sen & TAs' },
  ]

  const calendarEvents = [
    { date: 'Oct 20, 2026', title: 'Mid-Semester Examinations Commence', type: 'Exam' },
    { date: 'Oct 28, 2026', title: 'Mid-Semester Examinations Conclude', type: 'Exam' },
    { date: 'Nov 04, 2026', title: 'Autumn Break Begins', type: 'Holiday' },
    { date: 'Nov 12, 2026', title: 'Classes Resume Post-Break', type: 'Academic' },
    { date: 'Dec 01, 2026', title: 'Final Project Demonstrations', type: 'Evaluation' },
    { date: 'Dec 15, 2026', title: 'End-Semester Examinations Begin', type: 'Exam' },
  ]

  const examSchedule = [
    { code: 'CS401', subject: 'Operating Systems', date: 'Oct 20, 2026', time: '10:00 AM - 12:00 PM', hall: 'Academic Block 1 - Hall A' },
    { code: 'CS402', subject: 'Database Systems', date: 'Oct 22, 2026', time: '10:00 AM - 12:00 PM', hall: 'Academic Block 1 - Hall A' },
    { code: 'CS403', subject: 'Computer Networks', date: 'Oct 24, 2026', time: '10:00 AM - 12:00 PM', hall: 'Academic Block 1 - Hall B' },
    { code: 'MA401', subject: 'Discrete Mathematics', date: 'Oct 27, 2026', time: '10:00 AM - 12:00 PM', hall: 'Academic Block 2 - Hall C' },
  ]

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
          Weekly Timetable
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
          Exam Timetable
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
          Academic Calendar
        </button>
      </div>

      {/* Tab 1: Weekly Timetable */}
      {activeTab === 'timetable' && (
        <div className="space-y-4">
          {/* Day Selector */}
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
                {day}
              </button>
            ))}
          </div>

          <Card className="border shadow-card divide-y">
            {scheduleSlots.map((slot, idx) => (
              <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
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
            ))}
          </Card>
        </div>
      )}

      {/* Tab 2: Exam Timetable */}
      {activeTab === 'exams' && (
        <Card className="border shadow-card divide-y">
          {examSchedule.map((exam, idx) => (
            <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
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
          ))}
        </Card>
      )}

      {/* Tab 3: Academic Calendar */}
      {activeTab === 'calendar' && (
        <Card className="border shadow-card divide-y">
          {calendarEvents.map((evt, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between text-xs">
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
          ))}
        </Card>
      )}
    </div>
  )
}
