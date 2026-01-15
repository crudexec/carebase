# Architecture Overview

## Technology Stack

| Layer          | Technology               | Notes                              |
| -------------- | ------------------------ | ---------------------------------- |
| Frontend       | Next.js 14+ (App Router) | React-based with Server Components |
| Styling        | Tailwind CSS             | Utility-first CSS                  |
| UI Components  | shadcn/ui                | Accessible component library       |
| Database       | PostgreSQL               | Relational database                |
| ORM            | Prisma                   | Type-safe database access          |
| Authentication | NextAuth.js              | Self-hosted, flexible providers    |
| Real-time      | Socket.io                | Self-hosted WebSockets for chat    |
| File Storage   | MinIO                    | S3-compatible, custom instance     |
| Deployment     | Vercel                   | Production hosting                 |

### Mobile Strategy

- **Phase 1:** Responsive web application with PWA capabilities
- **Phase 2:** React Native mobile app (future consideration)

---

## Project Structure

```
carebase/
├── docs/                    # Documentation
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── (auth)/          # Auth pages (login, etc.)
│   │   ├── (dashboard)/     # Protected dashboard routes
│   │   │   ├── admin/
│   │   │   ├── onboarding/
│   │   │   ├── scheduling/
│   │   │   ├── payroll/
│   │   │   ├── incidents/
│   │   │   ├── reports/
│   │   │   ├── chat/
│   │   │   ├── invoices/
│   │   │   └── settings/
│   │   ├── api/             # API routes
│   │   └── layout.tsx
│   ├── components/          # React components
│   │   ├── ui/              # Base UI components
│   │   ├── forms/           # Form components
│   │   ├── layouts/         # Layout components
│   │   └── modules/         # Feature-specific components
│   ├── lib/                 # Utility functions
│   │   ├── db.ts            # Database client
│   │   ├── auth.ts          # Auth utilities
│   │   └── utils.ts         # General utilities
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript types
│   └── styles/              # Global styles
├── prisma/
│   └── schema.prisma        # Database schema
├── public/                  # Static assets
├── TASKS.md                 # Project task tracking
└── requirements.md          # Project requirements
```

---

## User Roles

The system supports 7 distinct user roles with different permissions:

1. **Admin** - Full system access
2. **Operations Manager** - Operational oversight and approvals
3. **Clinical Director** - Clinical authorization and payroll processing
4. **Staff** - Administrative tasks (payroll, scheduling, onboarding)
5. **Supervisor** - Field management and caregiver coordination
6. **Carer** - Mobile/field access for caregivers
7. **Sponsor** - Limited portal access for clients/family

See [Authentication & Authorization](./auth.md) for detailed permissions.

---

## Core Modules

### Client Onboarding (Kanban)

10-stage pipeline from initial contact to contract start.

### Scheduling

Shift management with availability tracking and conflict prevention.

### Payroll

Supervisor data entry → Clinical Director approval → Payment processing (Mon/Wed/Fri cycles).

### Incident Reporting

Carer/Supervisor report → Admin notification → Ops Manager approval → Sponsor notification.

### Daily Reports

Shift-based reports with image uploads and compliance tracking.

### Communication

Real-time chat between Carers and Sponsors.

### Invoices

Sponsor invoice viewing and payment marking.

---

## Non-Functional Requirements

- **Performance:** < 3 second page loads, 500+ concurrent users
- **Security:** TLS 1.3+, RBAC, 30-min session timeout, audit logging
- **Availability:** 99.5% uptime
- **Compliance:** HIPAA-compliant for health data

---

**Last Updated:** 2026-01-13
