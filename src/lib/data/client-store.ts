'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Profile,
  Notice,
  Post,
  Note,
  PYQ,
  Project,
  LostFoundReport,
  LostFoundClaim,
  Bus,
  Route,
  Message,
  Conversation,
  Notification,
  Theme
} from '@/types'
import {
  SEEDED_PROFILES,
  SEEDED_NOTICES,
  SEEDED_POSTS,
  SEEDED_NOTES,
  SEEDED_PYQS,
  SEEDED_PROJECTS,
  SEEDED_LOST_FOUND,
  SEEDED_BUSES,
  SEEDED_ROUTES
} from './store'

export interface TransportComplaintRecord {
  id: string
  studentId: string
  busId: string | null
  subject: string
  description: string
  status: 'open' | 'in_progress' | 'resolved'
  responseMessage?: string
  createdAt: string
}

interface AppStore {
  currentProfile: Profile
  theme: Theme
  profiles: Profile[]
  notices: Notice[]
  posts: Post[]
  notes: Note[]
  pyqs: PYQ[]
  projects: Project[]
  lostFoundReports: LostFoundReport[]
  buses: Bus[]
  routes: Route[]
  complaints: TransportComplaintRecord[]
  messages: Message[]
  conversations: Conversation[]
  notifications: Notification[]
  savedItemIds: string[]

  // Actions
  setProfile: (profile: Profile) => void
  setTheme: (theme: Theme) => void
  loginAs: (email: string) => boolean
  logout: () => void

  // Notices
  addNotice: (notice: Omit<Notice, 'id' | 'createdAt' | 'author'>) => void
  updateNoticeStatus: (id: string, status: Notice['status']) => void

  // Posts
  addPost: (content: string, type?: Post['type']) => void
  toggleLikePost: (postId: string) => void

  // Academic resources
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'author' | 'downloadCount'>) => void
  addPYQ: (pyq: Omit<PYQ, 'id' | 'createdAt' | 'author' | 'downloadCount'>) => void
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'author'>) => void

  // Lost & Found
  addLostFoundReport: (report: Omit<LostFoundReport, 'id' | 'createdAt' | 'reporter' | 'claims'>) => string
  submitClaim: (reportId: string, message: string) => void
  resolveClaim: (reportId: string, claimId: string, status: 'accepted' | 'rejected', responseMsg?: string) => void
  updateReportStatus: (reportId: string, status: LostFoundReport['status']) => void

  // Transport
  addComplaint: (subject: string, description: string, busId?: string | null) => void
  addBus: (bus: Omit<Bus, 'id'>) => void
  addRoute: (route: Omit<Route, 'id'>) => void

  // Messaging
  sendMessage: (recipientId: string, content: string) => void

  // Saved Items
  toggleSaveItem: (resourceId: string) => void

  // Notifications
  markNotificationAsRead: (id: string) => void
  markAllNotificationsAsRead: () => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      currentProfile: SEEDED_PROFILES[0], // Alex Chen by default
      theme: 'light',
      profiles: SEEDED_PROFILES,
      notices: SEEDED_NOTICES,
      posts: SEEDED_POSTS,
      notes: SEEDED_NOTES,
      pyqs: SEEDED_PYQS,
      projects: SEEDED_PROJECTS,
      lostFoundReports: SEEDED_LOST_FOUND,
      buses: SEEDED_BUSES,
      routes: SEEDED_ROUTES,
      complaints: [
        {
          id: 'cmp-001',
          studentId: 'usr-student-001',
          busId: 'bus-001',
          subject: 'Morning service delay at High School Gate',
          description: 'Bus CC-01 arrived 20 minutes behind scheduled departure on Wednesday morning due to route congestion.',
          status: 'in_progress',
          responseMessage: 'Operations supervisor has reassigned route checkpoint times.',
          createdAt: '2026-10-14T09:00:00Z',
        },
      ],
      messages: [
        {
          id: 'msg-001',
          conversationId: 'cnv-001',
          senderId: 'usr-student-002',
          content: 'Hi Alex! Did you manage to verify the question paper pattern for OS midterms?',
          isDeleted: false,
          createdAt: '2026-10-14T17:00:00Z',
          sender: {
            fullName: 'Priya Sharma',
            username: 'priya_sharma',
            avatarUrl: null,
          },
        },
        {
          id: 'msg-002',
          conversationId: 'cnv-001',
          senderId: 'usr-student-001',
          content: 'Yes! The exam cell confirmed it covers units 1 to 3 with 50% analytical problems. I just uploaded the lecture summary notes to the Notes tab.',
          isDeleted: false,
          createdAt: '2026-10-14T17:05:00Z',
          sender: {
            fullName: 'Alex Chen',
            username: 'alex_chen',
            avatarUrl: null,
          },
        },
      ],
      conversations: [
        {
          id: 'cnv-001',
          lastMessageAt: '2026-10-14T17:05:00Z',
          lastMessagePreview: 'Yes! The exam cell confirmed it covers units 1 to 3...',
          participants: [
            { id: 'usr-student-001', fullName: 'Alex Chen', username: 'alex_chen', avatarUrl: null },
            { id: 'usr-student-002', fullName: 'Priya Sharma', username: 'priya_sharma', avatarUrl: null },
          ],
          unreadCount: 0,
        },
      ],
      notifications: [
        {
          id: 'ntf-001',
          userId: 'usr-student-001',
          type: 'notice',
          title: 'New Exam Timetable Published',
          body: 'Spring 2026 Mid-Semester Timetable is now available under Notices.',
          resourceType: 'notice',
          resourceId: 'not-001',
          isRead: false,
          createdAt: '2026-10-14T08:35:00Z',
        },
        {
          id: 'ntf-002',
          userId: 'usr-student-001',
          type: 'lost_found_match',
          title: 'Potential match for your lost item',
          body: 'Priya Sharma reported finding a Casio fx-991EX calculator in Room 204.',
          resourceType: 'lost_found',
          resourceId: 'lf-002',
          isRead: false,
          createdAt: '2026-10-14T13:46:00Z',
        },
      ],
      savedItemIds: ['nte-001', 'pyq-001'],

      setProfile: (profile) => {
        set({ currentProfile: profile })
        if (typeof document !== 'undefined') {
          document.cookie = `cc_demo_user=${profile.email}; path=/; max-age=86400; SameSite=Lax`
        }
      },

      setTheme: (theme) => {
        set({ theme })
        if (typeof document !== 'undefined') {
          const root = document.documentElement
          if (theme === 'dark') {
            root.classList.add('dark')
          } else {
            root.classList.remove('dark')
          }
        }
      },

      loginAs: (email: string) => {
        const found = get().profiles.find((p) => p.email.toLowerCase() === email.toLowerCase())
        if (found) {
          get().setProfile(found)
          return true
        }
        return false
      },

      logout: () => {
        if (typeof document !== 'undefined') {
          document.cookie = 'cc_demo_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        }
      },

      addNotice: (noticeData) => {
        const profile = get().currentProfile
        const newNotice: Notice = {
          ...noticeData,
          id: `not-${Date.now()}`,
          collegeId: profile.collegeId,
          authorId: profile.id,
          createdAt: new Date().toISOString(),
          publishedAt: noticeData.status === 'published' ? new Date().toISOString() : null,
          author: {
            fullName: profile.fullName,
            username: profile.username,
            avatarUrl: profile.avatarUrl,
          },
        }
        set((state) => ({ notices: [newNotice, ...state.notices] }))
      },

      updateNoticeStatus: (id, status) => {
        set((state) => ({
          notices: state.notices.map((n) => (n.id === id ? { ...n, status } : n)),
        }))
      },

      addPost: (content, type = 'text') => {
        const profile = get().currentProfile
        const newPost: Post = {
          id: `pst-${Date.now()}`,
          collegeId: profile.collegeId,
          authorId: profile.id,
          type,
          content,
          imageUrl: null,
          likesCount: 0,
          commentsCount: 0,
          createdAt: new Date().toISOString(),
          author: {
            fullName: profile.fullName,
            username: profile.username,
            avatarUrl: profile.avatarUrl,
          },
          hasLiked: false,
        }
        set((state) => ({ posts: [newPost, ...state.posts] }))
      },

      toggleLikePost: (postId) => {
        set((state) => ({
          posts: state.posts.map((p) => {
            if (p.id === postId) {
              const currentlyLiked = p.hasLiked ?? false
              return {
                ...p,
                hasLiked: !currentlyLiked,
                likesCount: currentlyLiked ? Math.max(0, p.likesCount - 1) : p.likesCount + 1,
              }
            }
            return p
          }),
        }))
      },

      addNote: (noteData) => {
        const profile = get().currentProfile
        const newNote: Note = {
          ...noteData,
          id: `nte-${Date.now()}`,
          collegeId: profile.collegeId,
          authorId: profile.id,
          downloadCount: 0,
          createdAt: new Date().toISOString(),
          author: { fullName: profile.fullName, username: profile.username },
        }
        set((state) => ({ notes: [newNote, ...state.notes] }))
      },

      addPYQ: (pyqData) => {
        const profile = get().currentProfile
        const newPYQ: PYQ = {
          ...pyqData,
          id: `pyq-${Date.now()}`,
          collegeId: profile.collegeId,
          authorId: profile.id,
          downloadCount: 0,
          createdAt: new Date().toISOString(),
          author: { fullName: profile.fullName, username: profile.username },
        }
        set((state) => ({ pyqs: [newPYQ, ...state.pyqs] }))
      },

      addProject: (projectData) => {
        const profile = get().currentProfile
        const newProject: Project = {
          ...projectData,
          id: `prj-${Date.now()}`,
          collegeId: profile.collegeId,
          authorId: profile.id,
          createdAt: new Date().toISOString(),
          author: { fullName: profile.fullName, username: profile.username, avatarUrl: profile.avatarUrl },
        }
        set((state) => ({ projects: [newProject, ...state.projects] }))
      },

      addLostFoundReport: (reportData) => {
        const profile = get().currentProfile
        const newId = `lf-${Date.now()}`
        const newReport: LostFoundReport = {
          ...reportData,
          id: newId,
          collegeId: profile.collegeId,
          reporterId: profile.id,
          status: 'active',
          createdAt: new Date().toISOString(),
          reporter: { fullName: profile.fullName, username: profile.username, avatarUrl: profile.avatarUrl },
          claims: [],
        }

        // Automatic matching detection
        const oppositeType = reportData.type === 'lost' ? 'found' : 'lost'
        const existingCandidates = get().lostFoundReports.filter(
          (r) => r.type === oppositeType && r.category === reportData.category && r.status === 'active'
        )

        const newNotifications: Notification[] = []
        if (existingCandidates.length > 0) {
          const matchTarget = existingCandidates[0]
          newNotifications.push({
            id: `ntf-${Date.now()}`,
            userId: reportData.type === 'lost' ? profile.id : matchTarget.reporterId,
            type: 'lost_found_match',
            title: 'Potential item match identified',
            body: `Your report for "${reportData.itemName}" may match "${matchTarget.itemName}". Check Lost & Found to verify.`,
            resourceType: 'lost_found',
            resourceId: newId,
            isRead: false,
            createdAt: new Date().toISOString(),
          })
        }

        set((state) => ({
          lostFoundReports: [newReport, ...state.lostFoundReports],
          notifications: [...newNotifications, ...state.notifications],
        }))

        return newId
      },

      submitClaim: (reportId, message) => {
        const profile = get().currentProfile
        const newClaim: LostFoundClaim = {
          id: `clm-${Date.now()}`,
          reportId,
          claimantId: profile.id,
          status: 'pending',
          message,
          responseMessage: null,
          createdAt: new Date().toISOString(),
          claimant: { fullName: profile.fullName, username: profile.username, avatarUrl: profile.avatarUrl },
        }

        set((state) => ({
          lostFoundReports: state.lostFoundReports.map((r) => {
            if (r.id === reportId) {
              const currentClaims = r.claims || []
              return { ...r, claims: [...currentClaims, newClaim] }
            }
            return r
          }),
        }))
      },

      resolveClaim: (reportId, claimId, status, responseMsg) => {
        set((state) => ({
          lostFoundReports: state.lostFoundReports.map((r) => {
            if (r.id === reportId) {
              const updatedClaims = (r.claims || []).map((c) =>
                c.id === claimId ? { ...c, status, responseMessage: responseMsg || null } : c
              )
              const newReportStatus = status === 'accepted' ? 'resolved' : r.status
              return { ...r, claims: updatedClaims, status: newReportStatus }
            }
            return r
          }),
        }))
      },

      updateReportStatus: (reportId, status) => {
        set((state) => ({
          lostFoundReports: state.lostFoundReports.map((r) =>
            r.id === reportId ? { ...r, status } : r
          ),
        }))
      },

      addComplaint: (subject, description, busId) => {
        const profile = get().currentProfile
        const newComplaint: TransportComplaintRecord = {
          id: `cmp-${Date.now()}`,
          studentId: profile.id,
          busId: busId || null,
          subject,
          description,
          status: 'open',
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ complaints: [newComplaint, ...state.complaints] }))
      },

      addBus: (busData) => {
        const profile = get().currentProfile
        const newBus: Bus = {
          ...busData,
          id: `bus-${Date.now()}`,
          collegeId: profile.collegeId,
        }
        set((state) => ({ buses: [...state.buses, newBus] }))
      },

      addRoute: (routeData) => {
        const profile = get().currentProfile
        const newRoute: Route = {
          ...routeData,
          id: `rt-${Date.now()}`,
          collegeId: profile.collegeId,
        }
        set((state) => ({ routes: [...state.routes, newRoute] }))
      },

      sendMessage: (recipientId, content) => {
        const profile = get().currentProfile
        const recipient = get().profiles.find((p) => p.id === recipientId)
        if (!recipient) return

        let conv = get().conversations.find((c) =>
          c.participants.some((p) => p.id === recipientId) &&
          c.participants.some((p) => p.id === profile.id)
        )

        let convId = conv ? conv.id : `cnv-${Date.now()}`

        const newMsg: Message = {
          id: `msg-${Date.now()}`,
          conversationId: convId,
          senderId: profile.id,
          content,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          sender: {
            fullName: profile.fullName,
            username: profile.username,
            avatarUrl: profile.avatarUrl,
          },
        }

        if (!conv) {
          const newConv: Conversation = {
            id: convId,
            lastMessageAt: new Date().toISOString(),
            lastMessagePreview: content,
            participants: [
              { id: profile.id, fullName: profile.fullName, username: profile.username, avatarUrl: profile.avatarUrl },
              { id: recipient.id, fullName: recipient.fullName, username: recipient.username, avatarUrl: recipient.avatarUrl },
            ],
            unreadCount: 0,
          }
          set((state) => ({
            conversations: [newConv, ...state.conversations],
            messages: [...state.messages, newMsg],
          }))
        } else {
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === convId
                ? { ...c, lastMessageAt: new Date().toISOString(), lastMessagePreview: content }
                : c
            ),
            messages: [...state.messages, newMsg],
          }))
        }
      },

      toggleSaveItem: (resourceId) => {
        set((state) => {
          const exists = state.savedItemIds.includes(resourceId)
          return {
            savedItemIds: exists
              ? state.savedItemIds.filter((id) => id !== resourceId)
              : [...state.savedItemIds, resourceId],
          }
        })
      },

      markNotificationAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        }))
      },

      markAllNotificationsAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        }))
      },
    }),
    {
      name: 'campusconnect_app_storage',
    }
  )
)
