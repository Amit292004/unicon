'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import {
  FileText,
  Image as ImageIcon,
  Download,
  ExternalLink,
  Maximize2,
  X,
  Eye,
  FileCheck2,
  ShieldCheck,
  ZoomIn
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { isPdfAttachment, isImageAttachment, getAttachmentName, getAttachmentTypeLabel } from '@/lib/notices'

interface NoticeAttachmentViewerProps {
  url: string
  title?: string
  mode?: 'detail' | 'card'
  className?: string
}

export function NoticeAttachmentViewer({
  url,
  title = 'Official Announcement Attachment',
  mode = 'detail',
  className = '',
}: NoticeAttachmentViewerProps) {
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false)
  const isPdf = isPdfAttachment(url)
  const isImg = isImageAttachment(url)
  const fileName = getAttachmentName(url)
  const typeLabel = getAttachmentTypeLabel(url)

  // ─── CARD VIEW (For Listings / Directory) ──────────────────────────────────
  if (mode === 'card') {
    if (isImg) {
      return (
        <div className={`space-y-2 mt-3 ${className}`}>
          <div
            className="relative w-full h-48 sm:h-56 rounded-lg overflow-hidden border border-border/70 bg-muted/20 group/img cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              setIsFullscreenModalOpen(true)
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={title}
              className="w-full h-full object-cover group-hover/img:scale-102 transition duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button size="sm" variant="secondary" className="h-8 gap-1.5 text-xs shadow-md">
                <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Enlarge Poster</span>
              </Button>
            </div>
            <div className="absolute bottom-2 left-2">
              <Badge variant="secondary" className="text-3xs bg-background/90 backdrop-blur-sm shadow-sm gap-1 border">
                <ImageIcon className="h-3 w-3 text-primary" aria-hidden="true" />
                <span>Notice Poster</span>
              </Badge>
            </div>
          </div>

          {/* Fullscreen Modal for Card Click */}
          {isFullscreenModalOpen && (
            <AttachmentFullscreenModal
              url={url}
              title={title}
              fileName={fileName}
              isPdf={false}
              onClose={() => setIsFullscreenModalOpen(false)}
            />
          )}
        </div>
      )
    }

    if (isPdf) {
      return (
        <div className={`mt-3 ${className}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-9 w-9 rounded-md bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-800 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate">{fileName}</p>
                <div className="flex items-center gap-2 text-2xs text-muted-foreground mt-0.5">
                  <span className="font-medium text-red-600 dark:text-red-400 font-mono uppercase text-3xs">
                    PDF Document
                  </span>
                  <span>&bull;</span>
                  <span>Official Verified Attachment</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7.5 text-2xs gap-1 bg-background hover:bg-secondary shadow-subtle"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsFullscreenModalOpen(true)
                }}
              >
                <Eye className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                <span>Preview Document</span>
              </Button>

              <a
                href={url}
                download={fileName}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <Button size="sm" variant="ghost" className="h-7.5 text-2xs gap-1" title="Download PDF">
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="sr-only">Download</span>
                </Button>
              </a>
            </div>
          </div>

          {/* Fullscreen PDF Reader Modal for Card */}
          {isFullscreenModalOpen && (
            <AttachmentFullscreenModal
              url={url}
              title={title}
              fileName={fileName}
              isPdf={true}
              onClose={() => setIsFullscreenModalOpen(false)}
            />
          )}
        </div>
      )
    }

    // Generic document fallback
    return (
      <div className={`mt-3 flex items-center justify-between p-3 rounded-lg border bg-secondary/30 text-xs ${className}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <FileText className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
          <p className="font-medium text-foreground truncate">{fileName}</p>
        </div>
        <a href={url} download={fileName} target="_blank" rel="noopener noreferrer">
          <Button size="sm" variant="outline" className="h-7.5 text-2xs gap-1">
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Download
          </Button>
        </a>
      </div>
    )
  }

  // ─── DETAIL VIEW (For Notice Page /notices/[id]) ───────────────────────────
  return (
    <div className={`space-y-4 my-6 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/60">
        <div className="flex items-center gap-2">
          {isPdf ? (
            <div className="h-6 w-6 rounded bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
              <FileText className="h-3.5 w-3.5 text-red-600 dark:text-red-400" aria-hidden="true" />
            </div>
          ) : (
            <div className="h-6 w-6 rounded bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <ImageIcon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            </div>
          )}
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
            {typeLabel}: {fileName}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="h-7.5 text-2xs gap-1 shadow-subtle"
            onClick={() => setIsFullscreenModalOpen(true)}
            title="Expand into full screen mode"
          >
            <Maximize2 className="h-3 w-3" aria-hidden="true" />
            <span>Full View</span>
          </Button>

          <a href={url} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" className="h-7.5 text-2xs gap-1 shadow-subtle" title="Open in new window">
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
              <span>Open Raw</span>
            </Button>
          </a>

          <a href={url} download={fileName}>
            <Button size="sm" variant="default" className="h-7.5 text-2xs gap-1 shadow-subtle">
              <Download className="h-3 w-3" aria-hidden="true" />
              <span>Download</span>
            </Button>
          </a>
        </div>
      </div>

      {/* Render Image Notice in Appropriate Dimension */}
      {isImg && (
        <div className="space-y-2">
          <div
            className="w-full flex items-center justify-center p-3 rounded-xl border border-border/80 bg-muted/20 shadow-subtle overflow-hidden cursor-zoom-in"
            onClick={() => setIsFullscreenModalOpen(true)}
            title="Click to view full size"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={title}
              className="w-full max-h-[560px] object-contain rounded-lg shadow-sm hover:opacity-95 transition"
            />
          </div>
          <div className="flex items-center justify-between text-2xs text-muted-foreground px-1">
            <span className="flex items-center gap-1">
              <FileCheck2 className="h-3 w-3 text-emerald-500" aria-hidden="true" />
              High-resolution institutional visual circular
            </span>
            <span>Click image to enlarge</span>
          </div>
        </div>
      )}

      {/* Render PDF Document in Appropriate Dimension */}
      {isPdf && (
        <div className="space-y-2">
          <div className="w-full h-[620px] sm:h-[720px] rounded-xl border border-border/80 bg-muted/20 shadow-card overflow-hidden relative">
            <iframe
              src={`${url}#toolbar=1&navpanes=0`}
              title={title}
              className="w-full h-full border-0 rounded-xl"
            />
          </div>
          <div className="flex items-center justify-between text-2xs text-muted-foreground px-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-primary" aria-hidden="true" />
              Official Controller of Examinations / Institutional Circular
            </span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-0.5"
            >
              <span>Problems viewing? Open standalone document</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>
      )}

      {/* Fullscreen / Expanded Modal */}
      {isFullscreenModalOpen && (
        <AttachmentFullscreenModal
          url={url}
          title={title}
          fileName={fileName}
          isPdf={isPdf}
          onClose={() => setIsFullscreenModalOpen(false)}
        />
      )}
    </div>
  )
}

interface AttachmentFullscreenModalProps {
  url: string
  title: string
  fileName: string
  isPdf: boolean
  onClose: () => void
}

function AttachmentFullscreenModal({
  url,
  title,
  fileName,
  isPdf,
  onClose,
}: AttachmentFullscreenModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col p-2 sm:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="flex items-center justify-between bg-card text-card-foreground p-3 sm:p-4 rounded-t-xl border border-border/80 shadow-md gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-w-0 flex items-center gap-2.5">
          {isPdf ? (
            <div className="h-8 w-8 rounded-md bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          ) : (
            <div className="h-8 w-8 rounded-md bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
              <ImageIcon className="h-4 w-4 text-primary" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold text-foreground truncate">{title}</p>
            <p className="text-3xs sm:text-2xs text-muted-foreground truncate font-mono">{fileName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a href={url} download={fileName} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          </a>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">New Tab</span>
            </Button>
          </a>
          <Button size="icon-sm" variant="ghost" onClick={onClose} title="Close full view">
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div
        className="flex-1 bg-background/95 rounded-b-xl border border-t-0 border-border/80 p-2 sm:p-4 overflow-auto flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {isPdf ? (
          <iframe
            src={`${url}#toolbar=1`}
            title={title}
            className="w-full h-full min-h-[75vh] rounded-lg border-0 bg-card"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={title}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-xl"
            />
          </div>
        )}
      </div>
    </div>
  )
}
