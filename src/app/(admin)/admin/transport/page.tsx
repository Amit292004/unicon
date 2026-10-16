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
  Trash2,
  Edit3,
  MessageSquare,
  X,
  Compass
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useAppStore, TransportComplaintRecord } from '@/lib/data/client-store'
import type { Bus as BusType, Route as RouteType, BusStatus } from '@/types'

export default function AdminTransportPage() {
  const {
    currentProfile,
    buses,
    routes,
    complaints,
    addBus,
    updateBus,
    deleteBus,
    addRoute,
    updateRoute,
    deleteRoute,
    updateComplaint,
    deleteComplaint,
  } = useAppStore()

  // Bus Modal State
  const [showBusModal, setShowBusModal] = useState(false)
  const [editingBus, setEditingBus] = useState<BusType | null>(null)
  const [busNumber, setBusNumber] = useState('')
  const [regNumber, setRegNumber] = useState('')
  const [capacity, setCapacity] = useState(50)
  const [busStatus, setBusStatus] = useState<BusStatus>('active')
  const [driverName, setDriverName] = useState('')
  const [driverPhone, setDriverPhone] = useState('')
  const [driverLicense, setDriverLicense] = useState('')

  // Route Modal State
  const [showRouteModal, setShowRouteModal] = useState(false)
  const [editingRoute, setEditingRoute] = useState<RouteType | null>(null)
  const [routeName, setRouteName] = useState('')
  const [departureTime, setDepartureTime] = useState('08:00 AM')
  const [arrivalTime, setArrivalTime] = useState('08:45 AM')
  const [assignedBusId, setAssignedBusId] = useState('')
  const [stopsInput, setStopsInput] = useState('Pickup Point A (08:00 AM), Campus Terminal (08:45 AM)')

  // Complaint Response Modal State
  const [showComplaintModal, setShowComplaintModal] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState<TransportComplaintRecord | null>(null)
  const [complaintResponse, setComplaintResponse] = useState('')
  const [complaintStatus, setComplaintStatus] = useState<'open' | 'in_progress' | 'resolved'>('resolved')

  const [feedback, setFeedback] = useState<string | null>(null)

  // Handlers for Bus
  const handleOpenAddBus = () => {
    setEditingBus(null)
    setBusNumber('')
    setRegNumber('')
    setCapacity(50)
    setBusStatus('active')
    setDriverName('')
    setDriverPhone('')
    setDriverLicense('')
    setShowBusModal(true)
  }

  const handleOpenEditBus = (bus: BusType) => {
    setEditingBus(bus)
    setBusNumber(bus.busNumber)
    setRegNumber(bus.registrationNumber || '')
    setCapacity(bus.capacity || 50)
    setBusStatus(bus.status)
    setDriverName(bus.driver?.fullName || '')
    setDriverPhone(bus.driver?.phone || '')
    setDriverLicense(bus.driver?.licenseNumber || '')
    setShowBusModal(true)
  }

  const handleDeleteBus = (id: string, name: string) => {
    if (typeof window !== 'undefined' && !window.confirm(`Are you sure you want to remove bus "${name}" from the fleet?`)) {
      return
    }
    deleteBus(id)
    setFeedback(`Bus vehicle "${name}" removed.`)
    setTimeout(() => setFeedback(null), 4000)
  }

  const handleBusSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!busNumber.trim()) return

    if (editingBus) {
      updateBus(editingBus.id, {
        busNumber: busNumber.trim(),
        registrationNumber: regNumber.trim() || 'NL-01-B-0000',
        capacity: Number(capacity),
        status: busStatus,
        driver: {
          id: editingBus.driver?.id || `drv-${Date.now()}`,
          busId: editingBus.id,
          fullName: driverName.trim() || 'Assigned Driver',
          phone: driverPhone.trim() || '+91 94360 00000',
          licenseNumber: driverLicense.trim() || 'NL-0120200000',
        },
      })
      setFeedback(`Vehicle "${busNumber}" updated successfully.`)
    } else {
      addBus({
        collegeId: currentProfile.collegeId,
        busNumber: busNumber.trim(),
        registrationNumber: regNumber.trim() || 'NL-01-B-0000',
        capacity: Number(capacity),
        status: busStatus,
        driver: {
          id: `drv-${Date.now()}`,
          busId: null,
          fullName: driverName.trim() || 'Assigned Driver',
          phone: driverPhone.trim() || '+91 94360 00000',
          licenseNumber: driverLicense.trim() || 'NL-0120200000',
        },
      })
      setFeedback(`Bus "${busNumber}" registered in active fleet.`)
    }

    setShowBusModal(false)
    setEditingBus(null)
    setTimeout(() => setFeedback(null), 4000)
  }

  // Handlers for Route
  const handleOpenAddRoute = () => {
    setEditingRoute(null)
    setRouteName('')
    setDepartureTime('08:00 AM')
    setArrivalTime('08:45 AM')
    setAssignedBusId(buses[0]?.id || '')
    setStopsInput('City Clock Tower (08:00 AM), High School Gate (08:25 AM), Campus Terminal (08:45 AM)')
    setShowRouteModal(true)
  }

  const handleOpenEditRoute = (route: RouteType) => {
    setEditingRoute(route)
    setRouteName(route.routeName)
    setDepartureTime(route.departureTime || '08:00 AM')
    setArrivalTime(route.arrivalTime || '08:45 AM')
    setAssignedBusId(route.busId || buses[0]?.id || '')
    const stopsStr = route.stops?.map((s) => `${s.stopName} (${s.estimatedTime || ''})`).join(', ')
    setStopsInput(stopsStr || '')
    setShowRouteModal(true)
  }

  const handleDeleteRoute = (id: string, name: string) => {
    if (typeof window !== 'undefined' && !window.confirm(`Are you sure you want to delete route "${name}"?`)) {
      return
    }
    deleteRoute(id)
    setFeedback(`Transit Route "${name}" deleted.`)
    setTimeout(() => setFeedback(null), 4000)
  }

  const handleRouteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!routeName.trim()) return

    const selectedBus = buses.find((b) => b.id === assignedBusId) || buses[0]

    // Parse stops from comma-separated input
    const parsedStops = stopsInput
      .split(',')
      .map((item, index) => {
        const trimmed = item.trim()
        const match = trimmed.match(/^(.*?)(?:\s*\((.*?)\))?$/)
        const stopName = match?.[1]?.trim() || trimmed
        const estimatedTime = match?.[2]?.trim() || (index === 0 ? departureTime : arrivalTime)
        return {
          id: `st-${Date.now()}-${index}`,
          routeId: editingRoute?.id || '',
          stopName,
          stopOrder: index + 1,
          estimatedTime,
        }
      })
      .filter((s) => Boolean(s.stopName))

    if (editingRoute) {
      updateRoute(editingRoute.id, {
        routeName: routeName.trim(),
        busId: assignedBusId || null,
        departureTime,
        arrivalTime,
        bus: selectedBus,
        stops: parsedStops.length > 0 ? parsedStops : editingRoute.stops,
      })
      setFeedback(`Route "${routeName}" updated.`)
    } else {
      addRoute({
        collegeId: currentProfile.collegeId,
        busId: assignedBusId || null,
        routeName: routeName.trim(),
        operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        departureTime,
        arrivalTime,
        isActive: true,
        bus: selectedBus,
        stops: parsedStops.length > 0 ? parsedStops : [
          { id: `st-1`, routeId: '', stopName: 'Pickup Point A', stopOrder: 1, estimatedTime: departureTime },
          { id: `st-2`, routeId: '', stopName: 'Campus Terminal', stopOrder: 2, estimatedTime: arrivalTime },
        ],
      })
      setFeedback(`Route "${routeName}" successfully configured.`)
    }

    setShowRouteModal(false)
    setEditingRoute(null)
    setTimeout(() => setFeedback(null), 4000)
  }

  // Handlers for Complaints
  const handleOpenRespondComplaint = (c: TransportComplaintRecord) => {
    setSelectedComplaint(c)
    setComplaintResponse(c.responseMessage || '')
    setComplaintStatus(c.status === 'open' ? 'in_progress' : c.status)
    setShowComplaintModal(true)
  }

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedComplaint) return

    updateComplaint(selectedComplaint.id, {
      status: complaintStatus,
      responseMessage: complaintResponse.trim() || undefined,
    })

    setFeedback(`Complaint ticket "${selectedComplaint.subject}" updated to ${complaintStatus}.`)
    setShowComplaintModal(false)
    setSelectedComplaint(null)
    setTimeout(() => setFeedback(null), 4000)
  }

  const handleDeleteComplaint = (id: string, subject: string) => {
    if (typeof window !== 'undefined' && !window.confirm(`Delete complaint ticket "${subject}"?`)) {
      return
    }
    deleteComplaint(id)
    setFeedback(`Complaint ticket removed.`)
    setTimeout(() => setFeedback(null), 4000)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Transit Fleet &amp; Logistics Control
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Full management for buses, transit route schedules, and student complaint ticket resolution
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleOpenAddBus} className="gap-1.5 text-xs">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Register Bus
          </Button>
          <Button size="sm" onClick={handleOpenAddRoute} className="gap-1.5 text-xs">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Configure Route
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 text-xs rounded-md bg-success-50 text-success-600 border border-success-500/20 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Section 1: Fleet Vehicles Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Bus className="h-4 w-4 text-primary" aria-hidden="true" />
            Active Fleet Vehicles ({buses.length})
          </h2>
          <Button size="sm" variant="ghost" onClick={handleOpenAddBus} className="h-7 text-xs text-primary">
            + Add Vehicle
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {buses.map((bus) => (
            <Card key={bus.id} className="p-5 border shadow-card space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Bus className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-foreground">{bus.busNumber}</h3>
                      <p className="text-2xs text-muted-foreground">Reg: {bus.registrationNumber}</p>
                    </div>
                  </div>
                  <Badge
                    variant={bus.status === 'active' ? 'success' : bus.status === 'maintenance' ? 'warning' : 'outline'}
                    className="text-2xs uppercase"
                  >
                    {bus.status}
                  </Badge>
                </div>

                <div className="p-2.5 rounded-md bg-secondary/30 text-2xs space-y-1.5">
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
                  {bus.driver?.licenseNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Driver License:</span>
                      <span className="font-mono">{bus.driver.licenseNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-2.5 flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-2xs gap-1"
                  onClick={() => handleOpenEditBus(bus)}
                >
                  <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-2xs gap-1 text-destructive-600 hover:bg-destructive-50"
                  onClick={() => handleDeleteBus(bus.id, bus.busNumber)}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Section 2: Transit Routes Management */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Compass className="h-4 w-4 text-primary" aria-hidden="true" />
            Configured Transit Routes ({routes.length})
          </h2>
          <Button size="sm" variant="ghost" onClick={handleOpenAddRoute} className="h-7 text-xs text-primary">
            + Add Route
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {routes.map((rt) => (
            <Card key={rt.id} className="p-5 border shadow-card flex flex-col justify-between space-y-3">
              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{rt.routeName}</h3>
                    <p className="text-2xs text-muted-foreground mt-0.5">
                      Assigned Vehicle: <span className="font-medium text-foreground">{rt.bus?.busNumber || 'None'}</span>
                    </p>
                  </div>
                  <Badge variant="outline" className="text-2xs">
                    {rt.departureTime} &rarr; {rt.arrivalTime}
                  </Badge>
                </div>

                <div className="p-2.5 rounded-md bg-secondary/30 text-2xs space-y-1">
                  <div className="text-muted-foreground font-semibold">Route Stops:</div>
                  <div className="flex flex-wrap gap-1">
                    {rt.stops?.map((st, i) => (
                      <span key={st.id || i} className="bg-background px-1.5 py-0.5 rounded border text-foreground">
                        {st.stopOrder}. {st.stopName} ({st.estimatedTime})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t pt-2.5 flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-2xs gap-1"
                  onClick={() => handleOpenEditRoute(rt)}
                >
                  <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                  Edit Route
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-2xs gap-1 text-destructive-600 hover:bg-destructive-50"
                  onClick={() => handleDeleteRoute(rt.id, rt.routeName)}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Section 3: Student Complaints Resolution Queue */}
      <div className="space-y-3 pt-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <AlertCircle className="h-4 w-4 text-warning-600" aria-hidden="true" />
          Transit Service Complaints Queue ({complaints.length})
        </h2>

        {complaints.length === 0 ? (
          <div className="p-8 text-center border rounded-lg bg-card text-muted-foreground text-xs">
            No transit complaints filed.
          </div>
        ) : (
          <Card className="border shadow-card divide-y">
            {complaints.map((c) => (
              <div key={c.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={c.status === 'resolved' ? 'success' : c.status === 'in_progress' ? 'warning' : 'destructive'} className="text-2xs uppercase">
                      {c.status}
                    </Badge>
                    <span className="font-semibold text-foreground text-sm">{c.subject}</span>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">{c.description}</p>
                  {c.responseMessage && (
                    <div className="text-2xs text-primary font-medium bg-primary/5 p-2 rounded border border-primary/20">
                      Logged Resolution: {c.responseMessage}
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-2xs gap-1"
                    onClick={() => handleOpenRespondComplaint(c)}
                  >
                    <MessageSquare className="h-3 w-3" aria-hidden="true" />
                    Respond &amp; Resolve
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="outline"
                    className="h-7 w-7 text-destructive-600 hover:bg-destructive-50"
                    onClick={() => handleDeleteComplaint(c.id, c.subject)}
                    title="Delete complaint ticket"
                  >
                    <Trash2 className="h-3 w-3" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>

      {/* Add / Edit Bus Modal */}
      {showBusModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 border shadow-modal max-h-[90vh] overflow-y-auto">
            <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">
                {editingBus ? 'Edit Fleet Vehicle' : 'Register Campus Bus'}
              </CardTitle>
              <Button size="icon-sm" variant="ghost" onClick={() => setShowBusModal(false)}>
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </CardHeader>

            <form onSubmit={handleBusSubmit} className="space-y-3">
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
                <label className="text-xs font-medium text-foreground" htmlFor="bus-status">
                  Operational Status
                </label>
                <select
                  id="bus-status"
                  value={busStatus}
                  onChange={(e) => setBusStatus(e.target.value as BusStatus)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                >
                  <option value="active">Active Service</option>
                  <option value="maintenance">Under Maintenance</option>
                  <option value="inactive">Inactive / Standby</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="drv-name">
                  Assigned Driver Name
                </label>
                <Input
                  id="drv-name"
                  placeholder="Driver Full Name"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="drv-phone">
                    Driver Mobile
                  </label>
                  <Input
                    id="drv-phone"
                    placeholder="+91 94360 00000"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="drv-lic">
                    License Number
                  </label>
                  <Input
                    id="drv-lic"
                    placeholder="NL-012019..."
                    value={driverLicense}
                    onChange={(e) => setDriverLicense(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowBusModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  {editingBus ? 'Save Changes' : 'Save Vehicle'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Add / Edit Route Modal */}
      {showRouteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 border shadow-modal max-h-[90vh] overflow-y-auto">
            <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">
                {editingRoute ? 'Edit Transit Route' : 'Configure Transit Route'}
              </CardTitle>
              <Button size="icon-sm" variant="ghost" onClick={() => setShowRouteModal(false)}>
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </CardHeader>

            <form onSubmit={handleRouteSubmit} className="space-y-3">
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

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="rt-stops">
                  Checkpoints &amp; Stops (Comma separated)
                </label>
                <textarea
                  id="rt-stops"
                  placeholder="Stop 1 (08:00 AM), Stop 2 (08:20 AM), Stop 3 (08:45 AM)"
                  className="w-full min-h-[70px] rounded-md border border-input bg-background p-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  value={stopsInput}
                  onChange={(e) => setStopsInput(e.target.value)}
                />
                <p className="text-2xs text-muted-foreground">Format: Stop Name (Estimated Time)</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowRouteModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  {editingRoute ? 'Update Route' : 'Publish Route'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Respond to Complaint Modal */}
      {showComplaintModal && selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 border shadow-modal">
            <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">Respond &amp; Update Ticket</CardTitle>
              <Button size="icon-sm" variant="ghost" onClick={() => setShowComplaintModal(false)}>
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </CardHeader>

            <form onSubmit={handleComplaintSubmit} className="space-y-3">
              <div className="p-2.5 rounded bg-muted/40 text-xs space-y-1">
                <p className="font-semibold text-foreground">{selectedComplaint.subject}</p>
                <p className="text-muted-foreground text-2xs">{selectedComplaint.description}</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="cmp-status">
                  Update Ticket Status
                </label>
                <select
                  id="cmp-status"
                  value={complaintStatus}
                  onChange={(e) => setComplaintStatus(e.target.value as 'open' | 'in_progress' | 'resolved')}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                >
                  <option value="in_progress">In Progress (Investigating)</option>
                  <option value="resolved">Resolved / Closed</option>
                  <option value="open">Re-open Ticket</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="cmp-reply">
                  Official Administrative Response
                </label>
                <textarea
                  id="cmp-reply"
                  placeholder="Explain actions taken (e.g., driver notified, schedule adjusted)..."
                  className="w-full min-h-[80px] rounded-md border border-input bg-background p-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  value={complaintResponse}
                  onChange={(e) => setComplaintResponse(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowComplaintModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Commit Resolution
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
