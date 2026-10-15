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

export default function ContactsPage() {
  const { currentProfile, profiles, campusContacts } = useAppStore()
  const [activeTab, setActiveTab] = useState<'all' | 'students' | 'admin'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const isAdminOrFaculty =
    currentProfile.role === 'admin' ||
    currentProfile.role === 'moderator' ||
    currentProfile.role === 'faculty'

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
        <div className="flex rounded-md border p-1 bg-muted/40 gap-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded font-medium transition ${
              activeTab === 'all' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
            }`}
          >
            All Contacts ({campusContacts.length + studentContacts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1.5 rounded font-medium transition ${
              activeTab === 'admin' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
            }`}
          >
            Administration &amp; Helpdesks ({campusContacts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('students')}
            className={`px-3 py-1.5 rounded font-medium transition ${
              activeTab === 'students' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
            }`}
          >
            Student Peers ({studentContacts.length})
          </button>
        </div>

        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search by officer name, department, role, or title..."
            className="pl-9 text-xs"
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
                <Card key={contact.id} className="p-5 border shadow-card space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge variant="outline" className="text-2xs mb-1">
                        {contact.category}
                      </Badge>
                      <h3 className="font-bold text-sm text-foreground">{contact.name}</h3>
                      <p className="text-xs text-primary font-medium">{contact.role}</p>
                      <p className="text-2xs text-muted-foreground">{contact.department}</p>
                    </div>
                    <ShieldCheck className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                  </div>

                  <div className="space-y-1.5 text-2xs text-muted-foreground border-t pt-2.5">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
                      <a href={`mailto:${contact.email}`} className="hover:underline text-foreground">
                        {contact.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
                      <a href={`tel:${contact.phone}`} className="hover:underline text-foreground">
                        {contact.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                      <span>{contact.office}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                      <span>Hours: {contact.hours}</span>
                    </div>
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
                <Card key={student.id} className="p-4 border shadow-card flex items-center justify-between gap-3">
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
                      <p className="text-2xs text-muted-foreground truncate">
                        @{student.username} &bull; {student.department?.code || 'Student'}
                      </p>
                    </div>
                  </div>

                  {student.id !== currentProfile.id && (
                    <Link href={`/chat`}>
                      <Button variant="outline" size="icon-sm" aria-label={`Message ${student.fullName}`}>
                        <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
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
