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
    <Card className="p-4 border shadow-card">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-start gap-3">
          <UserAvatar
            name={currentProfile.fullName}
            avatarUrl={currentProfile.avatarUrl}
            size="md"
          />
          <div className="flex-1">
            <textarea
              placeholder={`Share an academic update or discussion, ${currentProfile.fullName.split(' ')[0]}...`}
              className="w-full min-h-[72px] resize-none border-0 bg-transparent p-0 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus:ring-0 leading-relaxed"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={2000}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-xs">
          {/* Post Type Selector */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setType('text')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                type === 'text'
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-accent'
              }`}
            >
              General
            </button>
            <button
              type="button"
              onClick={() => setType('question')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                type === 'question'
                  ? 'bg-warning-50 text-warning-600 font-medium'
                  : 'text-muted-foreground hover:bg-accent'
              }`}
            >
              <HelpCircle className="h-3 w-3" aria-hidden="true" />
              Question
            </button>
            <button
              type="button"
              onClick={() => setType('project_update')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                type === 'project_update'
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-accent'
              }`}
            >
              <Compass className="h-3 w-3" aria-hidden="true" />
              Project Update
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xs text-muted-foreground">
              {content.length}/2000
            </span>
            <Button
              type="submit"
              size="sm"
              disabled={!content.trim() || isSubmitting}
              className="h-8"
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
