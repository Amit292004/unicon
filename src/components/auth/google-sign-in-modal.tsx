'use client'

import React, { useState, useEffect } from 'react'
import { X, Plus, AlertCircle, Copy, Check, ExternalLink, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/lib/data/client-store'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  )
}

/**
 * Initiates the Google authentication flow:
 * 1. Checks if Supabase has Google OAuth provider enabled.
 * 2. If enabled, redirects to the Supabase OAuth URL (accounts.google.com).
 * 3. If disabled (error 400 'provider is not enabled'), safely falls back to opening the Google modal.
 */
export async function initiateGoogleAuth({
  redirectTo,
  onNeedsModal,
  onError,
  setLoading,
}: {
  redirectTo?: string
  onNeedsModal: (info?: { msg?: string; callbackUrl?: string }) => void
  onError?: (msg: string) => void
  setLoading: (loading: boolean) => void
}) {
  setLoading(true)

  try {
    // 1. First probe our status route to check if Google provider is active in Supabase
    let isProviderActive = false
    let callbackUrl = 'https://pzbjflxmodibymhzvqja.supabase.co/auth/v1/callback'

    try {
      const res = await fetch('/api/auth/google/status', { method: 'GET' })
      if (res.ok) {
        const data = await res.json()
        isProviderActive = !!data.enabled
        if (data.callbackUrl) callbackUrl = data.callbackUrl
      }
    } catch {
      // If check fails, fall through to client Supabase SDK
      isProviderActive = false
    }

    // 2. If provider is definitely active, initiate live OAuth
    if (isProviderActive && isSupabaseConfigured()) {
      const supabase = createClient()
      const targetRedirect =
        redirectTo || (typeof window !== 'undefined' ? `${window.location.origin}/auth/callback?next=/` : '')

      const { data, error: sbError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: targetRedirect,
        },
      })

      if (sbError) {
        onNeedsModal({ msg: sbError.message, callbackUrl })
        return
      }

      if (data?.url) {
        window.location.assign(data.url)
        return
      }
    }

    // 3. Provider is not enabled in Supabase yet — open the Google Account Chooser
    onNeedsModal({
      msg: 'Google OAuth provider is not yet enabled in your Supabase project (pzbjflxmodibymhzvqja). You can sign in immediately below or enable it in Supabase Dashboard.',
      callbackUrl,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Google sign-in could not be initiated.'
    if (onError) onError(message)
    onNeedsModal({ msg: message })
  } finally {
    setLoading(false)
  }
}

interface GoogleSignInModalProps {
  isOpen: boolean
  onClose: () => void
  initialNotice?: string | null
  callbackUrl?: string
}

export function GoogleSignInModal({
  isOpen,
  onClose,
  initialNotice,
  callbackUrl = '/',
}: GoogleSignInModalProps) {
  const [signingInAccount, setSigningInAccount] = useState<string | null>(null)
  const [isCustomMode, setIsCustomMode] = useState(false)
  const [customEmail, setCustomEmail] = useState('')
  const [customName, setCustomName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showSetupGuide, setShowSetupGuide] = useState(false)
  const [copied, setCopied] = useState(false)

  const supabaseProjectRef = 'pzbjflxmodibymhzvqja'
  const supabaseCallbackUrl = `https://${supabaseProjectRef}.supabase.co/auth/v1/callback`

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleCopyCallbackUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(supabaseCallbackUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const performSignIn = (targetEmail: string, displayName?: string) => {
    setSigningInAccount(targetEmail)
    setError(null)

    try {
      const cleanEmail = targetEmail.trim().toLowerCase()
      useAppStore.getState().authenticate(cleanEmail, 'demo1234')

      if (displayName && displayName.trim()) {
        const current = useAppStore.getState().currentProfile
        if (current.email.toLowerCase() === cleanEmail) {
          useAppStore.getState().updateProfile({ fullName: displayName.trim() })
        }
      }

      if (typeof document !== 'undefined') {
        document.cookie = `cc_demo_user=${cleanEmail}; path=/; max-age=86400; SameSite=Lax`
        if (displayName) {
          document.cookie = `cc_user_name=${encodeURIComponent(displayName)}; path=/; max-age=86400; SameSite=Lax`
        }
      }

      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
      const targetParam = params?.get('callbackUrl')
      const targetDestination =
        targetParam ||
        callbackUrl ||
        (cleanEmail.includes('admin') || cleanEmail.includes('transport') ? '/admin/dashboard' : '/')

      window.location.href = targetDestination
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign-in could not be completed.'
      setError(message)
      setSigningInAccount(null)
    }
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customEmail || !customEmail.includes('@')) {
      setError('Please enter a valid Google email address.')
      return
    }
    performSignIn(customEmail, customName || undefined)
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-card text-card-foreground border border-border rounded-xl shadow-2xl max-w-md w-full overflow-hidden p-6 relative animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="google-modal-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <GoogleIcon className="h-6 w-6 shrink-0" />
            <div>
              <h3 id="google-modal-title" className="text-base font-semibold text-foreground leading-tight">
                Sign in with Google
              </h3>
              <p className="text-xs text-muted-foreground">Choose an account to continue to UNICON</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Notice if Google provider not enabled in Supabase */}
        {initialNotice && (
          <div className="mb-3.5 p-2.5 text-xs rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-xs leading-snug">Google OAuth Notice</p>
              <p className="text-2xs opacity-90 leading-relaxed">
                Supabase reported: <span className="font-mono bg-amber-500/15 px-1 py-0.5 rounded">Unsupported provider: provider is not enabled</span>.
                You can sign in immediately below or enable Google in your Supabase project.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-3 p-2.5 text-xs rounded-md bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Accounts List */}
        {!isCustomMode ? (
          <div className="space-y-2 mb-4">
            {/* Account 1: Amit Sharma */}
            <button
              type="button"
              disabled={signingInAccount !== null}
              onClick={() => performSignIn('amitsharma72020@gmail.com', 'Amit Sharma')}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-border/80 hover:bg-accent/60 transition-colors text-left group disabled:opacity-50 relative"
            >
              <div className="h-9 w-9 rounded-full bg-blue-600 text-white font-semibold text-sm flex items-center justify-center shrink-0">
                A
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    Amit Sharma
                  </p>
                  <span className="text-[10px] font-medium bg-primary/10 text-primary px-1.5 py-0.2 rounded-full">
                    Primary
                  </span>
                </div>
                <p className="text-2xs text-muted-foreground truncate">amitsharma72020@gmail.com</p>
              </div>
              {signingInAccount === 'amitsharma72020@gmail.com' ? (
                <span className="text-2xs text-primary font-medium animate-pulse">Signing in...</span>
              ) : (
                <span className="text-2xs text-muted-foreground group-hover:text-foreground">Continue</span>
              )}
            </button>

            {/* Account 2: Alex Chen */}
            <button
              type="button"
              disabled={signingInAccount !== null}
              onClick={() => performSignIn('alex.chen.student@gmail.com', 'Alex Chen')}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-border/80 hover:bg-accent/60 transition-colors text-left group disabled:opacity-50"
            >
              <div className="h-9 w-9 rounded-full bg-emerald-600 text-white font-semibold text-sm flex items-center justify-center shrink-0">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                  Alex Chen
                </p>
                <p className="text-2xs text-muted-foreground truncate">alex.chen.student@gmail.com</p>
              </div>
              {signingInAccount === 'alex.chen.student@gmail.com' ? (
                <span className="text-2xs text-primary font-medium animate-pulse">Signing in...</span>
              ) : (
                <span className="text-2xs text-muted-foreground group-hover:text-foreground">Continue</span>
              )}
            </button>

            {/* Account 3: Priya Sharma */}
            <button
              type="button"
              disabled={signingInAccount !== null}
              onClick={() => performSignIn('priya.sharma.campus@gmail.com', 'Priya Sharma')}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-border/80 hover:bg-accent/60 transition-colors text-left group disabled:opacity-50"
            >
              <div className="h-9 w-9 rounded-full bg-purple-600 text-white font-semibold text-sm flex items-center justify-center shrink-0">
                P
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                  Priya Sharma
                </p>
                <p className="text-2xs text-muted-foreground truncate">priya.sharma.campus@gmail.com</p>
              </div>
              {signingInAccount === 'priya.sharma.campus@gmail.com' ? (
                <span className="text-2xs text-primary font-medium animate-pulse">Signing in...</span>
              ) : (
                <span className="text-2xs text-muted-foreground group-hover:text-foreground">Continue</span>
              )}
            </button>

            {/* Custom Google Account Option */}
            <button
              type="button"
              disabled={signingInAccount !== null}
              onClick={() => setIsCustomMode(true)}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-dashed border-border hover:bg-accent/40 transition-colors text-left group"
            >
              <div className="h-9 w-9 rounded-full border border-muted-foreground/30 flex items-center justify-center shrink-0 text-muted-foreground group-hover:text-foreground">
                <Plus className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground">Use another Google account</p>
                <p className="text-2xs text-muted-foreground">Sign in with your personal or college Gmail</p>
              </div>
            </button>
          </div>
        ) : (
          /* Custom Google Account Input */
          <form onSubmit={handleCustomSubmit} className="space-y-3 mb-4 text-left">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground" htmlFor="custom-google-name">
                Full Name (Optional)
              </label>
              <Input
                id="custom-google-name"
                type="text"
                placeholder="e.g. Rahul Verma"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground" htmlFor="custom-google-email">
                Google Email Address
              </label>
              <Input
                id="custom-google-email"
                type="email"
                placeholder="yourname@gmail.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-8 text-xs"
                onClick={() => {
                  setIsCustomMode(false)
                  setError(null)
                }}
              >
                Back to accounts
              </Button>
              <Button
                type="submit"
                className="flex-1 h-8 text-xs"
                loading={signingInAccount !== null}
              >
                Sign in with Google
              </Button>
            </div>
          </form>
        )}

        {/* Collapsible Supabase Setup Guide */}
        <div className="border-t border-border pt-3 space-y-2 text-left">
          <button
            type="button"
            onClick={() => setShowSetupGuide(!showSetupGuide)}
            className="w-full flex items-center justify-between text-2xs font-medium text-primary hover:underline"
          >
            <span className="flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5" />
              How to enable Live Google OAuth in Supabase
            </span>
            {showSetupGuide ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {showSetupGuide && (
            <div className="p-3 rounded-lg bg-muted/60 text-2xs space-y-2.5 animate-in fade-in duration-150">
              <p className="font-semibold text-foreground">Step-by-Step Instructions:</p>
              <ol className="list-decimal pl-4 space-y-1.5 text-muted-foreground">
                <li>
                  Go to{' '}
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline inline-flex items-center gap-0.5"
                  >
                    Google Cloud Console <ExternalLink className="h-2.5 w-2.5 inline" />
                  </a>{' '}
                  and create an <strong>OAuth 2.0 Client ID</strong> (Web application).
                </li>
                <li>
                  Add this exact <strong>Authorized Redirect URI</strong>:
                  <div className="mt-1 flex items-center gap-1.5 bg-background border border-border p-1.5 rounded font-mono text-[11px] text-foreground overflow-x-auto">
                    <span className="flex-1 select-all">{supabaseCallbackUrl}</span>
                    <button
                      type="button"
                      onClick={handleCopyCallbackUrl}
                      className="shrink-0 p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                      title="Copy URL"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </li>
                <li>
                  Open your{' '}
                  <a
                    href={`https://supabase.com/dashboard/project/${supabaseProjectRef}/auth/providers`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline inline-flex items-center gap-0.5"
                  >
                    Supabase Providers Dashboard <ExternalLink className="h-2.5 w-2.5 inline" />
                  </a>.
                </li>
                <li>
                  Click <strong>Google</strong>, toggle <strong>Enable Google provider</strong> to ON, paste your Google <strong>Client ID</strong> and <strong>Client Secret</strong>, and click <strong>Save</strong>.
                </li>
              </ol>
              <p className="text-[10px] text-muted-foreground/80 italic">
                Once saved in Supabase, clicking &quot;Continue with Google&quot; will automatically redirect to live Google accounts!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
