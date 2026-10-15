'use client'

import React, { useState } from 'react'
import {
  Settings,
  User,
  Moon,
  Sun,
  Shield,
  Bell,
  CheckCircle2,
  Lock,
  Mail,
  AtSign,
  Palette
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/lib/data/client-store'

export default function SettingsPage() {
  const { currentProfile, setProfile, theme, setTheme, profiles } = useAppStore()

  // Username form
  const [username, setUsername] = useState(currentProfile.username)
  const [usernameMsg, setUsernameMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Email form
  const [newEmail, setNewEmail] = useState('')
  const [emailMsg, setEmailMsg] = useState<string | null>(null)

  // Notification toggles
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [lostFoundNotifs, setLostFoundNotifs] = useState(true)
  const [examNotifs, setExamNotifs] = useState(true)

  const handleUsernameSave = (e: React.FormEvent) => {
    e.preventDefault()
    const clean = username.trim().toLowerCase()

    if (!clean.match(/^[a-z0-9_]{3,30}$/)) {
      setUsernameMsg({
        type: 'error',
        text: 'Username must be 3-30 characters long with letters, numbers, and underscores only.',
      })
      return
    }

    const taken = profiles.some(
      (p) => p.username.toLowerCase() === clean && p.id !== currentProfile.id
    )
    if (taken) {
      setUsernameMsg({
        type: 'error',
        text: 'This username is already registered to another student.',
      })
      return
    }

    setProfile({
      ...currentProfile,
      username: clean,
    })

    setUsernameMsg({
      type: 'success',
      text: 'Username successfully updated and saved.',
    })
    setTimeout(() => setUsernameMsg(null), 4000)
  }

  const handleEmailRequest = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail.includes('@')) return

    setEmailMsg(`Verification OTP sent to ${newEmail}. Current active address (${currentProfile.email}) will remain active until verified.`)
    setNewEmail('')
    setTimeout(() => setEmailMsg(null), 6000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Account &amp; Appearance Settings
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage your credentials, theme preference, and institutional privacy.
        </p>
      </div>

      {/* Section 1: Appearance Theme */}
      <Card className="p-5 border shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 className="text-sm font-bold text-foreground">Visual Theme &amp; Contrast</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Select between crisp academic light mode and high-contrast dark mode. Preference persists across sessions.
        </p>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-3.5 rounded-lg border text-left transition flex items-center gap-3 ${
              theme === 'light'
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'bg-card hover:bg-accent/50'
            }`}
          >
            <div className="h-8 w-8 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Sun className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-xs text-foreground">Light Theme</p>
              <p className="text-2xs text-muted-foreground">Clean academic contrast</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-3.5 rounded-lg border text-left transition flex items-center gap-3 ${
              theme === 'dark'
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'bg-card hover:bg-accent/50'
            }`}
          >
            <div className="h-8 w-8 rounded-md bg-indigo-950 text-indigo-400 flex items-center justify-center shrink-0">
              <Moon className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-xs text-foreground">Dark Theme</p>
              <p className="text-2xs text-muted-foreground">Low-light study mode</p>
            </div>
          </button>
        </div>
      </Card>

      {/* Section 2: Change Username */}
      <Card className="p-5 border shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <AtSign className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 className="text-sm font-bold text-foreground">Public Handle / Username</h2>
        </div>

        {usernameMsg && (
          <div
            className={`p-3 text-xs rounded-md border ${
              usernameMsg.type === 'success'
                ? 'bg-success-50 text-success-600 border-success-500/20'
                : 'bg-destructive-50 text-destructive-600 border-destructive/20'
            }`}
            role="alert"
          >
            {usernameMsg.text}
          </div>
        )}

        <form onSubmit={handleUsernameSave} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground" htmlFor="set-user">
              Unique Username
            </label>
            <Input
              id="set-user"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="text-xs lowercase"
              required
            />
          </div>

          <Button type="submit" size="sm" className="h-8 text-xs">
            Save Username
          </Button>
        </form>
      </Card>

      {/* Section 3: Change Email */}
      <Card className="p-5 border shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 className="text-sm font-bold text-foreground">Registered Email Address</h2>
        </div>

        <p className="text-xs text-muted-foreground">
          Currently verified address: <span className="font-semibold text-foreground">{currentProfile.email}</span>
        </p>

        {emailMsg && (
          <div className="p-3 text-xs rounded-md bg-success-50 text-success-600 border border-success-500/20">
            {emailMsg}
          </div>
        )}

        <form onSubmit={handleEmailRequest} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground" htmlFor="new-mail">
              New Institutional Email
            </label>
            <Input
              id="new-mail"
              type="email"
              placeholder="new.email@demo.campusconnect.app"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="text-xs"
              required
            />
          </div>

          <Button type="submit" size="sm" variant="outline" className="h-8 text-xs">
            Request Email Change OTP
          </Button>
        </form>
      </Card>

      {/* Section 4: Notification Preferences */}
      <Card className="p-5 border shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 className="text-sm font-bold text-foreground">Notification Preferences</h2>
        </div>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-2 rounded hover:bg-accent/40 cursor-pointer">
            <div>
              <p className="font-semibold text-foreground">Department Examination Notices</p>
              <p className="text-2xs text-muted-foreground">Alerts when new timetable revisions are posted</p>
            </div>
            <input
              type="checkbox"
              checked={examNotifs}
              onChange={(e) => setExamNotifs(e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded hover:bg-accent/40 cursor-pointer">
            <div>
              <p className="font-semibold text-foreground">Lost &amp; Found Match Notifications</p>
              <p className="text-2xs text-muted-foreground">Instant notification when a potential match is reported</p>
            </div>
            <input
              type="checkbox"
              checked={lostFoundNotifs}
              onChange={(e) => setLostFoundNotifs(e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded hover:bg-accent/40 cursor-pointer">
            <div>
              <p className="font-semibold text-foreground">Direct Message Alerts</p>
              <p className="text-2xs text-muted-foreground">In-app notifications for incoming student chats</p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifs}
              onChange={(e) => setEmailNotifs(e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
          </label>
        </div>
      </Card>
    </div>
  )
}
