'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Building2, Mail, Lock, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { useAppStore } from '@/lib/data/client-store'
import { SEEDED_PROFILES } from '@/lib/data/store'

export default function LoginPage() {
  const router = useRouter()
  const { authenticate, loginAs } = useAppStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // 1. Try store-level authenticate (handles both demo and newly registered users)
      const res = authenticate(email, password)
      if (res.success) {
        router.push('/home')
        router.refresh()
        return
      }

      // 2. If Supabase configured, try Supabase auth
      const supabase = createClient()
      const { error: sbError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (!sbError) {
        loginAs(email)
        router.push('/home')
        router.refresh()
        return
      }

      setError(res.error || 'Invalid credentials. Please verify your email and password.')
    } catch {
      setError('An unexpected error occurred during sign-in.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = (profileEmail: string) => {
    loginAs(profileEmail)
    router.push('/home')
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
        <CardTitle className="text-xl font-bold">Sign In to UNICON</CardTitle>
        <CardDescription>
          Enter your registered college email and password to access your campus dashboard.
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

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground" htmlFor="email">
              College Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="email"
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
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground" htmlFor="password">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="pl-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" loading={loading}>
            Sign In with Email
            <ArrowRight className="h-4 w-4 ml-1" aria-hidden="true" />
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Demo Accounts for Evaluation</span>
          </div>
        </div>

        {/* Instant Role Switching Presets for Reviewers & Judges */}
        <div className="grid grid-cols-2 gap-2 text-left">
          <button
            type="button"
            onClick={() => handleQuickLogin('student@demo.campusconnect.app')}
            className="flex flex-col p-2.5 rounded-md border text-left hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <UserCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Alex Chen
            </div>
            <span className="text-2xs text-muted-foreground mt-0.5">Student (CSE, Sem 4)</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('priya@demo.campusconnect.app')}
            className="flex flex-col p-2.5 rounded-md border text-left hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <UserCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Priya Sharma
            </div>
            <span className="text-2xs text-muted-foreground mt-0.5">Student (Contributor)</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('admin@demo.campusconnect.app')}
            className="flex flex-col p-2.5 rounded-md border text-left hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
              Dean Academic
            </div>
            <span className="text-2xs text-muted-foreground mt-0.5">College Administrator</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('transport@demo.campusconnect.app')}
            className="flex flex-col p-2.5 rounded-md border text-left hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
              Transit Officer
            </div>
            <span className="text-2xs text-muted-foreground mt-0.5">Transport Administrator</span>
          </button>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2 border-t pt-4 text-center">
        <p className="text-xs text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Register new college profile
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
