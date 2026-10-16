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
  Compass,
  Check
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
  const {
    currentProfile,
    toggleLikePost,
    toggleSaveItem,
    savedItemIds,
    deletePost,
    postComments,
    addPostComment,
    deletePostComment
  } = useAppStore()

  const [showComments, setShowComments] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [copiedLink, setCopiedLink] = useState(false)

  const isLiked = post.hasLiked ?? false
  const isSaved = savedItemIds.includes(post.id)
  const isOwner = currentProfile.id === post.authorId
  const canDelete = isOwner || currentProfile.role === 'admin' || currentProfile.role === 'moderator'

  // Dynamic comments from client store
  const comments = postComments[post.id] || []

  const handleLike = () => {
    toggleLikePost(post.id)
  }

  const handleSave = () => {
    toggleSaveItem(post.id)
  }

  const handleDeletePost = () => {
    if (typeof window !== 'undefined' && !window.confirm('Delete this post permanently?')) return
    deletePost(post.id)
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return
    addPostComment(post.id, commentText.trim())
    setCommentText('')
  }

  const handleDeleteComment = (commentId: string) => {
    deletePostComment(post.id, commentId)
  }

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/home#${post.id}`)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
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
    <Card className="p-4 sm:p-5 border border-border/80 shadow-subtle hover:border-border transition-colors relative bg-card" id={post.id}>
      {/* Author Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Link href={`/profile/${post.author?.username || 'user'}`} className="shrink-0">
            <UserAvatar
              name={post.author?.fullName || 'Student'}
              avatarUrl={post.author?.avatarUrl}
              size="md"
            />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <Link
                href={`/profile/${post.author?.username || 'user'}`}
                className="font-semibold text-xs sm:text-sm text-foreground hover:underline truncate"
              >
                {post.author?.fullName || 'Anonymous Student'}
              </Link>
              <span className="text-3xs font-mono text-muted-foreground truncate">
                @{post.author?.username || 'user'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              <span className="text-3xs font-mono text-muted-foreground shrink-0">
                {formatRelativeTime(post.createdAt)}
              </span>
              {getTypeBadge(post.type)}
            </div>
          </div>
        </div>

        {canDelete && (
          <div className="relative">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Post actions"
            >
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </Button>

            {showMenu && (
              <div className="absolute right-0 top-8 z-20 w-36 bg-card border rounded-md shadow-md py-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false)
                    handleDeletePost()
                  }}
                  className="w-full text-left px-3 py-1.5 text-destructive hover:bg-destructive/10 flex items-center gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Text */}
      <div className="mt-3 text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
        {post.content}
      </div>

      {/* Post Image (Only displayed if author uploaded an image) */}
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
      <div className="mt-3.5 pt-2.5 border-t border-border/60 flex items-center justify-between text-muted-foreground text-xs">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors hover:bg-secondary cursor-pointer ${
              isLiked ? 'text-destructive-600 font-semibold' : 'hover:text-foreground'
            }`}
            aria-label={`Like post. Currently ${post.likesCount} likes`}
          >
            <Heart
              className={`h-4 w-4 ${isLiked ? 'fill-destructive-500 text-destructive-500' : ''}`}
              aria-hidden="true"
            />
            <span className="font-mono text-xs">{post.likesCount}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
            aria-label={`Comments. Currently ${comments.length} comments`}
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            <span className="font-mono text-xs">{comments.length}</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleSave}
            className={`p-1.5 rounded-md transition-colors hover:bg-secondary cursor-pointer ${
              isSaved ? 'text-primary' : 'hover:text-foreground'
            }`}
            aria-label={isSaved ? 'Remove from saved items' : 'Save post'}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-primary' : ''}`} aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label="Share post link"
            title={copiedLink ? 'Copied!' : 'Copy link'}
          >
            {copiedLink ? (
              <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            ) : (
              <Share2 className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable Comments Section */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-border/60 space-y-3">
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-3xs text-muted-foreground py-1">No comments yet. Start the conversation!</p>
            ) : (
              comments.map((comm) => {
                const canDeleteComm =
                  currentProfile.username === comm.authorUsername ||
                  currentProfile.role === 'admin'
                return (
                  <div key={comm.id} className="flex items-start justify-between gap-2 text-xs bg-secondary/40 border border-border/50 p-2.5 rounded-md">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                        <span className="font-semibold text-foreground text-xs">{comm.authorName}</span>
                        <span className="text-3xs font-mono text-muted-foreground">@{comm.authorUsername}</span>
                        <span className="text-3xs text-muted-foreground">&bull;</span>
                        <span className="text-3xs font-mono text-muted-foreground">{formatRelativeTime(comm.createdAt)}</span>
                      </div>
                      <p className="text-foreground text-xs leading-relaxed break-words">{comm.content}</p>
                    </div>

                    {canDeleteComm && (
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(comm.id)}
                        className="text-muted-foreground hover:text-destructive p-1 rounded hover:bg-secondary cursor-pointer"
                        aria-label="Delete comment"
                      >
                        <Trash2 className="h-3 w-3" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                )
              })
            )}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              placeholder="Write a constructive comment..."
              className="flex-1 h-8 rounded-md border border-border bg-background px-3 text-xs placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <Button type="submit" size="sm" className="h-8 px-3 shadow-subtle">
              <Send className="h-3 w-3" aria-hidden="true" />
              <span className="sr-only">Submit comment</span>
            </Button>
          </form>
        </div>
      )}
    </Card>
  )
}
