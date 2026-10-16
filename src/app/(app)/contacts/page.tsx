'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  Clock,
  Building2,
  GraduationCap,
  MessageCircle,
  ShieldCheck,
  Plus
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { UserAvatar } from '@/components/shared/user-avatar'
import { useAppStore } from '@/lib/data/client-store'
import { isFacultyOrAdmin } from '@/lib/auth/roles'

export default function ContactsPage() {
  const { currentProfile, profiles, campusContacts } = useAppStore()
  const [activeTab, setActiveTab] = useState<'all' | 'students' | 'admin'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const isAdminOrFaculty = isFacultyOrAdmin(currentProfile)

  const studentContacts = profiles.filter((p) => p.collegeId === currentProfile.collegeId)

  const filteredInstitutional = campusContacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  )

  const filteredStudents = studentContacts.filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.department?.name && s.department.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Campus Directory &amp; Key Contacts
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Verified academic officers, administrative departments, and peer directory for {currentProfile.college?.name}
          </p>
        </div>

        {isAdminOrFaculty && (
          <Link href="/admin/contacts">
            <Button size="sm" variant="outline" className="text-xs h-7 gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Manage Contacts
            </Button>
          </Link>
        )}
      </div>

      {/* Search and Tabs */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="flex rounded-md border p-1 bg-muted/40 gap-1 text-xs overflow-x-auto no-scrollbar max-w-full">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded font-medium transition whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'all' ? 'bg-background shadow-xs text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>All Directory</span>
            <span className="text-2xs font-mono px-1 rounded bg-muted text-muted-foreground">
              {campusContacts.length + studentContacts.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1.5 rounded font-medium transition whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'admin' ? 'bg-background shadow-xs text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>Administration &amp; Helplines</span>
            <span className="text-2xs font-mono px-1 rounded bg-muted text-muted-foreground">
              {campusContacts.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('students')}
            className={`px-3 py-1.5 rounded font-medium transition whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'students' ? 'bg-background shadow-xs text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>Student Peers</span>
            <span className="text-2xs font-mono px-1 rounded bg-muted text-muted-foreground">
              {studentContacts.length}
            </span>
          </button>
        </div>

        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search by officer name, department, role, or title..."
            className="pl-9 text-xs h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Section 1: Official Administrative Contacts */}
      {(activeTab === 'all' || activeTab === 'admin') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Academic &amp; Administrative Helpdesks
            </h2>
            <span className="text-2xs text-muted-foreground font-mono">{filteredInstitutional.length} Records</span>
          </div>

          {filteredInstitutional.length === 0 ? (
            <Card className="p-8 text-center text-xs text-muted-foreground border">
              No administrative contacts found matching &quot;{searchQuery}&quot;.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredInstitutional.map((contact) => (
                <Card key={contact.id} className="p-5 border shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between space-y-3.5">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <Badge variant="outline" className="text-2xs uppercase">
                          {contact.category}
                        </Badge>
                        <h3 className="font-bold text-sm text-foreground">{contact.name}</h3>
                        <p className="text-xs text-primary font-medium">{contact.role}</p>
                        <p className="text-2xs text-muted-foreground">{contact.department}</p>
                      </div>
                      <div className="flex items-center gap-1 text-primary text-2xs font-semibold bg-primary/10 px-2 py-0.5 rounded border border-primary/20 shrink-0">
                        <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
                        <span>Official</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-2xs text-muted-foreground border-t border-border/60 pt-2.5">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                        <span className="text-foreground">{contact.office}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                        <span>Desk Hours: <span className="font-mono">{contact.hours}</span></span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border/60 pt-3 flex items-center justify-between gap-2">
                    <a
                      href={`mailto:${contact.email}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium bg-card hover:bg-accent transition text-foreground"
                    >
                      <Mail className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                      <span>Email</span>
                    </a>

                    <a
                      href={`tel:${contact.phone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium bg-card hover:bg-accent transition text-foreground font-mono"
                    >
                      <Phone className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                      <span>{contact.phone}</span>
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Section 2: Student Peers Directory */}
      {(activeTab === 'all' || activeTab === 'students') && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Enrolled Student Directory
            </h2>
            <span className="text-2xs text-muted-foreground font-mono">{filteredStudents.length} Students</span>
          </div>

          {filteredStudents.length === 0 ? (
            <Card className="p-8 text-center text-xs text-muted-foreground border">
              No students found matching &quot;{searchQuery}&quot;.
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredStudents.map((student) => (
                <Card key={student.id} className="p-4 border shadow-card hover:shadow-card-hover transition-all flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <UserAvatar
                      name={student.fullName}
                      avatarUrl={student.avatarUrl}
                      size="md"
                      className="shrink-0"
                    />
                    <div className="min-w-0">
                      <Link
                        href={`/profile/${student.username}`}
                        className="font-bold text-xs text-foreground hover:underline truncate block"
                      >
                        {student.fullName}
                      </Link>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-2xs text-muted-foreground font-mono truncate">
                          @{student.username}
                        </span>
                        <Badge variant="outline" className="text-3xs uppercase px-1 py-0 font-mono">
                          {student.department?.code || 'STUDENT'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {student.id !== currentProfile.id && (
                    <Link href={`/chat`}>
                      <Button variant="outline" size="icon-sm" className="h-8 w-8 shrink-0" aria-label={`Message ${student.fullName}`}>
                        <MessageCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" aria-hidden="true" />
                      </Button>
                    </Link>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
