'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

interface PwaContextType {
  isInstallable: boolean
  isInstalled: boolean
  isIOS: boolean
  isAndroid: boolean
  isStandalone: boolean
  isModalOpen: boolean
  openInstallModal: () => void
  closeInstallModal: () => void
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'manual'>
}

const PwaContext = createContext<PwaContextType | undefined>(undefined)

export function PwaProvider({ children }: { children: ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Detect platform & standalone mode on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA] ServiceWorker registered with scope:', registration.scope)
          })
          .catch((err) => {
            console.warn('[PWA] ServiceWorker registration failed:', err)
          })
      })
    }

    const ua = window.navigator.userAgent.toLowerCase()
    const ios = /iphone|ipad|ipod/.test(ua)
    const android = /android/.test(ua)
    setIsIOS(ios)
    setIsAndroid(android)

    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true
      setIsStandalone(isStandaloneMode)
      if (isStandaloneMode) {
        setIsInstalled(true)
      }
    }

    checkStandalone()

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)
      setIsInstallable(true)
      console.log('[PWA] beforeinstallprompt captured')
    }

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
      setIsModalOpen(false)
      console.log('[PWA] App was successfully installed')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Also if not standalone on mobile iOS/Android, show as installable via manual guidance
    if (!window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'manual'> => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt()
        const choice = await deferredPrompt.userChoice
        setDeferredPrompt(null)
        if (choice.outcome === 'accepted') {
          setIsInstalled(true)
          setIsModalOpen(false)
          return 'accepted'
        }
        return 'dismissed'
      } catch (err) {
        console.error('[PWA] Error prompting installation:', err)
        return 'manual'
      }
    } else {
      // If native prompt is unavailable (e.g. iOS or manual browser), open guided modal
      setIsModalOpen(true)
      return 'manual'
    }
  }, [deferredPrompt])

  const openInstallModal = useCallback(() => {
    setIsModalOpen(true)
  }, [])

  const closeInstallModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  return (
    <PwaContext.Provider
      value={{
        isInstallable,
        isInstalled,
        isIOS,
        isAndroid,
        isStandalone,
        isModalOpen,
        openInstallModal,
        closeInstallModal,
        promptInstall,
      }}
    >
      {children}
    </PwaContext.Provider>
  )
}

export function usePwa() {
  const context = useContext(PwaContext)
  if (!context) {
    throw new Error('usePwa must be used within a PwaProvider')
  }
  return context
}
