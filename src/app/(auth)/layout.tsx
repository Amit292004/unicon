import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Building2, ShieldCheck, GraduationCap, Compass } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left branding panel - desktop only */}
      <div className="hidden lg:flex flex-col justify-between bg-card border-r p-12 relative overflow-hidden">
        <div>
          <Link href="/" className="inline-block">
            <Image
              src="/unicon-logo.png"
              alt="UNICON"
              width={160}
              height={36}
              className="h-9 w-auto object-contain dark:brightness-110 mb-1"
              priority
            />
            <span className="text-xs text-muted-foreground block">
              College Utility & Academic Platform
            </span>
          </Link>
        </div>

        <div className="space-y-6 max-w-md">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Unified Campus Utilities in One Verified Space
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Designed specifically for college communities. Access official notices, share academic courseware and previous year papers, coordinate bus transit, and report lost items with automated matching.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 text-xs text-muted-foreground">
              <div className="h-5 w-5 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
              </div>
              <span>College-scoped access control ensuring student privacy and institutional integrity</span>
            </div>
            <div className="flex items-start gap-3 text-xs text-muted-foreground">
              <div className="h-5 w-5 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              </div>
              <span>Role-gated administration for departments, faculty, and transit coordinators</span>
            </div>
            <div className="flex items-start gap-3 text-xs text-muted-foreground">
              <div className="h-5 w-5 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <Compass className="h-3.5 w-3.5" aria-hidden="true" />
              </div>
              <span>Direct bus timetable lookup, route stops, and verified lost item recovery</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground border-t pt-4">
          UNICON Platform &bull; Built with academic precision
        </div>
      </div>

      {/* Right form container */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          {children}
        </div>
      </div>
    </div>
  )
}
