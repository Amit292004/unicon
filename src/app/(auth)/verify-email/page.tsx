'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, CheckCircle2, RotateCw, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || 'student@demo.campusconnect.app'

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(60)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length > 0) {
      const newOtp = [...otp]
      for (let i = 0; i < pasted.length; i++) {
        newOtp[i] = pasted[i]
      }
      setOtp(newOtp)
      const nextIndex = Math.min(pasted.length, 5)
      inputRefs.current[nextIndex]?.focus()
    }
  }

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) {
      setError('Please enter all 6 digits of the verification code.')
      return
    }

    setLoading(true)
    setError(null)

    setTimeout(() => {
      setLoading(false)
      // Transition to onboarding
      router.push(`/onboarding?email=${encodeURIComponent(email)}`)
    }, 600)
  }

  const handleUseDemoOtp = () => {
    setOtp(['8', '4', '2', '1', '9', '0'])
    setError(null)
  }

  return (
    <Card className="border shadow-card w-full">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Mail className="h-6 w-6" aria-hidden="true" />
        </div>
        <CardTitle className="text-xl font-bold">Verify Your College Email</CardTitle>
        <CardDescription className="text-xs">
          Check your email for your access code. We have dispatched a 6-digit verification code to: <br />
          <span className="font-semibold text-foreground">{email}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div
            className="p-3 text-xs rounded-md bg-destructive-50 text-destructive-600 border border-destructive/20 text-center"
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="h-12 w-11 text-center text-lg font-bold rounded-md border border-input bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm"
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>

          <Button type="submit" className="w-full" loading={loading}>
            Verify Code and Continue
            <ArrowRight className="h-4 w-4 ml-1" aria-hidden="true" />
          </Button>
        </form>

        {/* Development & Demo OTP Helper */}
        <div className="p-3 rounded-md bg-secondary text-xs space-y-1.5 border">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Evaluation Helper:</span>
            <button
              type="button"
              onClick={handleUseDemoOtp}
              className="text-primary font-semibold hover:underline"
            >
              Autofill 842190
            </button>
          </div>
          <p className="text-2xs text-muted-foreground leading-relaxed">
            In development and sandbox testing, enter any 6-digit code or click Autofill to advance directly to profile completion.
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2 border-t pt-4 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          {cooldown > 0 ? (
            <span>Resend code in {cooldown}s</span>
          ) : (
            <button
              type="button"
              onClick={() => setCooldown(60)}
              className="text-primary font-medium hover:underline inline-flex items-center gap-1"
            >
              <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
              Resend verification code
            </button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}

export default function VerifyEmailPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading verification...</div>}>
      <VerifyEmailContent />
    </React.Suspense>
  )
}
