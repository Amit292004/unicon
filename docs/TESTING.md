# CampusConnect — Testing Strategy

## Skills Applied
- `e2e-testing` skill: Playwright setup, critical flow coverage, cross-browser
- `performance-optimization` skill: Core Web Vitals verification

## Test Categories

### 1. Type Safety (TypeScript)
```bash
npx tsc --noEmit
```
Runs on every CI pass. Zero type errors required.

### 2. Linting
```bash
npx eslint src --ext .ts,.tsx
```
Enforces code quality and catch common errors.

### 3. Unit Tests
Using Jest + React Testing Library for:
- Zod validation schemas
- Utility functions (date formatting, file validation, etc.)
- Component rendering (critical UI states)

### 4. Integration Tests
API Route handlers tested with msw (Mock Service Worker):
- Notice CRUD with targeting rules
- Lost & Found claim workflow
- File upload validation
- Permission enforcement

### 5. E2E Tests (Playwright)
Critical user journeys automated:

#### Auth Flow (auth.spec.ts)
- [ ] College selection renders correctly
- [ ] Registration form validates inputs
- [ ] Email OTP is sent and accepted
- [ ] Google OAuth redirects correctly
- [ ] Profile onboarding saves data
- [ ] Login redirects to Home

#### Notices (notices.spec.ts)
- [ ] Student sees college-scoped notices
- [ ] Filter by department works
- [ ] Admin can create and publish notice
- [ ] Student from different college cannot see notice
- [ ] Expired notices hidden from students

#### Lost & Found (lost-found.spec.ts)
- [ ] Student can submit lost report
- [ ] Student can submit found report
- [ ] Claim workflow sends notification
- [ ] Original uploader can accept/reject claim
- [ ] Statistics update after status change

#### Transport (transport.spec.ts)
- [ ] Transport admin can create bus
- [ ] Admin can create route with stops
- [ ] Student sees assigned bus info
- [ ] Complaint submission works

#### Messaging (messages.spec.ts)
- [ ] Student can start conversation
- [ ] Messages persist on refresh
- [ ] Student cannot access another student's conversation via URL manipulation

#### Permissions (permissions.spec.ts)
- [ ] Student cannot access admin routes
- [ ] Transport admin cannot manage notices
- [ ] College isolation enforced

### 6. Accessibility
Manual verification checklist (WCAG 2.2 AA):
- [ ] All interactive elements reachable by keyboard
- [ ] Focus indicators visible
- [ ] Icon-only buttons have aria-labels
- [ ] Form inputs have associated labels
- [ ] Color contrast >= 4.5:1 for normal text
- [ ] Images have meaningful alt text or are marked decorative
- [ ] Screen reader announces navigation changes
- [ ] Reduced motion respected

### 7. Responsive Layout
Manual verification at:
- 375px (iPhone SE)
- 768px (iPad)
- 1024px (Laptop)
- 1440px (Desktop)

Checklist:
- [ ] Bottom nav visible and functional on mobile
- [ ] Bottom nav doesn't cover content
- [ ] Sidebar collapses on tablet
- [ ] No horizontal scroll on any viewport
- [ ] Forms usable on mobile keyboard

### 8. Performance
Target (performance-optimization skill):
- LCP <= 2.5s
- INP <= 200ms
- CLS <= 0.1
- Lighthouse Performance >= 85

Measure with Chrome DevTools + Lighthouse CI.

## Running Tests

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Unit tests
npm test

# E2E tests (requires app running)
npm run test:e2e

# E2E with UI
npm run test:e2e:ui

# Production build check
npm run build
```

## CI Pipeline

GitHub Actions workflow:
1. Install dependencies
2. Type check
3. Lint
4. Unit tests
5. Build
6. E2E tests (headless Chromium)

## Test Data / Seeds

Demo accounts (created by seed script):
- Student: student@demo.campusconnect.app / Demo@1234
- Admin: admin@demo.campusconnect.app / Admin@1234
- Transport Admin: transport@demo.campusconnect.app / Transport@1234
- College: "Demo University" (seeded)

Run seed: `npm run db:seed`
