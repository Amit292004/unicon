'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Bookmark,
  FileText,
  ClipboardList,
  Bell,
  Trash2,
  Download,
  ExternalLink,
  MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/empty-state'
import { ResourceFileIcon } from '@/components/shared/resource-file-icon'
import { useAppStore } from '@/lib/data/client-store'
import { formatDate } from '@/lib/utils'

export default function SavedItemsPage() {
  const { savedItemIds, toggleSaveItem, notes, pyqs, posts, notices } = useAppStore()
  const [filterType, setFilterType] = useState<'all' | 'notes' | 'pyqs' | 'posts'>('all')

  const savedNotes = notes.filter((n) => savedItemIds.includes(n.id))
  const savedPYQs = pyqs.filter((p) => savedItemIds.includes(p.id))
  const savedPosts = posts.filter((p) => savedItemIds.includes(p.id))

  const totalSavedCount = savedNotes.length + savedPYQs.length + savedPosts.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Saved Bookmarks &amp; Resources
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Personal archive of course notes, question papers, and discussions ({totalSavedCount} items)
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex rounded-md border p-1 bg-muted/40 gap-1 text-xs">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded font-medium transition ${
              filterType === 'all' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
            }`}
          >
            All Items
          </button>
          <button
            type="button"
            onClick={() => setFilterType('notes')}
            className={`px-3 py-1.5 rounded font-medium transition ${
              filterType === 'notes' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
            }`}
          >
            Notes ({savedNotes.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('pyqs')}
            className={`px-3 py-1.5 rounded font-medium transition ${
              filterType === 'pyqs' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
            }`}
          >
            PYQs ({savedPYQs.length})
          </button>
        </div>
      </div>

      {totalSavedCount === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved items yet"
          description="Click the bookmark icon on any post, note, or question paper to store it in your personal reading list."
          action={
            <Link href="/notes">
              <Button size="sm">Browse Course Notes</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
          {/* Saved Notes Section */}
          {(filterType === 'all' || filterType === 'notes') && savedNotes.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Saved Course Notes ({savedNotes.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {savedNotes.map((note) => (
                  <Card key={note.id} className="p-4 border shadow-card flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <ResourceFileIcon mimeType="application/pdf" fileName={note.fileName} size="sm" />
                      <div className="min-w-0">
                        <h3 className="font-bold text-foreground truncate">{note.title}</h3>
                        <p className="text-2xs text-muted-foreground truncate">{note.subject} &bull; Sem {note.semester}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <a href={note.fileUrl} download target="_blank" rel="noopener noreferrer">
                        <Button size="icon-sm" variant="ghost" aria-label="Download note">
                          <Download className="h-3.5 w-3.5" aria-hidden="true" />
                        </Button>
                      </a>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => toggleSaveItem(note.id)}
                        className="text-destructive-600 hover:bg-destructive-50"
                        aria-label="Remove bookmark"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Saved PYQs Section */}
          {(filterType === 'all' || filterType === 'pyqs') && savedPYQs.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Saved Question Papers ({savedPYQs.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {savedPYQs.map((pyq) => (
                  <Card key={pyq.id} className="p-4 border shadow-card flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <ResourceFileIcon mimeType="application/pdf" fileName={pyq.fileName} size="sm" />
                      <div className="min-w-0">
                        <h3 className="font-bold text-foreground truncate">{pyq.title}</h3>
                        <p className="text-2xs text-muted-foreground truncate">{pyq.subject} &bull; Year {pyq.examYear}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <a href={pyq.fileUrl} download target="_blank" rel="noopener noreferrer">
                        <Button size="icon-sm" variant="ghost" aria-label="Download PYQ">
                          <Download className="h-3.5 w-3.5" aria-hidden="true" />
                        </Button>
                      </a>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => toggleSaveItem(pyq.id)}
                        className="text-destructive-600 hover:bg-destructive-50"
                        aria-label="Remove bookmark"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
