'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Bus,
  Clock,
  MapPin,
  Phone,
  AlertCircle,
  ShieldCheck,
  Send,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Info,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/lib/data/client-store'
import { formatRelativeTime } from '@/lib/utils'

export default function TransportPage() {
  const { currentProfile, routes, buses, complaints, addComplaint, deleteComplaint } = useAppStore()

  const [selectedRouteId, setSelectedRouteId] = useState<string>(routes[0]?.id || '')
  const [complaintSubject, setComplaintSubject] = useState('')
  const [complaintDescription, setComplaintDescription] = useState('')
  const [complaintBusId, setComplaintBusId] = useState<string>(buses[0]?.id || '')
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null)

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0]

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!complaintSubject.trim() || !complaintDescription.trim()) return

    addComplaint(complaintSubject.trim(), complaintDescription.trim(), complaintBusId)
    setFeedbackMsg('Your transportation complaint has been submitted to Transit Administration.')
    setComplaintSubject('')
    setComplaintDescription('')
    setTimeout(() => setFeedbackMsg(null), 5000)
  }

  const myComplaints = complaints.filter((c) => c.studentId === currentProfile.id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Campus Transit &amp; Bus Logistics
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Verified timetables, stops, drivers, and operational support for {currentProfile.college?.name}
          </p>
        </div>

        {currentProfile.role !== 'student' && (
          <Link href="/admin/transport">
            <Button size="sm" className="gap-1.5 text-xs">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Manage Fleet &amp; Routes
            </Button>
          </Link>
        )}
      </div>

      {feedbackMsg && (
        <div className="p-3 text-xs rounded-md bg-success-50 text-success-600 border border-success-500/20 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Route Selector Cards */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Available Campus Transit Lines
          </h2>
          <span className="text-2xs text-muted-foreground font-mono">
            {routes.length} Active Routes Today
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {routes.map((rt, idx) => {
            const isSelected = selectedRouteId === rt.id
            const busCode = rt.bus?.busNumber ? `BUS ${rt.bus.busNumber.replace(/[^0-9]/g, '') || idx + 1}` : `R-0${idx + 1}`
            return (
              <button
                type="button"
                key={rt.id}
                onClick={() => setSelectedRouteId(rt.id)}
                className={`p-4 rounded-lg border text-left transition-all flex flex-col justify-between space-y-3 relative ${
                  isSelected
                    ? 'border-primary bg-primary/[0.03] ring-1 ring-primary/60 shadow-card'
                    : 'bg-card border-border/80 hover:border-border hover:bg-accent/40 shadow-subtle'
                }`}
              >
                <div className="flex items-start justify-between w-full gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`h-8 px-2 rounded font-mono font-bold text-xs flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted/70 text-foreground border-border/80'
                      }`}
                    >
                      {busCode}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-foreground truncate">{rt.routeName}</p>
                      <p className="text-2xs text-muted-foreground truncate font-mono">
                        {rt.bus?.registrationNumber || 'Fleet Vehicle'} &bull; Driver: {rt.bus?.driver?.fullName || 'Assigned'}
                      </p>
                    </div>
                  </div>
                  <Badge variant={isSelected ? 'default' : 'outline'} className="text-2xs font-mono shrink-0">
                    {rt.departureTime}
                  </Badge>
                </div>

                <div className="text-2xs text-muted-foreground flex items-center justify-between border-t border-border/60 pt-2.5 w-full gap-2">
                  <span className="flex items-center gap-1 shrink-0">
                    <MapPin className="h-3 w-3 text-primary shrink-0" aria-hidden="true" />
                    <span>{rt.stops.length} Checkpoints</span>
                  </span>
                  <span className="truncate max-w-[120px] min-[380px]:max-w-[180px] sm:max-w-[240px] text-right">
                    {rt.operatingDays?.join(', ')}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Route Details */}
      {activeRoute && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stops Timeline (2 Columns) */}
          <div className="lg:col-span-2 space-y-5">
            <Card className="p-4 sm:p-5 border shadow-card">
              <CardHeader className="p-0 pb-4 border-b flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <CardTitle className="text-base font-bold text-foreground truncate">
                      {activeRoute.routeName}
                    </CardTitle>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Departs {activeRoute.departureTime} &bull; Expected Campus Arrival {activeRoute.arrivalTime}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <Badge variant="outline" className="text-2xs font-mono">
                    {activeRoute.operatingDays?.join(', ')}
                  </Badge>
                  <Badge variant="secondary" className="text-2xs uppercase">
                    Active Schedule
                  </Badge>
                </div>
              </CardHeader>

              {/* Transit Stop Timeline */}
              <div className="pt-4">
                {activeRoute.stops.map((stop, idx) => {
                  const isFirst = idx === 0
                  const isLast = idx === activeRoute.stops.length - 1
                  return (
                    <div key={stop.id} className="relative flex items-start gap-3.5 text-xs pb-5 last:pb-1">
                      {/* Timeline track connector to next stop */}
                      {!isLast && (
                        <span
                          className="absolute left-[6px] top-3 -bottom-1 w-0.5 bg-border pointer-events-none"
                          aria-hidden="true"
                        />
                      )}

                      {/* Node Indicator */}
                      <div
                        className={`relative z-10 h-3.5 w-3.5 rounded-full border-2 bg-background shrink-0 mt-0.5 transition-colors ${
                          isFirst
                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 ring-2 ring-emerald-500/20'
                            : isLast
                            ? 'border-primary bg-primary text-primary-foreground ring-2 ring-primary/20'
                            : 'border-muted-foreground/60'
                        }`}
                        aria-hidden="true"
                      />

                      {/* Stop Information */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                          <span className="font-semibold text-foreground flex flex-wrap items-center gap-1.5 min-w-0">
                            <span className="text-muted-foreground font-mono text-2xs">{stop.stopOrder}.</span>
                            <span className="break-words">{stop.stopName}</span>
                            {isFirst && (
                              <Badge variant="outline" className="text-3xs text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                                Route Origin
                              </Badge>
                            )}
                            {isLast && (
                              <Badge variant="default" className="text-3xs">
                                Campus Terminus
                              </Badge>
                            )}
                          </span>
                          <span className="text-2xs font-mono text-foreground font-medium bg-muted/60 px-2 py-0.5 rounded border border-border/50 shrink-0 self-start sm:self-auto">
                            {stop.estimatedTime}
                          </span>
                        </div>
                        <p className="text-2xs text-muted-foreground mt-0.5">
                          {isFirst
                            ? 'Primary bus departure point. Arrive 5 minutes prior to listed time.'
                            : isLast
                            ? 'Official institution drop-off gate and campus pedestrian entry.'
                            : 'Designated intermediate checkpoint and passenger transfer zone.'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Complaints Submission Form */}
            <Card className="p-5 border shadow-card">
              <CardHeader className="p-0 pb-3 border-b mb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-primary" aria-hidden="true" />
                  Submit Transport Incident or Service Feedback
                </CardTitle>
                <p className="text-2xs text-muted-foreground">
                  Your ticket will be routed directly to the Directorate of Campus Logistics.
                </p>
              </CardHeader>
              <form onSubmit={handleComplaintSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground" htmlFor="cmp-bus">
                      Assigned Vehicle
                    </label>
                    <select
                      id="cmp-bus"
                      value={complaintBusId}
                      onChange={(e) => setComplaintBusId(e.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-xs shadow-subtle focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    >
                      {buses.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.busNumber} ({b.registrationNumber})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground" htmlFor="cmp-subject">
                      Incident Summary / Subject
                    </label>
                    <Input
                      id="cmp-subject"
                      placeholder="e.g., Delayed morning departure by 20 mins"
                      className="h-9 text-xs"
                      value={complaintSubject}
                      onChange={(e) => setComplaintSubject(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="cmp-desc">
                    Detailed Account &amp; Location
                  </label>
                  <textarea
                    id="cmp-desc"
                    placeholder="Specify the exact time, stop name, and circumstance..."
                    className="w-full min-h-[75px] rounded-md border border-input bg-background p-2.5 text-xs shadow-subtle focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    value={complaintDescription}
                    onChange={(e) => setComplaintDescription(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" size="sm" className="h-8 text-xs font-medium">
                  <Send className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                  Submit Ticket to Transit Office
                </Button>
              </form>
            </Card>
          </div>

          {/* Right Column: Driver Info & Guidelines */}
          <div className="space-y-4">
            {/* Driver Profile */}
            <Card className="p-5 border shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Designated Fleet Driver
                </h3>
                <Badge variant="outline" className="text-3xs text-emerald-700 dark:text-emerald-400">
                  Verified Driver
                </Badge>
              </div>

              <div className="p-3.5 rounded-lg border bg-muted/30 space-y-2.5 text-xs">
                <div>
                  <p className="font-bold text-foreground text-sm">
                    {activeRoute.bus?.driver?.fullName || 'Assigned Transit Staff'}
                  </p>
                  <p className="text-2xs text-muted-foreground font-mono">
                    License: {activeRoute.bus?.driver?.licenseNumber || 'NL-01-20210045'}
                  </p>
                </div>

                <div className="border-t border-border/60 pt-2 flex items-center justify-between">
                  <span className="text-2xs text-muted-foreground font-mono">
                    {activeRoute.bus?.driver?.phone || '+91 94360 00000'}
                  </span>
                  <a
                    href={`tel:${activeRoute.bus?.driver?.phone || '+919436000000'}`}
                    className="inline-flex items-center gap-1 text-2xs font-semibold text-primary hover:underline"
                  >
                    <Phone className="h-3 w-3" aria-hidden="true" />
                    Call Driver
                  </a>
                </div>
              </div>
            </Card>

            {/* Safety Guidelines */}
            <Card className="p-5 border shadow-card space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Boarding Policy &amp; Safety
              </h3>
              <div className="text-2xs text-muted-foreground space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Arrive at checkpoints at least 5 minutes prior to scheduled departure.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Present your physical or digital student ID card upon boarding.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Priority seating reserved for faculty and students with mobility requirements.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Immediate incident reporting available via the digital support form.</span>
                </div>
              </div>
            </Card>

            {/* My Recent Complaints Status */}
            {myComplaints.length > 0 && (
              <Card className="p-5 border shadow-card space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  My Complaint Tickets ({myComplaints.length})
                </h3>
                <div className="space-y-2 text-xs">
                  {myComplaints.map((c) => (
                    <div key={c.id} className="p-2.5 rounded border bg-card space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <span className="font-semibold text-foreground truncate min-w-0 max-w-[200px] sm:max-w-none">{c.subject}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge
                            variant={c.status === 'resolved' ? 'success' : 'warning'}
                            className="text-2xs uppercase"
                          >
                            {c.status}
                          </Badge>
                          <button
                            type="button"
                            onClick={() => {
                              if (typeof window !== 'undefined' && window.confirm('Delete this complaint ticket?')) {
                                deleteComplaint(c.id)
                              }
                            }}
                            className="text-muted-foreground hover:text-destructive p-0.5 cursor-pointer"
                            title="Delete Ticket"
                            aria-label="Delete ticket"
                          >
                            <Trash2 className="h-3 w-3" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                      <p className="text-2xs text-muted-foreground">{c.description}</p>
                      {c.responseMessage && (
                        <p className="text-2xs text-primary font-medium border-t pt-1">
                          Admin response: {c.responseMessage}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
