# Database Schema

## Overview

CareBase uses PostgreSQL with Prisma ORM. This document describes all data models and their relationships.

---

## Entity Relationship Diagram

```
User (1) ────────< (M) Shift
  │
  ├── CaregiverProfile (1:1, for Carers)
  │
  └── (M) >──────── Client (M) [assignments]

Client (1) ────────< (M) OnboardingRecord
Client (1) ────────< (M) DailyReport
Client (1) ────────< (M) IncidentReport
Client (1) ────────< (M) Invoice
Client (1) ────────< (M) ChatMessage

Shift (1) ────────< (1) PayrollRecord
Shift (1) ────────< (M) DailyReport

User (1) ────────< (M) Escalation (Carer submits)
User (1) ────────< (M) Escalation (Supervisor manages)

User (1) ────────< (M) Notification
User (1) ────────< (M) AuditLog
```

---

## Models

### User

Core user model supporting all 7 roles.

| Field        | Type          | Description                                                              |
| ------------ | ------------- | ------------------------------------------------------------------------ |
| id           | String (UUID) | Primary key                                                              |
| email        | String        | Unique email address                                                     |
| passwordHash | String        | Hashed password                                                          |
| firstName    | String        | First name                                                               |
| lastName     | String        | Last name                                                                |
| role         | Enum          | ADMIN, OPS_MANAGER, CLINICAL_DIRECTOR, STAFF, SUPERVISOR, CARER, SPONSOR |
| phone        | String?       | Phone number                                                             |
| isActive     | Boolean       | Account status                                                           |
| lastLogin    | DateTime?     | Last login timestamp                                                     |
| createdAt    | DateTime      | Creation timestamp                                                       |
| updatedAt    | DateTime      | Last update timestamp                                                    |

### CaregiverProfile

Extended profile for Carer users.

| Field            | Type          | Description            |
| ---------------- | ------------- | ---------------------- |
| id               | String (UUID) | Primary key            |
| userId           | String        | Foreign key to User    |
| certifications   | String[]      | List of certifications |
| healthStatus     | String?       | Current health status  |
| emergencyContact | String?       | Emergency contact info |
| availableDays    | String[]      | Days available to work |

### Client

Care recipients (the people receiving care services).

| Field           | Type          | Description                            |
| --------------- | ------------- | -------------------------------------- |
| id              | String (UUID) | Primary key                            |
| firstName       | String        | First name                             |
| lastName        | String        | Last name                              |
| dateOfBirth     | DateTime      | Date of birth                          |
| address         | String        | Service address                        |
| phone           | String?       | Contact phone                          |
| medicalNotes    | String?       | Medical information                    |
| sponsorId       | String        | Foreign key to User (Sponsor)          |
| assignedCarerId | String?       | Foreign key to User (Carer)            |
| status          | Enum          | PROSPECT, ONBOARDING, ACTIVE, INACTIVE |
| createdAt       | DateTime      | Creation timestamp                     |

### OnboardingRecord

Tracks client progress through onboarding pipeline.

| Field            | Type          | Description                          |
| ---------------- | ------------- | ------------------------------------ |
| id               | String (UUID) | Primary key                          |
| clientId         | String        | Foreign key to Client                |
| stage            | Enum          | Current pipeline stage (1-10)        |
| stageEnteredAt   | DateTime      | When entered current stage           |
| assignedToId     | String?       | User responsible for current stage   |
| notes            | String?       | Stage notes                          |
| documents        | String[]      | Attached document URLs               |
| clinicalApproval | Boolean?      | Clinical Director approval (stage 5) |

### Shift

Scheduled work shifts for caregivers.

| Field            | Type          | Description                                  |
| ---------------- | ------------- | -------------------------------------------- |
| id               | String (UUID) | Primary key                                  |
| carerId          | String        | Foreign key to User (Carer)                  |
| clientId         | String        | Foreign key to Client                        |
| scheduledStart   | DateTime      | Planned start time                           |
| scheduledEnd     | DateTime      | Planned end time                             |
| actualStart      | DateTime?     | Check-in time                                |
| actualEnd        | DateTime?     | Check-out time                               |
| checkInLocation  | Json?         | GPS coordinates at check-in                  |
| checkOutLocation | Json?         | GPS coordinates at check-out                 |
| status           | Enum          | SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED |

### DailyReport

Daily care reports submitted by caregivers.

| Field        | Type          | Description                |
| ------------ | ------------- | -------------------------- |
| id           | String (UUID) | Primary key                |
| shiftId      | String        | Foreign key to Shift       |
| carerId      | String        | Foreign key to User        |
| clientId     | String        | Foreign key to Client      |
| reportDate   | DateTime      | Report date                |
| activities   | String        | Activities performed       |
| clientStatus | String        | Client status observations |
| medications  | String?       | Medications administered   |
| notes        | String?       | Additional notes           |
| images       | String[]      | Uploaded image URLs        |
| concerns     | String?       | Any concerns raised        |
| createdAt    | DateTime      | Submission timestamp       |

### IncidentReport

Incident documentation with approval workflow.

| Field           | Type          | Description                  |
| --------------- | ------------- | ---------------------------- |
| id              | String (UUID) | Primary key                  |
| reporterId      | String        | Foreign key to User          |
| clientId        | String        | Foreign key to Client        |
| carerId         | String?       | Carer involved               |
| incidentDate    | DateTime      | When incident occurred       |
| location        | String        | Incident location            |
| category        | String        | Incident type                |
| severity        | Enum          | LOW, MEDIUM, HIGH, CRITICAL  |
| description     | String        | Incident description         |
| actionsTaken    | String        | Immediate actions            |
| attachments     | String[]      | Photos/documents             |
| witnesses       | String?       | Witness information          |
| status          | Enum          | PENDING, APPROVED, REJECTED  |
| approvedById    | String?       | Approving user               |
| approvedAt      | DateTime?     | Approval timestamp           |
| sponsorNotified | Boolean       | Whether sponsor was notified |

### PayrollRecord

Payment records for completed shifts.

| Field                  | Type          | Description                             |
| ---------------------- | ------------- | --------------------------------------- |
| id                     | String (UUID) | Primary key                             |
| shiftId                | String        | Foreign key to Shift                    |
| carerId                | String        | Foreign key to User                     |
| hoursWorked            | Decimal       | Calculated hours                        |
| hourlyRate             | Decimal       | Pay rate                                |
| totalAmount            | Decimal       | Total payment                           |
| dailyReportCompliant   | Boolean       | Report compliance status                |
| supervisorApprovedById | String?       | Approving supervisor                    |
| supervisorApprovedAt   | DateTime?     | Supervisor approval time                |
| status                 | Enum          | PENDING, SUPERVISOR_APPROVED, PROCESSED |
| processedById          | String?       | Clinical Director who processed         |
| processedAt            | DateTime?     | Payment processing time                 |
| paymentCycle           | String        | Mon/Wed/Fri cycle identifier            |

### Invoice

Invoices for sponsors.

| Field         | Type          | Description           |
| ------------- | ------------- | --------------------- |
| id            | String (UUID) | Primary key           |
| sponsorId     | String        | Foreign key to User   |
| clientId      | String        | Foreign key to Client |
| invoiceNumber | String        | Unique invoice number |
| periodStart   | DateTime      | Billing period start  |
| periodEnd     | DateTime      | Billing period end    |
| amount        | Decimal       | Invoice amount        |
| status        | Enum          | PENDING, PAID         |
| markedPaidAt  | DateTime?     | When marked as paid   |
| createdAt     | DateTime      | Invoice creation date |

### ChatMessage

Messages between Carers and Sponsors.

| Field      | Type          | Description                     |
| ---------- | ------------- | ------------------------------- |
| id         | String (UUID) | Primary key                     |
| senderId   | String        | Foreign key to User             |
| receiverId | String        | Foreign key to User             |
| clientId   | String        | Foreign key to Client (context) |
| content    | String        | Message content                 |
| readAt     | DateTime?     | When message was read           |
| createdAt  | DateTime      | Sent timestamp                  |

### Escalation

Urgent issues raised by caregivers.

| Field        | Type          | Description                 |
| ------------ | ------------- | --------------------------- |
| id           | String (UUID) | Primary key                 |
| carerId      | String        | Foreign key to User         |
| supervisorId | String        | Assigned supervisor         |
| clientId     | String?       | Related client              |
| title        | String        | Brief title                 |
| description  | String        | Issue description           |
| status       | Enum          | OPEN, IN_PROGRESS, RESOLVED |
| resolvedAt   | DateTime?     | Resolution timestamp        |
| resolution   | String?       | Resolution notes            |
| createdAt    | DateTime      | Creation timestamp          |

### Notification

System notifications.

| Field     | Type          | Description          |
| --------- | ------------- | -------------------- |
| id        | String (UUID) | Primary key          |
| userId    | String        | Foreign key to User  |
| type      | String        | Notification type    |
| title     | String        | Notification title   |
| message   | String        | Notification content |
| link      | String?       | Related link         |
| read      | Boolean       | Read status          |
| createdAt | DateTime      | Creation timestamp   |

### AuditLog

Audit trail for compliance.

| Field      | Type          | Description               |
| ---------- | ------------- | ------------------------- |
| id         | String (UUID) | Primary key               |
| userId     | String        | User who performed action |
| action     | String        | Action type               |
| entityType | String        | Affected entity type      |
| entityId   | String        | Affected entity ID        |
| changes    | Json?         | Before/after values       |
| ipAddress  | String?       | User IP address           |
| createdAt  | DateTime      | Timestamp                 |

---

## Enums

### UserRole

```
ADMIN | OPS_MANAGER | CLINICAL_DIRECTOR | STAFF | SUPERVISOR | CARER | SPONSOR
```

### ClientStatus

```
PROSPECT | ONBOARDING | ACTIVE | INACTIVE
```

### OnboardingStage

```
REACH_OUT | ASSESSMENT | SCHEDULE_APPOINTMENT | ASSESSMENT_REPORT |
CLINICAL_AUTHORIZATION | ASSIGN_CAREGIVER | HEALTH_CHECK |
HEALTH_ASSESSMENT | ONE_ON_ONE | CONTRACT_START
```

### ShiftStatus

```
SCHEDULED | IN_PROGRESS | COMPLETED | CANCELLED
```

### IncidentSeverity

```
LOW | MEDIUM | HIGH | CRITICAL
```

### IncidentStatus

```
PENDING | APPROVED | REJECTED
```

### PayrollStatus

```
PENDING | SUPERVISOR_APPROVED | PROCESSED
```

### InvoiceStatus

```
PENDING | PAID
```

### EscalationStatus

```
OPEN | IN_PROGRESS | RESOLVED
```

---

**Last Updated:** 2026-01-13
