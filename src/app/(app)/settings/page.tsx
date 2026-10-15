'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Settings,
  User,
  Moon,
  Sun,
  Shield,
  Bell,
  CheckCircle2,
  Lock,
  Mail,
  AtSign,
  Palette,
  Edit3,
  Building2,
  Hash,
  Calendar,
  Phone,
  ExternalLink,
  Check,
  AlertCircle
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { UserAvatar } from '@/components/shared/user-avatar'
import { EditProfileModal } from '@/components/profile/edit-profile-modal'
import { useAppStore } from '@/lib/data/client-store'

export default function SettingsPage() {
  const { currentProfile, updateProfile, theme, setTheme, profiles, departments } = useAppStore()

  // Modal state
  const [showEditModal, setShowEditModal] = useState(false)

  // Profile form state
  const [fullName, setFullName] = useState(currentProfile.fullName || '')
  const [username, setUsername] = useState(currentProfile.username || '')
  const [bio, setBio] = useState(currentProfile.bio || '')
  const [departmentId, setDepartmentId] = useState(
    currentProfile.departmentId || departments[0]?.id || ''
  )
  const [rollNumber, setRollNumber] = useState(currentProfile.rollNumber || '')
  const [yearOfJoining, setYearOfJoining] = useState(currentProfile.yearOfJoining || 2023)
  const [expectedGraduationYear, setExpectedGraduationYear] = useState(
    currentProfile.expectedGraduationYear || 2027
  )
  const [phoneNumber, setPhoneNumber] = useState(currentProfile.phoneNumber || '')
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // Email form
  const [newEmail, setNewEmail] = useState('')
  const [emailMsg, setEmailMsg] = useState<string | null>(null)

  // Notification toggles
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [lostFoundNotifs, setLostFoundNotifs] = useState(true)
  const [examNotifs, setExamNotifs] = useState(true)

  // Sync profile form when currentProfile updates
  useEffect(() => {
    setFullName(currentProfile.fullName || '')
    setUsername(currentProfile.username || '')
    setBio(currentProfile.bio || '')
    setDepartmentId(currentProfile.departmentId || departments[0]?.id || '')
    setRollNumber(currentProfile.rollNumber || '')
    setYearOfJoining(currentProfile.yearOfJoining || 2023)
    setExpectedGraduationYear(currentProfile.expectedGraduationYear || 2027)
    setPhoneNumber(currentProfile.phoneNumber || '')
  }, [currentProfile, departments])

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault()
    setProfileMsg(null)

    const cleanName = fullName.trim()
    const cleanUsername = username.trim().toLowerCase()
    const cleanRoll = rollNumber.trim().toUpperCase()

    if (!cleanName) {
      setProfileMsg({ type: 'error', text: 'Full legal name is required.' })
      return
    }

    if (!cleanUsername.match(/^[a-z0-9_]{3,30}$/)) {
      setProfileMsg({
        type: 'error',
        text: 'Username must be 3-30 characters long with letters, numbers, and underscores only.',
      })
      return
    }

    const taken = profiles.some(
      (p) => p.username.toLowerCase() === cleanUsername && p.id !== currentProfile.id
    )
    if (taken) {
      setProfileMsg({
        type: 'error',
        text: 'This username is already registered to another student.',
      })
      return
    }

    if (!cleanRoll) {
      setProfileMsg({ type: 'error', text: 'College roll number is required.' })
      return
    }

    const joiningNum = Number(yearOfJoining)
    const gradNum = Number(expectedGraduationYear)

    if (gradNum < joiningNum) {
      setProfileMsg({
        type: 'error',
        text: 'Expected graduation year must be after or equal to year of joining.',
      })
      return
    }

    setIsSavingProfile(true)

    updateProfile({
      fullName: cleanName,
      username: cleanUsername,
      bio: bio.trim() || null,
      departmentId: departmentId || null,
      rollNumber: cleanRoll,
      yearOfJoining: joiningNum,
      expectedGraduationYear: gradNum,
      phoneNumber: phoneNumber.trim() || null,
    })

    setTimeout(() => {
      setIsSavingProfile(false)
      setProfileMsg({
        type: 'success',
        text: 'Profile details successfully updated and saved across CampusConnect.',
      })
      setTimeout(() => setProfileMsg(null), 5000)
    }, 300)
  }

  const handleEmailRequest = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail.includes('@')) return

    setEmailMsg(
      `Verification OTP sent to ${newEmail}. Current active address (${currentProfile.email}) will remain active until verified.`
    )
    setNewEmail('')
    setTimeout(() => setEmailMsg(null), 6000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Account &amp; Appearance Settings
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your student profile, visual preferences, and institutional privacy.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/profile/${currentProfile.username}`}>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              View Profile
            </Button>
          </Link>
          <Button
            size="sm"
            className="h-8 gap-1.5 text-xs font-semibold"
            onClick={() => setShowEditModal(true)}
          >
            <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Section 1: Profile Information */}
      <Card className="p-5 border shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" aria-hidden="true" />
            <h2 className="text-sm font-bold text-foreground">Student Profile Details</h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-2xs gap-1 text-primary hover:text-primary"
            onClick={() => setShowEditModal(true)}
          >
            <Edit3 className="h-3 w-3" aria-hidden="true" />
            Open Photo &amp; Avatar Editor
          </Button>
        </div>

        {/* Profile Card Preview */}
        <div className="flex items-center gap-3.5 p-3 rounded-lg border bg-muted/20">
          <UserAvatar
            name={currentProfile.fullName}
            avatarUrl={currentProfile.avatarUrl}
            size="lg"
            className="h-14 w-14 text-base border-2 border-background shadow-xs shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-foreground truncate">{currentProfile.fullName}</p>
            <p className="text-xs text-muted-foreground font-mono">@{currentProfile.username}</p>
            <p className="text-2xs text-muted-foreground mt-0.5 truncate">
              {currentProfile.department?.name || 'Department'} &bull; Roll: {currentProfile.rollNumber}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-2xs shrink-0"
            onClick={() => setShowEditModal(true)}
          >
            Change Photo
          </Button>
        </div>

        {profileMsg && (
          <div
            className={`p-3 text-xs rounded-md border flex items-center gap-2 ${
              profileMsg.type === 'success'
                ? 'bg-success-50 text-success-600 border-success-500/20'
                : 'bg-destructive-50 text-destructive-600 border-destructive/20'
            }`}
            role="alert"
          >
            {profileMsg.type === 'success' ? (
              <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            )}
            <span>{profileMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleProfileSave} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground" htmlFor="prof-name">
                Full Legal Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="prof-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground" htmlFor="prof-username">
                Username / Handle <span className="text-destructive">*</span>
              </label>
              <Input
                id="prof-username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                className="text-xs lowercase font-mono"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground" htmlFor="prof-bio">
                Profile Bio
              </label>
              <span className="text-2xs text-muted-foreground font-mono">{bio.length}/300</span>
            </div>
            <textarea
              id="prof-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 300))}
              rows={2}
              className="w-full rounded-md border border-input bg-background p-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary leading-relaxed resize-none"
              placeholder="A few words about your interests, research, or study goals..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground" htmlFor="prof-dept">
                Academic Department
              </label>
              <select
                id="prof-dept"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              >
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground" htmlFor="prof-roll">
                Roll Number <span className="text-destructive">*</span>
              </label>
              <Input
                id="prof-roll"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                className="text-xs uppercase font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground" htmlFor="prof-joining">
                Year Joined
              </label>
              <Input
                id="prof-joining"
                type="number"
                min={2000}
                max={2035}
                value={yearOfJoining}
                onChange={(e) => setYearOfJoining(Number(e.target.value))}
                className="text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground" htmlFor="prof-grad">
                Expected Grad
              </label>
              <Input
                id="prof-grad"
                type="number"
                min={2000}
                max={2040}
                value={expectedGraduationYear}
                onChange={(e) => setExpectedGraduationYear(Number(e.target.value))}
                className="text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground" htmlFor="prof-phone">
                Phone Number
              </label>
              <Input
                id="prof-phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91..."
                className="text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="sm" loading={isSavingProfile} className="h-8 text-xs font-semibold">
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Section 2: Appearance Theme */}
      <Card className="p-5 border shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 className="text-sm font-bold text-foreground">Visual Theme &amp; Contrast</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Select between crisp academic light mode and high-contrast dark mode. Preference persists across sessions.
        </p>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-3.5 rounded-lg border text-left transition flex items-center gap-3 ${
              theme === 'light'
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'bg-card hover:bg-accent/50'
            }`}
          >
            <div className="h-8 w-8 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Sun className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-xs text-foreground">Light Theme</p>
              <p className="text-2xs text-muted-foreground">Clean academic contrast</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-3.5 rounded-lg border text-left transition flex items-center gap-3 ${
              theme === 'dark'
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'bg-card hover:bg-accent/50'
            }`}
          >
            <div className="h-8 w-8 rounded-md bg-indigo-950 text-indigo-400 flex items-center justify-center shrink-0">
              <Moon className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-xs text-foreground">Dark Theme</p>
              <p className="text-2xs text-muted-foreground">Low-light study mode</p>
            </div>
          </button>
        </div>
      </Card>

      {/* Section 3: Change Email */}
      <Card className="p-5 border shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 className="text-sm font-bold text-foreground">Registered Email Address</h2>
        </div>

        <p className="text-xs text-muted-foreground">
          Currently verified address: <span className="font-semibold text-foreground">{currentProfile.email}</span>
        </p>

        {emailMsg && (
          <div className="p-3 text-xs rounded-md bg-success-50 text-success-600 border border-success-500/20">
            {emailMsg}
          </div>
        )}

        <form onSubmit={handleEmailRequest} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground" htmlFor="new-mail">
              New Institutional Email
            </label>
            <Input
              id="new-mail"
              type="email"
              placeholder="new.email@demo.campusconnect.app"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="text-xs"
              required
            />
          </div>

          <Button type="submit" size="sm" variant="outline" className="h-8 text-xs">
            Request Email Change OTP
          </Button>
        </form>
      </Card>

      {/* Section 4: Notification Preferences */}
      <Card className="p-5 border shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 className="text-sm font-bold text-foreground">Notification Preferences</h2>
        </div>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-2 rounded hover:bg-accent/40 cursor-pointer">
            <div>
              <p className="font-semibold text-foreground">Department Examination Notices</p>
              <p className="text-2xs text-muted-foreground">Alerts when new timetable revisions are posted</p>
            </div>
            <input
              type="checkbox"
              checked={examNotifs}
              onChange={(e) => setExamNotifs(e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded hover:bg-accent/40 cursor-pointer">
            <div>
              <p className="font-semibold text-foreground">Lost &amp; Found Match Notifications</p>
              <p className="text-2xs text-muted-foreground">Instant notification when a potential match is reported</p>
            </div>
            <input
              type="checkbox"
              checked={lostFoundNotifs}
              onChange={(e) => setLostFoundNotifs(e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded hover:bg-accent/40 cursor-pointer">
            <div>
              <p className="font-semibold text-foreground">Direct Message Alerts</p>
              <p className="text-2xs text-muted-foreground">In-app notifications for incoming student chats</p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifs}
              onChange={(e) => setEmailNotifs(e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
          </label>
        </div>
      </Card>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
      />
    </div>
  )
}
