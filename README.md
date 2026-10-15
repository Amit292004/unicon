# CampusConnect — The Digital Operating System for College Student Communities

CampusConnect is a production-grade, college-oriented student community and campus utility web application built for higher education institutions. It unifies academic notices, peer-to-peer study resources, lost and found item recovery, and daily transit logistics into one cohesive, institutional application.

---

## 1. Problem Statement & Mission

College information is fragmented across disparate messaging groups, unorganized bulletin boards, and disconnected portals. Students struggle to track official notifications, discover previous year question papers, locate lost belongings, or monitor campus bus transit.

**CampusConnect solves this by offering:**
- **Strict Institutional Scoping:** Multi-tenant architecture ensuring all notices, resources, transit, and directory records belong exclusively to the student's verified college.
- **Audience-Targeted Bulletins:** Announcements filtered by department, semester, or institution-wide audience.
- **Academic Exchange:** Peer-curated course notes, previous year question papers (PYQs), and student engineering portfolios.
- **Verified Lost & Found Lifecycle:** Dual-reporting with automatic keyword matching and claim verification workflows.
- **Transit Logistics Hub:** Real-time bus tracking schedules, route stop timelines, driver contacts, and direct incident reporting.
- **Zero Distractions UI:** Professional, high-craft interface strictly free of emojis, random stock photography, and excessive decorations.

---

## 2. Technology Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack, Server Actions)
- **Language:** TypeScript 5 (Strict mode)
- **Styling & Design System:** Tailwind CSS v4, CSS Variables, Radix UI Primitives, Lucide React SVG Icons
- **State Management & Persistence:** Zustand with `localStorage` persistence for instant browser demo evaluation
- **ORM & Database:** Drizzle ORM with PostgreSQL / Supabase client & server middleware architecture
- **Validation:** Zod schemas
- **Testing:** Playwright E2E Test Suite (`tests/`)

---

## 3. Evaluator Personas & 1-Click Access

CampusConnect provides pre-configured evaluator presets on `/login` to allow instant, zero-friction testing without blocking on external API keys:

| Persona | Role | Email | Capabilities |
| :--- | :--- | :--- | :--- |
| **Alex Chen** | Computer Science Student | `student@demo.campusconnect.app` | Post updates, download notes & PYQs, report lost items, view routes |
| **Priya Sharma** | Electronics Student | `priya@demo.campusconnect.app` | View targeted notices, share project portfolios, direct message peers |
| **Dean Academic** | Institutional Administrator | `admin@demo.campusconnect.app` | Publish audience-targeted notices, review college metrics, audit logs |
| **Transit Officer** | Fleet Logistics Manager | `transport@demo.campusconnect.app` | Manage buses, configure route stops, assign drivers, triage complaints |

*Default password for all demo accounts:* `CampusConnect2026!`

---

## 4. Key Modules & Navigation

### 8-Item Mobile Bottom Navigation & Desktop Sidebar:
1. **Home (`/home`):** Institutional news ticker, quick-action utility cards, and active student stream.
2. **Notices (`/notices`):** Official bulletins with department and semester filters and attachment downloads.
3. **Academics (`/academics`):** Class timetables, exam schedules, and academic milestones calendar.
4. **Transport (`/transport`):** Bus routes, live stops, driver phone links, and complaint dispatch.
5. **Lost & Found (`/lost-found`):** Missing/found registry with live statistics, keyword matching, and claim resolution.
6. **Contacts (`/contacts`):** Directory of HODs, faculty advisors, campus health center, and peer students.
7. **Notes (`/notes`):** Student-uploaded course notes categorized by semester and subject.
8. **PYQs (`/pyqs`):** Previous year question paper archives indexed by academic term and examination year.

### Student Profile & Governance:
- **Profile (`/profile/[username]`):** 4 distinct tabs: `Posts`, `Notes`, `PYQs`, and `Projects`. Sensitive credentials (roll number, personal phone) are masked for other students.
- **Admin Portal (`/admin/dashboard`):** Role-gated administration with real-time operational metrics, notice publishing (`/admin/notices`), and fleet logistics management (`/admin/transport`).

---

## 5. Getting Started

### Prerequisites
- Node.js 18+ (Node.js 20+ recommended)
- npm or pnpm

### Installation

```bash
# Navigate to the project directory
cd campusconnect

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run production build check
npm run build

# Start the local development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 6. Environment Variables

Create a `.env.local` file with the following keys (defaults are provided for standalone demo mode):

```env
# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Supabase Configuration (Optional for demo mode; defaults to mock client)
NEXT_PUBLIC_SUPABASE_URL="https://your_supabase_project_url.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"

# Database Connection
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/campusconnect"

# Email Delivery (Optional)
RESEND_API_KEY="re_demo_key"
```

---

## 7. Automated Testing

Playwright end-to-end tests verify authentication, notice audience filtering, and the lost-and-found claim lifecycle:

```bash
# Run Playwright E2E tests
npx playwright test
```

---

## 8. Architectural Documentation

Detailed technical documents are available in the `docs/` folder:
- [`docs/PROJECT_PLAN.md`](./docs/PROJECT_PLAN.md): Feature priorities, problem statement, and scoring criteria.
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md): System topology, database schema, multi-tenant boundaries, and security policies.
- [`docs/IMPLEMENTATION_STATUS.md`](./docs/IMPLEMENTATION_STATUS.md): Production checklist and verification logs.
- [`docs/TESTING.md`](./docs/TESTING.md): Comprehensive test plans, test matrices, and accessibility compliance.
