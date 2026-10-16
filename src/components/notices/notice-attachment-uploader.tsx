'use client'

import React, { useState, useRef } from 'react'
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  X,
  CheckCircle2,
  AlertCircle,
  Link2,
  Sparkles,
  Loader2,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { isPdfAttachment, isImageAttachment, getAttachmentName, getAttachmentTypeLabel } from '@/lib/notices'

interface NoticeAttachmentUploaderProps {
  attachmentUrl: string | null
  onChange: (url: string | null) => void
}

export function NoticeAttachmentUploader({
  attachmentUrl,
  onChange,
}: NoticeAttachmentUploaderProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'samples'>('upload')
  const [urlInput, setUrlInput] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFileUpload = async (file: File) => {
    setErrorMsg(null)

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|svg)$/i.test(file.name)

    if (!isPdf && !isImage) {
      setErrorMsg('Please select either a valid image (PNG, JPG, WebP, SVG) or a PDF document.')
      return
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('File exceeds 15 MB limit.')
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload attachment')
      }

      onChange(data.url)
    } catch (err) {
      console.error('Attachment upload failed:', err)
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return
    setErrorMsg(null)
    onChange(urlInput.trim())
    setUrlInput('')
  }

  const handleSelectSample = (sampleUrl: string) => {
    setErrorMsg(null)
    onChange(sampleUrl)
  }

  const handleRemove = () => {
    onChange(null)
    setErrorMsg(null)
  }

  return (
    <div className="space-y-3 p-4 rounded-xl border border-border/80 bg-secondary/15">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <UploadCloud className="h-4 w-4 text-primary" aria-hidden="true" />
          <span>Notice Attachment (Image or PDF)</span>
        </label>

        {/* Tab switchers if no attachment */}
        {!attachmentUrl && (
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-md text-2xs">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-2 py-1 rounded font-medium transition cursor-pointer ${
                activeTab === 'upload' ? 'bg-background shadow-xs text-foreground font-semibold' : 'text-muted-foreground'
              }`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`px-2 py-1 rounded font-medium transition cursor-pointer ${
                activeTab === 'url' ? 'bg-background shadow-xs text-foreground font-semibold' : 'text-muted-foreground'
              }`}
            >
              Paste URL
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('samples')}
              className={`flex items-center gap-1 px-2 py-1 rounded font-medium transition cursor-pointer ${
                activeTab === 'samples' ? 'bg-background shadow-xs text-foreground font-semibold' : 'text-muted-foreground'
              }`}
            >
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>Sample Docs</span>
            </button>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-2.5 rounded-md bg-destructive/10 text-destructive border border-destructive/20 text-2xs flex items-center gap-2">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* When Attachment is Attached: Show Active Preview in Appropriate Dimension */}
      {attachmentUrl ? (
        <div className="p-3.5 rounded-lg border border-border/80 bg-card space-y-3 shadow-subtle animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge
                variant={isPdfAttachment(attachmentUrl) ? 'destructive' : 'default'}
                className="text-3xs uppercase font-mono gap-1"
              >
                {isPdfAttachment(attachmentUrl) ? (
                  <>
                    <FileText className="h-3 w-3" />
                    <span>PDF Document</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-3 w-3" />
                    <span>Image Attachment</span>
                  </>
                )}
              </Badge>
              <span className="text-2xs font-semibold text-foreground truncate max-w-[240px] sm:max-w-xs">
                {getAttachmentName(attachmentUrl)}
              </span>
            </div>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleRemove}
              className="h-7 text-2xs text-destructive hover:bg-destructive/10 gap-1"
            >
              <X className="h-3.5 w-3.5" />
              <span>Remove</span>
            </Button>
          </div>

          {/* Interactive Preview in appropriate dimension inside form */}
          {isImageAttachment(attachmentUrl) && (
            <div className="w-full h-44 rounded-md border border-border/70 bg-muted/20 flex items-center justify-center overflow-hidden p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={attachmentUrl}
                alt="Notice visual attachment preview"
                className="max-h-full max-w-full object-contain rounded"
              />
            </div>
          )}

          {isPdfAttachment(attachmentUrl) && (
            <div className="w-full h-44 rounded-md border border-border/70 bg-muted/20 overflow-hidden relative">
              <iframe
                src={`${attachmentUrl}#toolbar=0&navpanes=0`}
                title="PDF Document Preview"
                className="w-full h-full border-0"
              />
            </div>
          )}
        </div>
      ) : (
        /* When No Attachment is Attached: Show Selected Input Mode */
        <div>
          {activeTab === 'upload' && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border/80 hover:border-primary/60 hover:bg-primary/5 transition rounded-lg p-5 text-center cursor-pointer flex flex-col items-center justify-center gap-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf,.pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              {isUploading ? (
                <div className="flex flex-col items-center gap-1.5 py-2">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="text-xs font-medium text-foreground">Processing attachment...</p>
                  <p className="text-3xs text-muted-foreground">Uploading and preparing preview</p>
                </div>
              ) : (
                <>
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Click to upload or drag &amp; drop file
                    </p>
                    <p className="text-2xs text-muted-foreground mt-0.5">
                      Supports <span className="font-semibold text-foreground">PDF Documents</span> or{' '}
                      <span className="font-semibold text-foreground">Images</span> (PNG, JPG, WebP, SVG) up to 15MB
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'url' && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="https://example.com/exam_timetable.pdf or poster.png"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="pl-9 text-xs h-9"
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleApplyUrl}
                  disabled={!urlInput.trim()}
                  className="h-9 text-xs"
                >
                  Attach
                </Button>
              </div>
              <p className="text-3xs text-muted-foreground">
                Paste any publicly accessible URL pointing to a PDF circular or announcement image.
              </p>
            </div>
          )}

          {activeTab === 'samples' && (
            <div className="space-y-2">
              <p className="text-2xs text-muted-foreground">
                Quick-test institutional attachments with preloaded campus documents:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectSample('/docs/midsem_schedule_2026.pdf')}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100/50 transition text-left cursor-pointer group"
                >
                  <FileText className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors truncate">
                      Mid-Sem Schedule (PDF)
                    </p>
                    <p className="text-3xs text-muted-foreground">Official Examination Timetable</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectSample('/docs/codefest_poster.svg')}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/50 transition text-left cursor-pointer group"
                >
                  <ImageIcon className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      Annual Codefest (Image)
                    </p>
                    <p className="text-3xs text-muted-foreground">Official Event Poster</p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
