import { pgTable, text, uuid, timestamp, boolean, integer, pgEnum, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ─── Enums ─────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', ['student', 'college_admin', 'transport_admin', 'platform_admin'])
export const noticeAudienceEnum = pgEnum('notice_audience', ['all', 'department', 'semester', 'department_semester'])
export const noticeStatusEnum = pgEnum('notice_status', ['draft', 'published', 'archived'])
export const lostFoundTypeEnum = pgEnum('lost_found_type', ['lost', 'found'])
export const lostFoundStatusEnum = pgEnum('lost_found_status', ['active', 'claimed', 'resolved'])
export const claimStatusEnum = pgEnum('claim_status', ['pending', 'accepted', 'rejected'])
export const busStatusEnum = pgEnum('bus_status', ['active', 'inactive', 'maintenance'])
export const transportRequestStatusEnum = pgEnum('transport_request_status', ['pending', 'approved', 'rejected'])
export const complaintStatusEnum = pgEnum('complaint_status', ['open', 'in_progress', 'resolved', 'closed'])
export const themeEnum = pgEnum('theme', ['light', 'dark', 'system'])
export const postTypeEnum = pgEnum('post_type', ['text', 'image', 'question', 'project_update', 'resource', 'event'])
export const resourceTypeEnum = pgEnum('resource_type', ['note', 'pyq', 'document', 'link'])
export const examTypeEnum = pgEnum('exam_type', ['internal', 'end_semester', 'mid_semester', 'supplementary'])

// ─── Colleges ──────────────────────────────────────────────────────────────────

export const colleges = pgTable('colleges', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  logoUrl: text('logo_url'),
  city: text('city'),
  state: text('state'),
  website: text('website'),
  isApproved: boolean('is_approved').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  slugIdx: uniqueIndex('colleges_slug_idx').on(table.slug),
}))

// ─── Departments ───────────────────────────────────────────────────────────────

export const departments = pgTable('departments', {
  id: uuid('id').primaryKey().defaultRandom(),
  collegeId: uuid('college_id').notNull().references(() => colleges.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  code: text('code').notNull(),
  durationYears: integer('duration_years').default(4).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  collegeIdx: index('departments_college_idx').on(table.collegeId),
  uniqueCode: uniqueIndex('departments_college_code_idx').on(table.collegeId, table.code),
}))

// ─── Users (extends Supabase auth.users) ──────────────────────────────────────

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // matches auth.users.id
  collegeId: uuid('college_id').notNull().references(() => colleges.id),
  departmentId: uuid('department_id').references(() => departments.id),
  role: userRoleEnum('role').default('student').notNull(),
  fullName: text('full_name').notNull(),
  username: text('username').notNull(),
  rollNumber: text('roll_number'),
  email: text('email').notNull(),
  phoneNumber: text('phone_number'),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  yearOfJoining: integer('year_of_joining'),
  expectedGraduationYear: integer('expected_graduation_year'),
  isEmailVerified: boolean('is_email_verified').default(false).notNull(),
  isOnboarded: boolean('is_onboarded').default(false).notNull(),
  theme: themeEnum('theme').default('system').notNull(),
  notificationPreferences: text('notification_preferences').default('{}'),
  profileVisibility: text('profile_visibility').default('college'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  usernameIdx: uniqueIndex('profiles_username_idx').on(table.username),
  collegeRollIdx: uniqueIndex('profiles_college_roll_idx').on(table.collegeId, table.rollNumber),
  collegeIdx: index('profiles_college_idx').on(table.collegeId),
  emailIdx: uniqueIndex('profiles_email_idx').on(table.email),
}))

// ─── Email OTP Verifications ───────────────────────────────────────────────────

export const emailVerifications = pgTable('email_verifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  otpHash: text('otp_hash').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  attempts: integer('attempts').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('email_verifications_email_idx').on(table.email),
}))

// ─── Posts ─────────────────────────────────────────────────────────────────────

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  collegeId: uuid('college_id').notNull().references(() => colleges.id),
  authorId: uuid('author_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  type: postTypeEnum('type').default('text').notNull(),
  content: text('content').notNull(),
  imageUrl: text('image_url'),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  likesCount: integer('likes_count').default(0).notNull(),
  commentsCount: integer('comments_count').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  collegeIdx: index('posts_college_idx').on(table.collegeId),
  authorIdx: index('posts_author_idx').on(table.authorId),
  createdIdx: index('posts_created_idx').on(table.createdAt),
}))

export const postLikes = pgTable('post_likes', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueLike: uniqueIndex('post_likes_unique_idx').on(table.postId, table.userId),
}))

export const postComments = pgTable('post_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  parentId: uuid('parent_id'),
  content: text('content').notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  postIdx: index('post_comments_post_idx').on(table.postId),
}))

// ─── Notes ─────────────────────────────────────────────────────────────────────

export const notes = pgTable('notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  collegeId: uuid('college_id').notNull().references(() => colleges.id),
  authorId: uuid('author_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  departmentId: uuid('department_id').references(() => departments.id),
  title: text('title').notNull(),
  description: text('description'),
  subject: text('subject').notNull(),
  semester: integer('semester'),
  fileUrl: text('file_url').notNull(),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size'),
  mimeType: text('mime_type'),
  downloadCount: integer('download_count').default(0).notNull(),
  isPublic: boolean('is_public').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  collegeIdx: index('notes_college_idx').on(table.collegeId),
  authorIdx: index('notes_author_idx').on(table.authorId),
  deptSemIdx: index('notes_dept_sem_idx').on(table.departmentId, table.semester),
}))

// ─── PYQs ──────────────────────────────────────────────────────────────────────

export const pyqs = pgTable('pyqs', {
  id: uuid('id').primaryKey().defaultRandom(),
  collegeId: uuid('college_id').notNull().references(() => colleges.id),
  authorId: uuid('author_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  departmentId: uuid('department_id').references(() => departments.id),
  title: text('title').notNull(),
  subject: text('subject').notNull(),
  semester: integer('semester'),
  examYear: integer('exam_year'),
  examType: examTypeEnum('exam_type'),
  fileUrl: text('file_url').notNull(),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size'),
  mimeType: text('mime_type'),
  downloadCount: integer('download_count').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  collegeIdx: index('pyqs_college_idx').on(table.collegeId),
  deptSubjIdx: index('pyqs_dept_subj_idx').on(table.departmentId, table.subject),
}))

// ─── Projects ──────────────────────────────────────────────────────────────────

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  collegeId: uuid('college_id').notNull().references(() => colleges.id),
  authorId: uuid('author_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  technologies: text('technologies').array(),
  coverImageUrl: text('cover_image_url'),
  repoUrl: text('repo_url'),
  liveUrl: text('live_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  collegeIdx: index('projects_college_idx').on(table.collegeId),
  authorIdx: index('projects_author_idx').on(table.authorId),
}))

// ─── Follows ───────────────────────────────────────────────────────────────────

export const follows = pgTable('follows', {
  id: uuid('id').primaryKey().defaultRandom(),
  followerId: uuid('follower_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  followingId: uuid('following_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueFollow: uniqueIndex('follows_unique_idx').on(table.followerId, table.followingId),
}))

// ─── Notices ───────────────────────────────────────────────────────────────────

export const notices = pgTable('notices', {
  id: uuid('id').primaryKey().defaultRandom(),
  collegeId: uuid('college_id').notNull().references(() => colleges.id),
  authorId: uuid('author_id').notNull().references(() => profiles.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  status: noticeStatusEnum('status').default('draft').notNull(),
  audience: noticeAudienceEnum('audience').default('all').notNull(),
  targetDepartmentId: uuid('target_department_id').references(() => departments.id),
  targetSemester: integer('target_semester'),
  attachmentUrls: text('attachment_urls').array(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  collegeStatusIdx: index('notices_college_status_idx').on(table.collegeId, table.status),
  publishedIdx: index('notices_published_idx').on(table.publishedAt),
}))

// ─── Lost & Found ──────────────────────────────────────────────────────────────

export const lostFoundReports = pgTable('lost_found_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  collegeId: uuid('college_id').notNull().references(() => colleges.id),
  reporterId: uuid('reporter_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  type: lostFoundTypeEnum('type').notNull(),
  status: lostFoundStatusEnum('status').default('active').notNull(),
  itemName: text('item_name').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  location: text('location'),
  dateOccurred: timestamp('date_occurred', { withTimezone: true }),
  imageUrl: text('image_url'),
  handoverInfo: text('handover_info'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  collegeIdx: index('lost_found_college_idx').on(table.collegeId),
  typeStatusIdx: index('lost_found_type_status_idx').on(table.type, table.status),
  createdIdx: index('lost_found_created_idx').on(table.createdAt),
}))

export const lostFoundClaims = pgTable('lost_found_claims', {
  id: uuid('id').primaryKey().defaultRandom(),
  reportId: uuid('report_id').notNull().references(() => lostFoundReports.id, { onDelete: 'cascade' }),
  claimantId: uuid('claimant_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  status: claimStatusEnum('status').default('pending').notNull(),
  message: text('message'),
  responseMessage: text('response_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueActiveClaim: uniqueIndex('claims_unique_active_idx').on(table.reportId, table.claimantId),
}))

export const lostFoundMatches = pgTable('lost_found_matches', {
  id: uuid('id').primaryKey().defaultRandom(),
  lostReportId: uuid('lost_report_id').notNull().references(() => lostFoundReports.id, { onDelete: 'cascade' }),
  foundReportId: uuid('found_report_id').notNull().references(() => lostFoundReports.id, { onDelete: 'cascade' }),
  matchScore: integer('match_score').notNull(),
  isNotified: boolean('is_notified').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// ─── Conversations & Messages ──────────────────────────────────────────────────

export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  lastMessageAt: timestamp('last_message_at', { withTimezone: true }).defaultNow().notNull(),
  lastMessagePreview: text('last_message_preview'),
})

export const conversationParticipants = pgTable('conversation_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  lastReadAt: timestamp('last_read_at', { withTimezone: true }),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueParticipant: uniqueIndex('conv_participants_unique_idx').on(table.conversationId, table.userId),
  userIdx: index('conv_participants_user_idx').on(table.userId),
}))

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  senderId: uuid('sender_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  conversationIdx: index('messages_conversation_idx').on(table.conversationId),
  senderIdx: index('messages_sender_idx').on(table.senderId),
  createdIdx: index('messages_created_idx').on(table.createdAt),
}))

// ─── Notifications ─────────────────────────────────────────────────────────────

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  title: text('title').notNull(),
  body: text('body'),
  resourceType: text('resource_type'),
  resourceId: uuid('resource_id'),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userReadIdx: index('notifications_user_read_idx').on(table.userId, table.isRead),
  createdIdx: index('notifications_created_idx').on(table.createdAt),
}))

// ─── Saved Items ───────────────────────────────────────────────────────────────

export const savedItems = pgTable('saved_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  resourceType: text('resource_type').notNull(), // post, note, pyq, project, notice, event
  resourceId: uuid('resource_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueSaved: uniqueIndex('saved_items_unique_idx').on(table.userId, table.resourceType, table.resourceId),
  userIdx: index('saved_items_user_idx').on(table.userId),
}))

// ─── Transport ─────────────────────────────────────────────────────────────────

export const buses = pgTable('buses', {
  id: uuid('id').primaryKey().defaultRandom(),
  collegeId: uuid('college_id').notNull().references(() => colleges.id),
  busNumber: text('bus_number').notNull(),
  registrationNumber: text('registration_number'),
  capacity: integer('capacity'),
  status: busStatusEnum('status').default('active').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  collegeIdx: index('buses_college_idx').on(table.collegeId),
}))

export const drivers = pgTable('drivers', {
  id: uuid('id').primaryKey().defaultRandom(),
  collegeId: uuid('college_id').notNull().references(() => colleges.id),
  busId: uuid('bus_id').references(() => buses.id),
  fullName: text('full_name').notNull(),
  phone: text('phone'),
  licenseNumber: text('license_number'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const routes = pgTable('routes', {
  id: uuid('id').primaryKey().defaultRandom(),
  collegeId: uuid('college_id').notNull().references(() => colleges.id),
  busId: uuid('bus_id').references(() => buses.id),
  routeName: text('route_name').notNull(),
  operatingDays: text('operating_days').array(),
  departureTime: text('departure_time'),
  arrivalTime: text('arrival_time'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const routeStops = pgTable('route_stops', {
  id: uuid('id').primaryKey().defaultRandom(),
  routeId: uuid('route_id').notNull().references(() => routes.id, { onDelete: 'cascade' }),
  stopName: text('stop_name').notNull(),
  stopOrder: integer('stop_order').notNull(),
  estimatedTime: text('estimated_time'),
}, (table) => ({
  routeIdx: index('route_stops_route_idx').on(table.routeId),
}))

export const studentTransportAssignments = pgTable('student_transport_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  busId: uuid('bus_id').notNull().references(() => buses.id),
  routeId: uuid('route_id').references(() => routes.id),
  boardingStop: text('boarding_stop'),
  assignedAt: timestamp('assigned_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueStudent: uniqueIndex('transport_assignment_student_idx').on(table.studentId),
}))

export const transportRequests = pgTable('transport_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  collegeId: uuid('college_id').notNull().references(() => colleges.id),
  status: transportRequestStatusEnum('status').default('pending').notNull(),
  message: text('message'),
  responseMessage: text('response_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const transportComplaints = pgTable('transport_complaints', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  collegeId: uuid('college_id').notNull().references(() => colleges.id),
  busId: uuid('bus_id').references(() => buses.id),
  status: complaintStatusEnum('status').default('open').notNull(),
  subject: text('subject').notNull(),
  description: text('description').notNull(),
  responseMessage: text('response_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ─── Events & Clubs ────────────────────────────────────────────────────────────

export const clubs = pgTable('clubs', {
  id: uuid('id').primaryKey().defaultRandom(),
  collegeId: uuid('college_id').notNull().references(() => colleges.id),
  name: text('name').notNull(),
  description: text('description'),
  logoUrl: text('logo_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  collegeId: uuid('college_id').notNull().references(() => colleges.id),
  clubId: uuid('club_id').references(() => clubs.id),
  organizerId: uuid('organizer_id').notNull().references(() => profiles.id),
  title: text('title').notNull(),
  description: text('description'),
  location: text('location'),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }),
  capacity: integer('capacity'),
  registrationDeadline: timestamp('registration_deadline', { withTimezone: true }),
  isPublished: boolean('is_published').default(false).notNull(),
  coverImageUrl: text('cover_image_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  collegeIdx: index('events_college_idx').on(table.collegeId),
  startsIdx: index('events_starts_idx').on(table.startsAt),
}))

export const eventRegistrations = pgTable('event_registrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  registeredAt: timestamp('registered_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueRegistration: uniqueIndex('event_registrations_unique_idx').on(table.eventId, table.userId),
}))

// ─── Ask the Campus (Q&A) ──────────────────────────────────────────────────────

export const questions = pgTable('questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  collegeId: uuid('college_id').notNull().references(() => colleges.id),
  authorId: uuid('author_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  departmentId: uuid('department_id').references(() => departments.id),
  title: text('title').notNull(),
  body: text('body'),
  subject: text('subject'),
  semester: integer('semester'),
  isResolved: boolean('is_resolved').default(false).notNull(),
  answersCount: integer('answers_count').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  collegeIdx: index('questions_college_idx').on(table.collegeId),
}))

export const answers = pgTable('answers', {
  id: uuid('id').primaryKey().defaultRandom(),
  questionId: uuid('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  isAccepted: boolean('is_accepted').default(false).notNull(),
  upvotesCount: integer('upvotes_count').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// ─── Study Groups ──────────────────────────────────────────────────────────────

export const studyGroups = pgTable('study_groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  collegeId: uuid('college_id').notNull().references(() => colleges.id),
  creatorId: uuid('creator_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  topic: text('topic'),
  membersCount: integer('members_count').default(1).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const studyGroupMembers = pgTable('study_group_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: uuid('group_id').notNull().references(() => studyGroups.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueMember: uniqueIndex('study_group_members_unique_idx').on(table.groupId, table.userId),
}))

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorId: uuid('actor_id').references(() => profiles.id),
  collegeId: uuid('college_id').references(() => colleges.id),
  action: text('action').notNull(),
  resourceType: text('resource_type'),
  resourceId: uuid('resource_id'),
  metadata: text('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  actorIdx: index('audit_logs_actor_idx').on(table.actorId),
  collegeIdx: index('audit_logs_college_idx').on(table.collegeId),
  createdIdx: index('audit_logs_created_idx').on(table.createdAt),
}))

// ─── Relations ─────────────────────────────────────────────────────────────────

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  college: one(colleges, { fields: [profiles.collegeId], references: [colleges.id] }),
  department: one(departments, { fields: [profiles.departmentId], references: [departments.id] }),
  posts: many(posts),
  notes: many(notes),
  pyqs: many(pyqs),
  projects: many(projects),
  sentMessages: many(messages),
  notifications: many(notifications),
  savedItems: many(savedItems),
}))

export const collegesRelations = relations(colleges, ({ many }) => ({
  departments: many(departments),
  profiles: many(profiles),
  notices: many(notices),
  lostFoundReports: many(lostFoundReports),
  buses: many(buses),
  routes: many(routes),
  events: many(events),
}))

export const noticesRelations = relations(notices, ({ one }) => ({
  college: one(colleges, { fields: [notices.collegeId], references: [colleges.id] }),
  author: one(profiles, { fields: [notices.authorId], references: [profiles.id] }),
  targetDepartment: one(departments, { fields: [notices.targetDepartmentId], references: [departments.id] }),
}))

export const lostFoundRelations = relations(lostFoundReports, ({ one, many }) => ({
  college: one(colleges, { fields: [lostFoundReports.collegeId], references: [colleges.id] }),
  reporter: one(profiles, { fields: [lostFoundReports.reporterId], references: [profiles.id] }),
  claims: many(lostFoundClaims),
}))
