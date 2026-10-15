# CampusConnect — Project Plan

## Problem Statement

College students face fragmented information ecosystems:
- Notices arrive through WhatsApp groups, email, and physical boards — inconsistently.
- Academic resources (notes, PYQs) are shared informally and are hard to discover.
- Lost items have no systematic reporting or matching mechanism.
- Transportation schedules are poorly communicated and rarely updated.
- Student-to-student communication is scattered across generic platforms.

CampusConnect solves all of these in a single, college-scoped, permission-aware platform.

---

## Skills Applied (from Antigravity Skill Ecosystem)

| Skill | Applied To |
|---|---|
| `frontend-design` | Aesthetic direction, DFII scoring, design system |
| `design-system` | Token architecture, typography, motion, color semantics |
| `backend-architect` | API design, service boundaries, auth patterns, resilience |
| `database-design` | Schema design, indexing, ORM selection, migrations |
| `security-audit` | OWASP Top 10, auth hardening, input validation, rate limiting |
| `e2e-testing` | Playwright test setup, critical flow coverage |
| `performance-optimization` | Core Web Vitals, N+1 prevention, pagination, caching |
| `concise-planning` | Atomic, ordered action items |

---

## Technology Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR, RSC, API Routes, file-based routing |
| Language | TypeScript 5 | End-to-end type safety |
| Styling | Tailwind CSS v4 | Utility-first, design token integration |
| Components | shadcn/ui | Accessible, composable, unstyled primitives |
| Icons | Lucide React | Single consistent SVG icon family |
| Database | Supabase (PostgreSQL) | Managed Postgres + Row-Level Security |
| Auth | Supabase Auth | Email OTP + Google OAuth, JWT sessions |
| ORM | Drizzle ORM | Type-safe, migrations, Supabase-compatible |
| File Storage | Supabase Storage | Private buckets, signed URLs |
| Email | Resend | Transactional email, OTP delivery |
| Validation | Zod | Runtime schema validation, API safety |
| Testing | Playwright | E2E browser automation |
| Linting | ESLint + Prettier | Code quality |
| Deployment | Vercel | Zero-config Next.js |

---

## Design Direction (frontend-design skill applied)

**Aesthetic Direction:** "Academic Precision" — clean, institutional, purposeful.
**DFII Score:** Impact(4) + Fit(5) + Feasibility(5) + Performance(5) − Risk(2) = **17** (Excellent)
**Differentiation Anchor:** Structured information density with deliberate whitespace and a deep indigo/slate palette.
**Typography:** Geist Sans (display) + Inter variable (body) — loaded via next/font with WOFF2 preload, no FOUT.
**Color Story:** Deep indigo brand (#4F46E5), slate neutrals, semantic green/red/amber. One accent, no rainbow palettes.
**Motion:** CSS-first, 150ms micro-interactions, 200ms transitions. Reduced motion respected.

---

## User Roles and Permissions

| Role | Key Permissions |
|---|---|
| `student` | Read own college data, create posts/notes/PYQs/projects, message peers |
| `college_admin` | All student permissions + manage notices/departments/academic info/events |
| `transport_admin` | Manage buses/routes/schedules/drivers/assignments/complaints |
| `platform_admin` | Manage colleges, global moderation |

Roles are stored server-side. Client UI hides buttons but server always re-validates.

---

## Feature Priority Matrix

| Priority | Feature |
|---|---|
| P0 (Must ship) | College selection, Auth (email OTP + Google), Profile, Navigation |
| P0 | Notices (create/filter/publish), Home feed |
| P0 | Notes, PYQs, Projects (CRUD + file upload) |
| P0 | Lost & Found (report/claim/match/status) |
| P0 | Transport (student view + admin management) |
| P0 | Messaging (persistent, access-controlled) |
| P1 (Should ship) | Dark/light themes, Notifications, Saved Items |
| P1 | Ask the Campus (Q&A), Student Discovery, Follow system |
| P1 | Events & Clubs, Study Groups |
| P1 | Admin portal, Unified Search, Audit logs |
| P2 (Nice to have) | Advanced matching algorithm, Real-time messaging |

---

## MVP Definition

The minimum viable hackathon demo must include:
1. Working college selection + email OTP registration
2. Profile with 4 tabs (Posts, Notes, PYQs, Projects)
3. Notices with targeting (all/department/semester)
4. Lost & Found with claim workflow
5. Transport student view + admin CRUD
6. Persistent messaging between students
7. Light/dark theme toggle (persisted)
8. Admin portal with real metrics
9. Mobile-responsive bottom nav (8 items)
10. No emojis, no random images, consistent Lucide icons

---

## Data Isolation Rules

- Every query must include a `college_id` filter unless the user is `platform_admin`.
- Row-Level Security (RLS) enforced in Supabase for all student-accessible tables.
- Service role key NEVER in client-side code.
- Storage buckets use signed URLs with short expiry for private attachments.
