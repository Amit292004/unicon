'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Users,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  Search,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  Building2,
  Mail,
  Phone,
  Hash,
  X
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { UserAvatar } from '@/components/shared/user-avatar'
import { useAppStore } from '@/lib/data/client-store'
import type { Profile, UserRole } from '@/types'

export default function AdminStudentsPage() {
  const { currentProfile, profiles, departments, addUser, updateUser, deleteUser } = useAppStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all')
  const [actionMsg, setActionMsg] = useState<string | null>(null)

  // Add / Edit Modal
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<Profile | null>(null)

  // Form Fields
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('demo1234')
  const [rollNumber, setRollNumber] = useState('')
  const [departmentId, setDepartmentId] = useState<string>(departments[0]?.id || '')
  const [role, setRole] = useState<UserRole>('student')
  const [yearOfJoining, setYearOfJoining] = useState(2024)
  const [expectedGraduationYear, setExpectedGraduationYear] = useState(2028)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [bio, setBio] = useState('')

  const collegeUsers = profiles.filter((p) => p.collegeId === currentProfile.collegeId)

  const filteredUsers = collegeUsers.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const match =
        u.fullName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.rollNumber && u.rollNumber.toLowerCase().includes(q)) ||
        u.email.toLowerCase().includes(q)
      if (!match) return false
    }
    return true
  })

  const handleOpenAdd = () => {
    setEditingUser(null)
    setFullName('')
    setUsername('')
    setEmail('')
    setPassword('demo1234')
    setRollNumber('')
    setDepartmentId(departments[0]?.id || '')
    setRole('student')
    setYearOfJoining(2024)
    setExpectedGraduationYear(2028)
    setPhoneNumber('')
    setBio('')
    setShowModal(true)
  }

  const handleOpenEdit = (user: Profile) => {
    setEditingUser(user)
    setFullName(user.fullName)
    setUsername(user.username)
    setEmail(user.email)
    setPassword('')
    setRollNumber(user.rollNumber || '')
    setDepartmentId(user.departmentId || departments[0]?.id || '')
    setRole(user.role)
    setYearOfJoining(user.yearOfJoining || 2024)
    setExpectedGraduationYear(user.expectedGraduationYear || 2028)
    setPhoneNumber(user.phoneNumber || '')
    setBio(user.bio || '')
    setShowModal(true)
  }

  const handleDelete = (id: string, name: string) => {
    if (id === currentProfile.id) {
      alert('You cannot delete your own active administrator account.')
      return
    }
    if (typeof window !== 'undefined' && !window.confirm(`Are you sure you want to delete user account "${name}"?`)) {
      return
    }
    deleteUser(id)
    setActionMsg(`User "${name}" was deleted successfully.`)
    setTimeout(() => setActionMsg(null), 4000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !username.trim() || !email.trim()) return

    const selectedDept = departments.find((d) => d.id === departmentId)

    if (editingUser) {
      updateUser(editingUser.id, {
        fullName: fullName.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        rollNumber: rollNumber.trim().toUpperCase() || null,
        departmentId: departmentId || null,
        department: selectedDept,
        role,
        yearOfJoining: Number(yearOfJoining),
        expectedGraduationYear: Number(expectedGraduationYear),
        phoneNumber: phoneNumber.trim() || null,
        bio: bio.trim() || null,
      })
      setActionMsg(`Account for "${fullName}" was updated.`)
    } else {
      addUser(
        {
          collegeId: currentProfile.collegeId,
          departmentId: departmentId || null,
          role,
          fullName: fullName.trim(),
          username: username.trim().toLowerCase(),
          rollNumber: rollNumber.trim().toUpperCase() || null,
          email: email.trim().toLowerCase(),
          phoneNumber: phoneNumber.trim() || null,
          avatarUrl: null,
          bio: bio.trim() || null,
          yearOfJoining: Number(yearOfJoining),
          expectedGraduationYear: Number(expectedGraduationYear),
          isEmailVerified: true,
          isOnboarded: true,
          theme: 'light',
          college: currentProfile.college,
          department: selectedDept,
        },
        password || 'demo1234'
      )
      setActionMsg(`Account for "${fullName}" was created.`)
    }

    setShowModal(false)
    setEditingUser(null)
    setTimeout(() => setActionMsg(null), 4000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Student &amp; User Accounts Directory
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add, update, manage credentials, or delete student and staff accounts for {currentProfile.college?.name}
          </p>
        </div>

        <Button size="sm" onClick={handleOpenAdd} className="gap-1.5 text-xs">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Enroll New User
        </Button>
      </div>

      {actionMsg && (
        <div className="p-3 text-xs rounded-md bg-success-50 text-success-600 border border-success-500/20 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search students by name, username, roll number, or email..."
            className="pl-9 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex rounded-md border p-1 bg-muted/40 gap-1 text-xs">
          <button
            type="button"
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded font-medium transition ${
              roleFilter === 'all' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
            }`}
          >
            All Roles ({collegeUsers.length})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('student')}
            className={`px-3 py-1.5 rounded font-medium transition ${
              roleFilter === 'student' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
            }`}
          >
            Students
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('college_admin')}
            className={`px-3 py-1.5 rounded font-medium transition ${
              roleFilter === 'college_admin' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
            }`}
          >
            Faculty / Admin
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('transport_admin')}
            className={`px-3 py-1.5 rounded font-medium transition ${
              roleFilter === 'transport_admin' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
            }`}
          >
            Transport Admin
          </button>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="p-4 border shadow-card flex flex-col justify-between space-y-3">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <UserAvatar name={user.fullName} avatarUrl={user.avatarUrl} size="md" />
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-foreground truncate">{user.fullName}</p>
                    <p className="text-2xs text-muted-foreground font-mono">@{user.username}</p>
                  </div>
                </div>

                <Badge
                  variant={user.role === 'student' ? 'default' : 'warning'}
                  className="text-2xs uppercase"
                >
                  {user.role.replace('_', ' ')}
                </Badge>
              </div>

              <div className="p-2.5 rounded-md bg-secondary/30 text-2xs space-y-1 font-mono">
                {user.rollNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Roll No:</span>
                    <span className="text-foreground">{user.rollNumber}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Dept:</span>
                  <span className="text-foreground truncate max-w-[150px]">{user.department?.code || user.department?.name || 'General'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="text-foreground truncate max-w-[150px]">{user.email}</span>
                </div>
                {user.expectedGraduationYear && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Class of:</span>
                    <span className="text-foreground">{user.expectedGraduationYear}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-2.5 flex items-center justify-between text-2xs">
              <Link href={`/profile/${user.username}`} className="text-primary hover:underline font-medium">
                View Profile &rarr;
              </Link>

              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-2xs gap-1"
                  onClick={() => handleOpenEdit(user)}
                >
                  <Edit3 className="h-3 w-3" aria-hidden="true" />
                  Edit
                </Button>
                {user.id !== currentProfile.id && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-2xs gap-1 text-destructive-600 hover:bg-destructive-50"
                    onClick={() => handleDelete(user.id, user.fullName)}
                  >
                    <Trash2 className="h-3 w-3" aria-hidden="true" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add / Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-6 border shadow-modal max-h-[90vh] overflow-y-auto">
            <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">
                {editingUser ? 'Edit User Profile' : 'Enroll New Campus User'}
              </CardTitle>
              <Button size="icon-sm" variant="ghost" onClick={() => setShowModal(false)}>
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </CardHeader>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="u-fullname">
                  Full Legal Name
                </label>
                <Input
                  id="u-fullname"
                  placeholder="e.g. Samuel Longkumer"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="u-username">
                    Unique Username
                  </label>
                  <Input
                    id="u-username"
                    placeholder="samuel_l"
                    className="lowercase"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="u-roll">
                    Roll Number
                  </label>
                  <Input
                    id="u-roll"
                    placeholder="2024CSE015"
                    className="uppercase"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="u-email">
                    Institutional Email
                  </label>
                  <Input
                    id="u-email"
                    type="email"
                    placeholder="user@demo.campusconnect.app"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {!editingUser && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground" htmlFor="u-pwd">
                      Initial Password
                    </label>
                    <Input
                      id="u-pwd"
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="u-dept">
                    Department
                  </label>
                  <select
                    id="u-dept"
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="u-role">
                    Access Role
                  </label>
                  <select
                    id="u-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <option value="student">Student</option>
                    <option value="college_admin">College Administrator</option>
                    <option value="transport_admin">Transport Administrator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="u-join">
                    Year of Joining
                  </label>
                  <Input
                    id="u-join"
                    type="number"
                    min={2000}
                    max={2030}
                    value={yearOfJoining}
                    onChange={(e) => setYearOfJoining(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="u-grad">
                    Expected Graduation
                  </label>
                  <Input
                    id="u-grad"
                    type="number"
                    min={2000}
                    max={2035}
                    value={expectedGraduationYear}
                    onChange={(e) => setExpectedGraduationYear(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="u-bio">
                  Profile Bio (Optional)
                </label>
                <textarea
                  id="u-bio"
                  placeholder="Academic interests, specialization..."
                  className="w-full min-h-[60px] rounded-md border border-input bg-background p-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  {editingUser ? 'Save Updates' : 'Enroll User'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
