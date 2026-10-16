'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, CheckCircle2, RotateCw, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || 'student@demo.campusconnect.app'
  const isDirectSent = searchParams.get('sent') === '1'

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(
    isDirectSent ? `A verification code was dispatched to ${email}.` : null
  )
  const [cooldown, setCooldown] = useState(isDirectSent ? 60 : 0)


  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Send OTP helper
  const triggerSendOtp = useCallback(async (isInitial = false) => {
    try {
      if (!isInitial) setResending(true)
      setError(null)

      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        if (response.status === 429 && data.cooldown) {
          setCooldown(data.cooldown)
        }
        setError(data.error || 'Failed to dispatch verification code.')
        return
      }

      setCooldown(data.cooldown || 60)
      const providerInfo = data.provider === 'gmail'
        ? `Real verification code dispatched to your Gmail inbox (${email}). Please check your inbox and spam folder.`
        : data.provider === 'smtp'
        ? `Verification code dispatched to your inbox (${email}) via SMTP.`
        : data.provider === 'resend'
        ? `Verification code dispatched to your inbox (${email}) via Resend.`
        : `Verification code dispatched for ${email}.`
      setInfoMessage(providerInfo)


    } catch {
      setError('Network error: Unable to contact the verification service.')
    } finally {
      setResending(false)
    }
  }, [email])

  // Initial mount: focus first input and request OTP if not already sent
  useEffect(() => {
    inputRefs.current[0]?.focus()

    if (!isDirectSent) {
      triggerSendOtp(true)
    }
  }, [isDirectSent, triggerSendOtp])

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

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

  const handleVerify = async (e?: React.FormEvent, overrideCode?: string) => {
    if (e) e.preventDefault()
    const code = (overrideCode || otp.join('')).trim()
    if (code.length < 6) {
      setError('Please enter all 6 digits of the verification code.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success || !data.verified) {
        setError(data.error || 'Verification code failed. Please check the code and try again.')
        setLoading(false)
        return
      }

      // Verification successful! Clean up preview code and proceed to onboarding
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('cc_preview_otp')
      }

      setInfoMessage('Code verified successfully! Proceeding...')
      router.push(`/onboarding?email=${encodeURIComponent(email)}`)
    } catch {
      setError('Network error: Unable to verify code with server.')
      setLoading(false)
    }
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
        {infoMessage && (
          <div
            className="p-3 text-xs rounded-md bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 text-center flex items-center justify-center gap-1.5"
            role="status"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{infoMessage}</span>
          </div>
        )}

        {error && (
          <div
            className="p-3 text-xs rounded-md bg-destructive-50 text-destructive-600 dark:bg-destructive-950/30 dark:text-destructive-400 border border-destructive/20 text-center"
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


      </CardContent>

      <CardFooter className="flex flex-col space-y-2 border-t pt-4 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          {cooldown > 0 ? (
            <span>Resend code in {cooldown}s</span>
          ) : (
            <button
              type="button"
              disabled={resending}
              onClick={() => triggerSendOtp(false)}
              className="text-primary font-medium hover:underline inline-flex items-center gap-1 disabled:opacity-50"
            >
              <RotateCw className={`h-3.5 w-3.5 ${resending ? 'animate-spin' : ''}`} aria-hidden="true" />
              {resending ? 'Sending code...' : 'Resend verification code'}
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
