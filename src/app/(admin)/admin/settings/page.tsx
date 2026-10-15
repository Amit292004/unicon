'use client'

import React, { useState } from 'react'
import {
  Building2,
  Settings,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  X,
  Globe,
  MapPin,
  ShieldCheck,
  Save,
  BookOpen
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/lib/data/client-store'
import type { Department } from '@/types'

export default function AdminSettingsPage() {
  const {
    currentProfile,
    college,
    departments,
    profiles,
    updateCollege,
    addDepartment,
    updateDepartment,
    deleteDepartment,
  } = useAppStore()

  const [actionMsg, setActionMsg] = useState<string | null>(null)

  // College form state
  const [collegeName, setCollegeName] = useState(college.name || '')
  const [collegeSlug, setCollegeSlug] = useState(college.slug || '')
  const [collegeDomain, setCollegeDomain] = useState(college.domain || '')
  const [collegeCity, setCollegeCity] = useState(college.city || '')
  const [collegeState, setCollegeState] = useState(college.state || '')
  const [collegeWebsite, setCollegeWebsite] = useState(college.websiteUrl || '')
  const [isVerified, setIsVerified] = useState(Boolean(college.isVerified))

  // Department Modal state
  const [showDeptModal, setShowDeptModal] = useState(false)
  const [editingDept, setEditingDept] = useState<Department | null>(null)
  const [deptName, setDeptName] = useState('')
  const [deptCode, setDeptCode] = useState('')

  const handleSaveCollege = (e: React.FormEvent) => {
    e.preventDefault()
    updateCollege({
      name: collegeName.trim(),
      slug: collegeSlug.trim(),
      domain: collegeDomain.trim() || null,
      city: collegeCity.trim() || null,
      state: collegeState.trim() || null,
      websiteUrl: collegeWebsite.trim() || null,
      isVerified,
    })
    setActionMsg('Institutional profile and campus metadata updated successfully.')
    setTimeout(() => setActionMsg(null), 3000)
  }

  const handleOpenAddDept = () => {
    setEditingDept(null)
    setDeptName('')
    setDeptCode('')
    setShowDeptModal(true)
  }

  const handleOpenEditDept = (dept: Department) => {
    setEditingDept(dept)
    setDeptName(dept.name)
    setDeptCode(dept.code)
    setShowDeptModal(true)
  }

  const handleDeleteDept = (id: string, name: string) => {
    if (typeof window !== 'undefined' && !window.confirm(`Delete department "${name}"? This action cannot be undone.`)) return
    deleteDepartment(id)
    setActionMsg(`Department "${name}" removed.`)
    setTimeout(() => setActionMsg(null), 3000)
  }

  const handleSaveDept = (e: React.FormEvent) => {
    e.preventDefault()
    if (!deptName.trim() || !deptCode.trim()) return

    if (editingDept) {
      updateDepartment(editingDept.id, {
        name: deptName.trim(),
        code: deptCode.trim().toUpperCase(),
      })
      setActionMsg(`Department "${deptName}" updated.`)
    } else {
      addDepartment({
        collegeId: college.id,
        name: deptName.trim(),
        code: deptCode.trim().toUpperCase(),
      })
      setActionMsg(`New department "${deptName}" established.`)
    }

    setShowDeptModal(false)
    setTimeout(() => setActionMsg(null), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-2xs uppercase">
              System Administration
            </Badge>
            <span className="text-2xs text-muted-foreground">&bull; Institution Config</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Institution &amp; Department Settings
          </h1>
          <p className="text-xs text-muted-foreground">
            Configure institutional profile, portal domain, official branding, and academic departmental divisions.
          </p>
        </div>

        <Button size="sm" onClick={handleOpenAddDept} className="gap-1.5 text-xs">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Department
        </Button>
      </div>

      {/* Action Notification */}
      {actionMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-md text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {actionMsg}
          </span>
          <Button size="icon-sm" variant="ghost" onClick={() => setActionMsg(null)} aria-label="Dismiss message">
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </div>
      )}

      {/* Two Column Layout: College Details & Departments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: College Profile Form */}
        <Card className="border shadow-card">
          <CardHeader className="border-b py-3 px-4">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" aria-hidden="true" />
              Institutional Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <form onSubmit={handleSaveCollege} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium">University / College Name *</label>
                <Input
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="e.g. National Institute of Technology, Nagaland"
                  required
                  className="text-xs h-8"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Institution Identifier Code *</label>
                  <Input
                    value={collegeSlug}
                    onChange={(e) => setCollegeSlug(e.target.value)}
                    placeholder="nit-nagaland"
                    required
                    className="text-xs h-8 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Campus Domain *</label>
                  <Input
                    value={collegeDomain}
                    onChange={(e) => setCollegeDomain(e.target.value)}
                    placeholder="nitnagaland.ac.in"
                    className="text-xs h-8 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">City</label>
                  <Input
                    value={collegeCity}
                    onChange={(e) => setCollegeCity(e.target.value)}
                    placeholder="Dimapur"
                    className="text-xs h-8"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">State / Province</label>
                  <Input
                    value={collegeState}
                    onChange={(e) => setCollegeState(e.target.value)}
                    placeholder="Nagaland"
                    className="text-xs h-8"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Official Portal URL</label>
                <Input
                  value={collegeWebsite}
                  onChange={(e) => setCollegeWebsite(e.target.value)}
                  placeholder="https://nitnagaland.ac.in"
                  className="text-xs h-8"
                />
              </div>

              <div className="flex items-center gap-2 p-3 rounded-md border bg-muted/20">
                <input
                  type="checkbox"
                  id="verified-checkbox"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                />
                <label htmlFor="verified-checkbox" className="text-xs font-medium cursor-pointer">
                  Accredited &amp; Officially Verified Campus
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" size="sm" className="gap-1.5 text-xs">
                  <Save className="h-3.5 w-3.5" aria-hidden="true" />
                  Save Institutional Profile
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Right Column: Academic Departments */}
        <Card className="border shadow-card flex flex-col justify-between">
          <div>
            <CardHeader className="border-b py-3 px-4 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
                Configured Academic Departments ({departments.length})
              </CardTitle>
              <Button size="xs" variant="outline" onClick={handleOpenAddDept} className="text-2xs gap-1">
                <Plus className="h-3 w-3" aria-hidden="true" />
                Add Dept
              </Button>
            </CardHeader>
            <CardContent className="p-0 divide-y max-h-[500px] overflow-y-auto">
              {departments.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No departments created yet.
                </div>
              ) : (
                departments.map((dept) => {
                  const studentCount = profiles.filter((p) => p.departmentId === dept.id).length
                  return (
                    <div key={dept.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-muted/10 transition">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-foreground">{dept.name}</span>
                          <Badge variant="outline" className="text-2xs font-mono">
                            {dept.code}
                          </Badge>
                        </div>
                        <p className="text-2xs text-muted-foreground">
                          {studentCount} enrolled student profile(s)
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => handleOpenEditDept(dept)}
                          title="Edit Department"
                          aria-label="Edit department"
                        >
                          <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteDept(dept.id, dept.name)}
                          title="Delete Department"
                          aria-label="Delete department"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </div>
        </Card>
      </div>

      {/* Department Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
          <div className="bg-card border rounded-lg shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
                {editingDept ? 'Modify Department' : 'Create Academic Department'}
              </h2>
              <Button size="icon-sm" variant="ghost" onClick={() => setShowDeptModal(false)} aria-label="Close dialog">
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>

            <form onSubmit={handleSaveDept} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Department Title *</label>
                <Input
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="Computer Science & Engineering"
                  required
                  className="text-xs h-8"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Department Abbreviation / Code *</label>
                <Input
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value)}
                  placeholder="CSE"
                  required
                  className="text-xs h-8 font-mono uppercase"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowDeptModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  {editingDept ? 'Save Changes' : 'Create Department'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
