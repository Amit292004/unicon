'use client'

import React from 'react'
import { PwaProvider } from '@/lib/pwa-context'
import { InstallModal } from '@/components/pwa/install-modal'
import { InstallBanner } from '@/components/pwa/install-banner'

export function PwaClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <PwaProvider>
      {children}
      <InstallModal />
      <InstallBanner />
    </PwaProvider>
  )
}
