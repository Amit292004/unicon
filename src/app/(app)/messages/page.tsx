'use client'

import React, { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Inbox,
  Search,
  Send,
  User,
  ShieldCheck,
  CheckCheck,
  ArrowLeft
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { UserAvatar } from '@/components/shared/user-avatar'
import { EmptyState } from '@/components/shared/empty-state'
import { useAppStore } from '@/lib/data/client-store'
import { formatRelativeTime } from '@/lib/utils'

function MessagesContent() {
  const searchParams = useSearchParams()
  const initialUserId = searchParams.get('user')
  const { currentProfile, profiles, messages, conversations, sendMessage } = useAppStore()

  const [selectedRecipientId, setSelectedRecipientId] = useState<string>(
    initialUserId || 'usr-student-002' // Priya Sharma by default
  )
  const [inputText, setInputText] = useState('')
  const [searchStudent, setSearchStudent] = useState('')
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false)

  const otherStudents = profiles.filter((p) => p.id !== currentProfile.id)
  const filteredStudents = otherStudents.filter(
    (p) =>
      p.fullName.toLowerCase().includes(searchStudent.toLowerCase()) ||
      p.username.toLowerCase().includes(searchStudent.toLowerCase())
  )

  const selectedRecipient = profiles.find((p) => p.id === selectedRecipientId)

  // Messages between current user and selected recipient
  const activeThread = messages.filter(
    (m) =>
      (m.senderId === currentProfile.id && selectedRecipientId) ||
      (m.senderId === selectedRecipientId)
  )

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || !selectedRecipientId) return

    sendMessage(selectedRecipientId, inputText.trim())
    setInputText('')
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Student Messaging
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Encrypted, college-scoped peer communications without exposing personal phone numbers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 border rounded-xl shadow-card bg-card overflow-hidden min-h-[560px]">
        {/* Left Panel: Student Directory & Active Threads */}
        <div
          className={`border-r flex flex-col ${
            mobileThreadOpen ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder="Find student peer..."
                className="pl-8 text-xs h-8"
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y">
            {filteredStudents.map((student) => {
              const isSelected = selectedRecipientId === student.id
              const lastMsg = messages
                .filter(
                  (m) =>
                    (m.senderId === student.id && currentProfile.id) ||
                    (m.senderId === currentProfile.id)
                )
                .slice(-1)[0]

              return (
                <button
                  type="button"
                  key={student.id}
                  onClick={() => {
                    setSelectedRecipientId(student.id)
                    setMobileThreadOpen(true)
                  }}
                  className={`w-full p-3.5 text-left flex items-start gap-3 transition ${
                    isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-accent/50'
                  }`}
                >
                  <UserAvatar
                    name={student.fullName}
                    avatarUrl={student.avatarUrl}
                    size="md"
                    className="shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-xs text-foreground truncate">
                        {student.fullName}
                      </p>
                      <span className="text-2xs text-muted-foreground font-mono">
                        {lastMsg ? formatRelativeTime(lastMsg.createdAt) : ''}
                      </span>
                    </div>
                    <p className="text-2xs text-muted-foreground mt-0.5 truncate">
                      {lastMsg ? lastMsg.content : `@${student.username} &bull; ${student.department?.code || 'Student'}`}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Panel: Active Message Conversation Thread */}
        <div
          className={`md:col-span-2 flex flex-col bg-background ${
            !mobileThreadOpen ? 'hidden md:flex' : 'flex'
          }`}
        >
          {selectedRecipient ? (
            <>
              {/* Thread Header */}
              <div className="p-3.5 border-b bg-card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMobileThreadOpen(false)}
                    className="md:hidden p-1.5 rounded-md hover:bg-accent"
                    aria-label="Back to students list"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  </button>

                  <UserAvatar
                    name={selectedRecipient.fullName}
                    avatarUrl={selectedRecipient.avatarUrl}
                    size="sm"
                  />
                  <div>
                    <p className="font-semibold text-xs text-foreground">
                      {selectedRecipient.fullName}
                    </p>
                    <p className="text-2xs text-muted-foreground">
                      @{selectedRecipient.username} &bull; {selectedRecipient.department?.name || 'Department'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-2xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  <span>College Verified</span>
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {activeThread.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-xs text-muted-foreground text-center">
                      Start a private academic conversation with {selectedRecipient.fullName}.
                    </p>
                  </div>
                ) : (
                  activeThread.map((msg) => {
                    const isMine = msg.senderId === currentProfile.id
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[78%] p-3 rounded-xl text-xs leading-relaxed ${
                            isMine
                              ? 'bg-primary text-primary-foreground rounded-br-none shadow-sm'
                              : 'bg-card border text-foreground rounded-bl-none shadow-sm'
                          }`}
                        >
                          {msg.content}
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-2xs text-muted-foreground px-1">
                          <span>{formatRelativeTime(msg.createdAt)}</span>
                          {isMine && <CheckCheck className="h-3 w-3 text-primary" aria-hidden="true" />}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Message Input Footer */}
              <form onSubmit={handleSend} className="p-3 border-t bg-card flex gap-2">
                <input
                  type="text"
                  placeholder={`Write a message to ${selectedRecipient.fullName.split(' ')[0]}...`}
                  className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <Button type="submit" size="sm" className="h-9 px-4 text-xs gap-1">
                  <Send className="h-3.5 w-3.5" aria-hidden="true" />
                  Send
                </Button>
              </form>
            </>
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              <EmptyState
                icon={Inbox}
                title="Select a student peer"
                description="Choose a conversation or student from the left panel to begin messaging."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading direct messages...</div>}>
      <MessagesContent />
    </React.Suspense>
  )
}
