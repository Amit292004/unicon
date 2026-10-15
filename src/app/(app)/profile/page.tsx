'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/data/client-store'

export default function ProfileRedirectPage() {
  const router = useRouter()
  const { currentProfile } = useAppStore()

  useEffect(() => {
    if (currentProfile?.username) {
      router.replace(`/profile/${currentProfile.username}`)
    } else {
      router.replace('/home')
    }
  }, [currentProfile, router])

  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="flex flex-col items-center gap-2">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        <p className="text-xs text-muted-foreground">Redirecting to your profile...</p>
      </div>
    </div>
  )
}
