// Shared TypeScript types across CampusConnect

export type UserRole = 'student' | 'college_admin' | 'transport_admin' | 'platform_admin' | 'faculty' | 'admin' | 'moderator'
export type Theme = 'light' | 'dark' | 'system'
export type NoticeAudience = 'all' | 'department' | 'semester' | 'department_semester'
export type NoticeStatus = 'draft' | 'published' | 'archived'
export type LostFoundType = 'lost' | 'found'
export type LostFoundStatus = 'active' | 'claimed' | 'resolved'
export type ClaimStatus = 'pending' | 'accepted' | 'rejected'
export type BusStatus = 'active' | 'inactive' | 'maintenance'
export type ComplaintStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type ExamType = 'internal' | 'end_semester' | 'mid_semester' | 'supplementary' | 'midsem' | 'endsem'

export interface College {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  city: string | null
  state: string | null
  website: string | null
  websiteUrl?: string | null
  domain?: string | null
  isApproved: boolean
  isVerified?: boolean
  createdAt: string
}

export interface Department {
  id: string
  collegeId: string
  name: string
  code: string
  durationYears?: number
}

export interface Profile {
  id: string
  collegeId: string
  departmentId: string | null
  role: UserRole
  fullName: string
  username: string
  rollNumber: string | null
  email: string
  phoneNumber: string | null
  avatarUrl: string | null
  bio: string | null
  yearOfJoining: number | null
  expectedGraduationYear: number | null
  isEmailVerified: boolean
  isOnboarded: boolean
  theme: Theme
  createdAt: string
  // Joined relations
  college?: College
  department?: Department
}

export interface Notice {
  id: string
  collegeId: string
  authorId: string
  title: string
  content: string
  status: NoticeStatus
  audience: NoticeAudience
  targetDepartmentId: string | null
  targetSemester: number | null
  attachmentUrls: string[] | null
  publishedAt: string | null
  expiresAt: string | null
  createdAt: string
  author?: Pick<Profile, 'fullName' | 'username' | 'avatarUrl'>
  targetDepartment?: Department
}

export interface Post {
  id: string
  collegeId: string
  authorId: string
  type: string
  content: string
  imageUrl: string | null
  likesCount: number
  commentsCount: number
  createdAt: string
  author?: Pick<Profile, 'fullName' | 'username' | 'avatarUrl'>
  hasLiked?: boolean
  hasSaved?: boolean
}

export interface Note {
  id: string
  collegeId: string
  authorId: string
  departmentId: string | null
  title: string
  description: string | null
  subject: string
  semester: number | null
  fileUrl: string
  fileName: string
  fileSize: number | null
  mimeType: string | null
  downloadCount: number
  isPublic?: boolean
  createdAt: string
  author?: Pick<Profile, 'fullName' | 'username'>
  department?: Department
}

export interface PYQ {
  id: string
  collegeId: string
  authorId: string
  departmentId: string | null
  title: string
  subject: string
  semester: number | null
  examYear: number | null
  examType: ExamType | null
  fileUrl: string
  fileName: string
  fileSize: number | null
  downloadCount: number
  createdAt: string
  author?: Pick<Profile, 'fullName' | 'username'>
  department?: Department
}

export interface Project {
  id: string
  collegeId: string
  authorId: string
  title: string
  description: string
  technologies: string[] | null
  coverImageUrl: string | null
  repoUrl: string | null
  liveUrl: string | null
  createdAt: string
  author?: Pick<Profile, 'fullName' | 'username' | 'avatarUrl'>
}

export interface LostFoundReport {
  id: string
  collegeId: string
  reporterId: string
  type: LostFoundType
  status: LostFoundStatus
  itemName: string
  category: string
  description: string
  location: string | null
  dateOccurred: string | null
  imageUrl: string | null
  handoverInfo: string | null
  createdAt: string
  reporter?: Pick<Profile, 'fullName' | 'username' | 'avatarUrl'>
  claims?: LostFoundClaim[]
}

export interface LostFoundClaim {
  id: string
  reportId: string
  claimantId: string
  status: ClaimStatus
  message: string | null
  responseMessage: string | null
  createdAt: string
  claimant?: Pick<Profile, 'fullName' | 'username' | 'avatarUrl'>
}

export interface Conversation {
  id: string
  lastMessageAt: string
  lastMessagePreview: string | null
  participants: Pick<Profile, 'id' | 'fullName' | 'username' | 'avatarUrl'>[]
  unreadCount?: number
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  isDeleted: boolean
  createdAt: string
  sender?: Pick<Profile, 'fullName' | 'username' | 'avatarUrl'>
}

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  body: string | null
  resourceType: string | null
  resourceId: string | null
  isRead: boolean
  createdAt: string
}

export interface Bus {
  id: string
  collegeId: string
  busNumber: string
  registrationNumber: string | null
  capacity: number | null
  status: BusStatus
  driver?: Driver
}

export interface Driver {
  id: string
  busId: string | null
  fullName: string
  phone: string | null
  licenseNumber: string | null
}

export interface Route {
  id: string
  collegeId: string
  busId: string | null
  routeName: string
  operatingDays: string[] | null
  departureTime: string | null
  arrivalTime: string | null
  isActive: boolean
  stops: RouteStop[]
  bus?: Bus
}

export interface RouteStop {
  id: string
  routeId: string
  stopName: string
  stopOrder: number
  estimatedTime: string | null
}

export interface Event {
  id: string
  collegeId: string
  title: string
  description: string | null
  location: string | null
  startsAt: string
  endsAt: string | null
  capacity: number | null
  registrationDeadline: string | null
  isPublished: boolean
  coverImageUrl: string | null
  organizer?: Pick<Profile, 'fullName' | 'username'>
  registrationCount?: number
  isRegistered?: boolean
}

// API Response types
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// Stats
export interface AdminDashboardStats {
  totalStudents: number
  publishedNotices: number
  activeLostFoundReports: number
  pendingClaims: number
  upcomingEvents: number
  openTransportComplaints: number
  totalNotes: number
  totalPYQs: number
}

export interface LostFoundStats {
  totalReports: number
  lostItems: number
  foundItems: number
  pendingClaims: number
  resolvedItems: number
}

export interface TimetableSlot {
  id: string
  collegeId: string
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'
  time: string
  subject: string
  room: string
  faculty: string
  departmentId?: string | null
  semester?: number | null
}

export interface ExamScheduleItem {
  id: string
  collegeId: string
  code: string
  subject: string
  date: string
  time: string
  hall: string
  departmentId?: string | null
  semester?: number | null
}

export interface AcademicCalendarEvent {
  id: string
  collegeId: string
  date: string
  title: string
  type: 'Exam' | 'Holiday' | 'Academic' | 'Evaluation' | 'Event'
}

export interface CampusContact {
  id: string
  collegeId: string
  category: string
  name: string
  role: string
  department: string
  email: string
  phone: string
  office: string
  hours: string
}

export interface PostComment {
  id: string
  postId: string
  authorName: string
  authorUsername: string
  avatarUrl?: string | null
  content: string
  createdAt: string
}

export interface CampusQuestionAnswer {
  id: string
  authorName: string
  role: string
  content: string
  createdAt: string
}

export interface CampusQuestion {
  id: string
  collegeId: string
  authorName: string
  authorUsername: string
  avatarUrl?: string | null
  category: 'Academics' | 'Hostel & Mess' | 'Transit & Bus' | 'Administrative' | 'Campus Life'
  question: string
  details: string
  answersCount: number
  upvotes: number
  createdAt: string
  hasUpvoted?: boolean
  answers: CampusQuestionAnswer[]
}

