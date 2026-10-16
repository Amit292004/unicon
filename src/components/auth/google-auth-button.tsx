'use client'

import React, { useState } from 'react'
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { useAppStore } from '@/lib/data/client-store'
import { GoogleSignInModal } from '@/components/auth/google-sign-in-modal'

interface GoogleAuthButtonProps {
  callbackUrl?: string
  onError?: (err: string) => void
  onSuccess?: () => void
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
}

export function GoogleAuthButton({
  callbackUrl = '/',
  onError,
  onSuccess,
  text = 'continue_with',
}: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false)
  const [showFallbackModal, setShowFallbackModal] = useState(false)
  const [errorNotice, setErrorNotice] = useState<string | null>(null)

  const clientId = (
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    '547807510306-si6tp52jqnivg9s1953rudmmrg50v4vq.apps.googleusercontent.com'
  )
    .replace(/['"]/g, '')
    .trim()

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      if (onError) onError('No credential received from Google.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        const errorMsg = data.error || 'Google authentication failed'
        if (onError) onError(errorMsg)
        setErrorNotice(errorMsg)
        setShowFallbackModal(true)
        return
      }

      // Sync state with Zustand store
      if (data.user?.email) {
        useAppStore.getState().authenticate(data.user.email, 'demo1234')
        if (data.user.fullName) {
          useAppStore.getState().updateProfile({ fullName: data.user.fullName })
        }
        if (data.user.avatarUrl) {
          useAppStore.getState().updateProfile({ avatarUrl: data.user.avatarUrl })
        }
      }

      if (onSuccess) {
        onSuccess()
      } else {
        const target =
          data.user?.email?.includes('admin') || data.user?.email?.includes('transport')
            ? '/admin/dashboard'
            : callbackUrl
        window.location.href = target
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google authentication request failed'
      if (onError) onError(message)
      setErrorNotice(message)
      setShowFallbackModal(true)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleError = () => {
    console.warn('Google Sign In popup closed or failed. Opening fallback modal.')
    setShowFallbackModal(true)
  }

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Official Google Button powered by @react-oauth/google (identical to Bounce Back Academy) */}
      <div className="w-full flex justify-center [&>div]:!w-full [&_iframe]:!w-full">
        <GoogleOAuthProvider clientId={clientId}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            text={text}
            shape="rectangular"
            size="large"
            theme="outline"
            width="380"
          />
        </GoogleOAuthProvider>
      </div>

      {loading && (
        <p className="text-2xs text-primary font-medium mt-2 animate-pulse">
          Verifying Google account and signing in...
        </p>
      )}

      {/* Fallback modal if popup is dismissed or manual choice is preferred */}
      <GoogleSignInModal
        isOpen={showFallbackModal}
        onClose={() => setShowFallbackModal(false)}
        initialNotice={errorNotice}
        callbackUrl={callbackUrl}
      />
    </div>
  )
}
