'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Download, X, Smartphone, ArrowRight } from 'lucide-react'
import { usePwa } from '@/lib/pwa-context'
import { Button } from '@/components/ui/button'

export function InstallBanner() {
  const { isInstalled, isStandalone, openInstallModal } = usePwa()
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Do not show banner if already standalone / installed
    if (isInstalled || isStandalone) {
      setDismissed(true)
      return
    }

    const lastDismissed = localStorage.getItem('unicon_pwa_banner_dismissed')
    if (lastDismissed) {
      const hoursPassed = (Date.now() - parseInt(lastDismissed, 10)) / (1000 * 60 * 60)
      if (hoursPassed < 24) {
        setDismissed(true)
        return
      }
    }

    // Delay slightly for smooth entrance
    const timer = setTimeout(() => {
      setDismissed(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [isInstalled, isStandalone])

  const handleDismiss = () => {
    setDismissed(true)
    if (typeof window !== 'undefined') {
      localStorage.setItem('unicon_pwa_banner_dismissed', Date.now().toString())
    }
  }

  if (dismissed || isInstalled || isStandalone) {
    return null
  }

  return (
    <div
      className="fixed bottom-20 lg:bottom-5 right-4 left-4 sm:left-auto sm:max-w-md z-40 bg-card/95 backdrop-blur-md border border-primary/20 shadow-xl rounded-2xl p-3.5 animate-in slide-in-from-bottom-5 duration-300"
      role="region"
      aria-label="Install UNICON app banner"
    >
      <div className="flex items-center gap-3">
        <div className="relative h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 p-1 shrink-0 flex items-center justify-center">
          <Image
            src="/unicon-icon.png"
            alt="UNICON"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">
            Install UNICON as App
          </p>
          <p className="text-3xs text-muted-foreground truncate">
            Faster navigation, offline notices & instant access
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            onClick={openInstallModal}
            className="h-8 px-3 text-xs gap-1.5 font-medium shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Install</span>
          </Button>

          <button
            type="button"
            onClick={handleDismiss}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            aria-label="Dismiss install banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
