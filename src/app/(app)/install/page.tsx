'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Download,
  QrCode,
  Smartphone,
  Share,
  PlusSquare,
  Check,
  Copy,
  ShieldCheck,
  Zap,
  WifiOff,
  Bell,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'
import QRCode from 'qrcode'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { usePwa } from '@/lib/pwa-context'

export default function InstallAppPage() {
  const { promptInstall, isInstalled, isStandalone, isIOS } = usePwa()
  const [appUrl, setAppUrl] = useState('http://10.168.207.20:3000')
  const [qrDataUrl, setQrDataUrl] = useState('/unicon-app-qr.png')
  const [copied, setCopied] = useState(false)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentOrigin = window.location.origin
      setAppUrl(currentOrigin)

      // Generate dynamic QR code matching the exact current domain or local IP
      QRCode.toDataURL(currentOrigin, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 400,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch(() => setQrDataUrl('/unicon-app-qr.png'))
    }
  }, [])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleInstallClick = async () => {
    setInstalling(true)
    try {
      await promptInstall()
    } finally {
      setInstalling(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
          <Smartphone className="h-3.5 w-3.5" />
          <span>Universal PWA Web App</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Download &amp; Install <span className="text-primary">UNICON</span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
          Scan the QR code with your mobile camera to open and install UNICON directly on your home screen. No App Store or Play Store download required!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive QR Code Card */}
        <div className="md:col-span-6 flex flex-col items-center">
          <Card className="w-full border-primary/20 shadow-xl overflow-hidden bg-card/90 backdrop-blur-xs">
            <CardHeader className="bg-primary/5 border-b pb-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                <CardTitle className="text-base font-bold">Mobile Install QR Code</CardTitle>
              </div>
              <p className="text-2xs text-muted-foreground mt-0.5">
                Scan with any smartphone camera (iPhone or Android)
              </p>
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
              {/* QR Code Container with Frame */}
              <div className="relative p-3 bg-white rounded-2xl shadow-md border-2 border-primary/30 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrDataUrl}
                  alt="Scan QR Code to Download UNICON App"
                  width={240}
                  height={240}
                  className="rounded-xl w-56 h-56 object-contain"
                />
                <div className="absolute inset-0 rounded-2xl ring-4 ring-primary/10 pointer-events-none" />
              </div>

              {/* URL pill with copy */}
              <div className="w-full max-w-xs flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-muted/60 border text-xs">
                <span className="font-mono text-2xs truncate text-muted-foreground">
                  {appUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="shrink-0 p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title="Copy App URL"
                >
                  {copied ? (
                    <span className="flex items-center gap-1 text-emerald-500 font-medium text-3xs">
                      <Check className="h-3.5 w-3.5" /> Copied
                    </span>
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              {/* Action buttons */}
              <div className="w-full max-w-xs flex gap-2">
                <a
                  href={qrDataUrl}
                  download="unicon-app-qr.png"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border border-border bg-secondary/50 hover:bg-secondary text-xs font-medium text-foreground transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Save QR Image
                </a>
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleInstallClick}
                  disabled={installing || isInstalled || isStandalone}
                  className="flex-1 h-9 text-xs gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  {isInstalled || isStandalone ? 'Installed' : 'Install Here'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Platform Instructions & Features */}
        <div className="md:col-span-6 space-y-4">
          {/* iOS Instructions */}
          <div className="p-4 rounded-2xl border bg-card/60 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                iOS
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">For iPhone &amp; iPad (Safari)</h3>
                <p className="text-3xs text-muted-foreground">Instant install without App Store ID</p>
              </div>
            </div>

            <ol className="text-xs text-muted-foreground space-y-2">
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-2xs">
                  1
                </span>
                <span>Open your iPhone Camera and scan the QR code to open UNICON in <strong>Safari</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-2xs">
                  2
                </span>
                <span>
                  Tap the <strong className="text-foreground">Share</strong> icon{' '}
                  <Share className="inline-block h-3.5 w-3.5 mx-0.5 text-primary align-text-bottom" />{' '}
                  in the Safari toolbar.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-2xs">
                  3
                </span>
                <span>
                  Select <strong className="text-foreground">Add to Home Screen</strong>{' '}
                  <PlusSquare className="inline-block h-3.5 w-3.5 mx-0.5 text-primary align-text-bottom" />{' '}
                  and tap <strong>Add</strong>.
                </span>
              </li>
            </ol>
          </div>

          {/* Android Instructions */}
          <div className="p-4 rounded-2xl border bg-card/60 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                AND
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">For Android (Chrome / Brave)</h3>
                <p className="text-3xs text-muted-foreground">1-Tap installation banner</p>
              </div>
            </div>

            <ol className="text-xs text-muted-foreground space-y-2">
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-2xs">
                  1
                </span>
                <span>Scan the QR code with your phone camera or Google Lens.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-2xs">
                  2
                </span>
                <span>
                  Tap the bottom banner <strong className="text-foreground">&quot;Install UNICON&quot;</strong> or tap Chrome menu (⋮) &gt; <strong className="text-foreground">Install app</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-2xs">
                  3
                </span>
                <span>UNICON will appear on your phone home screen and app drawer like a native app!</span>
              </li>
            </ol>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="p-3 rounded-xl border bg-muted/20 flex items-center gap-2.5">
              <Zap className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-xs font-semibold">Lightning Fast</p>
                <p className="text-3xs text-muted-foreground">Under 2 MB, zero storage drain</p>
              </div>
            </div>
            <div className="p-3 rounded-xl border bg-muted/20 flex items-center gap-2.5">
              <WifiOff className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-xs font-semibold">Works Offline</p>
                <p className="text-3xs text-muted-foreground">Cached circulars &amp; contacts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
