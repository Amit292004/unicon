import { z } from 'zod'

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string(),
  collegeId: z.string().uuid('Please select a college'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only digits'),
})

export const onboardingSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .toLowerCase(),
  rollNumber: z.string().min(1, 'Roll number is required').max(20),
  departmentId: z.string().uuid('Please select a department'),
  yearOfJoining: z.number().int().min(2000).max(new Date().getFullYear()),
  expectedGraduationYear: z.number().int().min(2000).max(new Date().getFullYear() + 8),
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  bio: z.string().max(500, 'Bio must be at most 500 characters').optional(),
})

// ─── Notices ──────────────────────────────────────────────────────────────────

export const noticeSchema = z.object({
  title: z.string().min(3, 'Title is required').max(200),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  audience: z.enum(['all', 'department', 'semester', 'department_semester']),
  targetDepartmentId: z.string().uuid().optional().nullable(),
  targetSemester: z.number().int().min(1).max(12).optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  status: z.enum(['draft', 'published']),
  attachmentUrls: z.array(z.string()).optional().nullable(),
})

// ─── Notes ───────────────────────────────────────────────────────────────────

export const noteSchema = z.object({
  title: z.string().min(3, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  subject: z.string().min(2, 'Subject is required').max(100),
  semester: z.number().int().min(1).max(12).optional().nullable(),
  departmentId: z.string().uuid().optional().nullable(),
  isPublic: z.boolean().default(true),
})

// ─── PYQs ─────────────────────────────────────────────────────────────────────

export const pyqSchema = z.object({
  title: z.string().min(3, 'Title is required').max(200),
  subject: z.string().min(2, 'Subject is required').max(100),
  semester: z.number().int().min(1).max(12).optional().nullable(),
  examYear: z.number().int().min(2000).max(new Date().getFullYear()),
  examType: z.enum(['internal', 'end_semester', 'mid_semester', 'supplementary']).optional().nullable(),
  departmentId: z.string().uuid().optional().nullable(),
})

// ─── Projects ─────────────────────────────────────────────────────────────────

export const projectSchema = z.object({
  title: z.string().min(3, 'Title is required').max(200),
  description: z.string().min(10, 'Description is required').max(2000),
  technologies: z.array(z.string().max(50)).max(20).default([]),
  repoUrl: z.string().url('Invalid repository URL').optional().or(z.literal('')),
  liveUrl: z.string().url('Invalid live URL').optional().or(z.literal('')),
})

// ─── Lost & Found ─────────────────────────────────────────────────────────────

export const LOST_FOUND_CATEGORIES = [
  'Electronics',
  'Books & Stationery',
  'Clothing & Accessories',
  'ID & Documents',
  'Keys',
  'Bags & Wallets',
  'Sports Equipment',
  'Musical Instruments',
  'Other',
] as const

export const lostFoundReportSchema = z.object({
  type: z.enum(['lost', 'found']),
  itemName: z.string().min(2, 'Item name is required').max(100),
  category: z.enum(LOST_FOUND_CATEGORIES),
  description: z.string().min(10, 'Description is required').max(1000),
  location: z.string().max(200).optional(),
  dateOccurred: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
  handoverInfo: z.string().max(500).optional(),
})

export const claimSchema = z.object({
  message: z.string().min(10, 'Please provide details about your claim').max(500),
})

// ─── Transport ────────────────────────────────────────────────────────────────

export const busSchema = z.object({
  busNumber: z.string().min(1, 'Bus number is required').max(20),
  registrationNumber: z.string().max(20).optional(),
  capacity: z.number().int().min(1).max(100).optional(),
  status: z.enum(['active', 'inactive', 'maintenance']),
})

export const routeSchema = z.object({
  routeName: z.string().min(2, 'Route name is required').max(100),
  busId: z.string().uuid().optional().nullable(),
  operatingDays: z.array(z.string()).min(1, 'Select at least one operating day'),
  departureTime: z.string().optional(),
  arrivalTime: z.string().optional(),
})

export const complaintSchema = z.object({
  subject: z.string().min(5, 'Subject is required').max(200),
  description: z.string().min(20, 'Please provide more details').max(1000),
  busId: z.string().uuid().optional().nullable(),
})

// ─── Messages ─────────────────────────────────────────────────────────────────

export const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(2000),
  conversationId: z.string().uuid(),
})

// ─── Posts ────────────────────────────────────────────────────────────────────

export const postSchema = z.object({
  content: z.string().min(1, 'Post content is required').max(5000),
  type: z.enum(['text', 'image', 'question', 'project_update', 'resource', 'event']).default('text'),
})

// ─── Settings ─────────────────────────────────────────────────────────────────

export const usernameSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
})

export const emailChangeSchema = z.object({
  newEmail: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required for email change'),
})

// Type exports
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type OtpInput = z.infer<typeof otpSchema>
export type OnboardingInput = z.infer<typeof onboardingSchema>
export type NoticeInput = z.infer<typeof noticeSchema>
export type NoteInput = z.infer<typeof noteSchema>
export type PYQInput = z.infer<typeof pyqSchema>
export type ProjectInput = z.infer<typeof projectSchema>
export type LostFoundReportInput = z.infer<typeof lostFoundReportSchema>
export type ClaimInput = z.infer<typeof claimSchema>
export type BusInput = z.infer<typeof busSchema>
export type RouteInput = z.infer<typeof routeSchema>
export type ComplaintInput = z.infer<typeof complaintSchema>
export type MessageInput = z.infer<typeof messageSchema>
export type PostInput = z.infer<typeof postSchema>
