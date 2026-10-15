# CampusConnect — Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js 15 App                           │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │  App Router  │  │  API Routes  │  │  Server Components  │  │
│  │  (RSC/SSR)   │  │  (Route Hdl) │  │  (data fetching)    │  │
│  └──────────────┘  └──────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
           │                    │
    ┌──────┘                    │
    │                           ▼
    ▼                  ┌─────────────────┐
┌────────────┐         │  Supabase Auth  │
│  Drizzle   │         │  (JWT + RLS)    │
│  ORM       │         └─────────────────┘
└────────────┘                  │
    │                           │
    ▼                           ▼
┌─────────────────────────────────────────┐
│         Supabase (PostgreSQL)           │
│  Tables → RLS Policies → Realtime       │
└─────────────────────────────────────────┘
    │
    ▼
┌──────────────────┐   ┌──────────────┐
│ Supabase Storage │   │   Resend     │
│ (files/images)   │   │  (OTP email) │
└──────────────────┘   └──────────────┘
```

## Directory Structure

```
campusconnect/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth group (no shell)
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── verify-email/page.tsx
│   │   │   └── onboarding/page.tsx
│   │   ├── (app)/                    # Authenticated shell
│   │   │   ├── layout.tsx            # App shell with nav
│   │   │   ├── home/page.tsx
│   │   │   ├── notices/page.tsx
│   │   │   ├── academics/page.tsx
│   │   │   ├── transport/page.tsx
│   │   │   ├── lost-found/page.tsx
│   │   │   ├── contacts/page.tsx
│   │   │   ├── notes/page.tsx
│   │   │   ├── pyqs/page.tsx
│   │   │   ├── profile/[username]/page.tsx
│   │   │   ├── messages/page.tsx
│   │   │   ├── messages/[id]/page.tsx
│   │   │   ├── search/page.tsx
│   │   │   └── saved/page.tsx
│   │   ├── (admin)/                  # Admin portal
│   │   │   ├── layout.tsx
│   │   │   ├── admin/dashboard/page.tsx
│   │   │   ├── admin/notices/page.tsx
│   │   │   ├── admin/transport/page.tsx
│   │   │   ├── admin/students/page.tsx
│   │   │   └── admin/lost-found/page.tsx
│   │   └── api/                      # API Route Handlers
│   │       ├── auth/[...all]/route.ts
│   │       ├── colleges/route.ts
│   │       ├── notices/route.ts
│   │       ├── notices/[id]/route.ts
│   │       ├── posts/route.ts
│   │       ├── notes/route.ts
│   │       ├── pyqs/route.ts
│   │       ├── projects/route.ts
│   │       ├── lost-found/route.ts
│   │       ├── lost-found/[id]/claim/route.ts
│   │       ├── messages/route.ts
│   │       ├── transport/route.ts
│   │       ├── notifications/route.ts
│   │       ├── search/route.ts
│   │       └── upload/route.ts
│   ├── components/
│   │   ├── ui/                       # shadcn/ui primitives
│   │   ├── layout/                   # Shell, Sidebar, BottomNav, Header
│   │   ├── auth/                     # Auth forms, OTP input
│   │   ├── profile/                  # Profile card, tabs, settings
│   │   ├── notices/                  # Notice card, composer, filters
│   │   ├── academics/                # Timetable, calendar
│   │   ├── notes/                    # Note card, uploader
│   │   ├── pyqs/                     # PYQ card, filters
│   │   ├── projects/                 # Project card, form
│   │   ├── lost-found/               # Report form, claim modal, match card
│   │   ├── transport/                # Bus card, route viewer, admin forms
│   │   ├── messages/                 # Conversation list, message thread
│   │   ├── notifications/            # Bell, notification list
│   │   ├── feed/                     # Post card, composer, feed
│   │   ├── search/                   # Search bar, result groups
│   │   └── shared/                   # AppIcon, Avatar, EmptyState, FileIcon
│   ├── lib/
│   │   ├── supabase/                 # Supabase client (server + browser)
│   │   ├── db/                       # Drizzle schema + queries
│   │   │   ├── schema.ts             # All table definitions
│   │   │   ├── migrations/           # Migration files
│   │   │   └── queries/              # Typed query functions
│   │   ├── auth/                     # Session helpers, middleware
│   │   ├── email/                    # Resend OTP integration
│   │   ├── storage/                  # File upload helpers
│   │   ├── validations/              # Zod schemas
│   │   └── utils/                    # General helpers
│   ├── hooks/                        # React hooks
│   ├── stores/                       # Zustand state (theme, UI)
│   └── types/                        # Global TypeScript types
├── public/
│   └── icons/                        # SVG assets
├── docs/                             # Project documentation
├── tests/                            # Playwright E2E tests
│   ├── auth.spec.ts
│   ├── notices.spec.ts
│   ├── lost-found.spec.ts
│   └── transport.spec.ts
└── drizzle.config.ts
```

## Security Architecture

### Authentication Flow
1. User registers → Supabase Auth creates identity
2. Email OTP sent via Resend → user verifies
3. JWT issued → stored in httpOnly cookie
4. Middleware validates JWT on every protected route
5. RLS policies on DB enforce college-level isolation

### Authorization Model
- **Middleware**: Verifies JWT, attaches user context
- **Server Actions / API Routes**: Re-verify role + college_id
- **Supabase RLS**: Last line of defense — never trust client
- **No service role key in client code**

### File Security
- Files uploaded to private Supabase Storage buckets
- Access via short-lived signed URLs (1 hour)
- MIME type validation + file signature check on upload
- Max file sizes: images 5MB, documents 20MB

## Real-time Strategy
- Messages: Supabase Realtime (Postgres changes) for live updates
- Notifications: Supabase Realtime subscriptions
- Fallback: 30-second polling when realtime unavailable (documented)

## Caching Strategy
- Next.js fetch cache for public college/department data (revalidate: 3600)
- No caching for user-specific or sensitive data
- Paginate all list endpoints (20 items default)

## College Isolation
Every table with student data includes `college_id`.
RLS policy pattern:
```sql
CREATE POLICY "college_isolation" ON notices
  USING (college_id = auth.jwt() ->> 'college_id');
```
