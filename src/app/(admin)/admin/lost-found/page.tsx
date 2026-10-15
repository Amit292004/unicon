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
  FileText
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

  const handleOpenAdd = () => {
    setEditingReport(null)
    setItemName('')
    setType('lost')
    setCategory(LOST_FOUND_CATEGORIES[0])
    setDescription('')
    setLocation('')
    setStatus('active')
    setHandoverInfo('')
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
        imageUrl: null,
        handoverInfo: handoverInfo.trim() || null,
      })
      setActionMsg(`New ${type} item record "${itemName}" created.`)
    }

    setShowModal(false)
    setEditingReport(null)
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
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  {editingReport ? 'Save Changes' : 'Publish Report'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
