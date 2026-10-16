import type { UserRole, Profile } from '@/types'

/**
 * Checks if a user has institutional administrative privileges
 * (college_admin, platform_admin, admin, moderator).
 */
export function isAdmin(profile?: Profile | { role?: UserRole | string | null } | null): boolean {
  if (!profile?.role) return false
  return ['college_admin', 'platform_admin', 'admin', 'moderator'].includes(profile.role)
}

/**
 * Checks if a user has transport administration privileges
 * (transport_admin, college_admin, platform_admin, admin).
 */
export function isTransportAdmin(profile?: Profile | { role?: UserRole | string | null } | null): boolean {
  if (!profile?.role) return false
  return ['transport_admin', 'college_admin', 'platform_admin', 'admin'].includes(profile.role)
}

/**
 * Checks if a user is faculty or administrator (can manage timetables, exams, contacts, notices).
 */
export function isFacultyOrAdmin(profile?: Profile | { role?: UserRole | string | null } | null): boolean {
  if (!profile?.role) return false
  return ['college_admin', 'platform_admin', 'admin', 'moderator', 'faculty'].includes(profile.role)
}

/**
 * Checks if a user can access the /admin console area.
 * Regular students CANNOT access the admin console.
 */
export function canAccessAdminPanel(profile?: Profile | { role?: UserRole | string | null } | null): boolean {
  if (!profile?.role) return false
  return ['college_admin', 'transport_admin', 'platform_admin', 'admin', 'faculty'].includes(profile.role)
}
