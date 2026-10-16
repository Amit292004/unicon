'use client'

import React, { useState } from 'react'
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  Calendar,
  MapPin,
  ShieldCheck,
  Tag,
  AlertCircle,
  X,
  Check,
  FileText,
  Camera,
  UploadCloud,
  ZoomIn
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/lib/data/client-store'
import { LOST_FOUND_CATEGORIES } from '@/lib/validations'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import type { LostFoundReport, LostFoundType, LostFoundStatus } from '@/types'

export default function AdminLostFoundPage() {
  const {
    currentProfile,
    lostFoundReports,
    addLostFoundReport,
    updateLostFoundReport,
    deleteLostFoundReport,
    resolveClaim,
    updateReportStatus
  } = useAppStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'lost' | 'found'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | LostFoundStatus>('all')
  const [actionMsg, setActionMsg] = useState<string | null>(null)

  // Add / Edit Modal
  const [showModal, setShowModal] = useState(false)
  const [editingReport, setEditingReport] = useState<LostFoundReport | null>(null)

  // Form Fields
  const [itemName, setItemName] = useState('')
  const [type, setType] = useState<LostFoundType>('lost')
  const [category, setCategory] = useState<string>(LOST_FOUND_CATEGORIES[0])
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [status, setStatus] = useState<LostFoundStatus>('active')
  const [handoverInfo, setHandoverInfo] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [previewZoomImage, setPreviewZoomImage] = useState<{ url: string; title: string } | null>(null)

  const collegeReports = lostFoundReports.filter((r) => r.collegeId === currentProfile.collegeId)

  const filteredReports = collegeReports.filter((r) => {
    if (typeFilter !== 'all' && r.type !== typeFilter) return false
    if (statusFilter !== 'all' && r.status !== statusFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const match =
        r.itemName.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        (r.location && r.location.toLowerCase().includes(q))
      if (!match) return false
    }
    return true
  })

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPEG, PNG, WebP, or GIF).')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds 5 MB limit.')
      return
    }

    setUploadError(null)
    setIsUploadingImage(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/lost-found/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload image')
      }

      setImageUrl(data.url)
    } catch (err: unknown) {
      console.error('Admin image upload error:', err)
      setUploadError(err instanceof Error ? err.message : 'Image upload failed. Please try again.')
    } finally {
      setIsUploadingImage(false)
      e.target.value = ''
    }
  }

  const handleRemoveImage = () => {
    setImageUrl(null)
    setUploadError(null)
  }

  const handleOpenAdd = () => {
    setEditingReport(null)
    setItemName('')
    setType('lost')
    setCategory(LOST_FOUND_CATEGORIES[0])
    setDescription('')
    setLocation('')
    setStatus('active')
    setHandoverInfo('')
    setImageUrl(null)
    setUploadError(null)
    setShowModal(true)
  }

  const handleOpenEdit = (report: LostFoundReport) => {
    setEditingReport(report)
    setItemName(report.itemName)
    setType(report.type)
    setCategory(report.category)
    setDescription(report.description)
    setLocation(report.location || '')
    setStatus(report.status)
    setHandoverInfo(report.handoverInfo || '')
    setImageUrl(report.imageUrl || null)
    setUploadError(null)
    setShowModal(true)
  }

  const handleDelete = (id: string, name: string) => {
    if (typeof window !== 'undefined' && !window.confirm(`Are you sure you want to permanently delete report "${name}"?`)) {
      return
    }
    deleteLostFoundReport(id)
    setActionMsg(`Report "${name}" was deleted.`)
    setTimeout(() => setActionMsg(null), 4000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!itemName.trim() || !description.trim()) return

    if (editingReport) {
      updateLostFoundReport(editingReport.id, {
        itemName: itemName.trim(),
        type,
        category,
        description: description.trim(),
        location: location.trim() || null,
        status,
        handoverInfo: handoverInfo.trim() || null,
        imageUrl: imageUrl || null,
      })
      setActionMsg(`Report "${itemName}" was successfully updated.`)
    } else {
      addLostFoundReport({
        collegeId: currentProfile.collegeId,
        reporterId: currentProfile.id,
        type,
        status,
        itemName: itemName.trim(),
        category,
        description: description.trim(),
        location: location.trim() || null,
        dateOccurred: new Date().toISOString().split('T')[0],
        imageUrl: imageUrl || null,
        handoverInfo: handoverInfo.trim() || null,
      })
      setActionMsg(`New ${type} item record "${itemName}" created.`)
    }

    setShowModal(false)
    setEditingReport(null)
    setImageUrl(null)
    setUploadError(null)
    setTimeout(() => setActionMsg(null), 4000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Lost &amp; Found Registry Oversight
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add reports, edit item listings, manage handover instructions, resolve disputes, and delete duplicate entries
          </p>
        </div>

        <Button size="sm" onClick={handleOpenAdd} className="gap-1.5 text-xs">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Log Item Report
        </Button>
      </div>

      {actionMsg && (
        <div className="p-3 text-xs rounded-md bg-success-50 text-success-600 border border-success-500/20 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search items by name, description, or location..."
            className="pl-9 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'lost' | 'found')}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            aria-label="Filter by report type"
          >
            <option value="all">All Types</option>
            <option value="lost">Lost Valuables</option>
            <option value="found">Found Items</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | LostFoundStatus)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            aria-label="Filter by report status"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
            <option value="claimed">Claimed</option>
          </select>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReports.map((report) => (
          <Card key={report.id} className="p-5 border shadow-card flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={report.type === 'lost' ? 'destructive' : 'success'} className="text-2xs uppercase">
                      {report.type}
                    </Badge>
                    <Badge variant="outline" className="text-2xs">
                      {report.category}
                    </Badge>
                    <Badge variant={report.status === 'resolved' ? 'secondary' : 'default'} className="text-2xs uppercase">
                      {report.status}
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-foreground mt-1">{report.itemName}</h3>
                </div>

                <span className="text-2xs text-muted-foreground shrink-0">
                  {formatRelativeTime(report.createdAt)}
                </span>
              </div>

              {report.imageUrl && (
                <div
                  className="relative rounded-lg overflow-hidden border border-border/70 bg-muted/20 aspect-video sm:aspect-[21/9] max-h-48 w-full group cursor-pointer"
                  onClick={() => setPreviewZoomImage({ url: report.imageUrl!, title: report.itemName })}
                  title="Click to view full photo"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={report.imageUrl}
                    alt={`Photo of ${report.itemName}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 backdrop-blur-sm text-white text-2xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                      <ZoomIn className="h-3 w-3" />
                      <span>View Photo</span>
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-3xs font-medium bg-black/60 text-white backdrop-blur-sm pointer-events-none">
                    Photo Attached
                  </div>
                </div>
              )}

              <p className="text-xs text-foreground leading-relaxed">{report.description}</p>

              <div className="space-y-1 text-2xs text-muted-foreground border-t pt-2.5">
                {report.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                    <span>Location: {report.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                  <span>Reported: {formatDate(report.dateOccurred || report.createdAt)}</span>
                </div>
                {report.handoverInfo && (
                  <div className="flex items-center gap-1.5 text-primary">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
                    <span>Handover: {report.handoverInfo}</span>
                  </div>
                )}
              </div>

              {/* Claims Section if any */}
              {report.claims && report.claims.length > 0 && (
                <div className="border-t pt-2.5 space-y-1.5 bg-secondary/30 p-2.5 rounded text-2xs">
                  <p className="font-semibold text-foreground uppercase tracking-wider">
                    Student Claims ({report.claims.length})
                  </p>
                  {report.claims.map((clm) => (
                    <div key={clm.id} className="p-2 rounded bg-card border space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{clm.claimant?.fullName || 'Student'}</span>
                        <Badge variant={clm.status === 'accepted' ? 'success' : clm.status === 'rejected' ? 'destructive' : 'warning'} className="text-2xs">
                          {clm.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{clm.message}</p>
                      {clm.status === 'pending' && (
                        <div className="flex gap-2 pt-1">
                          <Button
                            size="sm"
                            className="h-6 text-2xs bg-success-600 hover:bg-success-500 text-white"
                            onClick={() => resolveClaim(report.id, clm.id, 'accepted', 'Claim approved by admin.')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-2xs text-destructive-600"
                            onClick={() => resolveClaim(report.id, clm.id, 'rejected', 'Verification failed.')}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t pt-3 flex items-center justify-between">
              <span className="text-2xs text-muted-foreground">
                Reporter: {report.reporter?.fullName || 'System Staff'}
              </span>

              <div className="flex items-center gap-1.5">
                {report.status !== 'resolved' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-2xs"
                    onClick={() => updateReportStatus(report.id, 'resolved')}
                  >
                    Mark Resolved
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-2xs"
                    onClick={() => updateReportStatus(report.id, 'active')}
                  >
                    Re-open
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-2xs gap-1"
                  onClick={() => handleOpenEdit(report)}
                >
                  <Edit3 className="h-3 w-3" aria-hidden="true" />
                  Edit
                </Button>

                <Button
                  size="icon-sm"
                  variant="outline"
                  className="h-7 w-7 text-destructive-600 hover:bg-destructive-50"
                  onClick={() => handleDelete(report.id, report.itemName)}
                  title="Delete report"
                >
                  <Trash2 className="h-3 w-3" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add / Edit Report Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-6 border shadow-modal max-h-[90vh] overflow-y-auto">
            <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">
                {editingReport ? 'Edit Lost / Found Report' : 'Log New Item in Registry'}
              </CardTitle>
              <Button size="icon-sm" variant="ghost" onClick={() => setShowModal(false)}>
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </CardHeader>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="lf-type">
                    Report Type
                  </label>
                  <select
                    id="lf-type"
                    value={type}
                    onChange={(e) => setType(e.target.value as LostFoundType)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <option value="lost">Lost Valuable</option>
                    <option value="found">Found Item</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="lf-status">
                    Status
                  </label>
                  <select
                    id="lf-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as LostFoundStatus)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <option value="active">Active (Pending Recovery)</option>
                    <option value="resolved">Resolved (Returned / Closed)</option>
                    <option value="claimed">Claim In Progress</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="lf-name">
                  Item Title
                </label>
                <Input
                  id="lf-name"
                  placeholder="e.g. Casio Scientific Calculator fx-991EX"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="lf-cat">
                    Category
                  </label>
                  <select
                    id="lf-cat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    {LOST_FOUND_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="lf-loc">
                    Campus Location
                  </label>
                  <Input
                    id="lf-loc"
                    placeholder="e.g. Academic Block 2, Room 204"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="lf-desc">
                  Detailed Description &amp; Distinctive Marks
                </label>
                <textarea
                  id="lf-desc"
                  placeholder="Color, serial prefix, stickers, contents..."
                  className="w-full min-h-[80px] rounded-md border border-input bg-background p-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* Item Photo Upload (Vercel Blob Storage) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground flex items-center gap-1.5" htmlFor="admin-lf-image-upload">
                    <Camera className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    <span>Photo of Item (Optional)</span>
                  </label>
                  <span className="text-3xs text-muted-foreground font-mono">Vercel Blob Storage</span>
                </div>

                {imageUrl ? (
                  <div className="relative rounded-lg border border-border/80 bg-secondary/40 p-2.5 flex items-center gap-3">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden border border-border/80 bg-background shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt="Uploaded lost item"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span>Photo attached</span>
                      </p>
                      <p className="text-3xs text-muted-foreground truncate mt-0.5">
                        Uploaded to Vercel Blob
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-2xs text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={handleRemoveImage}
                      title="Remove attached photo"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label
                      htmlFor="admin-lf-image-upload"
                      className={`flex flex-col items-center justify-center p-3.5 rounded-lg border-2 border-dashed transition cursor-pointer text-center ${
                        isUploadingImage
                          ? 'border-primary/50 bg-primary/5 pointer-events-none'
                          : 'border-border hover:border-primary/60 hover:bg-muted/30'
                      }`}
                    >
                      <input
                        id="admin-lf-image-upload"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleImageFileChange}
                        disabled={isUploadingImage}
                        className="hidden"
                      />
                      {isUploadingImage ? (
                        <div className="flex flex-col items-center gap-1.5 py-1">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          <p className="text-xs font-medium text-foreground">
                            Uploading to Vercel Blob Storage...
                          </p>
                          <p className="text-3xs text-muted-foreground">Please wait a moment</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <UploadCloud className="h-4 w-4" aria-hidden="true" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-foreground">
                              <span className="text-primary hover:underline font-semibold">Click to upload photo</span> or drag & drop
                            </p>
                            <p className="text-3xs text-muted-foreground">
                              PNG, JPG, or WebP up to 5 MB
                            </p>
                          </div>
                        </div>
                      )}
                    </label>

                    {uploadError && (
                      <p className="text-2xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{uploadError}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="lf-handover">
                  Safe Handover / Custody Instructions (Optional)
                </label>
                <Input
                  id="lf-handover"
                  placeholder="e.g. In custody of Security Desk Gate 1"
                  value={handoverInfo}
                  onChange={(e) => setHandoverInfo(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowModal(false)
                    setImageUrl(null)
                    setUploadError(null)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isUploadingImage}>
                  {editingReport ? 'Save Changes' : 'Publish Report'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Photo Lightbox Modal */}
      {previewZoomImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewZoomImage(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-card rounded-xl border border-border/80 shadow-2xl overflow-hidden p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-foreground truncate pr-2">
                Photo: {previewZoomImage.title}
              </h3>
              <Button
                size="icon-sm"
                variant="ghost"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => setPreviewZoomImage(null)}
                aria-label="Close photo preview"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="rounded-lg overflow-hidden border bg-black/5 max-h-[70vh] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewZoomImage.url}
                alt={previewZoomImage.title}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
