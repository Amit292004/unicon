'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Building2, Search, ArrowRight, CheckCircle2, Mail, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { SEEDED_COLLEGES } from '@/lib/data/store'
import { GoogleAuthButton } from '@/components/auth/google-auth-button'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [searchCollege, setSearchCollege] = useState('')
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>('col-002')

  // Step 2 Form
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const filteredColleges = SEEDED_COLLEGES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchCollege.toLowerCase()) ||
      (c.city && c.city.toLowerCase().includes(searchCollege.toLowerCase()))
  )

  const selectedCollege = SEEDED_COLLEGES.find((c) => c.id === selectedCollegeId)

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCollegeId) {
      setError('Please select your affiliated college.')
      return
    }
    setError(null)
    setStep(2)
  }

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      // Send real OTP email
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          collegeName: selectedCollege?.name,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to dispatch verification code to your email.')
        setLoading(false)
        return
      }

      // Store pending registration info in sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'cc_pending_registration',
          JSON.stringify({
            collegeId: selectedCollegeId,
            email,
            password,
          })
        )
      }

      router.push(`/verify-email?email=${encodeURIComponent(email)}&sent=1`)
    } catch {
      setError('Network error: Unable to contact the verification service.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border shadow-card w-full">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2 lg:hidden mb-2">
          <Image
            src="/unicon-logo.png"
            alt="UNICON"
            width={120}
            height={26}
            className="h-7 w-auto object-contain dark:brightness-110"
            priority
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>Step {step} of 2</span>
          <span>{step === 1 ? 'Select College' : 'Account Details'}</span>
        </div>
        <CardTitle className="text-xl font-bold">
          {step === 1 ? 'Find Your College' : 'Create Student Account'}
        </CardTitle>
        <CardDescription>
          {step === 1
            ? 'UNICON is strictly scoped by institution to keep data private and relevant.'
            : `Registering as a student for ${selectedCollege?.name || 'Selected College'}.`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div
            className="p-3 text-xs rounded-md bg-destructive-50 text-destructive-600 border border-destructive/20"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Quick Sign up with Google (identical to Bounce Back Academy) */}
        <GoogleAuthButton
          callbackUrl="/"
          text="signup_with"
          onError={(err) => setError(err)}
        />

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-2xs text-muted-foreground font-medium">
              Or register with email
            </span>
          </div>
        </div>

        {step === 1 && (
          <form onSubmit={handleStep1Next} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder="Search college name or city..."
                className="pl-9"
                value={searchCollege}
                onChange={(e) => setSearchCollege(e.target.value)}
              />
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1" role="radiogroup" aria-label="College selection">
              {filteredColleges.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground border rounded-md p-4">
                  No verified colleges match your search. You can submit a request to add your campus.
                </div>
              ) : (
                filteredColleges.map((college) => {
                  const isSelected = selectedCollegeId === college.id
                  return (
                    <button
                      type="button"
                      key={college.id}
                      onClick={() => setSelectedCollegeId(college.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all flex items-start justify-between ${
                        isSelected
                          ? 'border-border/80 bg-accent/40 shadow-xs'
                          : 'border-border/80 hover:bg-accent/50'
                      }`}
                      role="radio"
                      aria-checked={isSelected}
                    >
                      <div className="flex items-start gap-2.5">
                        <Building2
                          className={`h-4 w-4 mt-0.5 shrink-0 ${
                            isSelected ? 'text-primary' : 'text-muted-foreground'
                          }`}
                          aria-hidden="true"
                        />
                        <div>
                          <p className="text-xs font-semibold text-foreground">{college.name}</p>
                          <p className="text-2xs text-muted-foreground">
                            {college.city}, {college.state}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                      )}
                    </button>
                  )
                })
              )}
            </div>

            <Button type="submit" className="w-full">
              Continue to Account Details
              <ArrowRight className="h-4 w-4 ml-1" aria-hidden="true" />
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2Submit} className="space-y-4">
            <div className="p-3 bg-muted/40 rounded-lg border border-border/80 flex items-center justify-between">
              <span className="text-xs font-medium text-foreground truncate max-w-[240px]">
                {selectedCollege?.name}
              </span>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-2xs font-semibold text-primary hover:underline"
              >
                Change
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground" htmlFor="reg-email">
                College Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="student@demo.campusconnect.app"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground" htmlFor="reg-password">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="reg-password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground" htmlFor="reg-confirm-password">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="reg-confirm-password"
                  type="password"
                  placeholder="Re-enter password"
                  className="pl-9"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" loading={loading}>
              Send Verification OTP
              <ArrowRight className="h-4 w-4 ml-1" aria-hidden="true" />
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="flex justify-center border-t pt-4">
        <p className="text-xs text-muted-foreground">
          Already registered?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
