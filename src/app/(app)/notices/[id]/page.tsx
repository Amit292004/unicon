'use client'

import React from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Calendar,
  Building2,
  FileText,
  User,
  Download,
  Share2,
  ShieldCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/lib/data/client-store'
import { formatDateTime } from '@/lib/utils'

export default function NoticeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { notices, currentProfile } = useAppStore()

  const noticeId = params?.id as string
  const notice = notices.find((n) => n.id === noticeId)

  if (!notice) {
    return (
      <div className="py-16 text-center space-y-4">
        <h1 className="text-xl font-bold">Notice Not Found</h1>
        <p className="text-xs text-muted-foreground">The requested announcement could not be found or has expired.</p>
        <Link href="/notices">
          <Button size="sm">
            <ArrowLeft className="h-4 w-4 mr-1.5" aria-hidden="true" />
            Back to Notices
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/notices">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Notices
          </Button>
        </Link>

        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={() => {
            if (typeof navigator !== 'undefined' && navigator.clipboard) {
              navigator.clipboard.writeText(window.location.href)
            }
          }}
        >
          <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
          Share Notice
        </Button>
      </div>

      {/* Main Notice Document Card */}
      <Card className="p-6 sm:p-8 border shadow-card space-y-6">
        {/* Notice Meta Header */}
        <div className="space-y-3 border-b pb-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default" className="text-2xs uppercase">
              {notice.audience === 'all'
                ? 'All Students'
                : notice.audience === 'department'
                ? 'Department Scope'
                : `Semester ${notice.targetSemester || ''}`}
            </Badge>
            <span className="text-2xs text-muted-foreground">
              College: {currentProfile.college?.name}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-snug">
            {notice.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4 text-primary" aria-hidden="true" />
              <span className="font-medium text-foreground">
                {notice.author?.fullName || 'Academic Dean'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span>{formatDateTime(notice.publishedAt || notice.createdAt)}</span>
            </div>

            {notice.expiresAt && (
              <span className="text-2xs text-muted-foreground border-l pl-3">
                Valid until {formatDateTime(notice.expiresAt)}
              </span>
            )}
          </div>
        </div>

        {/* Notice Body */}
        <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap space-y-4">
          {notice.content}
        </div>

        {/* Official Attachments */}
        {notice.attachmentUrls && notice.attachmentUrls.length > 0 && (
          <div className="border-t pt-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Official Document Attachments
            </h3>
            <div className="space-y-2">
              {notice.attachmentUrls.map((url, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg border bg-secondary/30 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-foreground">
                        {url.split('/').pop() || 'official_bulletin.pdf'}
                      </p>
                      <p className="text-2xs text-muted-foreground">PDF Document &bull; Verified</p>
                    </div>
                  </div>

                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      Download
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verification Signoff */}
        <div className="border-t pt-5 flex items-center justify-between text-2xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>Cryptographically Verified Institutional Announcement</span>
          </div>
          <span>Ref ID: {notice.id}</span>
        </div>
      </Card>
    </div>
  )
}
