'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  X,
  Camera,
  Upload,
  User,
  AtSign,
  Building2,
  Hash,
  Calendar,
  Phone,
  Mail,
  Check,
  AlertCircle,
  Sparkles,
  Trash2,
  Image as ImageIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { UserAvatar } from '@/components/shared/user-avatar'
import { useAppStore } from '@/lib/data/client-store'
import type { Profile } from '@/types'

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
]

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (newUsername: string) => void
}

export function EditProfileModal({ isOpen, onClose, onSuccess }: EditProfileModalProps) {
  const router = useRouter()
  const { currentProfile, updateProfile, profiles, departments } = useAppStore()

  // Form fields
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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentProfile.avatarUrl || null)

  // Avatar picker helpers
  const [showAvatarPresets, setShowAvatarPresets] = useState(false)
  const [customImageUrl, setCustomImageUrl] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)

  // Status & error handling
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync state whenever modal opens or currentProfile changes
  useEffect(() => {
    if (isOpen) {
      setFullName(currentProfile.fullName || '')
      setUsername(currentProfile.username || '')
      setBio(currentProfile.bio || '')
      setDepartmentId(currentProfile.departmentId || departments[0]?.id || '')
      setRollNumber(currentProfile.rollNumber || '')
      setYearOfJoining(currentProfile.yearOfJoining || 2023)
      setExpectedGraduationYear(currentProfile.expectedGraduationYear || 2027)
      setPhoneNumber(currentProfile.phoneNumber || '')
      setAvatarUrl(currentProfile.avatarUrl || null)
      setError(null)
      setSuccessMsg(null)
      setShowAvatarPresets(false)
      setShowUrlInput(false)
      setCustomImageUrl('')
    }
  }, [isOpen, currentProfile, departments])

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Handle image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check size <= 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError('Selected image exceeds maximum allowed size of 5 MB.')
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Please choose a valid image file (PNG, JPG, or WebP).')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result)
        setError(null)
        setShowAvatarPresets(false)
        setShowUrlInput(false)
      }
    }
    reader.onerror = () => {
      setError('Unable to read selected photo file.')
    }
    reader.readAsDataURL(file)
  }

  // Handle custom image URL submission
  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customImageUrl.trim()) return
    setAvatarUrl(customImageUrl.trim())
    setShowUrlInput(false)
    setCustomImageUrl('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleanName = fullName.trim()
    const cleanUsername = username.trim().toLowerCase()
    const cleanRoll = rollNumber.trim().toUpperCase()

    if (!cleanName) {
      setError('Full legal name is required.')
      return
    }

    // Username format: 3-30 characters, letters, numbers, underscores
    if (!cleanUsername.match(/^[a-z0-9_]{3,30}$/)) {
      setError('Username must be 3-30 characters long with letters, numbers, and underscores only.')
      return
    }

    // Check username collision with OTHER users
    const isTaken = profiles.some(
      (p) => p.username.toLowerCase() === cleanUsername && p.id !== currentProfile.id
    )
    if (isTaken) {
      setError('This username is already taken by another student on campus. Please choose another.')
      return
    }

    if (!cleanRoll) {
      setError('College Roll Number is required for institutional student records.')
      return
    }

    const joiningNum = Number(yearOfJoining)
    const gradNum = Number(expectedGraduationYear)

    if (gradNum < joiningNum) {
      setError('Expected graduation year must be after or equal to the year of joining.')
      return
    }

    setIsSubmitting(true)

    const updates: Partial<Profile> = {
      fullName: cleanName,
      username: cleanUsername,
      bio: bio.trim() || null,
      departmentId: departmentId || null,
      rollNumber: cleanRoll,
      yearOfJoining: joiningNum,
      expectedGraduationYear: gradNum,
      phoneNumber: phoneNumber.trim() || null,
      avatarUrl: avatarUrl || null,
    }

    updateProfile(updates)

    setSuccessMsg('Profile updated successfully!')

    setTimeout(() => {
      setIsSubmitting(false)
      onClose()

      if (onSuccess) {
        onSuccess(cleanUsername)
      } else if (cleanUsername !== currentProfile.username.toLowerCase()) {
        router.push(`/profile/${cleanUsername}`)
      }
    }, 400)
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
    >
      <Card className="max-w-xl w-full my-auto border shadow-2xl bg-card overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/20">
          <div>
            <h2 id="edit-profile-title" className="text-lg font-bold text-foreground">
              Edit Student Profile
            </h2>
            <p className="text-xs text-muted-foreground">
              Update your public identity, academic affiliation, and contact details.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div
              className="p-3 text-xs rounded-md bg-destructive-50 text-destructive-600 border border-destructive/20 flex items-start gap-2"
              role="alert"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div
              className="p-3 text-xs rounded-md bg-success-50 text-success-600 border border-success-500/20 flex items-center gap-2"
              role="status"
            >
              <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Section: Avatar */}
          <div className="p-4 rounded-lg border bg-muted/10 space-y-3">
            <label className="text-xs font-semibold text-foreground block">
              Profile Photo &amp; Avatar
            </label>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="relative group shrink-0">
                <UserAvatar
                  name={fullName || 'Student'}
                  avatarUrl={avatarUrl}
                  size="xl"
                  className="h-20 w-20 text-xl border-2 border-primary/20 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-2xs font-medium cursor-pointer"
                  title="Upload new image"
                >
                  <Camera className="h-5 w-5 mb-0.5" aria-hidden="true" />
                  <span>Change</span>
                </button>
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <p className="text-2xs text-muted-foreground leading-relaxed">
                  Upload a photo from your device, choose from curated campus presets, or provide an image link.
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="profile-avatar-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-2xs gap-1.5"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-3 w-3" aria-hidden="true" />
                    Upload Photo
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-2xs gap-1.5"
                    onClick={() => {
                      setShowAvatarPresets(!showAvatarPresets)
                      setShowUrlInput(false)
                    }}
                  >
                    <Sparkles className="h-3 w-3 text-amber-500" aria-hidden="true" />
                    Preset Avatars
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-2xs gap-1.5"
                    onClick={() => {
                      setShowUrlInput(!showUrlInput)
                      setShowAvatarPresets(false)
                    }}
                  >
                    <ImageIcon className="h-3 w-3 text-primary" aria-hidden="true" />
                    Image URL
                  </Button>

                  {avatarUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-2xs text-destructive hover:bg-destructive/10 gap-1"
                      onClick={() => setAvatarUrl(null)}
                    >
                      <Trash2 className="h-3 w-3" aria-hidden="true" />
                      Remove
                    </Button>
                  )}
                </div>

                {/* Preset Avatars Drawer */}
                {showAvatarPresets && (
                  <div className="p-3 mt-2 rounded-md border bg-card space-y-2 animate-in fade-in duration-100">
                    <p className="text-2xs font-medium text-foreground">Select a student avatar:</p>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_AVATARS.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setAvatarUrl(url)
                            setShowAvatarPresets(false)
                          }}
                          className={`relative rounded-full p-0.5 border-2 transition ${
                            avatarUrl === url
                              ? 'border-primary ring-2 ring-primary/30'
                              : 'border-transparent hover:border-muted-foreground'
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={`Avatar preset ${idx + 1}`}
                            className="h-9 w-9 rounded-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Image URL input */}
                {showUrlInput && (
                  <div className="p-2.5 mt-2 rounded-md border bg-card space-y-2 animate-in fade-in duration-100">
                    <div className="flex gap-2">
                      <Input
                        type="url"
                        placeholder="https://example.com/avatar.jpg"
                        value={customImageUrl}
                        onChange={(e) => setCustomImageUrl(e.target.value)}
                        className="text-xs h-7"
                      />
                      <Button
                        type="button"
                        size="sm"
                        className="h-7 text-2xs"
                        onClick={handleApplyCustomUrl}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section: Basic Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5" htmlFor="edit-fullname">
                <User className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Full Legal Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="edit-fullname"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Chen"
                className="text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5" htmlFor="edit-username">
                <AtSign className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Username / Handle <span className="text-destructive">*</span>
              </label>
              <Input
                id="edit-username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                placeholder="e.g. alex_chen"
                className="text-xs font-mono lowercase"
                required
              />
              <p className="text-2xs text-muted-foreground">
                Letters, numbers, and underscores only (3-30 chars).
              </p>
            </div>
          </div>

          {/* Section: Bio */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground" htmlFor="edit-bio">
                Profile Bio
              </label>
              <span className="text-2xs text-muted-foreground font-mono">
                {bio.length}/300
              </span>
            </div>
            <textarea
              id="edit-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 300))}
              placeholder="Share your academic interests, tech stack, or campus goals..."
              rows={3}
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary leading-relaxed resize-none"
            />
          </div>

          {/* Section: Academic Affiliation */}
          <div className="p-4 rounded-lg border bg-muted/10 space-y-3">
            <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Academic &amp; Institutional Affiliation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-2xs font-medium text-muted-foreground" htmlFor="edit-dept">
                  Department / Branch
                </label>
                <select
                  id="edit-dept"
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
                <label className="text-2xs font-medium text-muted-foreground flex items-center gap-1" htmlFor="edit-roll">
                  <Hash className="h-3 w-3" aria-hidden="true" />
                  College Roll Number <span className="text-destructive">*</span>
                </label>
                <Input
                  id="edit-roll"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                  placeholder="2023CSE042"
                  className="text-xs uppercase font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-2xs font-medium text-muted-foreground flex items-center gap-1" htmlFor="edit-joining">
                    <Calendar className="h-3 w-3" aria-hidden="true" />
                    Joined
                  </label>
                  <Input
                    id="edit-joining"
                    type="number"
                    min={2000}
                    max={2035}
                    value={yearOfJoining}
                    onChange={(e) => {
                      const yr = Number(e.target.value)
                      setYearOfJoining(yr)
                      if (expectedGraduationYear <= yr) {
                        setExpectedGraduationYear(yr + 4)
                      }
                    }}
                    className="text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-medium text-muted-foreground flex items-center gap-1" htmlFor="edit-grad">
                    <Calendar className="h-3 w-3" aria-hidden="true" />
                    Graduation
                  </label>
                  <Input
                    id="edit-grad"
                    type="number"
                    min={2000}
                    max={2040}
                    value={expectedGraduationYear}
                    onChange={(e) => setExpectedGraduationYear(Number(e.target.value))}
                    className="text-xs"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5" htmlFor="edit-phone">
                <Phone className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Phone Number (Private)
              </label>
              <Input
                id="edit-phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98765 43210"
                className="text-xs"
              />
              <p className="text-2xs text-muted-foreground">
                Only visible to you and verified institutional administrators.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5" htmlFor="edit-email">
                <Mail className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Institutional Email
              </label>
              <Input
                id="edit-email"
                type="email"
                value={currentProfile.email}
                disabled
                className="text-xs bg-muted/50 cursor-not-allowed opacity-80"
              />
              <p className="text-2xs text-muted-foreground">
                Email changes can be requested via Settings.
              </p>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              loading={isSubmitting}
              className="min-w-[120px]"
            >
              Save Profile
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
