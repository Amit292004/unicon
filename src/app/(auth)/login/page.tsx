'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Mail,
  Lock,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { useAppStore } from '@/lib/data/client-store'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { GoogleAuthButton } from '@/components/auth/google-auth-button'

export default function LoginPage() {
  const router = useRouter()
  const { authenticate, loginAs } = useAppStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const [error, setError] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const err = params.get('error')
      if (err) return decodeURIComponent(err)
    }
    return null
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
      const callbackUrl = params?.get('callbackUrl')
      const targetDestination = callbackUrl || (email.toLowerCase().includes('admin') || email.toLowerCase().includes('transport') ? '/admin/dashboard' : '/')

      // 1. Try store-level authenticate
      const res = authenticate(email, password)
      if (res.success) {
        if (typeof document !== 'undefined') {
          document.cookie = `cc_demo_user=${email.trim().toLowerCase()}; path=/; max-age=86400; SameSite=Lax`
        }
        window.location.href = targetDestination
        return
      }

      // 2. Only try Supabase auth if Supabase credentials are genuinely configured
      if (isSupabaseConfigured()) {
        const supabase = createClient()
        const { error: sbError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (!sbError) {
          loginAs(email)
          if (typeof document !== 'undefined') {
            document.cookie = `cc_demo_user=${email.trim().toLowerCase()}; path=/; max-age=86400; SameSite=Lax`
          }
          window.location.href = targetDestination
          return
        }
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
    if (typeof document !== 'undefined') {
      document.cookie = `cc_demo_user=${profileEmail}; path=/; max-age=86400; SameSite=Lax`
    }
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
    const callbackUrl = params?.get('callbackUrl')
    const targetDestination = callbackUrl || (profileEmail.includes('admin') || profileEmail.includes('transport') ? '/admin/dashboard' : '/')
    window.location.href = targetDestination
  }

  return (
    <Card className="border shadow-card w-full">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2 lg:hidden mb-2">
          <Image
            src="/unicon-logo.png"
            alt="UNICON"
            width={130}
            height={28}
            className="h-8 w-auto object-contain dark:brightness-110"
            priority
          />
        </div>
        <CardTitle className="text-xl font-bold">Sign In to UNICON</CardTitle>
        <CardDescription>
          Enter your registered email and password to access your campus dashboard.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div
            className="p-3 text-xs rounded-md bg-destructive-50 text-destructive-600 border border-destructive/20 text-left"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Official Google Sign In Button (identical to Bounce Back Academy) */}
        <GoogleAuthButton
          callbackUrl="/"
          text="continue_with"
          onError={(err) => setError(err)}
        />

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-2xs text-muted-foreground font-medium">
              Or continue with password
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground" htmlFor="login-email">
              Institutional Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="login-email"
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
              <label className="text-xs font-medium text-foreground" htmlFor="login-password">
                Password
              </label>
              <Link
                href="/register"
                className="text-2xs text-muted-foreground hover:text-primary transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="login-password"
                type="password"
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                className="pl-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" loading={loading}>
            Sign In
            <ArrowRight className="h-4 w-4 ml-1" aria-hidden="true" />
          </Button>
        </form>

        {/* Quick Evaluator Role Switcher */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-dashed" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wider">
            <span className="bg-card px-2.5 text-2xs text-muted-foreground font-semibold">
              Evaluator Fast-Track (1-Click)
            </span>
          </div>
        </div>

        {/* Instant Role Switching Presets for Reviewers & Judges */}
        <div className="grid grid-cols-2 gap-2.5 text-left">
          <button
            type="button"
            onClick={() => handleQuickLogin('amitsharma72020@gmail.com')}
            className="flex flex-col p-2.5 rounded-lg border border-primary/30 bg-primary/[0.03] hover:bg-primary/[0.08] hover:border-primary/60 transition-all text-left shadow-subtle group"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                Amit Sharma
              </span>
              <span className="text-3xs font-mono font-semibold uppercase px-1 py-0.5 rounded bg-primary/10 text-primary">
                Student Lead
              </span>
            </div>
            <span className="text-2xs text-muted-foreground mt-1">CSE &bull; Lead Evaluator</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('student@demo.campusconnect.app')}
            className="flex flex-col p-2.5 rounded-lg border border-border/80 hover:border-border hover:bg-accent/50 transition-all text-left shadow-subtle group"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                Alex Chen
              </span>
              <span className="text-3xs font-mono uppercase px-1 py-0.5 rounded bg-muted text-muted-foreground">
                Student
              </span>
            </div>
            <span className="text-2xs text-muted-foreground mt-1">CSE &bull; 4th Semester</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('admin@demo.campusconnect.app')}
            className="flex flex-col p-2.5 rounded-lg border border-border/80 hover:border-border hover:bg-accent/50 transition-all text-left shadow-subtle group"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                Dean Academic
              </span>
              <span className="text-3xs font-mono uppercase px-1 py-0.5 rounded bg-muted text-muted-foreground">
                Admin
              </span>
            </div>
            <span className="text-2xs text-muted-foreground mt-1">Academic Affairs &amp; Registry</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('transport@demo.campusconnect.app')}
            className="flex flex-col p-2.5 rounded-lg border border-border/80 hover:border-border hover:bg-accent/50 transition-all text-left shadow-subtle group"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                Transit Officer
              </span>
              <span className="text-3xs font-mono uppercase px-1 py-0.5 rounded bg-muted text-muted-foreground">
                Logistics
              </span>
            </div>
            <span className="text-2xs text-muted-foreground mt-1">Fleet &amp; Bus Administration</span>
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
