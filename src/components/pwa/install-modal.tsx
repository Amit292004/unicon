'use client'

import React from 'react'
import Image from 'next/image'
import {
  X,
  Download,
  Share,
  PlusSquare,
  CheckCircle2,
  Zap,
  WifiOff,
  Bell,
  ShieldCheck,
  Smartphone,
  ExternalLink,
} from 'lucide-react'
import { usePwa } from '@/lib/pwa-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function InstallModal() {
  const {
    isModalOpen,
    closeInstallModal,
    promptInstall,
    isIOS,
    isAndroid,
    isInstalled,
  } = usePwa()

  if (!isModalOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-modal-title"
    >
      <div
        className="relative w-full max-w-md bg-card border rounded-2xl shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={closeInstallModal}
          className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header with App Icon and Badges */}
        <div className="flex items-start gap-4 mb-5">
          <div className="relative h-16 w-16 rounded-2xl bg-muted/60 p-1 border shadow-xs shrink-0 flex items-center justify-center overflow-hidden">
            <Image
              src="/unicon-icon.png"
              alt="UNICON App Icon"
              width={56}
              height={56}
              className="h-14 w-14 object-contain"
            />
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 id="install-modal-title" className="text-lg font-bold text-foreground leading-tight">
                UNICON App
              </h2>
              <Badge variant="outline" className="text-3xs px-1.5 py-0 border-primary/30 text-primary">
                Official PWA
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              Campus Companion & Student Portal
            </p>
            <div className="flex items-center gap-2 mt-1.5 text-2xs text-muted-foreground">
              <span className="flex items-center gap-0.5 font-medium text-amber-500">
                ★★★★★
              </span>
              <span>•</span>
              <span>Fast 1.8 MB</span>
              <span>•</span>
              <span className="text-emerald-500 font-medium flex items-center gap-0.5">
                <ShieldCheck className="h-3 w-3" /> Safe
              </span>
            </div>
          </div>
        </div>

        {/* If already installed */}
        {isInstalled ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center space-y-2 mb-4">
            <div className="inline-flex h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">App Already Installed!</h3>
            <p className="text-xs text-muted-foreground">
              UNICON is already installed on your device. You can launch it directly from your home screen or application launcher.
            </p>
            <Button className="w-full mt-2" onClick={closeInstallModal}>
              Done
            </Button>
          </div>
        ) : isIOS ? (
          /* iOS Instructions */
          <div className="space-y-4">
            <div className="bg-muted/40 rounded-xl p-3.5 border space-y-2.5">
              <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Smartphone className="h-4 w-4 text-primary" />
                How to install on iPhone & iPad (Safari):
              </h3>
              <ol className="text-xs text-muted-foreground space-y-2">
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-2xs">
                    1
                  </span>
                  <span>
                    Tap the <strong className="text-foreground">Share</strong> icon{' '}
                    <Share className="inline-block h-3.5 w-3.5 mx-0.5 text-primary align-text-bottom" />{' '}
                    in your Safari bottom toolbar.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-2xs">
                    2
                  </span>
                  <span>
                    Scroll down and tap{' '}
                    <strong className="text-foreground">Add to Home Screen</strong>{' '}
                    <PlusSquare className="inline-block h-3.5 w-3.5 mx-0.5 text-primary align-text-bottom" />.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-2xs">
                    3
                  </span>
                  <span>
                    Tap <strong className="text-foreground">Add</strong> in the top-right corner. UNICON will appear on your home screen!
                  </span>
                </li>
              </ol>
            </div>

            <Button className="w-full" variant="outline" onClick={closeInstallModal}>
              Got It
            </Button>
          </div>
        ) : (
          /* Android & Desktop flow */
          <div className="space-y-4">
            {/* Value props */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg border bg-muted/20 space-y-1">
                <div className="flex items-center gap-1.5 text-foreground font-medium">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                  <span>Instant Launch</span>
                </div>
                <p className="text-3xs text-muted-foreground">Open in full screen without browser tabs</p>
              </div>

              <div className="p-2.5 rounded-lg border bg-muted/20 space-y-1">
                <div className="flex items-center gap-1.5 text-foreground font-medium">
                  <WifiOff className="h-3.5 w-3.5 text-primary" />
                  <span>Offline Ready</span>
                </div>
                <p className="text-3xs text-muted-foreground">Access contacts & cached notices without internet</p>
              </div>

              <div className="p-2.5 rounded-lg border bg-muted/20 space-y-1">
                <div className="flex items-center gap-1.5 text-foreground font-medium">
                  <Bell className="h-3.5 w-3.5 text-primary" />
                  <span>Notice Alerts</span>
                </div>
                <p className="text-3xs text-muted-foreground">Never miss urgent exam circulars</p>
              </div>

              <div className="p-2.5 rounded-lg border bg-muted/20 space-y-1">
                <div className="flex items-center gap-1.5 text-foreground font-medium">
                  <Smartphone className="h-3.5 w-3.5 text-primary" />
                  <span>Zero Storage</span>
                </div>
                <p className="text-3xs text-muted-foreground">Uses under 2 MB with automatic updates</p>
              </div>
            </div>

            <div className="pt-1 space-y-2">
              <Button
                onClick={async () => {
                  const res = await promptInstall()
                  if (res === 'accepted') {
                    closeInstallModal()
                  }
                }}
                className="w-full gap-2 text-sm font-semibold shadow-md py-5"
              >
                <Download className="h-4 w-4" />
                Download & Install App
              </Button>

              <p className="text-3xs text-center text-muted-foreground">
                Works directly on Chrome, Edge, Brave, and Android. No App Store ID needed.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
