'use client'

import React, { useState } from 'react'
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Plus,
  Edit3,
  Trash2,
  Search,
  CheckCircle2,
  X,
  Building2,
  ShieldAlert,
  UserCheck
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/lib/data/client-store'
import type { CampusContact } from '@/types'

const PRESET_CATEGORIES = [
  'Administration',
  'Academic Affairs',
  'Emergency & Security',
  'Health & Medical',
  'Student Welfare',
  'Transport & Logistics',
  'Hostel & Residence',
  'IT & Network Services',
]

export default function AdminContactsPage() {
  const {
    currentProfile,
    campusContacts,
    addCampusContact,
    updateCampusContact,
    deleteCampusContact,
  } = useAppStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [actionMsg, setActionMsg] = useState<string | null>(null)

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [editingContact, setEditingContact] = useState<CampusContact | null>(null)
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [category, setCategory] = useState('Administration')
  const [department, setDepartment] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [office, setOffice] = useState('')
  const [hours, setHours] = useState('09:00 AM - 05:00 PM (Mon-Fri)')

  const categories = Array.from(new Set(['all', ...campusContacts.map((c) => c.category)]))

  const filteredContacts = campusContacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleOpenAdd = () => {
    setEditingContact(null)
    setName('')
    setRole('')
    setCategory('Administration')
    setDepartment('Administrative Wing')
    setEmail('')
    setPhone('+91 ')
    setOffice('Room 101, Admin Block')
    setHours('09:00 AM - 05:00 PM (Mon-Fri)')
    setShowModal(true)
  }

  const handleOpenEdit = (contact: CampusContact) => {
    setEditingContact(contact)
    setName(contact.name)
    setRole(contact.role)
    setCategory(contact.category)
    setDepartment(contact.department)
    setEmail(contact.email)
    setPhone(contact.phone)
    setOffice(contact.office)
    setHours(contact.hours)
    setShowModal(true)
  }

  const handleDelete = (id: string, contactName: string) => {
    if (typeof window !== 'undefined' && !window.confirm(`Delete directory listing for "${contactName}"?`)) return
    deleteCampusContact(id)
    setActionMsg(`Contact "${contactName}" deleted successfully.`)
    setTimeout(() => setActionMsg(null), 3000)
  }

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !role.trim() || !email.trim()) return

    if (editingContact) {
      updateCampusContact(editingContact.id, {
        name: name.trim(),
        role: role.trim(),
        category: category.trim(),
        department: department.trim(),
        email: email.trim(),
        phone: phone.trim(),
        office: office.trim(),
        hours: hours.trim(),
      })
      setActionMsg(`Directory record for "${name}" updated.`)
    } else {
      addCampusContact({
        collegeId: currentProfile.collegeId,
        name: name.trim(),
        role: role.trim(),
        category: category.trim(),
        department: department.trim(),
        email: email.trim(),
        phone: phone.trim(),
        office: office.trim(),
        hours: hours.trim(),
      })
      setActionMsg(`New directory record for "${name}" created.`)
    }

    setShowModal(false)
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
            <span className="text-2xs text-muted-foreground">&bull; Directory Management</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Campus Contacts &amp; Helpdesk Directory
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage administrative helplines, academic counseling, department heads, and campus security points of contact.
          </p>
        </div>

        <Button size="sm" onClick={handleOpenAdd} className="gap-1.5 text-xs">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Directory Contact
        </Button>
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

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, role, department, or phone..."
            className="pl-8 text-xs h-8"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-8 text-xs rounded-md border border-input bg-card px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Directory Categories' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contacts List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.length === 0 ? (
          <div className="col-span-full p-12 text-center border rounded-lg bg-card text-xs text-muted-foreground">
            No contacts found matching the criteria. Click &quot;Add Directory Contact&quot; to create a new entry.
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <Card key={contact.id} className="border shadow-card flex flex-col justify-between hover:border-primary/40 transition">
              <CardHeader className="p-4 pb-2 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <CardTitle className="text-sm font-bold text-foreground">
                      {contact.name}
                    </CardTitle>
                    <p className="text-xs text-primary font-medium">{contact.role}</p>
                  </div>
                  <Badge variant="outline" className="text-2xs font-normal">
                    {contact.category}
                  </Badge>
                </div>
                <p className="text-2xs text-muted-foreground">{contact.department}</p>
              </CardHeader>

              <CardContent className="p-4 pt-1 space-y-3">
                <div className="space-y-1.5 text-xs text-muted-foreground border-t pt-2.5">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                    <a href={`mailto:${contact.email}`} className="text-foreground hover:underline truncate">
                      {contact.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                    <a href={`tel:${contact.phone}`} className="text-foreground hover:underline">
                      {contact.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                    <span>{contact.office}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                    <span>{contact.hours}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-2 border-t">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => handleOpenEdit(contact)}
                    title="Edit Contact"
                    aria-label="Edit contact"
                  >
                    <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(contact.id, contact.name)}
                    title="Delete Contact"
                    aria-label="Delete contact"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
          <div className="bg-card border rounded-lg shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
                {editingContact ? 'Edit Contact Directory Record' : 'Add New Contact to Directory'}
              </h2>
              <Button size="icon-sm" variant="ghost" onClick={() => setShowModal(false)} aria-label="Close dialog">
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Contact Full Name *</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Prof. R. Sharma"
                    required
                    className="text-xs h-8"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Designation / Role *</label>
                  <Input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Dean of Student Affairs"
                    required
                    className="text-xs h-8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-8 text-xs rounded-md border border-input bg-card px-2 text-foreground"
                  >
                    {PRESET_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Department / Division *</label>
                  <Input
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Academic Secretariat"
                    required
                    className="text-xs h-8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Official Email Address *</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="dean.students@demo.edu"
                    required
                    className="text-xs h-8"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Contact Phone Number *</label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                    className="text-xs h-8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Office Location</label>
                  <Input
                    value={office}
                    onChange={(e) => setOffice(e.target.value)}
                    placeholder="Room 102, Ground Floor"
                    className="text-xs h-8"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Operating Hours</label>
                  <Input
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="09:00 AM - 05:00 PM (Mon-Fri)"
                    className="text-xs h-8"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  {editingContact ? 'Save Changes' : 'Create Contact'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
