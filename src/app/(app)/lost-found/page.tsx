'use client'

import React, { useState } from 'react'
import {
  Search,
  Plus,
  Filter,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Tag,
  AlertCircle,
  FileText
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/empty-state'
import { UserAvatar } from '@/components/shared/user-avatar'
import { useAppStore } from '@/lib/data/client-store'
import { LOST_FOUND_CATEGORIES } from '@/lib/validations'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import type { LostFoundReport } from '@/types'

export default function LostFoundPage() {
  const {
    currentProfile,
    lostFoundReports,
    addLostFoundReport,
    submitClaim,
    resolveClaim,
    updateReportStatus
  } = useAppStore()

  const [activeTab, setActiveTab] = useState<'all' | 'lost' | 'found' | 'my_reports'>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Report Modal state
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportType, setReportType] = useState<'lost' | 'found'>('lost')
  const [itemName, setItemName] = useState('')
  const [category, setCategory] = useState<string>(LOST_FOUND_CATEGORIES[0])
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [handoverInfo, setHandoverInfo] = useState('')

  // Claim Modal state
  const [claimingItem, setClaimingItem] = useState<LostFoundReport | null>(null)
  const [claimMessage, setClaimMessage] = useState('')
  const [claimSuccessMsg, setClaimSuccessMsg] = useState<string | null>(null)

  // Real statistics from store data
  const collegeReports = lostFoundReports.filter(
    (r) => r.collegeId === currentProfile.collegeId
  )
  const totalReportsCount = collegeReports.length
  const missingCount = collegeReports.filter((r) => r.type === 'lost' && r.status === 'active').length
  const foundCount = collegeReports.filter((r) => r.type === 'found' && r.status === 'active').length
  const pendingClaimsCount = collegeReports.reduce(
    (acc, curr) => acc + (curr.claims?.filter((c) => c.status === 'pending').length || 0),
    0
  )

  // Filtered reports
  const filteredReports = collegeReports.filter((report) => {
    if (activeTab === 'lost' && report.type !== 'lost') return false
    if (activeTab === 'found' && report.type !== 'found') return false
    if (activeTab === 'my_reports' && report.reporterId !== currentProfile.id) return false

    if (selectedCategory !== 'all' && report.category !== selectedCategory) return false

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const matches =
        report.itemName.toLowerCase().includes(q) ||
        report.description.toLowerCase().includes(q) ||
        (report.location && report.location.toLowerCase().includes(q))
      if (!matches) return false
    }

    return true
  })

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault()
    if (!itemName.trim() || !description.trim()) return

    addLostFoundReport({
      collegeId: currentProfile.collegeId,
      reporterId: currentProfile.id,
      type: reportType,
      status: 'active',
      itemName: itemName.trim(),
      category,
      description: description.trim(),
      location: location.trim() || null,
      dateOccurred: new Date().toISOString().split('T')[0],
      imageUrl: null,
      handoverInfo: handoverInfo.trim() || null,
    })

    // Reset & close
    setItemName('')
    setDescription('')
    setLocation('')
    setHandoverInfo('')
    setShowReportModal(false)
  }

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!claimingItem || !claimMessage.trim()) return

    submitClaim(claimingItem.id, claimMessage.trim())
    setClaimSuccessMsg(`Claim submitted for "${claimingItem.itemName}". The uploader has been notified.`)
    setClaimingItem(null)
    setClaimMessage('')
    setTimeout(() => setClaimSuccessMsg(null), 5000)
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Campus Lost &amp; Found Registry
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Verified reporting, recovery, and automated item matching for {currentProfile.college?.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              setReportType('lost')
              setShowReportModal(true)
            }}
            variant="outline"
            className="text-xs gap-1"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Report Lost Item
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setReportType('found')
              setShowReportModal(true)
            }}
            className="text-xs gap-1"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Report Found Item
          </Button>
        </div>
      </div>

      {/* Real Statistics Calculated from Database */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-lg border bg-card shadow-card">
          <p className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
            Total Registry
          </p>
          <p className="text-2xl font-bold text-foreground mt-1">{totalReportsCount}</p>
        </div>
        <div className="p-4 rounded-lg border bg-card shadow-card">
          <p className="text-2xs font-semibold uppercase tracking-wider text-destructive-600">
            Missing Items
          </p>
          <p className="text-2xl font-bold text-destructive-600 mt-1">{missingCount}</p>
        </div>
        <div className="p-4 rounded-lg border bg-card shadow-card">
          <p className="text-2xs font-semibold uppercase tracking-wider text-success-600">
            Recovered / Found
          </p>
          <p className="text-2xl font-bold text-success-600 mt-1">{foundCount}</p>
        </div>
        <div className="p-4 rounded-lg border bg-card shadow-card">
          <p className="text-2xs font-semibold uppercase tracking-wider text-warning-600">
            Pending Claims
          </p>
          <p className="text-2xl font-bold text-warning-600 mt-1">{pendingClaimsCount}</p>
        </div>
      </div>

      {claimSuccessMsg && (
        <div className="p-3 text-xs rounded-md bg-success-50 text-success-600 border border-success-500/20 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{claimSuccessMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        {/* Navigation Tabs */}
        <div className="flex rounded-md border p-1 bg-muted/40 gap-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded font-medium transition ${
              activeTab === 'all' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
            }`}
          >
            All Reports
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('lost')}
            className={`px-3 py-1.5 rounded font-medium transition ${
              activeTab === 'lost' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
            }`}
          >
            Lost Only
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('found')}
            className={`px-3 py-1.5 rounded font-medium transition ${
              activeTab === 'found' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
            }`}
          >
            Found Only
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('my_reports')}
            className={`px-3 py-1.5 rounded font-medium transition ${
              activeTab === 'my_reports' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
            }`}
          >
            My Reports
          </button>
        </div>

        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search items by name, description, or location..."
            className="pl-9 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          aria-label="Filter items by category"
        >
          <option value="all">All Categories</option>
          {LOST_FOUND_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No items found"
          description="There are currently no reports matching your query and active filters."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveTab('all')
                setSelectedCategory('all')
                setSearchQuery('')
              }}
            >
              Reset Filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.map((report) => {
            const isOwner = report.reporterId === currentProfile.id
            const hasPendingClaims = (report.claims || []).some((c) => c.status === 'pending')

            return (
              <Card key={report.id} className="p-5 border shadow-card flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={report.type === 'lost' ? 'destructive' : 'success'}
                          className="text-2xs uppercase"
                        >
                          {report.type}
                        </Badge>
                        <Badge variant="outline" className="text-2xs">
                          {report.category}
                        </Badge>
                        {report.status === 'resolved' && (
                          <Badge variant="secondary" className="text-2xs">
                            Resolved
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-foreground mt-1">
                        {report.itemName}
                      </h3>
                    </div>

                    <span className="text-2xs text-muted-foreground shrink-0">
                      {formatRelativeTime(report.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-foreground leading-relaxed">
                    {report.description}
                  </p>

                  <div className="space-y-1 text-2xs text-muted-foreground border-t pt-2.5">
                    {report.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                        <span>Approx. Location: {report.location}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                      <span>Reported Date: {formatDate(report.dateOccurred || report.createdAt)}</span>
                    </div>

                    {report.handoverInfo && (
                      <div className="flex items-start gap-1.5 text-primary">
                        <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                        <span>Handover: {report.handoverInfo}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="border-t pt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-2xs text-muted-foreground">
                    <UserAvatar
                      name={report.reporter?.fullName || 'Student'}
                      avatarUrl={report.reporter?.avatarUrl}
                      size="xs"
                    />
                    <span>{report.reporter?.fullName}</span>
                  </div>

                  <div>
                    {isOwner ? (
                      <div className="flex items-center gap-2">
                        {report.status !== 'resolved' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-2xs"
                            onClick={() => updateReportStatus(report.id, 'resolved')}
                          >
                            Mark Recovered
                          </Button>
                        )}
                      </div>
                    ) : (
                      report.status === 'active' && (
                        <Button
                          size="sm"
                          className="h-7 text-2xs"
                          onClick={() => setClaimingItem(report)}
                        >
                          Submit Claim
                        </Button>
                      )
                    )}
                  </div>
                </div>

                {/* Owner Claims Management Panel */}
                {isOwner && report.claims && report.claims.length > 0 && (
                  <div className="border-t pt-3 space-y-2 bg-muted/20 p-3 rounded-md text-xs">
                    <p className="font-semibold text-foreground text-2xs uppercase tracking-wider">
                      Claims Received ({report.claims.length})
                    </p>
                    {report.claims.map((claim) => (
                      <div
                        key={claim.id}
                        className="p-2 rounded border bg-card space-y-1.5 text-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">
                            Claimant: {claim.claimant?.fullName}
                          </span>
                          <Badge
                            variant={
                              claim.status === 'accepted'
                                ? 'success'
                                : claim.status === 'rejected'
                                ? 'destructive'
                                : 'warning'
                            }
                            className="text-2xs"
                          >
                            {claim.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{claim.message}</p>

                        {claim.status === 'pending' && (
                          <div className="flex items-center gap-2 pt-1">
                            <Button
                              size="sm"
                              className="h-6 text-2xs bg-success-600 hover:bg-success-500 text-white"
                              onClick={() => resolveClaim(report.id, claim.id, 'accepted', 'Identity verified.')}
                            >
                              Accept Claim
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-2xs text-destructive-600"
                              onClick={() => resolveClaim(report.id, claim.id, 'rejected', 'Details did not match.')}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-6 border shadow-modal max-h-[90vh] overflow-y-auto">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-lg font-bold">
                Report {reportType === 'lost' ? 'Lost Valuable' : 'Found Item'}
              </CardTitle>
            </CardHeader>

            <form onSubmit={handleCreateReport} className="space-y-3.5">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={reportType === 'lost' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setReportType('lost')}
                >
                  I Lost an Item
                </Button>
                <Button
                  type="button"
                  variant={reportType === 'found' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setReportType('found')}
                >
                  I Found an Item
                </Button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="item-name">
                  Item Title
                </label>
                <Input
                  id="item-name"
                  placeholder="e.g. Casio fx-991EX Calculator"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="item-category">
                  Category
                </label>
                <select
                  id="item-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                >
                  {LOST_FOUND_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="item-location">
                  Approximate Campus Location
                </label>
                <Input
                  id="item-location"
                  placeholder="e.g. Library 2nd Floor reading desk"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="item-desc">
                  Detailed Description &amp; Distinctive Marks
                </label>
                <textarea
                  id="item-desc"
                  placeholder="Color, brand, serial markings, or unique identifiers..."
                  className="w-full min-h-[80px] rounded-md border border-input bg-background p-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {reportType === 'found' && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="item-handover">
                    Safe Handover / Collection Instructions
                  </label>
                  <Input
                    id="item-handover"
                    placeholder="e.g. Handed over to CSE Department Reception"
                    value={handoverInfo}
                    onChange={(e) => setHandoverInfo(e.target.value)}
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReportModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Publish Report
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Claim Modal */}
      {claimingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 border shadow-modal">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base font-bold">
                Claim: {claimingItem.itemName}
              </CardTitle>
            </CardHeader>

            <form onSubmit={handleClaimSubmit} className="space-y-3">
              <p className="text-xs text-muted-foreground">
                To prevent false claims, describe confidential identifying marks (e.g., sticker location, serial prefix, or specific contents).
              </p>

              <textarea
                placeholder="Provide verifiable ownership details..."
                className="w-full min-h-[90px] rounded-md border border-input bg-background p-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                value={claimMessage}
                onChange={(e) => setClaimMessage(e.target.value)}
                required
              />

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setClaimingItem(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Submit Ownership Claim
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
