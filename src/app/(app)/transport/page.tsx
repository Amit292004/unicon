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
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/lib/data/client-store'
import { formatRelativeTime } from '@/lib/utils'

export default function TransportPage() {
  const { currentProfile, routes, buses, complaints, addComplaint } = useAppStore()

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
      <div className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Available Campus Transit Lines
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {routes.map((rt) => {
            const isSelected = selectedRouteId === rt.id
            return (
              <button
                type="button"
                key={rt.id}
                onClick={() => setSelectedRouteId(rt.id)}
                className={`p-4 rounded-lg border text-left transition flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'bg-card hover:bg-accent/50'
                }`}
              >
                <div className="flex items-start justify-between w-full">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Bus className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-foreground">{rt.routeName}</p>
                      <p className="text-2xs text-muted-foreground">{rt.bus?.busNumber} &bull; {rt.bus?.registrationNumber}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-2xs">
                    {rt.departureTime} Departure
                  </Badge>
                </div>

                <div className="text-2xs text-muted-foreground flex items-center gap-3 border-t pt-2 w-full">
                  <span>{rt.stops.length} Checkpoints</span>
                  <span>&bull;</span>
                  <span>Days: {rt.operatingDays?.join(', ')}</span>
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
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-5 border shadow-card">
              <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">{activeRoute.routeName}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Terminal Arrival: {activeRoute.arrivalTime} &bull; Scheduled Days: {activeRoute.operatingDays?.join(', ')}
                  </p>
                </div>
                <Badge variant="default" className="text-2xs uppercase">
                  Published Schedule
                </Badge>
              </CardHeader>

              {/* Stop Timeline */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {activeRoute.stops.map((stop, idx) => (
                  <div key={stop.id} className="relative flex items-start gap-4 text-xs">
                    <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-primary bg-background shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">
                          {stop.stopOrder}. {stop.stopName}
                        </span>
                        <span className="text-2xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {stop.estimatedTime}
                        </span>
                      </div>
                      <p className="text-2xs text-muted-foreground mt-0.5">
                        Designated passenger pickup and drop-off zone
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Complaints Submission Form */}
            <Card className="p-5 border shadow-card">
              <CardHeader className="p-0 pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-warning-600" aria-hidden="true" />
                  Submit Transport Incident or Service Feedback
                </CardTitle>
              </CardHeader>
              <form onSubmit={handleComplaintSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground" htmlFor="cmp-bus">
                      Relevant Bus
                    </label>
                    <select
                      id="cmp-bus"
                      value={complaintBusId}
                      onChange={(e) => setComplaintBusId(e.target.value)}
                      className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
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
                      Subject
                    </label>
                    <Input
                      id="cmp-subject"
                      placeholder="e.g. Departure delayed by 15 mins"
                      className="h-8 text-xs"
                      value={complaintSubject}
                      onChange={(e) => setComplaintSubject(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="cmp-desc">
                    Detailed Account
                  </label>
                  <textarea
                    id="cmp-desc"
                    placeholder="State time, stop location, and nature of the issue..."
                    className="w-full min-h-[70px] rounded-md border border-input bg-background p-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    value={complaintDescription}
                    onChange={(e) => setComplaintDescription(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" size="sm" className="h-8 text-xs">
                  <Send className="h-3 w-3 mr-1.5" aria-hidden="true" />
                  Submit to Transport Office
                </Button>
              </form>
            </Card>
          </div>

          {/* Right Column: Driver Info & Guidelines */}
          <div className="space-y-4">
            {/* Driver Profile */}
            <Card className="p-5 border shadow-card space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Designated Fleet Driver
              </h3>
              <div className="p-3 rounded-md bg-secondary/40 space-y-2 text-xs">
                <p className="font-semibold text-foreground text-sm">
                  {activeRoute.bus?.driver?.fullName || 'Assigned Driver'}
                </p>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
                  <span>{activeRoute.bus?.driver?.phone || '+91 94360 00000'}</span>
                </div>
                <p className="text-2xs text-muted-foreground">
                  License: {activeRoute.bus?.driver?.licenseNumber}
                </p>
              </div>
            </Card>

            {/* Safety Guidelines */}
            <Card className="p-5 border shadow-card space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Safety &amp; Boarding Policy
              </h3>
              <ul className="text-2xs text-muted-foreground space-y-2 list-disc pl-4">
                <li>Arrive at designated checkpoints at least 5 minutes prior to departure.</li>
                <li>Display student ID card upon entry.</li>
                <li>Seats are prioritized for physically challenged individuals and faculty.</li>
                <li>Report schedule irregularities immediately via the feedback form.</li>
              </ul>
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
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">{c.subject}</span>
                        <Badge
                          variant={c.status === 'resolved' ? 'success' : 'warning'}
                          className="text-2xs uppercase"
                        >
                          {c.status}
                        </Badge>
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
