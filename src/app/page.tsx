'use client'

import React from 'react'
import Link from 'next/link'
import {
  Building2,
  Bell,
  BookOpen,
  Bus,
  Search,
  Users,
  FileText,
  ClipboardList,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Inbox
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/data/client-store'

export default function LandingPage() {
  const { currentProfile, loginAs } = useAppStore()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation Bar */}
      <header className="h-[60px] border-b bg-card/80 backdrop-blur sticky top-0 z-30 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-foreground">
              CampusConnect
            </span>
            <span className="hidden sm:inline-block text-2xs text-muted-foreground ml-2 px-2 py-0.5 border rounded-full">
              College Utility Platform
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/home">
            <Button size="sm">
              Enter Campus Dashboard
              <ArrowRight className="h-4 w-4 ml-1" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-16 sm:py-24 px-6 max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-secondary/50 text-xs text-muted-foreground font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span>Built for Higher Education Institutions</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground max-w-3xl mx-auto leading-tight text-balance">
            The Digital Operating System for College Student Communities
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance">
            Combining academic notices, peer-to-peer course notes, previous year question papers, verified lost item recovery, and daily transit logistics into one cohesive institutional utility.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link href="/home">
              <Button size="lg" className="h-11 px-6">
                Open Campus Portal
                <ArrowRight className="h-4 w-4 ml-1.5" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="h-11 px-6">
                Evaluator Sign-In
              </Button>
            </Link>
          </div>

          {/* Quick Evaluator Role Launchers */}
          <div className="pt-8 border-t max-w-2xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              One-Click Evaluator Personas (Live Demo Data)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Link
                href="/home"
                onClick={() => loginAs('student@demo.campusconnect.app')}
                className="p-2.5 rounded-lg border bg-card hover:bg-accent transition text-left"
              >
                <p className="text-xs font-semibold text-foreground">Alex Chen</p>
                <p className="text-2xs text-muted-foreground">Student (CSE)</p>
              </Link>
              <Link
                href="/home"
                onClick={() => loginAs('priya@demo.campusconnect.app')}
                className="p-2.5 rounded-lg border bg-card hover:bg-accent transition text-left"
              >
                <p className="text-xs font-semibold text-foreground">Priya Sharma</p>
                <p className="text-2xs text-muted-foreground">Student (Contributor)</p>
              </Link>
              <Link
                href="/admin/notices"
                onClick={() => loginAs('admin@demo.campusconnect.app')}
                className="p-2.5 rounded-lg border bg-card hover:bg-accent transition text-left"
              >
                <p className="text-xs font-semibold text-foreground">Dr. Jamir</p>
                <p className="text-2xs text-muted-foreground">College Admin</p>
              </Link>
              <Link
                href="/admin/transport"
                onClick={() => loginAs('transport@demo.campusconnect.app')}
                className="p-2.5 rounded-lg border bg-card hover:bg-accent transition text-left"
              >
                <p className="text-xs font-semibold text-foreground">Vikram Singh</p>
                <p className="text-2xs text-muted-foreground">Transport Admin</p>
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-12 bg-secondary/30 border-y px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Eight Integrated Campus Utilities</h2>
              <p className="text-xs text-muted-foreground">
                Eliminating scattered WhatsApp channels, lost notice boards, and unorganized cloud drives.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-lg bg-card border shadow-card space-y-2">
                <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <Bell className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Targeted Notices</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Filter announcements by Department, Semester, or Campus-wide. Never miss an exam or elective deadline.
                </p>
              </div>

              <div className="p-5 rounded-lg bg-card border shadow-card space-y-2">
                <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <FileText className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Academic Notes Library</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Peer-contributed, verified lecture notes indexed by Subject, Semester, and Course Syllabus.
                </p>
              </div>

              <div className="p-5 rounded-lg bg-card border shadow-card space-y-2">
                <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <ClipboardList className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">PYQ Archive</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Searchable previous year question papers categorized by examination term and year.
                </p>
              </div>

              <div className="p-5 rounded-lg bg-card border shadow-card space-y-2">
                <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <Search className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Lost &amp; Found</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Report missing valuables with automated keyword similarity matching and structured claim resolution.
                </p>
              </div>

              <div className="p-5 rounded-lg bg-card border shadow-card space-y-2">
                <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <Bus className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Transit &amp; Bus Routes</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Verified timetables, pickup checkpoints, driver contact details, and direct complaint submission.
                </p>
              </div>

              <div className="p-5 rounded-lg bg-card border shadow-card space-y-2">
                <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <Users className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Campus Directory</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Search faculty, department heads, and campus administrative contacts with privacy-preserving boundaries.
                </p>
              </div>

              <div className="p-5 rounded-lg bg-card border shadow-card space-y-2">
                <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <Inbox className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Student Messaging</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Direct peer-to-peer communication without sharing personal telephone numbers or external social handles.
                </p>
              </div>

              <div className="p-5 rounded-lg bg-card border shadow-card space-y-2">
                <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Administrative Control</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Dedicated consoles for college deans, department admins, and fleet logistics managers.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 px-6 bg-card text-center text-xs text-muted-foreground">
        <p>CampusConnect &bull; College Student Community and Utility Web Application</p>
      </footer>
    </div>
  )
}
