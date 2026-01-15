# CareBase - Project Tasks

## Overview

Care Agency Management System - A Next.js application for managing home care service operations.

---

## Current Status

**Phase:** Phase 5 Complete - Ready for Phase 6 (Scheduling Module)
**Last Updated:** 2026-01-13

---

## Phase 1: Project Setup & Configuration ✅ COMPLETE

| Status | Task                                           | Notes                            |
| ------ | ---------------------------------------------- | -------------------------------- |
| [x]    | Initialize Next.js 14+ project with App Router | TypeScript, ESLint, Tailwind     |
| [x]    | Set up project folder structure                | Following Next.js best practices |
| [x]    | Configure database (PostgreSQL/Prisma)         | Schema created                   |
| [x]    | Set up authentication (NextAuth.js)            | Credentials provider + RBAC      |
| [x]    | Configure environment variables                | .env.example created             |
| [x]    | Set up UI component library                    | shadcn/ui + design system        |
| [x]    | Set up testing framework                       | Jest + RTL + Playwright          |
| [x]    | Configure Husky pre-commit hooks               | lint-staged configured           |
| [x]    | Set up MSW for API mocking                     | Handlers created                 |

---

## Phase 2: Database Schema & Models ✅ COMPLETE

| Status | Task                            | Notes                         |
| ------ | ------------------------------- | ----------------------------- |
| [x]    | Design and create User model    | Support 7 role types          |
| [x]    | Create Client model             | For care recipients           |
| [x]    | Create Caregiver profile model  | Extended user info for carers |
| [x]    | Create Shift model              | For scheduling                |
| [x]    | Create DailyReport model        | Text + image uploads          |
| [x]    | Create IncidentReport model     | With approval workflow        |
| [x]    | Create Invoice model            | Payment tracking              |
| [x]    | Create ChatMessage model        | For communication             |
| [x]    | Create Escalation model         | Issue tracking                |
| [x]    | Create OnboardingPipeline model | Kanban stages + history       |
| [x]    | Create PayrollRecord model      | Payment cycles                |
| [x]    | Create AuditLog model           | For compliance                |
| [x]    | Set up database migrations      | 14 tables created             |

---

## Phase 3: Authentication & Authorization ✅ COMPLETE

| Status | Task                                    | Notes                          |
| ------ | --------------------------------------- | ------------------------------ |
| [x]    | Implement authentication flow           | Login page + NextAuth          |
| [x]    | Create role-based access control (RBAC) | 7 roles with permissions       |
| [x]    | Build permission middleware             | Route protection               |
| [x]    | Create session management               | 30-min timeout configured      |
| [x]    | Implement password policy               | Validation in auth.ts          |
| [x]    | Build dashboard layout                  | Role-based sidebar + views     |
| [ ]    | Build user management (Admin)           | Create/modify/deactivate users |

---

## Phase 4: Core Layout & Navigation ✅ COMPLETE

| Status | Task                            | Notes                        |
| ------ | ------------------------------- | ---------------------------- |
| [x]    | Create main dashboard layout    | Role-based sidebar           |
| [ ]    | Build responsive navigation     | Mobile hamburger menu (TODO) |
| [x]    | Create role-specific dashboards | 7 different views            |
| [ ]    | Implement notification system   | In-app notifications         |
| [ ]    | Build breadcrumb navigation     | For deep pages               |

---

## Phase 5: Client Onboarding Module (Kanban) ✅ COMPLETE

| Status | Task                                     | Notes                     |
| ------ | ---------------------------------------- | ------------------------- |
| [x]    | Build Kanban board UI                    | Drag-and-drop (dnd-kit)   |
| [x]    | Create 10 pipeline stages                | Per requirements          |
| [x]    | Implement card creation/editing          | Client info forms         |
| [x]    | Add stage transition logic               | Permission-based          |
| [ ]    | Build stage transition notifications     | Email + in-app (Phase 15) |
| [ ]    | Implement document attachments           | Per stage (enhancement)   |
| [x]    | Create audit trail for transitions       | REQ-ONB-005               |
| [x]    | Add Clinical Director authorization gate | Stage 5 approval          |

---

## Phase 6: Scheduling Module

| Status | Task                                | Notes                  |
| ------ | ----------------------------------- | ---------------------- |
| [ ]    | Build calendar view                 | Weekly/monthly views   |
| [ ]    | Create shift creation interface     | For Staff/Supervisors  |
| [ ]    | Implement caregiver availability    | Prevent double-booking |
| [ ]    | Build shift assignment workflow     | Match carer to client  |
| [ ]    | Add schedule change notifications   | To affected carers     |
| [ ]    | Create shift swap/coverage requests | Optional enhancement   |

---

## Phase 7: Payroll Module

| Status | Task                                  | Notes                          |
| ------ | ------------------------------------- | ------------------------------ |
| [ ]    | Build payroll data entry (Supervisor) | After shift completion         |
| [ ]    | Show daily report compliance status   | During data entry              |
| [ ]    | Create approval workflow              | Supervisor → Clinical Director |
| [ ]    | Implement payment cycle logic         | Mon/Wed/Fri                    |
| [ ]    | Build payroll notifications           | Per notification rules         |
| [ ]    | Create payroll audit trail            | REQ-PAY-005                    |
| [ ]    | Build carer payment history view      | For carers                     |

---

## Phase 8: Incident Reporting Module

| Status | Task                                | Notes               |
| ------ | ----------------------------------- | ------------------- |
| [ ]    | Create incident report form         | All required fields |
| [ ]    | Implement severity levels           | Categorization      |
| [ ]    | Build photo/document attachments    | Upload support      |
| [ ]    | Create Admin notification on submit | Immediate           |
| [ ]    | Build approval workflow             | Ops Manager/Admin   |
| [ ]    | Implement Sponsor notification      | Post-approval only  |
| [ ]    | Create incident list/search         | For Admin review    |

---

## Phase 9: Daily Reporting Module

| Status | Task                              | Notes                   |
| ------ | --------------------------------- | ----------------------- |
| [ ]    | Build daily report form (Carer)   | Mobile-optimized        |
| [ ]    | Implement image upload            | Photo documentation     |
| [ ]    | Create report compliance tracking | For payroll integration |
| [ ]    | Build Sponsor report view         | Read-only access        |
| [ ]    | Add Supervisor report review      | Compliance checking     |

---

## Phase 10: Monthly Reporting Module

| Status | Task                              | Notes              |
| ------ | --------------------------------- | ------------------ |
| [ ]    | Create monthly report aggregation | From daily reports |
| [ ]    | Build Sponsor monthly view        | Summary dashboard  |
| [ ]    | Implement auto-generation         | By 5th of month    |
| [ ]    | Add PDF export                    | Optional           |

---

## Phase 11: Communication Module (Chat)

| Status | Task                                | Notes              |
| ------ | ----------------------------------- | ------------------ |
| [ ]    | Set up real-time infrastructure     | WebSocket/Pusher   |
| [ ]    | Build chat UI                       | Mobile-friendly    |
| [ ]    | Implement Carer ↔ Sponsor messaging | 1:1 chat           |
| [ ]    | Create message persistence          | Chat history       |
| [ ]    | Add chat search                     | REQ-COM-003        |
| [ ]    | Build Admin monitoring view         | Optional oversight |

---

## Phase 12: Invoice Management Module

| Status | Task                               | Notes               |
| ------ | ---------------------------------- | ------------------- |
| [ ]    | Create invoice list view (Sponsor) | With status filters |
| [ ]    | Build "Mark as Paid" functionality | Status update       |
| [ ]    | Implement invoice generation       | Admin/Staff         |
| [ ]    | Add payment status tracking        | Pending/Paid        |

---

## Phase 13: Escalation Module

| Status | Task                               | Notes                     |
| ------ | ---------------------------------- | ------------------------- |
| [ ]    | Create escalation submission form  | For Carers                |
| [ ]    | Implement Supervisor notifications | Immediate alerts          |
| [ ]    | Build escalation management view   | For Supervisors           |
| [ ]    | Add status tracking                | Open/In Progress/Resolved |
| [ ]    | Create escalation history          | Audit trail               |

---

## Phase 14: Check-in/Check-out (Carer Mobile)

| Status | Task                           | Notes               |
| ------ | ------------------------------ | ------------------- |
| [ ]    | Build GPS-enabled check-in     | Location capture    |
| [ ]    | Create check-out functionality | Shift completion    |
| [ ]    | Implement location validation  | Geofencing optional |
| [ ]    | Add shift time tracking        | For payroll         |

---

## Phase 15: Notification System

| Status | Task                             | Notes            |
| ------ | -------------------------------- | ---------------- |
| [ ]    | Set up email service             | SendGrid/Resend  |
| [ ]    | Implement SMS notifications      | Twilio/similar   |
| [ ]    | Build in-app notification center | Real-time        |
| [ ]    | Create notification preferences  | User settings    |
| [ ]    | Implement notification rules     | Per module specs |

---

## Phase 16: Admin & System Configuration

| Status | Task                           | Notes                    |
| ------ | ------------------------------ | ------------------------ |
| [ ]    | Build system settings page     | Admin only               |
| [ ]    | Create audit log viewer        | All sensitive operations |
| [ ]    | Implement user management CRUD | Full user lifecycle      |
| [ ]    | Add role assignment interface  | Permission management    |

---

## Phase 17: Final QA & Security Audit

| Status | Task                                  | Notes                         |
| ------ | ------------------------------------- | ----------------------------- |
| [ ]    | Run full test suite                   | All unit + integration tests  |
| [ ]    | Run E2E test suite                    | All critical user flows       |
| [ ]    | Verify test coverage meets minimums   | 80%+ overall                  |
| [ ]    | Perform security audit                | OWASP top 10                  |
| [ ]    | Test RBAC permissions comprehensively | All 7 roles, all routes       |
| [ ]    | Cross-browser testing                 | Chrome, Safari, Firefox, Edge |
| [ ]    | Mobile responsiveness testing         | iOS + Android browsers        |
| [ ]    | Performance testing                   | Page load < 3s                |
| [ ]    | Accessibility audit                   | WCAG 2.1 AA compliance        |

---

## Phase 18: Deployment & DevOps

| Status | Task                          | Notes              |
| ------ | ----------------------------- | ------------------ |
| [ ]    | Set up CI/CD pipeline         | GitHub Actions     |
| [ ]    | Configure production database | Managed PostgreSQL |
| [ ]    | Set up file storage           | S3/Cloudinary      |
| [ ]    | Deploy to Vercel/similar      | Production hosting |
| [ ]    | Configure monitoring          | Error tracking     |
| [ ]    | Set up backup strategy        | Database backups   |

---

## Completed Tasks

_None yet_

---

## Technology Decisions (Confirmed)

| Area             | Decision              | Notes                                     |
| ---------------- | --------------------- | ----------------------------------------- |
| Database         | PostgreSQL + Prisma   | Type-safe ORM                             |
| Authentication   | NextAuth.js           | Self-hosted, flexible                     |
| Real-time (Chat) | Socket.io             | Self-hosted WebSockets                    |
| File Storage     | MinIO (S3-compatible) | Custom instance                           |
| Mobile           | Responsive Web + PWA  | Plan for React Native later               |
| Scheduling       | Build Basic Module    | Functional now, integrate Sparkplug later |

---

## Development Rules

### Testing Rule (MANDATORY)

**Every feature MUST have corresponding tests. Tests run automatically before commits via Husky pre-commit hooks.**

Test requirements:

- **UI Components** → Unit tests (Jest + React Testing Library)
- **API Routes** → Integration tests (Jest)
- **Utilities/Hooks** → Unit tests (Jest)
- **Critical Flows** → E2E tests (Playwright)
- **Database Operations** → Integration tests with test DB

Pre-commit behavior:

1. ESLint runs and auto-fixes issues
2. Jest runs tests related to changed files
3. Commit is **blocked** if any test fails

Coverage minimums:

- Utilities: 90%
- API Routes: 85%
- Components: 80%
- Overall: 80%

**A feature without tests is not complete.**

See: `docs/testing-strategy.md` for full details.

---

### Documentation Rule (MANDATORY)

**When any feature, API, workflow, or UI is added or modified, the corresponding documentation in `/docs` MUST be updated.**

Documentation locations:

- `docs/architecture.md` - Update when tech stack or structure changes
- `docs/database-schema.md` - Update when models change
- `docs/api-reference.md` - Update when API endpoints are added/modified
- `docs/auth.md` - Update when permissions or auth flow changes
- `docs/design-system.md` - Update when UI patterns change
- `docs/testing-strategy.md` - Update when testing approach changes
- `docs/guides/*.md` - Update user guides when user-facing features change
- `docs/modules/*.md` - Update module docs when module functionality changes

**Failure to update documentation is considered incomplete work.**

---

## Notes

- Mark tasks with `[x]` when completed
- Move completed tasks to "Completed Tasks" section with date
- REQ codes reference requirements.md specifications
- **Always write tests for new features** (see Testing Rule above)
- **Always update `/docs` when completing tasks** (see Documentation Rule above)
- Pre-commit hooks will block commits if tests fail
