'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  MoreHorizontal,
  Trash2,
  Send,
  HelpCircle,
  FileText,
  Compass
} from 'lucide-react'
import { UserAvatar } from '@/components/shared/user-avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatRelativeTime } from '@/lib/utils'
import { useAppStore } from '@/lib/data/client-store'
import type { Post } from '@/types'

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const { currentProfile, toggleLikePost, toggleSaveItem, savedItemIds } = useAppStore()
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState<string[]>([
    'Thanks for sharing, this was really helpful for our unit review!',
  ])

  const isLiked = post.hasLiked ?? false
  const isSaved = savedItemIds.includes(post.id)
  const isOwner = currentProfile.id === post.authorId

  const handleLike = () => {
    toggleLikePost(post.id)
  }

  const handleSave = () => {
    toggleSaveItem(post.id)
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setComments([...comments, commentText.trim()])
    setCommentText('')
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'question':
        return (
          <Badge variant="warning" className="text-2xs font-normal">
            <HelpCircle className="h-3 w-3" aria-hidden="true" />
            Academic Question
          </Badge>
        )
      case 'project_update':
        return (
          <Badge variant="default" className="text-2xs font-normal">
            <Compass className="h-3 w-3" aria-hidden="true" />
            Project Update
          </Badge>
        )
      case 'resource':
        return (
          <Badge variant="secondary" className="text-2xs font-normal">
            <FileText className="h-3 w-3" aria-hidden="true" />
            Resource Sharing
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <Card className="p-4 sm:p-5 border shadow-card transition-colors">
      {/* Author Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${post.author?.username || 'user'}`}>
            <UserAvatar
              name={post.author?.fullName || 'Student'}
              avatarUrl={post.author?.avatarUrl}
              size="md"
            />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link
                href={`/profile/${post.author?.username || 'user'}`}
                className="font-semibold text-sm text-foreground hover:underline"
              >
                {post.author?.fullName || 'Anonymous Student'}
              </Link>
              <span className="text-xs text-muted-foreground">
                @{post.author?.username || 'user'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xs text-muted-foreground">
                {formatRelativeTime(post.createdAt)}
              </span>
              {getTypeBadge(post.type)}
            </div>
          </div>
        </div>

        {isOwner && (
          <Button variant="ghost" size="icon-sm" aria-label="Post actions">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </Button>
        )}
      </div>

      {/* Post Text */}
      <div className="mt-3 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
        {post.content}
      </div>

      {/* Post Image (Only displayed if author genuinely uploaded an image) */}
      {post.imageUrl && (
        <div className="mt-3 rounded-lg overflow-hidden border bg-muted/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.imageUrl}
            alt="Post media attachment"
            className="w-full object-cover max-h-96"
            loading="lazy"
          />
        </div>
      )}

      {/* Interaction Actions */}
      <div className="mt-4 pt-3 border-t flex items-center justify-between text-muted-foreground text-xs">
        <div className="flex items-center gap-1 sm:gap-4">
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors hover:bg-accent ${
              isLiked ? 'text-destructive-600 font-semibold' : ''
            }`}
            aria-label={`Like post. Currently ${post.likesCount} likes`}
          >
            <Heart
              className={`h-4 w-4 ${isLiked ? 'fill-destructive-600' : ''}`}
              aria-hidden="true"
            />
            <span>{post.likesCount}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-accent transition-colors"
            aria-label={`Comments. Currently ${comments.length} comments`}
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            <span>{comments.length}</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleSave}
            className={`p-1.5 rounded-md transition-colors hover:bg-accent ${
              isSaved ? 'text-primary' : ''
            }`}
            aria-label={isSaved ? 'Remove from saved items' : 'Save post'}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-primary' : ''}`} aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => {
              if (typeof navigator !== 'undefined' && navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href)
              }
            }}
            className="p-1.5 rounded-md hover:bg-accent transition-colors"
            aria-label="Share post link"
          >
            <Share2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Expandable Comments Section */}
      {showComments && (
        <div className="mt-3 pt-3 border-t space-y-3">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {comments.map((comm, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs bg-muted/40 p-2.5 rounded-md">
                <span className="font-semibold text-foreground shrink-0">Student Peer:</span>
                <span className="text-muted-foreground">{comm}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              placeholder="Write a constructive comment..."
              className="flex-1 h-8 rounded-md border border-input bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <Button type="submit" size="sm" className="h-8 px-3">
              <Send className="h-3 w-3" aria-hidden="true" />
              <span className="sr-only">Submit comment</span>
            </Button>
          </form>
        </div>
      )}
    </Card>
  )
}
