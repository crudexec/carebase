# Caregiver Credential & License Management

## Executive Summary

Caregivers hold critical certifications and licenses (RN, CNA, CPR, First Aid, etc.) that expire and require renewal. Expired credentials create **compliance risk** and **legal liability** for the agency. This feature provides a robust system to:

1. Track all caregiver credentials with expiration dates
2. Proactively alert caregivers and administrators before expiration
3. Prevent scheduling of caregivers with expired credentials
4. Maintain audit trails for compliance reporting

---

## Problem Statement

| Pain Point                             | Impact                                                  |
| -------------------------------------- | ------------------------------------------------------- |
| No centralized credential tracking     | Admins use spreadsheets, things fall through cracks     |
| Reactive discovery of expired licenses | Caregiver shows up to shift with expired CPR cert       |
| No automated reminders                 | Manual calendar tracking is error-prone                 |
| Compliance risk                        | State audits can result in fines or license revocation  |
| Scheduling conflicts                   | Caregivers assigned to shifts they're not qualified for |

---

## User Stories

### As a Caregiver (CARER role)

- I want to see all my credentials and their expiration dates in one place
- I want to receive reminders 60, 30, and 7 days before expiration
- I want to upload my renewed credential documents easily
- I want to see which credentials are blocking me from taking shifts

### As a Supervisor/Admin

- I want a dashboard showing all credentials expiring in the next 30/60/90 days
- I want to receive alerts when my team members' credentials are expiring
- I want to see which caregivers are currently non-compliant
- I want to prevent scheduling caregivers with expired required credentials
- I want to run compliance reports for state audits

### As an Agency Owner

- I want company-wide visibility into credential compliance
- I want to define which credentials are required vs. optional
- I want audit trails for compliance documentation

---

## Feature Design

### 1. Credential Types (Company-Configurable)

Each company can define their required credential types:

| Credential Type      | Category      | Typical Validity  | Required?      |
| -------------------- | ------------- | ----------------- | -------------- |
| RN License           | License       | 2 years           | By role        |
| LPN License          | License       | 2 years           | By role        |
| CNA Certification    | Certification | 2 years           | Required       |
| CPR/BLS              | Certification | 2 years           | Required       |
| First Aid            | Certification | 2 years           | Required       |
| TB Test              | Health        | 1 year            | Required       |
| Physical Exam        | Health        | 1 year            | Required       |
| Background Check     | Compliance    | 1-2 years         | Required       |
| Driver's License     | Other         | Varies            | If driving     |
| Auto Insurance       | Other         | 6 months - 1 year | If driving     |
| COVID Vaccination    | Health        | N/A               | Company policy |
| Specialized Training | Training      | Varies            | By client need |

### 2. Data Model

```
┌─────────────────────────────────────────────────────────────────┐
│                      CredentialType                              │
│  (Company-defined credential requirements)                       │
├─────────────────────────────────────────────────────────────────┤
│  id, name, category, defaultValidityMonths, isRequired,         │
│  requiredForRoles[], description, companyId                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1:many
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CaregiverCredential                           │
│  (Individual caregiver's credential instances)                   │
├─────────────────────────────────────────────────────────────────┤
│  id, credentialTypeId, caregiverProfileId                        │
│  licenseNumber, issuingAuthority, issuingState                   │
│  issueDate, expirationDate                                       │
│  status: ACTIVE | EXPIRING_SOON | EXPIRED | PENDING_VERIFICATION │
│  documentUrls[], verificationUrl, verifiedAt, verifiedById       │
│  notes                                                           │
│  reminder30DaySent, reminder7DaySent, expiredAlertSent          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1:many
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     CredentialAlert                              │
│  (Actionable alerts for expiring/expired credentials)            │
├─────────────────────────────────────────────────────────────────┤
│  id, credentialId, alertType, message, severity                  │
│  isRead, readAt, isDismissed, dismissedAt                        │
│  actionTaken, actionTakenAt, actionTakenById                     │
│  companyId, createdAt                                            │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Alert Timeline

```
        60 days          30 days           7 days          Expiration
           │                │                 │                 │
           ▼                ▼                 ▼                 ▼
    ┌──────────┐     ┌──────────┐      ┌──────────┐      ┌──────────┐
    │ Optional │     │  Email   │      │  Email   │      │ CRITICAL │
    │ Reminder │     │ + In-App │      │ + In-App │      │  ALERT   │
    │ (config) │     │  MEDIUM  │      │   HIGH   │      │ + Block  │
    └──────────┘     └──────────┘      └──────────┘      └──────────┘
                          │                  │                  │
                          ▼                  ▼                  ▼
                    Notify Carer       Notify Carer       Notify Admin
                    + Supervisor       + Supervisor       + Supervisor
                                       + Admin            + Carer
                                                          + Prevent
                                                            Scheduling
```

### 4. Notification Events

| Event                            | Recipients               | Channels           | Priority |
| -------------------------------- | ------------------------ | ------------------ | -------- |
| `CREDENTIAL_EXPIRING_60_DAYS`    | Carer                    | Email              | LOW      |
| `CREDENTIAL_EXPIRING_30_DAYS`    | Carer, Supervisor        | Email, In-App      | MEDIUM   |
| `CREDENTIAL_EXPIRING_7_DAYS`     | Carer, Supervisor, Admin | Email, In-App      | HIGH     |
| `CREDENTIAL_EXPIRED`             | Carer, Supervisor, Admin | Email, In-App, SMS | CRITICAL |
| `CREDENTIAL_RENEWED`             | Admin                    | In-App             | LOW      |
| `CREDENTIAL_VERIFICATION_NEEDED` | Admin                    | In-App             | MEDIUM   |

### 5. User Interface

#### 5.1 Caregiver View: My Credentials

```
┌─────────────────────────────────────────────────────────────────┐
│  My Credentials                                    [+ Add New]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ⚠️ 1 credential expiring soon                                  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🟢 CNA Certification          Expires: Dec 15, 2026        ││
│  │    License #: CNA-12345       Issued by: MD Board          ││
│  │    [View Document]                                          ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🟡 CPR/BLS Certification      Expires: Mar 10, 2026        ││
│  │    ⚠️ Expiring in 27 days                                  ││
│  │    [View Document] [Upload Renewal]                         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🔴 TB Test                    EXPIRED: Jan 15, 2026        ││
│  │    ❌ This credential has expired                          ││
│  │    [Upload Renewal]                                         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 5.2 Admin View: Credential Compliance Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  Credential Compliance                              [Settings]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │    45    │  │    3     │  │    8     │  │    2     │        │
│  │ Compliant│  │ Expiring │  │ Expiring │  │ Expired  │        │
│  │          │  │  30 days │  │  7 days  │  │          │        │
│  │   🟢     │  │    🟡    │  │    🟠    │  │    🔴    │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│  Alerts Requiring Attention                                     │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  🔴 CRITICAL: John Smith - CPR expired 2 days ago               │
│     [View] [Contact Caregiver] [Dismiss]                        │
│                                                                  │
│  🟠 HIGH: Jane Doe - RN License expires in 5 days               │
│     [View] [Contact Caregiver] [Dismiss]                        │
│                                                                  │
│  🟡 MEDIUM: Bob Wilson - TB Test expires in 25 days             │
│     [View] [Dismiss]                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 5.3 Admin View: Credential Types Settings

```
┌─────────────────────────────────────────────────────────────────┐
│  Credential Types                              [+ Add Type]     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────┬──────────┬──────────┬──────────┬─────────┐ │
│  │ Type           │ Category │ Validity │ Required │ Actions │ │
│  ├────────────────┼──────────┼──────────┼──────────┼─────────┤ │
│  │ CNA Cert       │ License  │ 24 mo    │ ✓ All    │ Edit    │ │
│  │ CPR/BLS        │ Cert     │ 24 mo    │ ✓ All    │ Edit    │ │
│  │ First Aid      │ Cert     │ 24 mo    │ ✓ All    │ Edit    │ │
│  │ TB Test        │ Health   │ 12 mo    │ ✓ All    │ Edit    │ │
│  │ RN License     │ License  │ 24 mo    │ RN only  │ Edit    │ │
│  │ Driver License │ Other    │ 48 mo    │ Drivers  │ Edit    │ │
│  └────────────────┴──────────┴──────────┴──────────┴─────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6. Scheduling Integration

When assigning a caregiver to a shift:

```
┌─────────────────────────────────────────────────────────────────┐
│  Assign Caregiver to Shift                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ⚠️ Warning: John Smith has credential issues                   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🔴 CPR/BLS - EXPIRED (Jan 15, 2026)                        ││
│  │ 🟡 TB Test - Expiring in 10 days                           ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [ ] Override and assign anyway (requires reason)               │
│      Reason: ____________________________                       │
│                                                                  │
│  [Cancel]                              [Assign with Override]   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7. Background Job: Daily Credential Check

A scheduled job runs daily to:

1. Check all credentials for upcoming expirations
2. Update credential status (ACTIVE → EXPIRING_SOON → EXPIRED)
3. Create CredentialAlerts for new expirations
4. Dispatch notifications via the existing notification system
5. Flag caregivers with expired required credentials

---

## Implementation Phases

### Phase 1: Core Infrastructure (Foundation)

- [ ] Database schema: CredentialType, CaregiverCredential, CredentialAlert models
- [ ] Prisma migration
- [ ] Basic CRUD API endpoints for credentials
- [ ] Seed common credential types (CNA, CPR, First Aid, TB, etc.)

### Phase 2: Caregiver Experience

- [ ] "My Credentials" page for caregivers
- [ ] Add/edit credential form with document upload
- [ ] Credential status display (active, expiring, expired)
- [ ] View uploaded documents

### Phase 3: Admin Dashboard

- [ ] Compliance dashboard with summary stats
- [ ] Credential alerts page (following AuthorizationAlert pattern)
- [ ] Credential types settings page
- [ ] Individual caregiver credential view

### Phase 4: Notification System

- [ ] Add new notification event types
- [ ] Create email templates for credential reminders
- [ ] Daily background job for expiration checking
- [ ] Integrate with existing notification dispatcher

### Phase 5: Scheduling Integration

- [ ] Add credential check to shift assignment flow
- [ ] Warning/blocking for expired credentials
- [ ] Override capability with audit trail
- [ ] Compliance reporting

---

## Technical Considerations

### Leveraging Existing Infrastructure

| Component     | Existing                    | Reuse Strategy                    |
| ------------- | --------------------------- | --------------------------------- |
| Notifications | Full system with dispatcher | Add 6 new event types             |
| Alerts UI     | AuthorizationAlert page     | Clone pattern for CredentialAlert |
| File Upload   | Likely exists for documents | Reuse for credential docs         |
| Multi-tenancy | Full company scoping        | Inherit via user.companyId        |
| Audit Trail   | NotificationLog pattern     | Apply to credential changes       |

### State-Specific Requirements

The existing `StateConfiguration` model can be extended to define:

- Which credentials are required per state
- State-specific renewal periods
- State verification URL patterns

---

## Success Metrics

| Metric                                      | Target |
| ------------------------------------------- | ------ |
| Expired credentials discovered reactively   | → 0    |
| Credentials renewed before expiration       | > 95%  |
| Admin time spent on manual tracking         | -80%   |
| Compliance audit findings                   | 0      |
| Caregiver satisfaction with renewal process | > 4/5  |

---

## Questions for Stakeholder Review

1. **Reminder Timing**: Is 60/30/7 days appropriate, or should we allow company configuration?
2. **Blocking vs Warning**: Should expired credentials hard-block scheduling or just warn?
3. **Verification**: Do we need admin verification of uploaded credentials before they're valid?
4. **Integration**: Should we integrate with any credential verification APIs (e.g., state nursing board lookups)?
5. **Mobile**: Do caregivers need mobile app support for this, or is web sufficient?

---

## Appendix: Prisma Schema

```prisma
enum CredentialCategory {
  LICENSE
  CERTIFICATION
  HEALTH
  TRAINING
  COMPLIANCE
  OTHER
}

enum CredentialStatus {
  ACTIVE
  EXPIRING_SOON
  EXPIRED
  PENDING_VERIFICATION
  REVOKED
}

model CredentialType {
  id                    String              @id @default(cuid())
  name                  String              // "CNA Certification", "CPR/BLS", etc.
  category              CredentialCategory
  description           String?
  defaultValidityMonths Int                 @default(24)
  isRequired            Boolean             @default(false)
  requiredForRoles      String[]            // ["CARER"] or ["RN", "LPN"]
  reminderDays          Int[]               @default([60, 30, 7])

  companyId             String
  company               Company             @relation(fields: [companyId], references: [id])

  credentials           CaregiverCredential[]

  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  @@unique([companyId, name])
  @@index([companyId])
}

model CaregiverCredential {
  id                    String              @id @default(cuid())

  // Credential details
  licenseNumber         String?
  issuingAuthority      String?             // "Maryland Board of Nursing"
  issuingState          String?             // "MD"
  issueDate             DateTime
  expirationDate        DateTime

  // Status
  status                CredentialStatus    @default(ACTIVE)

  // Documents
  documentUrls          String[]
  verificationUrl       String?

  // Verification (optional admin verification)
  isVerified            Boolean             @default(false)
  verifiedAt            DateTime?
  verifiedById          String?
  verifiedBy            User?               @relation("CredentialVerifier", fields: [verifiedById], references: [id])

  // Reminder tracking
  reminder60DaySent     Boolean             @default(false)
  reminder30DaySent     Boolean             @default(false)
  reminder7DaySent      Boolean             @default(false)
  expiredAlertSent      Boolean             @default(false)

  notes                 String?

  // Relations
  credentialTypeId      String
  credentialType        CredentialType      @relation(fields: [credentialTypeId], references: [id])

  caregiverProfileId    String
  caregiverProfile      CaregiverProfile    @relation(fields: [caregiverProfileId], references: [id])

  alerts                CredentialAlert[]

  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  @@index([caregiverProfileId])
  @@index([credentialTypeId])
  @@index([expirationDate])
  @@index([status])
}

model CredentialAlert {
  id                    String              @id @default(cuid())

  alertType             String              // EXPIRING_60, EXPIRING_30, EXPIRING_7, EXPIRED
  message               String
  severity              String              // INFO, WARNING, HIGH, CRITICAL

  // Status
  isRead                Boolean             @default(false)
  readAt                DateTime?
  isDismissed           Boolean             @default(false)
  dismissedAt           DateTime?
  dismissedById         String?
  dismissedBy           User?               @relation("CredentialAlertDismisser", fields: [dismissedById], references: [id])

  // Action tracking
  actionTaken           String?
  actionTakenAt         DateTime?
  actionTakenById       String?
  actionTakenBy         User?               @relation("CredentialAlertAction", fields: [actionTakenById], references: [id])

  // Relations
  credentialId          String
  credential            CaregiverCredential @relation(fields: [credentialId], references: [id], onDelete: Cascade)

  companyId             String
  company               Company             @relation(fields: [companyId], references: [id])

  createdAt             DateTime            @default(now())

  @@index([credentialId])
  @@index([companyId])
  @@index([severity])
  @@index([isRead])
  @@index([createdAt])
}
```

---

## Next Steps

1. **Review this spec** with stakeholders
2. **Prioritize phases** based on business need
3. **Begin Phase 1** implementation with database schema
4. **Iterate** based on feedback

---

_Document Version: 1.0_
_Author: Product Team_
_Date: February 2026_
