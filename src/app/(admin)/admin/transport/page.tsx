'use client'

import React, { useState } from 'react'
import {
  Bus,
  Plus,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Trash2
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/lib/data/client-store'
import type { BusStatus } from '@/types'

export default function AdminTransportPage() {
  const { currentProfile, buses, routes, complaints, addBus, addRoute } = useAppStore()

  // Add Bus modal state
  const [showBusModal, setShowBusModal] = useState(false)
  const [busNumber, setBusNumber] = useState('')
  const [regNumber, setRegNumber] = useState('')
  const [capacity, setCapacity] = useState(50)
  const [driverName, setDriverName] = useState('')
  const [driverPhone, setDriverPhone] = useState('')

  // Add Route modal state
  const [showRouteModal, setShowRouteModal] = useState(false)
  const [routeName, setRouteName] = useState('')
  const [departureTime, setDepartureTime] = useState('08:00 AM')
  const [arrivalTime, setArrivalTime] = useState('08:45 AM')
  const [assignedBusId, setAssignedBusId] = useState(buses[0]?.id || '')

  const [feedback, setFeedback] = useState<string | null>(null)

  const handleAddBusSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!busNumber.trim()) return

    addBus({
      collegeId: currentProfile.collegeId,
      busNumber: busNumber.trim(),
      registrationNumber: regNumber.trim() || 'NL-01-B-0000',
      capacity: Number(capacity),
      status: 'active',
      driver: {
        id: `drv-${Date.now()}`,
        busId: null,
        fullName: driverName.trim() || 'Assigned Driver',
        phone: driverPhone.trim() || '+91 94360 00000',
        licenseNumber: 'NL-0120200000',
      },
    })

    setFeedback(`Bus ${busNumber} added to active campus fleet.`)
    setBusNumber('')
    setRegNumber('')
    setDriverName('')
    setDriverPhone('')
    setShowBusModal(false)
    setTimeout(() => setFeedback(null), 4000)
  }

  const handleAddRouteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!routeName.trim()) return

    const selectedBus = buses.find((b) => b.id === assignedBusId) || buses[0]

    addRoute({
      collegeId: currentProfile.collegeId,
      busId: assignedBusId,
      routeName: routeName.trim(),
      operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      departureTime,
      arrivalTime,
      isActive: true,
      bus: selectedBus,
      stops: [
        { id: `st-1`, routeId: '', stopName: 'Pickup Point A', stopOrder: 1, estimatedTime: departureTime },
        { id: `st-2`, routeId: '', stopName: 'Campus Terminal', stopOrder: 2, estimatedTime: arrivalTime },
      ],
    })

    setFeedback(`Transit Route "${routeName}" configured successfully.`)
    setRouteName('')
    setShowRouteModal(false)
    setTimeout(() => setFeedback(null), 4000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Transit Fleet &amp; Route Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Fleet maintenance, route schedules, driver assignments, and student complaint resolution
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowBusModal(true)} className="gap-1.5 text-xs">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Bus Vehicle
          </Button>
          <Button size="sm" onClick={() => setShowRouteModal(true)} className="gap-1.5 text-xs">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Route
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 text-xs rounded-md bg-success-50 text-success-600 border border-success-500/20 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Fleet Vehicles Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Active Fleet Vehicles ({buses.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {buses.map((bus) => (
            <Card key={bus.id} className="p-5 border shadow-card space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                    <Bus className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{bus.busNumber}</h3>
                    <p className="text-2xs text-muted-foreground">Registration: {bus.registrationNumber}</p>
                  </div>
                </div>
                <Badge variant="success" className="text-2xs uppercase">
                  {bus.status}
                </Badge>
              </div>

              <div className="p-2.5 rounded-md bg-secondary/30 text-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Assigned Driver:</span>
                  <span className="font-semibold text-foreground">{bus.driver?.fullName || 'Not assigned'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Driver Contact:</span>
                  <span className="font-mono">{bus.driver?.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Seating Capacity:</span>
                  <span>{bus.capacity || 50} passengers</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Student Complaints Resolution Queue */}
      <div className="space-y-3 pt-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Transit Service Complaints Queue ({complaints.length})
        </h2>
        <Card className="border shadow-card divide-y">
          {complaints.map((c) => (
            <div key={c.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant={c.status === 'resolved' ? 'success' : 'warning'} className="text-2xs uppercase">
                    {c.status}
                  </Badge>
                  <span className="font-semibold text-foreground text-sm">{c.subject}</span>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">{c.description}</p>
                {c.responseMessage && (
                  <p className="text-2xs text-primary font-medium">Logged Resolution: {c.responseMessage}</p>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <Button size="sm" variant="outline" className="h-7 text-2xs">
                  Respond &amp; Close Ticket
                </Button>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Add Bus Modal */}
      {showBusModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 border shadow-modal">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base font-bold">Register Campus Bus</CardTitle>
            </CardHeader>

            <form onSubmit={handleAddBusSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="bus-num">
                  Bus Identification
                </label>
                <Input
                  id="bus-num"
                  placeholder="e.g. Bus CC-03"
                  value={busNumber}
                  onChange={(e) => setBusNumber(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="bus-reg">
                    Registration No.
                  </label>
                  <Input
                    id="bus-reg"
                    placeholder="NL-01-B-7788"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="bus-cap">
                    Capacity
                  </label>
                  <Input
                    id="bus-cap"
                    type="number"
                    min={10}
                    max={100}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="drv-name">
                  Driver Name
                </label>
                <Input
                  id="drv-name"
                  placeholder="Driver Full Name"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="drv-phone">
                  Driver Mobile Contact
                </label>
                <Input
                  id="drv-phone"
                  placeholder="+91 94360 00000"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowBusModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Save Vehicle
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Add Route Modal */}
      {showRouteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 border shadow-modal">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base font-bold">Configure Transit Route</CardTitle>
            </CardHeader>

            <form onSubmit={handleAddRouteSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="rt-name">
                  Route Title
                </label>
                <Input
                  id="rt-name"
                  placeholder="e.g. Route 3: South Valley Express"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="rt-bus">
                  Assign Vehicle
                </label>
                <select
                  id="rt-bus"
                  value={assignedBusId}
                  onChange={(e) => setAssignedBusId(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                >
                  {buses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.busNumber} ({b.registrationNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="rt-dep">
                    Departure Time
                  </label>
                  <Input
                    id="rt-dep"
                    placeholder="07:45 AM"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="rt-arr">
                    Arrival Time
                  </label>
                  <Input
                    id="rt-arr"
                    placeholder="08:35 AM"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowRouteModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Publish Route
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
