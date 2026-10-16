'use client'

import React, { useState, useEffect } from 'react'
import { Download, Smartphone, CheckCircle2 } from 'lucide-react'
import { usePwa } from '@/lib/pwa-context'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DownloadAppButtonProps {
  variant?: 'default' | 'outline' | 'header' | 'sidebar' | 'hero' | 'minimal'
  className?: string
  showWhenInstalled?: boolean
}

export function DownloadAppButton({
  variant = 'default',
  className,
  showWhenInstalled = false,
}: DownloadAppButtonProps) {
  const { isInstalled, isStandalone, openInstallModal } = usePwa()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Render nothing until client has mounted — prevents server/client hydration mismatch
  // because isInstalled/isStandalone are always false on the server but may differ on the client.
  if (!mounted) return null

  if ((isInstalled || isStandalone) && !showWhenInstalled) {
    return null
  }

  if (variant === 'header') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={openInstallModal}
        className={cn(
          'h-8 px-2.5 text-xs font-medium gap-1.5 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary transition-colors',
          className
        )}
        title="Download UNICON as App"
        aria-label="Download App"
      >
        <Download className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Download App</span>
      </Button>
    )
  }

  if (variant === 'sidebar') {
    return (
      <div className={cn('px-2.5 pb-2 shrink-0', className)}>
        <button
          type="button"
          onClick={openInstallModal}
          className="w-full flex items-center justify-between gap-2.5 p-2 rounded-lg border border-border/70 bg-secondary/30 hover:bg-secondary/70 hover:border-primary/40 transition-all text-left group cursor-pointer shadow-subtle"
          title="Install UNICON Desktop & Mobile App"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-7 w-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Download className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
                Install App
              </p>
              <p className="text-3xs text-muted-foreground truncate">
                Desktop &amp; Mobile PWA
              </p>
            </div>
          </div>
          <span className="text-3xs font-semibold text-primary px-1.5 py-0.5 rounded border border-primary/20 bg-primary/10 shrink-0">
            Get
          </span>
        </button>
      </div>
    )
  }

  if (variant === 'hero') {
    return (
      <Button
        size="lg"
        variant="outline"
        onClick={openInstallModal}
        className={cn(
          'h-12 px-6 rounded-xl font-semibold gap-2.5 border-primary/40 bg-card hover:bg-primary/10 hover:border-primary text-foreground shadow-sm transition-all',
          className
        )}
      >
        <Download className="h-4.5 w-4.5 text-primary" />
        <span>Download as App</span>
      </Button>
    )
  }

  if (variant === 'minimal') {
    return (
      <button
        type="button"
        onClick={openInstallModal}
        className={cn(
          'flex items-center gap-2 text-xs font-medium text-primary hover:underline transition-colors',
          className
        )}
      >
        <Download className="h-3.5 w-3.5" />
        <span>Install App</span>
      </button>
    )
  }

  return (
    <Button
      variant={variant === 'outline' ? 'outline' : 'default'}
      onClick={openInstallModal}
      className={cn('gap-2 font-medium', className)}
    >
      <Download className="h-4 w-4" />
      <span>Download as App</span>
    </Button>
  )
}
