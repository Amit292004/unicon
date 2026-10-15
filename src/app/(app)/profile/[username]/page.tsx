'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  User,
  GraduationCap,
  Calendar,
  Building2,
  Mail,
  Phone,
  Hash,
  Settings,
  Edit3,
  FileText,
  ClipboardList,
  Compass,
  Download,
  ExternalLink,
  Code2,
  Plus,
  Heart,
  MessageCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { UserAvatar } from '@/components/shared/user-avatar'
import { EmptyState } from '@/components/shared/empty-state'
import { ResourceFileIcon } from '@/components/shared/resource-file-icon'
import { useAppStore } from '@/lib/data/client-store'
import { formatDate, formatRelativeTime } from '@/lib/utils'

export default function StudentProfilePage() {
  const params = useParams()
  const username = params?.username as string
  const { currentProfile, profiles, posts, notes, pyqs, projects, addProject } = useAppStore()

  const [activeTab, setActiveTab] = useState<'posts' | 'notes' | 'pyqs' | 'projects'>('posts')
  const [showAddProjectModal, setShowAddProjectModal] = useState(false)

  // Project form state
  const [projectTitle, setProjectTitle] = useState('')
  const [projectDesc, setProjectDesc] = useState('')
  const [projectTech, setProjectTech] = useState('')
  const [projectRepo, setProjectRepo] = useState('')
  const [projectLive, setProjectLive] = useState('')

  // Find profile
  const profile =
    profiles.find((p) => p.username.toLowerCase() === username.toLowerCase()) ||
    currentProfile

  const isOwner = currentProfile.id === profile.id

  // Tab data filtered by this profile
  const userPosts = posts.filter((p) => p.authorId === profile.id)
  const userNotes = notes.filter((n) => n.authorId === profile.id)
  const userPYQs = pyqs.filter((p) => p.authorId === profile.id)
  const userProjects = projects.filter((p) => p.authorId === profile.id)

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectTitle.trim() || !projectDesc.trim()) return

    const techs = projectTech
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    addProject({
      collegeId: currentProfile.collegeId,
      authorId: currentProfile.id,
      title: projectTitle.trim(),
      description: projectDesc.trim(),
      technologies: techs.length > 0 ? techs : ['TypeScript', 'React'],
      coverImageUrl: null,
      repoUrl: projectRepo.trim() || null,
      liveUrl: projectLive.trim() || null,
    })

    setProjectTitle('')
    setProjectDesc('')
    setProjectTech('')
    setProjectRepo('')
    setProjectLive('')
    setShowAddProjectModal(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="p-6 sm:p-8 border shadow-card">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <UserAvatar
            name={profile.fullName}
            avatarUrl={profile.avatarUrl}
            size="xl"
            className="h-24 w-24 sm:h-28 sm:w-28 text-2xl border-4 border-background shadow-md shrink-0"
          />

          <div className="space-y-3 flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {profile.fullName}
                </h1>
                <p className="text-xs text-muted-foreground font-mono">@{profile.username}</p>
              </div>

              {isOwner ? (
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Link href="/settings">
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                      <Settings className="h-3.5 w-3.5" aria-hidden="true" />
                      Settings
                    </Button>
                  </Link>
                </div>
              ) : (
                <Link href={`/messages?user=${profile.id}`}>
                  <Button size="sm" className="h-8 gap-1.5 text-xs">
                    Send Message
                  </Button>
                </Link>
              )}
            </div>

            {profile.bio && (
              <p className="text-xs text-foreground leading-relaxed max-w-xl">
                {profile.bio}
              </p>
            )}

            {/* Academic Badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-2xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                {profile.college?.name}
              </span>
              <span className="flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                {profile.department?.name || 'General Department'}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Class of {profile.expectedGraduationYear || '2027'} (Joined {profile.yearOfJoining || '2023'})
              </span>
            </div>

            {/* Private Details (Only visible to the account owner) */}
            {isOwner && (
              <div className="border-t pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-2xs text-muted-foreground bg-muted/30 p-2.5 rounded-md">
                <div className="flex items-center gap-1 font-mono">
                  <Hash className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                  <span>Roll: {profile.rollNumber}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                  <span>Email: {profile.email}</span>
                </div>
                {profile.phoneNumber && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                    <span>Phone: {profile.phoneNumber}</span>
                  </div>
                )}
                <span className="text-2xs text-primary font-medium ml-auto">Private to you</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Exactly FOUR Primary Profile Tabs */}
      <div className="flex border-b text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 pb-3 px-4 border-b-2 transition ${
            activeTab === 'posts'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <span>Posts ({userPosts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-2 pb-3 px-4 border-b-2 transition ${
            activeTab === 'notes'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <span>Notes ({userNotes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pyqs')}
          className={`flex items-center gap-2 pb-3 px-4 border-b-2 transition ${
            activeTab === 'pyqs'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <span>PYQs ({userPYQs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-2 pb-3 px-4 border-b-2 transition ${
            activeTab === 'projects'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <span>Projects ({userProjects.length})</span>
        </button>
      </div>

      {/* Tab 1: Posts */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {userPosts.length === 0 ? (
            <EmptyState
              icon={Edit3}
              title="No posts published"
              description={`${profile.fullName} has not published any community updates yet.`}
            />
          ) : (
            userPosts.map((post) => (
              <Card key={post.id} className="p-4 border shadow-card space-y-2 text-xs">
                <div className="flex items-center justify-between text-2xs text-muted-foreground">
                  <span>{formatRelativeTime(post.createdAt)}</span>
                  <Badge variant="outline" className="text-2xs capitalize">
                    {post.type.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
                <div className="flex items-center gap-4 text-muted-foreground border-t pt-2 mt-2">
                  <span className="flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5" aria-hidden="true" />
                    {post.likesCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    {post.commentsCount}
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Notes */}
      {activeTab === 'notes' && (
        <div className="space-y-3">
          {userNotes.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No uploaded notes"
              description="No academic note packages uploaded by this student."
            />
          ) : (
            userNotes.map((note) => (
              <Card key={note.id} className="p-4 border shadow-card flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <ResourceFileIcon mimeType="application/pdf" fileName={note.fileName} size="sm" />
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{note.title}</h3>
                    <p className="text-2xs text-muted-foreground mt-0.5">
                      {note.subject} &bull; Semester {note.semester}
                    </p>
                  </div>
                </div>

                <a href={note.fileUrl} download={note.fileName} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="h-8 gap-1 text-xs">
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    Download
                  </Button>
                </a>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab 3: PYQs */}
      {activeTab === 'pyqs' && (
        <div className="space-y-3">
          {userPYQs.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No PYQs contributed"
              description="No previous year question papers contributed by this student."
            />
          ) : (
            userPYQs.map((pyq) => (
              <Card key={pyq.id} className="p-4 border shadow-card flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <ResourceFileIcon mimeType="application/pdf" fileName={pyq.fileName} size="sm" />
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{pyq.title}</h3>
                    <p className="text-2xs text-muted-foreground mt-0.5">
                      {pyq.subject} &bull; Year {pyq.examYear} &bull; Sem {pyq.semester}
                    </p>
                  </div>
                </div>

                <a href={pyq.fileUrl} download={pyq.fileName} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="h-8 gap-1 text-xs">
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    Download
                  </Button>
                </a>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Projects */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          {isOwner && (
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setShowAddProjectModal(true)} className="gap-1.5 text-xs">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add Student Project
              </Button>
            </div>
          )}

          {userProjects.length === 0 ? (
            <EmptyState
              icon={Compass}
              title="No showcase projects"
              description="No projects added to showcase yet."
              action={
                isOwner ? (
                  <Button size="sm" onClick={() => setShowAddProjectModal(true)}>
                    Add Your First Project
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userProjects.map((proj) => (
                <Card key={proj.id} className="p-5 border shadow-card flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-foreground">{proj.title}</h3>
                      <span className="text-2xs text-muted-foreground">
                        {formatDate(proj.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {proj.description}
                    </p>

                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {proj.technologies.map((tech, idx) => (
                          <Badge key={idx} variant="outline" className="text-2xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {proj.repoUrl && (
                        <a href={proj.repoUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline" className="h-7 text-2xs gap-1">
                            <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
                            Repository
                          </Button>
                        </a>
                      )}
                      {proj.liveUrl && (
                        <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline" className="h-7 text-2xs gap-1">
                            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                            Live Demo
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Project Modal */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 border shadow-modal">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base font-bold">Add Portfolio Project</CardTitle>
            </CardHeader>

            <form onSubmit={handleAddProject} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="proj-title">
                  Project Title
                </label>
                <Input
                  id="proj-title"
                  placeholder="e.g. Distributed Consensus Engine"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="proj-desc">
                  Project Description
                </label>
                <textarea
                  id="proj-desc"
                  placeholder="Architecture overview, problem solved, impact..."
                  className="w-full min-h-[70px] rounded-md border border-input bg-background p-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="proj-tech">
                  Technologies (comma-separated)
                </label>
                <Input
                  id="proj-tech"
                  placeholder="TypeScript, Next.js, Postgres"
                  value={projectTech}
                  onChange={(e) => setProjectTech(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="proj-repo">
                    Source Code URL
                  </label>
                  <Input
                    id="proj-repo"
                    placeholder="https://github.com/..."
                    value={projectRepo}
                    onChange={(e) => setProjectRepo(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="proj-live">
                    Live Demo URL
                  </label>
                  <Input
                    id="proj-live"
                    placeholder="https://..."
                    value={projectLive}
                    onChange={(e) => setProjectLive(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddProjectModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Save Project
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
