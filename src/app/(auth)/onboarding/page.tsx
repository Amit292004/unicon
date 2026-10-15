'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  User,
  GraduationCap,
  Calendar,
  Phone,
  FileText,
  ArrowRight,
  Hash,
  AtSign,
  Building2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { useAppStore } from '@/lib/data/client-store'
import { SEEDED_DEPARTMENTS, SEEDED_COLLEGES } from '@/lib/data/store'
import type { Profile } from '@/types'

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || 'new.student@demo.campusconnect.app'
  const { registerUser, profiles } = useAppStore()

  const [collegeId, setCollegeId] = useState<string>('col-003')
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [rollNumber, setRollNumber] = useState('')
  const [departmentId, setDepartmentId] = useState(SEEDED_DEPARTMENTS[0].id)
  const [yearOfJoining, setYearOfJoining] = useState(2024)
  const [expectedGraduationYear, setExpectedGraduationYear] = useState(2028)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [bio, setBio] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [pendingPassword, setPendingPassword] = useState<string | undefined>()

  // Retrieve pending registration info if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('cc_pending_registration')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed.collegeId) setCollegeId(parsed.collegeId)
          if (parsed.password) setPendingPassword(parsed.password)
        }
      } catch {
        // Ignore JSON errors
      }
    }
  }, [])

  // Auto-suggest graduation year based on joining year
  useEffect(() => {
    setExpectedGraduationYear(Number(yearOfJoining) + 4)
  }, [yearOfJoining])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    const cleanUsername = username.trim().toLowerCase()
    if (!cleanUsername.match(/^[a-z0-9_]{3,30}$/)) {
      setError('Username must be 3-30 characters and only contain letters, numbers, or underscores.')
      return
    }

    // Check username uniqueness
    const exists = profiles.some(
      (p) => p.username.toLowerCase() === cleanUsername && p.email !== email
    )
    if (exists) {
      setError('This username is already taken. Please choose another.')
      return
    }

    if (!rollNumber.trim()) {
      setError('College Roll Number is required for institutional records.')
      return
    }

    setLoading(true)

    const selectedCollege = SEEDED_COLLEGES.find((c) => c.id === collegeId) || SEEDED_COLLEGES[2]
    const selectedDept = SEEDED_DEPARTMENTS.find((d) => d.id === departmentId)
    const newProfile: Profile = {
      id: `usr-${Date.now()}`,
      collegeId: selectedCollege.id,
      departmentId,
      role: 'student',
      fullName: fullName.trim(),
      username: cleanUsername,
      rollNumber: rollNumber.trim().toUpperCase(),
      email,
      phoneNumber: phoneNumber.trim() || null,
      avatarUrl: null,
      bio: bio.trim() || 'College student collaborating on UNICON.',
      yearOfJoining: Number(yearOfJoining),
      expectedGraduationYear: Number(expectedGraduationYear),
      isEmailVerified: true,
      isOnboarded: true,
      theme: 'light',
      createdAt: new Date().toISOString(),
      college: selectedCollege,
      department: selectedDept,
    }

    registerUser(newProfile, pendingPassword)
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('cc_pending_registration')
    }

    setTimeout(() => {
      setLoading(false)
      router.push('/home')
    }, 400)
  }

  return (
    <Card className="border shadow-card w-full">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-primary font-semibold mb-1">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          <span>Final Step: Student Identity Verification</span>
        </div>
        <CardTitle className="text-xl font-bold">Complete Your Profile</CardTitle>
        <CardDescription>
          Provide your verified academic details to connect with peers and access department notices.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <div
            className="mb-4 p-3 text-xs rounded-md bg-destructive-50 text-destructive-600 border border-destructive/20"
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground" htmlFor="fullName">
              Full Legal Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="fullName"
                placeholder="e.g. Samuel Longkumer"
                className="pl-9"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground" htmlFor="username">
                Unique Username
              </label>
              <div className="relative">
                <AtSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="username"
                  placeholder="samuel_l"
                  className="pl-9 lowercase"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground" htmlFor="rollNumber">
                College Roll Number
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="rollNumber"
                  placeholder="2024CSE012"
                  className="pl-9 uppercase"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground" htmlFor="department">
              Academic Department
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <select
                id="department"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {SEEDED_DEPARTMENTS.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground" htmlFor="yearOfJoining">
                Year of Joining
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="yearOfJoining"
                  type="number"
                  min={2000}
                  max={2030}
                  className="pl-9"
                  value={yearOfJoining}
                  onChange={(e) => setYearOfJoining(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground" htmlFor="gradYear">
                Expected Graduation
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="gradYear"
                  type="number"
                  min={2000}
                  max={2035}
                  className="pl-9"
                  value={expectedGraduationYear}
                  onChange={(e) => setExpectedGraduationYear(Number(e.target.value))}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground" htmlFor="phone">
              Phone Number (Optional - kept private)
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                className="pl-9"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground" htmlFor="bio">
              Brief Profile Bio
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="bio"
                placeholder="Interests, projects, or study goals..."
                className="pl-9"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" className="w-full mt-2" loading={loading}>
            Complete Setup & Enter Campus
            <ArrowRight className="h-4 w-4 ml-1" aria-hidden="true" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function OnboardingPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading onboarding...</div>}>
      <OnboardingContent />
    </React.Suspense>
  )
}
