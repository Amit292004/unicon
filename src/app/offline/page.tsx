'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { WifiOff, RotateCcw, Home, PhoneCall, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OfflinePage() {
  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="w-full max-w-md bg-card border rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary animate-pulse">
            <WifiOff className="h-8 w-8" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Image
              src="/unicon-icon.png"
              alt="UNICON"
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
            />
            <h1 className="text-xl font-bold tracking-tight text-foreground">You are currently offline</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            UNICON saved your core app shell, but you need an active internet connection to sync live circulars and post updates.
          </p>
        </div>

        <div className="bg-muted/40 rounded-xl p-4 border text-left space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <ShieldAlert className="h-4 w-4 text-primary" />
            <span>Emergency Campus Hotlines (Offline Access)</span>
          </div>
          <div className="text-2xs text-muted-foreground space-y-1">
            <p>• Campus Security Control: <a href="tel:03862240101" className="font-semibold text-primary underline">03862-240101</a></p>
            <p>• Health Center Ambulance: <a href="tel:03862240108" className="font-semibold text-primary underline">03862-240108</a></p>
            <p>• Transit Helpline: <a href="tel:03862240112" className="font-semibold text-primary underline">03862-240112</a></p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <Button
            onClick={handleReload}
            className="flex-1 gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Retry Connection
          </Button>

          <Button
            variant="outline"
            asChild
            className="flex-1 gap-2"
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              Try Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
