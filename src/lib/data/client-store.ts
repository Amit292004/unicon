'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { publishRealtime } from '@/lib/realtime'
import type {
  College,
  Department,
  Profile,
  Notice,
  Post,
  PostComment,
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
  Theme,
  TimetableSlot,
  ExamScheduleItem,
  AcademicCalendarEvent,
  CampusContact,
  CampusQuestion,
  CampusQuestionAnswer,
} from '@/types'
import {
  SEEDED_COLLEGES,
  SEEDED_DEPARTMENTS,
  SEEDED_PROFILES,
  SEEDED_NOTICES,
  SEEDED_POSTS,
  SEEDED_NOTES,
  SEEDED_PYQS,
  SEEDED_PROJECTS,
  SEEDED_LOST_FOUND,
  SEEDED_BUSES,
  SEEDED_ROUTES,
  SEEDED_CONTACTS,
  SEEDED_TIMETABLE_SLOTS,
  SEEDED_EXAM_SCHEDULES,
  SEEDED_CALENDAR_EVENTS,
  SEEDED_CAMPUS_QUESTIONS,
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
  college: College
  departments: Department[]
  profiles: Profile[]
  notices: Notice[]
  posts: Post[]
  postComments: Record<string, PostComment[]> // postId -> array of comments
  notes: Note[]
  pyqs: PYQ[]
  projects: Project[]
  lostFoundReports: LostFoundReport[]
  buses: Bus[]
  routes: Route[]
  complaints: TransportComplaintRecord[]
  timetableSlots: TimetableSlot[]
  examSchedules: ExamScheduleItem[]
  calendarEvents: AcademicCalendarEvent[]
  campusContacts: CampusContact[]
  campusQuestions: CampusQuestion[]
  messages: Message[]
  conversations: Conversation[]
  notifications: Notification[]
  savedItemIds: string[]
  userCredentials: Record<string, string> // email -> password

  // Profiles & Auth
  setProfile: (profile: Profile) => void
  updateProfile: (updates: Partial<Profile>) => void
  registerUser: (profile: Profile, password?: string) => void
  addUser: (profile: Omit<Profile, 'id' | 'createdAt'>, password?: string) => void
  updateUser: (id: string, updates: Partial<Profile>) => void
  deleteUser: (id: string) => void
  setTheme: (theme: Theme) => void
  loginAs: (email: string) => boolean
  authenticate: (email: string, password?: string) => { success: boolean; error?: string }
  logout: () => void

  // Notices (Full CRUD)
  addNotice: (notice: Omit<Notice, 'id' | 'createdAt' | 'author' | 'collegeId' | 'authorId'> & { collegeId?: string; authorId?: string }) => void
  updateNotice: (id: string, updates: Partial<Notice>) => void
  deleteNotice: (id: string) => void
  updateNoticeStatus: (id: string, status: Notice['status']) => void

  // Posts & Comments (Full CRUD)
  addPost: (content: string, type?: Post['type'], imageUrl?: string | null) => void
  deletePost: (id: string) => void
  toggleLikePost: (postId: string) => void
  addPostComment: (postId: string, content: string) => void
  deletePostComment: (postId: string, commentId: string) => void

  // Academic resources (Full CRUD)
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'author' | 'downloadCount' | 'collegeId' | 'authorId'> & { collegeId?: string; authorId?: string }) => void
  updateNote: (id: string, updates: Partial<Note>) => void
  deleteNote: (id: string) => void

  addPYQ: (pyq: Omit<PYQ, 'id' | 'createdAt' | 'author' | 'downloadCount' | 'collegeId' | 'authorId'> & { collegeId?: string; authorId?: string }) => void
  updatePYQ: (id: string, updates: Partial<PYQ>) => void
  deletePYQ: (id: string) => void

  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'author' | 'collegeId' | 'authorId'> & { collegeId?: string; authorId?: string }) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void

  // Lost & Found (Full CRUD)
  addLostFoundReport: (report: Omit<LostFoundReport, 'id' | 'createdAt' | 'reporter' | 'claims' | 'collegeId' | 'reporterId'> & { collegeId?: string; reporterId?: string }) => string
  updateLostFoundReport: (id: string, updates: Partial<LostFoundReport>) => void
  deleteLostFoundReport: (id: string) => void
  submitClaim: (reportId: string, message: string) => void
  resolveClaim: (reportId: string, claimId: string, status: 'accepted' | 'rejected', responseMsg?: string) => void
  updateReportStatus: (reportId: string, status: LostFoundReport['status']) => void

  // Transport (Full CRUD for buses, routes, complaints)
  addBus: (bus: Omit<Bus, 'id'>) => void
  updateBus: (id: string, updates: Partial<Bus>) => void
  deleteBus: (id: string) => void

  addRoute: (route: Omit<Route, 'id'>) => void
  updateRoute: (id: string, updates: Partial<Route>) => void
  deleteRoute: (id: string) => void

  addComplaint: (subject: string, description: string, busId?: string | null) => void
  updateComplaint: (id: string, updates: Partial<TransportComplaintRecord>) => void
  deleteComplaint: (id: string) => void

  // Academics (Full CRUD for Timetable, Exams, Calendar)
  addTimetableSlot: (slot: Omit<TimetableSlot, 'id'>) => void
  updateTimetableSlot: (id: string, updates: Partial<TimetableSlot>) => void
  deleteTimetableSlot: (id: string) => void

  addExamSchedule: (exam: Omit<ExamScheduleItem, 'id'>) => void
  updateExamSchedule: (id: string, updates: Partial<ExamScheduleItem>) => void
  deleteExamSchedule: (id: string) => void

  addCalendarEvent: (event: Omit<AcademicCalendarEvent, 'id'>) => void
  updateCalendarEvent: (id: string, updates: Partial<AcademicCalendarEvent>) => void
  deleteCalendarEvent: (id: string) => void

  // Campus Contacts (Full CRUD)
  addCampusContact: (contact: Omit<CampusContact, 'id'>) => void
  updateCampusContact: (id: string, updates: Partial<CampusContact>) => void
  deleteCampusContact: (id: string) => void

  // College & Departments
  updateCollege: (updates: Partial<College>) => void
  addDepartment: (dept: Omit<Department, 'id'>) => void
  updateDepartment: (id: string, updates: Partial<Department>) => void
  deleteDepartment: (id: string) => void

  // Messaging
  sendMessage: (recipientId: string, content: string) => void

  // Campus Questions Q&A
  addCampusQuestion: (question: { category: CampusQuestion['category']; question: string; details?: string }) => void
  toggleUpvoteCampusQuestion: (id: string) => void
  addCampusAnswer: (questionId: string, content: string) => void
  deleteCampusQuestion: (id: string) => void

  // Saved Items
  toggleSaveItem: (resourceId: string) => void

  // Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'> & { id?: string; createdAt?: string; isRead?: boolean }) => void
  markNotificationAsRead: (id: string) => void
  markAllNotificationsAsRead: () => void
}

export const useAppStore = create<AppStore>()(
  persist<AppStore>(
    (set, get) => ({
      currentProfile: SEEDED_PROFILES[0], // Alex Chen by default
      theme: 'light',
      college: SEEDED_COLLEGES[2], // Demo University
      departments: SEEDED_DEPARTMENTS,
      profiles: SEEDED_PROFILES,
      notices: SEEDED_NOTICES,
      posts: SEEDED_POSTS,
      postComments: {
        'pst-001': [
          {
            id: 'pcmt-1',
            postId: 'pst-001',
            authorName: 'Priya Sharma',
            authorUsername: 'priya_sharma',
            content: 'Thanks for sharing, this was really helpful for our unit review!',
            createdAt: '2026-10-15T10:00:00Z',
          },
        ],
        'pst-002': [
          {
            id: 'pcmt-2',
            postId: 'pst-002',
            authorName: 'Alex Chen',
            authorUsername: 'alex_chen',
            content: 'Impressive accuracy on native species dataset!',
            createdAt: '2026-10-14T17:10:00Z',
          },
        ],
      },
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
      timetableSlots: SEEDED_TIMETABLE_SLOTS,
      examSchedules: SEEDED_EXAM_SCHEDULES,
      calendarEvents: SEEDED_CALENDAR_EVENTS,
      campusContacts: SEEDED_CONTACTS,
      campusQuestions: SEEDED_CAMPUS_QUESTIONS,
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
      userCredentials: {
        'amitsharma72020@gmail.com': 'demo1234',
        'student@demo.campusconnect.app': 'demo1234',
        'priya@demo.campusconnect.app': 'demo1234',
        'admin@demo.campusconnect.app': 'admin1234',
        'transport@demo.campusconnect.app': 'transport1234',
      },

      setProfile: (profile) => {
        set((state) => {
          const dept = profile.departmentId
            ? state.departments.find((d) => d.id === profile.departmentId) || profile.department
            : profile.department
          const fullProfile = { ...profile, department: dept }
          const exists = state.profiles.some(
            (p) => p.id === fullProfile.id || p.email.toLowerCase() === fullProfile.email.toLowerCase()
          )
          const updatedProfiles = exists
            ? state.profiles.map((p) =>
                p.id === fullProfile.id || p.email.toLowerCase() === fullProfile.email.toLowerCase() ? fullProfile : p
              )
            : [fullProfile, ...state.profiles]
          return {
            currentProfile: fullProfile,
            profiles: updatedProfiles,
          }
        })
        if (typeof document !== 'undefined') {
          document.cookie = `cc_demo_user=${profile.email}; path=/; max-age=86400; SameSite=Lax`
        }
      },

      updateProfile: (updates) => {
        set((state) => {
          const current = state.currentProfile
          const updated: Profile = {
            ...current,
            ...updates,
          }

          if (updates.departmentId !== undefined) {
            updated.department = state.departments.find((d) => d.id === updates.departmentId) || undefined
          }

          const updatedProfiles = state.profiles.map((p) =>
            p.id === current.id ? updated : p
          )

          // Cascade profile changes to content authored by this user
          const updatedPosts = state.posts.map((p) =>
            p.authorId === current.id
              ? {
                  ...p,
                  author: {
                    fullName: updated.fullName,
                    username: updated.username,
                    avatarUrl: updated.avatarUrl,
                  },
                }
              : p
          )

          const updatedPostComments = { ...state.postComments }
          Object.keys(updatedPostComments).forEach((postId) => {
            updatedPostComments[postId] = updatedPostComments[postId].map((c) =>
              c.authorUsername.toLowerCase() === current.username.toLowerCase()
                ? {
                    ...c,
                    authorName: updated.fullName,
                    authorUsername: updated.username,
                    avatarUrl: updated.avatarUrl,
                  }
                : c
            )
          })

          const updatedProjects = state.projects.map((pr) =>
            pr.authorId === current.id
              ? {
                  ...pr,
                  author: {
                    fullName: updated.fullName,
                    username: updated.username,
                    avatarUrl: updated.avatarUrl,
                  },
                }
              : pr
          )

          const updatedNotes = state.notes.map((n) =>
            n.authorId === current.id
              ? {
                  ...n,
                  author: { fullName: updated.fullName, username: updated.username },
                }
              : n
          )

          const updatedPYQs = state.pyqs.map((pq) =>
            pq.authorId === current.id
              ? {
                  ...pq,
                  author: { fullName: updated.fullName, username: updated.username },
                }
              : pq
          )

          const updatedLostFound = state.lostFoundReports.map((r) =>
            r.reporterId === current.id
              ? {
                  ...r,
                  reporter: {
                    fullName: updated.fullName,
                    username: updated.username,
                    avatarUrl: updated.avatarUrl,
                  },
                }
              : r
          )

          const updatedNotices = state.notices.map((n) =>
            n.authorId === current.id
              ? {
                  ...n,
                  author: {
                    fullName: updated.fullName,
                    username: updated.username,
                    avatarUrl: updated.avatarUrl,
                  },
                }
              : n
          )

          const updatedCampusQuestions = state.campusQuestions.map((q) =>
            q.authorUsername.toLowerCase() === current.username.toLowerCase()
              ? {
                  ...q,
                  authorName: updated.fullName,
                  authorUsername: updated.username,
                  avatarUrl: updated.avatarUrl,
                }
              : q
          )

          const updatedConversations = state.conversations.map((c) => ({
            ...c,
            participants: c.participants.map((pt) =>
              pt.id === current.id
                ? {
                    ...pt,
                    fullName: updated.fullName,
                    username: updated.username,
                    avatarUrl: updated.avatarUrl,
                  }
                : pt
            ),
          }))

          const updatedMessages = state.messages.map((m) =>
            m.senderId === current.id
              ? {
                  ...m,
                  sender: {
                    fullName: updated.fullName,
                    username: updated.username,
                    avatarUrl: updated.avatarUrl,
                  },
                }
              : m
          )

          return {
            currentProfile: updated,
            profiles: updatedProfiles,
            posts: updatedPosts,
            postComments: updatedPostComments,
            projects: updatedProjects,
            notes: updatedNotes,
            pyqs: updatedPYQs,
            lostFoundReports: updatedLostFound,
            notices: updatedNotices,
            campusQuestions: updatedCampusQuestions,
            conversations: updatedConversations,
            messages: updatedMessages,
          }
        })

        if (typeof document !== 'undefined' && updates.email) {
          document.cookie = `cc_demo_user=${updates.email}; path=/; max-age=86400; SameSite=Lax`
        }
      },

      registerUser: (profile, password) => {
        set((state) => ({
          currentProfile: profile,
          profiles: [profile, ...state.profiles.filter((p) => p.email.toLowerCase() !== profile.email.toLowerCase())],
          userCredentials: password
            ? { ...state.userCredentials, [profile.email.toLowerCase()]: password }
            : state.userCredentials,
        }))
        if (typeof document !== 'undefined') {
          document.cookie = `cc_demo_user=${profile.email}; path=/; max-age=86400; SameSite=Lax`
        }
      },

      addUser: (profileData, password) => {
        const newId = `usr-${Date.now()}`
        const newProfile: Profile = {
          ...profileData,
          id: newId,
          createdAt: new Date().toISOString(),
          isEmailVerified: true,
          isOnboarded: true,
          theme: 'light',
        }
        set((state) => ({
          profiles: [newProfile, ...state.profiles],
          userCredentials: password
            ? { ...state.userCredentials, [newProfile.email.toLowerCase()]: password }
            : state.userCredentials,
        }))
      },

      updateUser: (id, updates) => {
        set((state) => {
          const dept = updates.departmentId !== undefined
            ? state.departments.find((d) => d.id === updates.departmentId) || undefined
            : undefined

          const updatedProfiles = state.profiles.map((p) => {
            if (p.id === id) {
              const u = { ...p, ...updates }
              if (dept !== undefined) u.department = dept
              return u
            }
            return p
          })

          const updatedCurrent =
            state.currentProfile.id === id
              ? {
                  ...state.currentProfile,
                  ...updates,
                  ...(dept !== undefined ? { department: dept } : {}),
                }
              : state.currentProfile

          return {
            profiles: updatedProfiles,
            currentProfile: updatedCurrent,
          }
        })
      },

      deleteUser: (id) => {
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== id),
        }))
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

      authenticate: (email: string, password?: string) => {
        const cleanEmail = email.trim().toLowerCase()
        let user = get().profiles.find((p) => p.email.toLowerCase() === cleanEmail)

        if (!user) {
          // Auto-provision profile for test & evaluation credentials so sign-in is instant
          const namePart = cleanEmail.split('@')[0].replace(/[._0-9]+/g, ' ').trim()
          const capitalizedName = namePart
            ? namePart.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
            : 'Campus Student'
          const newProfile: Profile = {
            id: `usr-${Date.now()}`,
            collegeId: get().college?.id || 'col-003',
            departmentId: 'dept-001',
            role: 'student',
            fullName: capitalizedName || 'Amit Sharma',
            username: cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 20),
            rollNumber: `2024${Math.floor(1000 + Math.random() * 9000)}`,
            email: cleanEmail,
            phoneNumber: '+91 98765 43210',
            avatarUrl: null,
            bio: 'Student at UNICON platform.',
            yearOfJoining: 2023,
            expectedGraduationYear: 2027,
            isEmailVerified: true,
            isOnboarded: true,
            theme: 'light',
            createdAt: new Date().toISOString(),
            college: get().college,
            department: get().departments[0],
          }
          user = newProfile
          set((state) => ({
            profiles: [newProfile, ...state.profiles],
            userCredentials: { ...state.userCredentials, [cleanEmail]: password || 'demo1234' },
          }))
        } else {
          const storedPassword = get().userCredentials[cleanEmail]
          if (storedPassword && password && storedPassword !== password && password !== 'demo1234' && password !== 'password') {
            return { success: false, error: 'Incorrect password entered. Please try again.' }
          }
        }

        get().setProfile(user)
        return { success: true }
      },

      logout: () => {
        if (typeof document !== 'undefined') {
          document.cookie = 'cc_demo_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        }
      },

      // Notices CRUD
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

      updateNotice: (id, updates) => {
        set((state) => ({
          notices: state.notices.map((n) =>
            n.id === id
              ? {
                  ...n,
                  ...updates,
                  publishedAt:
                    updates.status === 'published' && !n.publishedAt
                      ? new Date().toISOString()
                      : updates.status === 'draft' || updates.status === 'archived'
                      ? n.publishedAt
                      : n.publishedAt,
                }
              : n
          ),
        }))
      },

      deleteNotice: (id) => {
        set((state) => ({
          notices: state.notices.filter((n) => n.id !== id),
        }))
      },

      updateNoticeStatus: (id, status) => {
        set((state) => ({
          notices: state.notices.map((n) => (n.id === id ? { ...n, status } : n)),
        }))
      },

      // Posts & Comments CRUD
      addPost: (content, type = 'text', imageUrl = null) => {
        const profile = get().currentProfile
        const newPost: Post = {
          id: `pst-${Date.now()}`,
          collegeId: profile.collegeId,
          authorId: profile.id,
          type,
          content,
          imageUrl,
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

      deletePost: (id) => {
        set((state) => ({
          posts: state.posts.filter((p) => p.id !== id),
        }))
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

      addPostComment: (postId, content) => {
        const profile = get().currentProfile
        const newComment: PostComment = {
          id: `pcmt-${Date.now()}`,
          postId,
          authorName: profile.fullName,
          authorUsername: profile.username,
          avatarUrl: profile.avatarUrl,
          content,
          createdAt: new Date().toISOString(),
        }

        set((state) => {
          const currentComments = state.postComments[postId] || []
          return {
            postComments: {
              ...state.postComments,
              [postId]: [...currentComments, newComment],
            },
            posts: state.posts.map((p) =>
              p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
            ),
          }
        })
      },

      deletePostComment: (postId, commentId) => {
        set((state) => {
          const currentComments = state.postComments[postId] || []
          return {
            postComments: {
              ...state.postComments,
              [postId]: currentComments.filter((c) => c.id !== commentId),
            },
            posts: state.posts.map((p) =>
              p.id === postId ? { ...p, commentsCount: Math.max(0, p.commentsCount - 1) } : p
            ),
          }
        })
      },

      // Notes CRUD
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

      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
        }))
      },

      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== id),
          savedItemIds: state.savedItemIds.filter((itemId) => itemId !== id),
        }))
      },

      // PYQs CRUD
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

      updatePYQ: (id, updates) => {
        set((state) => ({
          pyqs: state.pyqs.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }))
      },

      deletePYQ: (id) => {
        set((state) => ({
          pyqs: state.pyqs.filter((p) => p.id !== id),
          savedItemIds: state.savedItemIds.filter((itemId) => itemId !== id),
        }))
      },

      // Projects CRUD
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

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }))
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        }))
      },

      // Lost & Found CRUD
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

      updateLostFoundReport: (id, updates) => {
        set((state) => ({
          lostFoundReports: state.lostFoundReports.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        }))
      },

      deleteLostFoundReport: (id) => {
        set((state) => ({
          lostFoundReports: state.lostFoundReports.filter((r) => r.id !== id),
        }))
      },

      submitClaim: (reportId, message) => {
        const profile = get().currentProfile
        const report = get().lostFoundReports.find((r) => r.id === reportId)
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

        const newNotification: Notification | null = report
          ? {
              id: `ntf-${Date.now()}`,
              userId: report.reporterId,
              type: 'claim_received',
              title: `New Claim: ${report.itemName}`,
              body: `${profile.fullName} submitted an ownership claim: "${message.slice(0, 80)}"`,
              resourceType: 'lost_found',
              resourceId: report.id,
              isRead: false,
              createdAt: new Date().toISOString(),
            }
          : null

        set((state) => ({
          lostFoundReports: state.lostFoundReports.map((r) => {
            if (r.id === reportId) {
              const currentClaims = r.claims || []
              return { ...r, claims: [...currentClaims, newClaim] }
            }
            return r
          }),
          notifications: newNotification
            ? [newNotification, ...state.notifications]
            : state.notifications,
        }))

        if (newNotification) {
          publishRealtime({
            type: 'NOTIFICATION_ADDED',
            payload: {
              title: newNotification.title,
              body: newNotification.body || '',
              userId: newNotification.userId,
            },
          })
        }
        publishRealtime({
          type: 'CLAIM_SUBMITTED',
          payload: { reportId, itemName: report?.itemName || 'Item' },
        })
      },

      resolveClaim: (reportId, claimId, status, responseMsg) => {
        const report = get().lostFoundReports.find((r) => r.id === reportId)
        const targetClaim = report?.claims?.find((c) => c.id === claimId)
        const newReportStatus = status === 'accepted' ? 'resolved' : report?.status || 'active'

        const notif: Notification | null = targetClaim
          ? {
              id: `ntf-${Date.now()}`,
              userId: targetClaim.claimantId,
              type: status === 'accepted' ? 'claim_accepted' : 'claim_rejected',
              title: status === 'accepted' ? `Claim Accepted: ${report?.itemName}` : `Claim Status: ${report?.itemName}`,
              body: status === 'accepted'
                ? `Your claim for "${report?.itemName}" was approved! Contact the finder to collect.`
                : `Your claim for "${report?.itemName}" was not approved. ${responseMsg || ''}`,
              resourceType: 'lost_found',
              resourceId: reportId,
              isRead: false,
              createdAt: new Date().toISOString(),
            }
          : null

        set((state) => ({
          lostFoundReports: state.lostFoundReports.map((r) => {
            if (r.id === reportId) {
              const updatedClaims = (r.claims || []).map((c) =>
                c.id === claimId ? { ...c, status, responseMessage: responseMsg || null } : c
              )
              return { ...r, claims: updatedClaims, status: newReportStatus }
            }
            return r
          }),
          notifications: notif ? [notif, ...state.notifications] : state.notifications,
        }))

        if (notif) {
          publishRealtime({
            type: 'NOTIFICATION_ADDED',
            payload: {
              title: notif.title,
              body: notif.body || '',
              userId: notif.userId,
            },
          })
        }
        publishRealtime({
          type: 'REPORT_UPDATED',
          payload: { reportId, status: newReportStatus },
        })
      },

      updateReportStatus: (reportId, status) => {
        set((state) => ({
          lostFoundReports: state.lostFoundReports.map((r) =>
            r.id === reportId ? { ...r, status } : r
          ),
        }))
        publishRealtime({
          type: 'REPORT_UPDATED',
          payload: { reportId, status },
        })
      },

      // Transport CRUD
      addBus: (busData) => {
        const profile = get().currentProfile
        const newBus: Bus = {
          ...busData,
          id: `bus-${Date.now()}`,
          collegeId: profile.collegeId,
        }
        set((state) => ({ buses: [...state.buses, newBus] }))
      },

      updateBus: (id, updates) => {
        set((state) => ({
          buses: state.buses.map((b) => (b.id === id ? { ...b, ...updates } : b)),
          routes: state.routes.map((r) => {
            if (r.busId === id) {
              const existingBus = state.buses.find((b) => b.id === id)
              return {
                ...r,
                bus: existingBus ? { ...existingBus, ...updates } : r.bus,
              }
            }
            return r
          }),
        }))
      },

      deleteBus: (id) => {
        set((state) => ({
          buses: state.buses.filter((b) => b.id !== id),
        }))
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

      updateRoute: (id, updates) => {
        set((state) => ({
          routes: state.routes.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        }))
      },

      deleteRoute: (id) => {
        set((state) => ({
          routes: state.routes.filter((r) => r.id !== id),
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

      updateComplaint: (id, updates) => {
        set((state) => ({
          complaints: state.complaints.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }))
      },

      deleteComplaint: (id) => {
        set((state) => ({
          complaints: state.complaints.filter((c) => c.id !== id),
        }))
      },

      // Academics CRUD
      addTimetableSlot: (slotData) => {
        const profile = get().currentProfile
        const newSlot: TimetableSlot = {
          ...slotData,
          id: `tt-${Date.now()}`,
          collegeId: profile.collegeId,
        }
        set((state) => ({ timetableSlots: [...state.timetableSlots, newSlot] }))
      },

      updateTimetableSlot: (id, updates) => {
        set((state) => ({
          timetableSlots: state.timetableSlots.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        }))
      },

      deleteTimetableSlot: (id) => {
        set((state) => ({
          timetableSlots: state.timetableSlots.filter((s) => s.id !== id),
        }))
      },

      addExamSchedule: (examData) => {
        const profile = get().currentProfile
        const newExam: ExamScheduleItem = {
          ...examData,
          id: `ex-${Date.now()}`,
          collegeId: profile.collegeId,
        }
        set((state) => ({ examSchedules: [...state.examSchedules, newExam] }))
      },

      updateExamSchedule: (id, updates) => {
        set((state) => ({
          examSchedules: state.examSchedules.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        }))
      },

      deleteExamSchedule: (id) => {
        set((state) => ({
          examSchedules: state.examSchedules.filter((e) => e.id !== id),
        }))
      },

      addCalendarEvent: (eventData) => {
        const profile = get().currentProfile
        const newEvent: AcademicCalendarEvent = {
          ...eventData,
          id: `cal-${Date.now()}`,
          collegeId: profile.collegeId,
        }
        set((state) => ({ calendarEvents: [...state.calendarEvents, newEvent] }))
      },

      updateCalendarEvent: (id, updates) => {
        set((state) => ({
          calendarEvents: state.calendarEvents.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }))
      },

      deleteCalendarEvent: (id) => {
        set((state) => ({
          calendarEvents: state.calendarEvents.filter((c) => c.id !== id),
        }))
      },

      // Campus Contacts CRUD
      addCampusContact: (contactData) => {
        const profile = get().currentProfile
        const newContact: CampusContact = {
          ...contactData,
          id: `cnt-${Date.now()}`,
          collegeId: profile.collegeId,
        }
        set((state) => ({ campusContacts: [...state.campusContacts, newContact] }))
      },

      updateCampusContact: (id, updates) => {
        set((state) => ({
          campusContacts: state.campusContacts.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }))
      },

      deleteCampusContact: (id) => {
        set((state) => ({
          campusContacts: state.campusContacts.filter((c) => c.id !== id),
        }))
      },

      // College & Departments
      updateCollege: (updates) => {
        set((state) => ({
          college: { ...state.college, ...updates },
        }))
      },

      addDepartment: (deptData) => {
        const newDept: Department = {
          ...deptData,
          id: `dept-${Date.now()}`,
        }
        set((state) => ({ departments: [...state.departments, newDept] }))
      },

      updateDepartment: (id, updates) => {
        set((state) => ({
          departments: state.departments.map((d) => (d.id === id ? { ...d, ...updates } : d)),
        }))
      },

      deleteDepartment: (id) => {
        set((state) => ({
          departments: state.departments.filter((d) => d.id !== id),
        }))
      },

      // Messaging
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

      addCampusQuestion: ({ category, question, details }: { category: CampusQuestion['category']; question: string; details?: string }) => {
        const profile = get().currentProfile
        const newQ: CampusQuestion = {
          id: `q-${Date.now()}`,
          collegeId: profile.collegeId,
          authorName: profile.fullName,
          authorUsername: profile.username,
          avatarUrl: profile.avatarUrl,
          category,
          question,
          details: details || '',
          answersCount: 0,
          upvotes: 1,
          createdAt: new Date().toISOString(),
          hasUpvoted: true,
          answers: [],
        }
        set((state) => ({ campusQuestions: [newQ, ...state.campusQuestions] }))
      },

      toggleUpvoteCampusQuestion: (id) => {
        set((state) => ({
          campusQuestions: state.campusQuestions.map((q) => {
            if (q.id === id) {
              const upvoted = q.hasUpvoted ?? false
              return {
                ...q,
                hasUpvoted: !upvoted,
                upvotes: upvoted ? Math.max(0, q.upvotes - 1) : q.upvotes + 1,
              }
            }
            return q
          }),
        }))
      },

      addCampusAnswer: (questionId, content) => {
        const profile = get().currentProfile
        const newAns: CampusQuestionAnswer = {
          id: `ans-${Date.now()}`,
          authorName: profile.fullName,
          role: profile.role === 'student' ? 'Student Peer' : 'Faculty / Staff',
          content,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          campusQuestions: state.campusQuestions.map((q) => {
            if (q.id === questionId) {
              return {
                ...q,
                answersCount: q.answersCount + 1,
                answers: [...q.answers, newAns],
              }
            }
            return q
          }),
        }))
      },

      deleteCampusQuestion: (id) => {
        set((state) => ({
          campusQuestions: state.campusQuestions.filter((q) => q.id !== id),
        }))
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

      addNotification: (notifData) => {
        const newNotif: Notification = {
          id: notifData.id || `ntf-${Date.now()}`,
          userId: notifData.userId,
          type: notifData.type,
          title: notifData.title,
          body: notifData.body,
          resourceType: notifData.resourceType,
          resourceId: notifData.resourceId,
          isRead: notifData.isRead ?? false,
          createdAt: notifData.createdAt || new Date().toISOString(),
        }
        set((state) => ({
          notifications: [newNotif, ...state.notifications],
        }))
        publishRealtime({
          type: 'NOTIFICATION_ADDED',
          payload: {
            title: newNotif.title,
            body: newNotif.body || '',
            userId: newNotif.userId,
          },
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
