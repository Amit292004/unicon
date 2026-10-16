'use client'

import React, { useState } from 'react'
import { Send, FileText, HelpCircle, Compass, Sparkles } from 'lucide-react'
import { UserAvatar } from '@/components/shared/user-avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAppStore } from '@/lib/data/client-store'
import type { Post } from '@/types'

export function PostComposer() {
  const { currentProfile, addPost } = useAppStore()
  const [content, setContent] = useState('')
  const [type, setType] = useState<Post['type']>('text')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsSubmitting(true)
    addPost(content.trim(), type)
    setContent('')
    setType('text')
    setIsSubmitting(false)
  }

  return (
    <Card className="p-4 border border-border/80 shadow-subtle bg-card">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-start gap-3">
          <UserAvatar
            name={currentProfile.fullName}
            avatarUrl={currentProfile.avatarUrl}
            size="md"
          />
          <div className="flex-1">
            <textarea
              placeholder={`Share an academic update, ask a course question, or start a discussion, ${currentProfile.fullName.split(' ')[0]}...`}
              className="w-full min-h-[76px] resize-none border-0 bg-transparent p-0 text-xs sm:text-sm placeholder:text-muted-foreground/70 focus-visible:outline-none focus:ring-0 leading-relaxed text-foreground"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={2000}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2.5 border-t border-border/60 text-xs">
          {/* Post Type Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setType('text')}
              className={`px-2.5 py-1 rounded text-2xs font-medium transition cursor-pointer whitespace-nowrap shrink-0 ${
                type === 'text'
                  ? 'bg-secondary text-foreground font-semibold border border-border/80 shadow-subtle'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }`}
            >
              General Discussion
            </button>
            <button
              type="button"
              onClick={() => setType('question')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-2xs font-medium transition cursor-pointer whitespace-nowrap shrink-0 ${
                type === 'question'
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800 shadow-subtle'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }`}
            >
              <HelpCircle className="h-3 w-3 text-amber-600" aria-hidden="true" />
              Academic Question
            </button>
            <button
              type="button"
              onClick={() => setType('project_update')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-2xs font-medium transition cursor-pointer whitespace-nowrap shrink-0 ${
                type === 'project_update'
                  ? 'bg-primary/10 text-primary font-semibold border border-primary/25 shadow-subtle'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }`}
            >
              <Compass className="h-3 w-3 text-primary" aria-hidden="true" />
              Project Update
            </button>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-1 sm:pt-0">
            <span className="text-3xs text-muted-foreground font-mono">
              {content.length}/2000
            </span>
            <Button
              type="submit"
              size="sm"
              disabled={!content.trim() || isSubmitting}
              className="h-8 shadow-subtle shrink-0"
            >
              <Send className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
              Publish Post
            </Button>
          </div>
        </div>
      </form>
    </Card>
  )
}
