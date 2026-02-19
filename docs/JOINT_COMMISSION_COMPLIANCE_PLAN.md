# Joint Commission Compliance Implementation Plan

## CareBase Home Care Management System

**Document Version:** 1.1
**Created:** February 2026
**Last Updated:** February 17, 2026
**Purpose:** Comprehensive specification for achieving Joint Commission accreditation compliance

---

## Implementation Status Summary

> **Phase 2 (HR Compliance) - COMPLETED**

| Module                    | Status         | Database | API | UI  |
| ------------------------- | -------------- | -------- | --- | --- |
| Competency Management     | ✅ IMPLEMENTED | ✅       | ✅  | ✅  |
| Training & Education      | ✅ IMPLEMENTED | ✅       | ✅  | ✅  |
| Supervision Documentation | ✅ IMPLEMENTED | ✅       | ✅  | ✅  |
| Remediation Management    | ✅ IMPLEMENTED | ✅       | ✅  | ✅  |
| Reassessment Scheduling   | 📋 Planned     | -        | -   | -   |
| Root Cause Analysis       | 📋 Planned     | -        | -   | -   |
| Infection Control         | 📋 Planned     | -        | -   | -   |
| Quality Metrics           | 📋 Planned     | -        | -   | -   |
| Document Control          | 📋 Planned     | -        | -   | -   |
| Patient Rights            | 📋 Planned     | -        | -   | -   |
| OASIS-C2                  | 📋 Planned     | -        | -   | -   |

### What Was Implemented

**Database Models Added (19 new models):**

- `Competency`, `StaffCompetency`, `TaskCompetencyRequirement`
- `RemediationPlan`, `RemediationActivity`
- `TrainingCourse`, `TrainingSession`, `TrainingAttendance`, `TrainingAssignment`
- `SupervisoryRelationship`, `SupervisionVisit`, `StaffDevelopmentPlan`, `DevelopmentGoal`
- 20+ supporting enums

**API Endpoints Created:**

- `/api/competencies` - CRUD for competency definitions
- `/api/competencies/[id]` - Individual competency operations
- `/api/staff/[id]/competencies` - Staff competency assessments
- `/api/remediation-plans` - Remediation plan management
- `/api/remediation-plans/[id]/activities` - Activity management
- `/api/remediation-plans/[id]/verify` - Completion verification
- `/api/training/courses` - Course management
- `/api/training/courses/[id]` - Individual course operations
- `/api/training/sessions` - Session scheduling
- `/api/training/sessions/[id]/attendance` - Attendance tracking
- `/api/training/assignments` - Assignment management (single & bulk)
- `/api/supervision/relationships` - Supervisory relationships
- `/api/supervision/visits` - Visit scheduling and documentation
- `/api/supervision/visits/[id]/sign` - Signature capture

**UI Pages Created:**

- `/settings/competencies` - Competency library management
- `/training` - Training dashboard with courses, sessions, assignments
- `/supervision` - Supervision dashboard with relationships and visits

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Assessment](#current-state-assessment)
3. [Gap Analysis by Standard](#gap-analysis-by-standard)
4. [Module Specifications](#module-specifications)
   - [Reassessment Scheduling System](#1-reassessment-scheduling-system)
   - [Competency Management System](#2-competency-management-system)
   - [Training & Education Module](#3-training--education-module)
   - [Supervision Documentation System](#4-supervision-documentation-system)
   - [Root Cause Analysis Module](#5-root-cause-analysis-module)
   - [Infection Prevention & Control](#6-infection-prevention--control)
   - [Quality Metrics & Outcomes](#7-quality-metrics--outcomes)
   - [Document Control & Audit Trail](#8-document-control--audit-trail)
   - [Patient Rights & Consent Enhancements](#9-patient-rights--consent-enhancements)
   - [OASIS-C2 Integration](#10-oasis-c2-integration)
5. [Database Schema Additions](#database-schema-additions)
6. [API Endpoints](#api-endpoints)
7. [UI/UX Requirements](#uiux-requirements)
8. [Implementation Phases](#implementation-phases)
9. [Testing & Validation](#testing--validation)
10. [Compliance Dashboard](#compliance-dashboard)

---

## Executive Summary

This document outlines the features and specifications required to bring CareBase into compliance with Joint Commission Home Care Accreditation Standards. The implementation is organized into 10 major modules addressing gaps in:

- **Human Resources (HR)** - Competency, training, supervision
- **Provision of Care (PC)** - Assessments, care plans, reassessments
- **Performance Improvement (PI)** - Quality metrics, incident analysis
- **Infection Control (IC)** - Infection tracking and prevention
- **Information Management (IM)** - Documentation, audit trails
- **Rights & Responsibilities (RI)** - Consents, advance directives

**Estimated Scope:** 10 modules, ~45 new database models, ~120 API endpoints, ~60 UI pages/components

---

## Current State Assessment

### Existing Strengths

| Feature                        | Status      | Notes                                     |
| ------------------------------ | ----------- | ----------------------------------------- |
| Credential expiration tracking | ✅ Complete | Automated reminders at 60/30/7 days       |
| Assessment templates           | ✅ Complete | 40+ assessment types, scoring system      |
| Care plan generation           | ✅ Complete | Assessment-driven task generation         |
| Visit note documentation       | ✅ Complete | Templates, QA workflow                    |
| Audit logging                  | ✅ Partial  | Actions logged, needs before/after values |
| EVV compliance                 | ✅ Complete | GPS tracking, compliance status           |
| Incident reporting             | ✅ Partial  | Basic workflow, needs RCA                 |
| Consent management             | ✅ Partial  | 9 forms, needs advance directives         |
| QA review workflow             | ✅ Complete | Assessments and visit notes               |

### Critical Gaps

| Gap                          | Joint Commission Standard | Risk Level | Status             |
| ---------------------------- | ------------------------- | ---------- | ------------------ |
| No reassessment scheduling   | PC.01.02.03               | CRITICAL   | 📋 Planned         |
| No competency verification   | HR.01.02.05               | CRITICAL   | ✅ **IMPLEMENTED** |
| No supervision documentation | HR.01.06.01               | CRITICAL   | ✅ **IMPLEMENTED** |
| No root cause analysis       | PI.01.01.01               | CRITICAL   | 📋 Planned         |
| No infection tracking        | IC.01.01.01               | CRITICAL   | 📋 Planned         |
| No OASIS-C2 assessments      | PC.01.02.01               | HIGH       | 📋 Planned         |
| No training management       | HR.01.05.03               | HIGH       | ✅ **IMPLEMENTED** |
| Incomplete audit trail       | IM.02.02.01               | HIGH       | 📋 Planned         |
| No advance directive forms   | RI.01.01.01               | HIGH       | 📋 Planned         |
| No outcome measurement       | PI.03.01.01               | MEDIUM     | 📋 Planned         |

---

## Gap Analysis by Standard

### HR - Human Resources Standards

#### HR.01.02.05 - Competency Verification

**Requirement:** Organization verifies staff competencies and ensures they are qualified to perform assigned duties.

**Current State:**

- Credential tracking exists (licenses, certifications)
- No competency assessment or skills verification
- No task-to-competency mapping

**Required:**

- Competency assessment framework
- Skills verification with documentation
- Competency-to-task requirements
- Annual competency reassessment
- Competency expiration tracking

#### HR.01.05.03 - Training & Education

**Requirement:** Staff receive ongoing education and training appropriate to their responsibilities.

**Current State:**

- TRAINING credential category exists but unused
- No training session tracking
- No attendance records
- No mandatory training enforcement

**Required:**

- Training course management
- Attendance tracking with certificates
- Mandatory training assignments
- Training effectiveness evaluation
- CEU/contact hour tracking

#### HR.01.06.01 - Supervision

**Requirement:** Staff are supervised according to professional standards and organizational policy.

**Current State:**

- SUPERVISOR role exists
- No supervision visit records
- No supervisory relationship tracking
- No supervision schedules

**Required:**

- Supervisor-supervisee relationships
- Supervision visit documentation
- Supervision frequency enforcement
- Performance feedback tracking
- Corrective action plans

---

### PC - Provision of Care Standards

#### PC.01.02.01 - Comprehensive Assessment

**Requirement:** Organization conducts comprehensive, individualized assessments.

**Current State:**

- Multiple assessment types available
- No OASIS-C2 standard items
- No assessment completeness validation
- No mandatory assessment enforcement

**Required:**

- OASIS-C2 compliant assessment items
- Assessment completeness validation
- Mandatory assessment requirements by discipline
- Assessment timeliness tracking

#### PC.01.02.03 - Reassessment

**Requirement:** Patient is reassessed at defined intervals and when condition changes.

**Current State:**

- `expiresAt` field exists but unused
- `assessmentFrequency` on Intake unused
- No automated scheduling
- No reassessment notifications

**Required:**

- Automated reassessment scheduling
- Configurable frequencies by assessment type
- Reassessment due notifications
- Overdue assessment alerts
- Condition change triggers

#### PC.01.03.01 - Individualized Care Plan

**Requirement:** Care plan is individualized based on assessment findings.

**Current State:**

- Care plan generation from assessments exists
- Limited to score-based task generation
- No comprehensive finding incorporation
- No outcome tracking

**Required:**

- Full assessment finding integration
- Individualized goal setting
- Progress tracking
- Care plan reassessment alignment

---

### PI - Performance Improvement Standards

#### PI.01.01.01 - Root Cause Analysis

**Requirement:** Organization investigates adverse events and near-misses.

**Current State:**

- Incident reporting exists
- Basic approval workflow
- No investigation process
- No corrective action tracking

**Required:**

- Structured RCA methodology
- Investigation workflow
- Causal factor documentation
- Corrective action plans
- Effectiveness verification

#### PI.03.01.01 - Outcome Measurement

**Requirement:** Organization measures patient outcomes and uses data for improvement.

**Current State:**

- Basic reporting exists
- No outcome tracking
- No rehospitalization monitoring
- No patient satisfaction tracking

**Required:**

- Clinical outcome metrics
- Rehospitalization tracking
- Patient satisfaction surveys
- Functional improvement tracking
- Outcome trending and analysis

---

### IC - Infection Control Standards

#### IC.01.01.01 - Infection Prevention Program

**Requirement:** Organization has infection prevention and control program.

**Current State:**

- No infection tracking
- No outbreak management
- Infection_Control consent type only

**Required:**

- Infection surveillance system
- Outbreak detection and management
- Isolation precaution tracking
- Staff exposure tracking
- Infection rate reporting

---

### IM - Information Management Standards

#### IM.02.02.01 - Complete Documentation

**Requirement:** Health information is complete, accurate, and protected.

**Current State:**

- Audit logging tracks actions
- No before/after value capture
- Approved documents can be edited
- No version control for documents

**Required:**

- Detailed change tracking with values
- Document immutability after approval
- Version control for documents
- Comprehensive audit reports

---

### RI - Rights & Responsibilities Standards

#### RI.01.01.01 - Patient Rights

**Requirement:** Organization respects patient rights including advance directives.

**Current State:**

- 9 consent form templates
- Advance directive field in care plan
- No AD/DNR/POLST forms implemented
- No capacity assessment

**Required:**

- Advance directive form templates
- DNR/POLST documentation
- Healthcare proxy/POA tracking
- Capacity assessment documentation
- Rights acknowledgment tracking

---

## Module Specifications

### 1. Reassessment Scheduling System

#### Overview

Automated system to schedule, track, and enforce reassessment requirements based on clinical standards and organizational policy.

#### Functional Requirements

**FR-1.1: Assessment Schedule Configuration**

- Configure reassessment frequency by assessment type
- Support multiple frequency patterns:
  - Fixed interval (every X days)
  - Calendar-based (monthly, quarterly)
  - Event-driven (condition change, hospitalization)
- State-specific regulatory requirements
- Payer-specific requirements (Medicare, Medicaid, private)

**FR-1.2: Automated Scheduling Engine**

- Calculate next reassessment date upon assessment completion
- Create scheduled assessment records
- Account for weekends/holidays (configurable)
- Handle schedule conflicts

**FR-1.3: Notification System**

- Upcoming reassessment notifications (configurable days ahead)
- Overdue reassessment alerts
- Escalation for missed reassessments
- Multi-channel notifications (in-app, email, SMS)

**FR-1.4: Compliance Tracking**

- Real-time compliance dashboard
- Assessment timeliness metrics
- Compliance rate by clinician, client, assessment type
- Trend analysis

**FR-1.5: Override & Exception Handling**

- Manual schedule adjustment with reason documentation
- Skip/defer with clinical justification
- Emergency reassessment triggers
- Audit trail for all changes

#### Data Model

```prisma
model AssessmentSchedule {
  id                    String   @id @default(cuid())
  clientId              String
  client                Client   @relation(fields: [clientId], references: [id])
  assessmentTemplateId  String
  assessmentTemplate    AssessmentTemplate @relation(fields: [assessmentTemplateId], references: [id])

  // Scheduling
  scheduledDate         DateTime
  dueDate               DateTime  // scheduledDate + grace period
  frequency             AssessmentFrequency
  frequencyDays         Int?      // For custom frequencies

  // Triggers
  triggerType           ScheduleTriggerType // INITIAL, RECURRING, CONDITION_CHANGE, HOSPITALIZATION
  triggerReason         String?

  // Status
  status                ScheduleStatus // PENDING, COMPLETED, OVERDUE, SKIPPED, CANCELLED
  completedAssessmentId String?
  completedAssessment   Assessment? @relation(fields: [completedAssessmentId], references: [id])
  completedAt           DateTime?

  // Override
  skippedReason         String?
  skippedById           String?
  skippedBy             User? @relation("SkippedBy", fields: [skippedById], references: [id])

  // Notifications
  remindersSent         Int @default(0)
  lastReminderAt        DateTime?
  escalatedAt           DateTime?
  escalatedToId         String?

  // Audit
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  companyId             String

  @@index([clientId, status])
  @@index([scheduledDate])
  @@index([status, companyId])
}

enum AssessmentFrequency {
  DAILY
  WEEKLY
  BIWEEKLY
  MONTHLY
  QUARTERLY
  SEMI_ANNUALLY
  ANNUALLY
  CUSTOM
  ON_CONDITION_CHANGE
}

enum ScheduleTriggerType {
  INITIAL
  RECURRING
  CONDITION_CHANGE
  HOSPITALIZATION
  PAYER_REQUIRED
  REGULATORY
  MANUAL
}

enum ScheduleStatus {
  PENDING
  DUE
  OVERDUE
  COMPLETED
  SKIPPED
  CANCELLED
}

model AssessmentScheduleConfig {
  id                    String   @id @default(cuid())
  assessmentTemplateId  String   @unique
  assessmentTemplate    AssessmentTemplate @relation(fields: [assessmentTemplateId], references: [id])

  // Default frequency
  defaultFrequency      AssessmentFrequency
  defaultFrequencyDays  Int?

  // Grace period
  gracePeriodDays       Int @default(7)

  // Notification settings
  reminderDays          Int[] @default([14, 7, 3, 1])
  escalationDays        Int @default(3)  // Days overdue before escalation

  // Requirements
  isRequired            Boolean @default(false)
  requiredForPayers     String[] // ["MEDICARE", "MEDICAID"]
  requiredByState       String[] // ["MD", "VA"]

  companyId             String
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

#### API Endpoints

| Method | Endpoint                                  | Description                             |
| ------ | ----------------------------------------- | --------------------------------------- |
| GET    | `/api/assessment-schedules`               | List scheduled assessments with filters |
| GET    | `/api/assessment-schedules/upcoming`      | Get upcoming assessments for dashboard  |
| GET    | `/api/assessment-schedules/overdue`       | Get overdue assessments                 |
| GET    | `/api/assessment-schedules/[id]`          | Get schedule details                    |
| POST   | `/api/assessment-schedules`               | Create manual schedule                  |
| PATCH  | `/api/assessment-schedules/[id]`          | Update schedule                         |
| POST   | `/api/assessment-schedules/[id]/skip`     | Skip with reason                        |
| POST   | `/api/assessment-schedules/[id]/complete` | Mark as completed                       |
| GET    | `/api/assessment-schedules/config`        | Get schedule configurations             |
| POST   | `/api/assessment-schedules/config`        | Create/update config                    |
| GET    | `/api/assessment-schedules/compliance`    | Get compliance metrics                  |

#### UI Components

1. **Assessment Schedule Dashboard** (`/assessments/schedule`)
   - Calendar view of upcoming assessments
   - List view with filters (client, type, status)
   - Quick actions (complete, skip, reschedule)

2. **Schedule Configuration** (`/settings/assessment-schedules`)
   - Configure frequencies per assessment type
   - Set reminder thresholds
   - Define escalation rules

3. **Client Assessment Timeline** (embedded in client detail)
   - Visual timeline of past and upcoming assessments
   - Color-coded by status
   - Quick schedule actions

4. **Overdue Assessment Alert Widget** (dashboard)
   - Count of overdue assessments
   - Click-through to filtered list
   - Severity indicators

#### Business Rules

1. Initial assessment generates first recurring schedule
2. Completed assessment generates next scheduled assessment
3. Reassessment within grace period counts as on-time
4. Skipped assessments require documented reason and supervisor approval
5. Three consecutive overdue assessments trigger supervisor notification
6. OASIS assessments follow CMS-specific timing rules
7. Condition change invalidates existing schedule, triggers immediate reassessment

---

### 2. Competency Management System

#### Overview

System to define, assess, track, and enforce staff competencies ensuring qualified personnel perform appropriate duties.

#### Functional Requirements

**FR-2.1: Competency Definition**

- Define competencies by category (clinical, technical, regulatory)
- Link competencies to job roles
- Specify assessment methods (observation, test, demonstration)
- Set validity periods and revalidation requirements

**FR-2.2: Competency Assessment**

- Conduct competency assessments with structured forms
- Record assessment results (Pass/Fail/Needs Improvement)
- Document observations and feedback
- Support multiple assessors

**FR-2.3: Task-Competency Mapping**

- Link tasks/services to required competencies
- Prevent assignment of unqualified staff
- Alert when competency expires before scheduled task
- Support competency prerequisites

**FR-2.4: Competency Tracking**

- Dashboard showing staff competency status
- Expiration alerts
- Compliance reporting
- Historical competency record

**FR-2.5: Remediation**

- Track staff with competency gaps
- Create remediation plans
- Monitor remediation progress
- Document remediation completion

#### Data Model

```prisma
model Competency {
  id                    String   @id @default(cuid())
  name                  String
  description           String?
  category              CompetencyCategory

  // Assessment
  assessmentMethod      AssessmentMethod
  assessmentFormId      String?  // Link to assessment template
  passingScore          Float?   // For scored assessments

  // Validity
  validityMonths        Int @default(12)
  requiresRevalidation  Boolean @default(true)

  // Requirements
  prerequisiteIds       String[]
  requiredForRoles      UserRole[]
  requiredForServices   String[] // Service type IDs

  // Status
  isActive              Boolean @default(true)

  companyId             String
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  staffCompetencies     StaffCompetency[]
  taskCompetencies      TaskCompetencyRequirement[]

  @@unique([name, companyId])
}

enum CompetencyCategory {
  CLINICAL_SKILLS
  MEDICATION_MANAGEMENT
  INFECTION_CONTROL
  SAFETY_PROCEDURES
  DOCUMENTATION
  COMMUNICATION
  EQUIPMENT_OPERATION
  EMERGENCY_RESPONSE
  PATIENT_RIGHTS
  REGULATORY_COMPLIANCE
  SPECIALIZED_CARE
}

enum AssessmentMethod {
  DIRECT_OBSERVATION
  SKILLS_DEMONSTRATION
  WRITTEN_TEST
  VERBAL_ASSESSMENT
  SIMULATION
  CASE_STUDY
  PEER_REVIEW
  SUPERVISOR_EVALUATION
  SELF_ASSESSMENT_WITH_VALIDATION
}

model StaffCompetency {
  id                    String   @id @default(cuid())

  userId                String
  user                  User     @relation(fields: [userId], references: [id])
  competencyId          String
  competency            Competency @relation(fields: [competencyId], references: [id])

  // Assessment
  assessedAt            DateTime
  assessedById          String
  assessedBy            User     @relation("Assessor", fields: [assessedById], references: [id])

  // Results
  status                CompetencyStatus
  score                 Float?
  observations          String?
  strengths             String?
  areasForImprovement   String?

  // Documentation
  documentUrls          String[]
  assessmentResponseId  String?  // Link to completed assessment

  // Validity
  validUntil            DateTime
  isExpired             Boolean @default(false)

  // Remediation
  requiresRemediation   Boolean @default(false)
  remediationPlanId     String?
  remediationPlan       RemediationPlan? @relation(fields: [remediationPlanId], references: [id])

  companyId             String
  createdAt             DateTime @default(now())

  @@unique([userId, competencyId, assessedAt])
  @@index([userId, status])
  @@index([validUntil])
}

enum CompetencyStatus {
  COMPETENT
  NOT_COMPETENT
  NEEDS_IMPROVEMENT
  IN_PROGRESS
  EXPIRED
  WAIVED
}

model TaskCompetencyRequirement {
  id                    String   @id @default(cuid())

  // What requires this competency
  serviceTypeId         String?
  serviceType           ServiceType? @relation(fields: [serviceTypeId], references: [id])
  taskDescription       String?  // For ad-hoc tasks

  competencyId          String
  competency            Competency @relation(fields: [competencyId], references: [id])

  isRequired            Boolean @default(true)  // vs preferred

  companyId             String
  createdAt             DateTime @default(now())

  @@unique([serviceTypeId, competencyId])
}

model RemediationPlan {
  id                    String   @id @default(cuid())

  userId                String
  user                  User     @relation(fields: [userId], references: [id])

  // Gap identification
  competencyGaps        String[] // Competency IDs
  identifiedAt          DateTime @default(now())
  identifiedById        String
  identifiedBy          User     @relation("GapIdentifier", fields: [identifiedById], references: [id])

  // Plan
  planDescription       String
  targetCompletionDate  DateTime

  // Activities
  activities            RemediationActivity[]

  // Status
  status                RemediationStatus
  completedAt           DateTime?
  verifiedById          String?
  verifiedBy            User?    @relation("Verifier", fields: [verifiedById], references: [id])
  verificationNotes     String?

  companyId             String
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  staffCompetencies     StaffCompetency[]
}

model RemediationActivity {
  id                    String   @id @default(cuid())

  remediationPlanId     String
  remediationPlan       RemediationPlan @relation(fields: [remediationPlanId], references: [id])

  activityType          RemediationActivityType
  description           String
  dueDate               DateTime

  // Completion
  completedAt           DateTime?
  completedById         String?
  completedBy           User?    @relation(fields: [completedById], references: [id])
  completionNotes       String?
  documentUrls          String[]

  // Training link
  trainingSessionId     String?
  trainingSession       TrainingSession? @relation(fields: [trainingSessionId], references: [id])

  createdAt             DateTime @default(now())
}

enum RemediationActivityType {
  TRAINING_COURSE
  SUPERVISED_PRACTICE
  SKILLS_LAB
  READING_ASSIGNMENT
  MENTORING_SESSION
  REASSESSMENT
  OBSERVATION_HOURS
  CASE_REVIEW
}

enum RemediationStatus {
  PENDING
  IN_PROGRESS
  COMPLETED_PENDING_VERIFICATION
  VERIFIED_COMPLETE
  EXTENDED
  FAILED
}
```

#### API Endpoints

| Method | Endpoint                              | Description                 |
| ------ | ------------------------------------- | --------------------------- |
| GET    | `/api/competencies`                   | List competency definitions |
| POST   | `/api/competencies`                   | Create competency           |
| GET    | `/api/competencies/[id]`              | Get competency details      |
| PATCH  | `/api/competencies/[id]`              | Update competency           |
| GET    | `/api/staff/[id]/competencies`        | Get staff competencies      |
| POST   | `/api/staff/[id]/competencies`        | Assess staff competency     |
| GET    | `/api/staff/competencies/expiring`    | Get expiring competencies   |
| GET    | `/api/staff/competencies/gaps`        | Get competency gaps         |
| POST   | `/api/remediation-plans`              | Create remediation plan     |
| PATCH  | `/api/remediation-plans/[id]`         | Update plan                 |
| POST   | `/api/remediation-plans/[id]/verify`  | Verify completion           |
| GET    | `/api/task-competencies`              | Get task requirements       |
| POST   | `/api/task-competencies`              | Map task to competencies    |
| GET    | `/api/scheduling/validate-competency` | Check staff eligibility     |

#### UI Components

1. **Competency Library** (`/settings/competencies`)
   - List/grid of defined competencies
   - Create/edit competency forms
   - Category filtering

2. **Staff Competency Profile** (embedded in staff detail)
   - Competency status grid
   - Expiration timeline
   - Assessment history
   - Quick assess action

3. **Competency Assessment Form** (modal)
   - Structured assessment fields
   - Score/status entry
   - Observation documentation
   - Document upload

4. **Remediation Management** (`/staff/remediation`)
   - Active remediation plans
   - Activity tracking
   - Verification workflow

5. **Competency Compliance Dashboard** (`/reports/competency`)
   - Organization-wide compliance rate
   - Expiring competencies
   - Gap analysis
   - Trending

#### Business Rules

1. Staff cannot be scheduled for tasks requiring competencies they lack
2. Competency expiration within 30 days triggers notification
3. Expired competency automatically prevents new assignments
4. Supervisor approval required to waive competency requirement
5. Failed competency assessment requires remediation plan within 7 days
6. New hire must complete core competencies within 90 days
7. Competency assessment documented within 24 hours of observation

---

### 3. Training & Education Module

#### Overview

Comprehensive system to manage training courses, track attendance, document completion, and ensure mandatory training compliance.

#### Functional Requirements

**FR-3.1: Training Course Management**

- Create and manage training courses
- Define learning objectives
- Set course duration and format (in-person, online, hybrid)
- Track CEU/contact hours

**FR-3.2: Training Scheduling**

- Schedule training sessions
- Manage instructor assignments
- Handle registration and capacity
- Send reminders and calendar invites

**FR-3.3: Attendance Tracking**

- Record attendance (present, absent, partial)
- Document completion status
- Issue certificates
- Track makeup requirements

**FR-3.4: Mandatory Training Assignment**

- Assign required training by role
- Set due dates
- Track completion
- Escalate non-compliance

**FR-3.5: Training Effectiveness**

- Post-training assessments
- Knowledge checks
- Feedback collection
- Training outcome correlation

#### Data Model

```prisma
model TrainingCourse {
  id                    String   @id @default(cuid())

  title                 String
  description           String?
  category              TrainingCategory

  // Format
  format                TrainingFormat
  durationMinutes       Int

  // Credits
  ceuCredits            Float @default(0)
  contactHours          Float @default(0)

  // Content
  learningObjectives    String[]
  materials             String[] // URLs

  // Assessment
  requiresAssessment    Boolean @default(false)
  assessmentTemplateId  String?
  passingScore          Float?

  // Recurrence
  isRecurring           Boolean @default(false)
  recurrenceMonths      Int?

  // Requirements
  prerequisites         String[] // Course IDs
  requiredForRoles      UserRole[]
  requiredForNewHires   Boolean @default(false)
  newHireDueDays        Int? // Days after hire to complete

  isActive              Boolean @default(true)
  companyId             String
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  sessions              TrainingSession[]
  assignments           TrainingAssignment[]
}

enum TrainingCategory {
  ORIENTATION
  CLINICAL_SKILLS
  SAFETY
  COMPLIANCE
  INFECTION_CONTROL
  PATIENT_RIGHTS
  DOCUMENTATION
  EMERGENCY_PROCEDURES
  SPECIALTY_CARE
  PROFESSIONAL_DEVELOPMENT
  LEADERSHIP
  TECHNOLOGY
}

enum TrainingFormat {
  IN_PERSON
  ONLINE_SELF_PACED
  ONLINE_LIVE
  HYBRID
  ON_THE_JOB
  SIMULATION
}

model TrainingSession {
  id                    String   @id @default(cuid())

  courseId              String
  course                TrainingCourse @relation(fields: [courseId], references: [id])

  // Scheduling
  scheduledDate         DateTime
  startTime             String // "09:00"
  endTime               String // "12:00"
  timezone              String @default("America/New_York")

  // Location
  location              String?
  isVirtual             Boolean @default(false)
  virtualMeetingUrl     String?

  // Instructor
  instructorId          String?
  instructor            User? @relation(fields: [instructorId], references: [id])
  externalInstructor    String?

  // Capacity
  capacity              Int?
  registeredCount       Int @default(0)

  // Status
  status                SessionStatus
  cancelledReason       String?

  companyId             String
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  attendances           TrainingAttendance[]
  remediationActivities RemediationActivity[]
}

enum SessionStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  RESCHEDULED
}

model TrainingAttendance {
  id                    String   @id @default(cuid())

  sessionId             String
  session               TrainingSession @relation(fields: [sessionId], references: [id])
  userId                String
  user                  User @relation(fields: [userId], references: [id])

  // Attendance
  status                AttendanceStatus
  checkInTime           DateTime?
  checkOutTime          DateTime?
  minutesAttended       Int?

  // Completion
  completedSuccessfully Boolean @default(false)
  assessmentScore       Float?
  certificateUrl        String?
  certificateIssuedAt   DateTime?

  // Makeup
  requiresMakeup        Boolean @default(false)
  makeupSessionId       String?
  makeupCompletedAt     DateTime?

  // Feedback
  feedbackRating        Int? // 1-5
  feedbackComments      String?

  companyId             String
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@unique([sessionId, userId])
}

enum AttendanceStatus {
  REGISTERED
  CONFIRMED
  ATTENDED
  PARTIALLY_ATTENDED
  ABSENT
  EXCUSED
  CANCELLED
}

model TrainingAssignment {
  id                    String   @id @default(cuid())

  userId                String
  user                  User @relation(fields: [userId], references: [id])
  courseId              String
  course                TrainingCourse @relation(fields: [courseId], references: [id])

  // Assignment
  assignedAt            DateTime @default(now())
  assignedById          String
  assignedBy            User @relation("Assigner", fields: [assignedById], references: [id])
  reason                TrainingAssignmentReason

  // Due date
  dueDate               DateTime

  // Completion
  status                AssignmentStatus
  completedAt           DateTime?
  completedSessionId    String?

  // Extensions
  extensionGranted      Boolean @default(false)
  extensionDate         DateTime?
  extensionReason       String?
  extensionApprovedById String?

  // Notifications
  remindersSent         Int @default(0)
  lastReminderAt        DateTime?
  escalatedAt           DateTime?

  companyId             String
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@unique([userId, courseId, assignedAt])
}

enum TrainingAssignmentReason {
  NEW_HIRE
  ANNUAL_REQUIREMENT
  COMPETENCY_GAP
  POLICY_CHANGE
  NEW_EQUIPMENT
  REGULATORY_REQUIREMENT
  PERFORMANCE_IMPROVEMENT
  VOLUNTARY
}

enum AssignmentStatus {
  ASSIGNED
  REGISTERED_FOR_SESSION
  COMPLETED
  OVERDUE
  WAIVED
  EXTENDED
}
```

#### API Endpoints

| Method | Endpoint                                 | Description               |
| ------ | ---------------------------------------- | ------------------------- |
| GET    | `/api/training/courses`                  | List courses              |
| POST   | `/api/training/courses`                  | Create course             |
| GET    | `/api/training/courses/[id]`             | Get course details        |
| PATCH  | `/api/training/courses/[id]`             | Update course             |
| GET    | `/api/training/sessions`                 | List sessions             |
| POST   | `/api/training/sessions`                 | Schedule session          |
| POST   | `/api/training/sessions/[id]/register`   | Register for session      |
| POST   | `/api/training/sessions/[id]/attendance` | Record attendance         |
| GET    | `/api/staff/[id]/training`               | Get staff training record |
| POST   | `/api/staff/[id]/training/assign`        | Assign training           |
| GET    | `/api/training/assignments/overdue`      | Get overdue assignments   |
| GET    | `/api/training/compliance`               | Get compliance metrics    |
| POST   | `/api/training/certificates/[id]/issue`  | Issue certificate         |

#### UI Components

1. **Training Catalog** (`/training`)
   - Course library with search/filter
   - Upcoming sessions calendar
   - My training dashboard

2. **Course Management** (`/settings/training/courses`)
   - Create/edit courses
   - Set requirements
   - Manage materials

3. **Session Scheduling** (`/training/sessions`)
   - Schedule new sessions
   - Manage registrations
   - Take attendance

4. **Staff Training Record** (embedded in staff detail)
   - Completed training history
   - Pending assignments
   - Certificates

5. **Training Compliance Dashboard** (`/reports/training`)
   - Completion rates
   - Overdue assignments
   - CEU tracking

---

### 4. Supervision Documentation System

#### Overview

System to define supervisory relationships, schedule supervision visits, document oversight activities, and ensure regulatory supervision requirements are met.

#### Functional Requirements

**FR-4.1: Supervisory Relationships**

- Define supervisor-supervisee relationships
- Support multiple supervisors per staff
- Track primary vs secondary supervisors
- Handle supervisor changes

**FR-4.2: Supervision Scheduling**

- Schedule supervision visits based on requirements
- Track supervision frequency by role/tenure
- Calendar integration
- Reminder system

**FR-4.3: Supervision Visit Documentation**

- Structured supervision visit forms
- Clinical observation documentation
- Feedback and coaching notes
- Performance observations

**FR-4.4: Staff Development**

- Track development goals
- Document progress
- Performance improvement plans
- Career development planning

**FR-4.5: Compliance Tracking**

- Supervision frequency compliance
- Required supervision hours tracking
- Regulatory requirement monitoring
- Gap identification

#### Data Model

```prisma
model SupervisoryRelationship {
  id                    String   @id @default(cuid())

  supervisorId          String
  supervisor            User @relation("Supervisor", fields: [supervisorId], references: [id])
  superviseeId          String
  supervisee            User @relation("Supervisee", fields: [superviseeId], references: [id])

  // Relationship
  relationshipType      SupervisorType
  discipline            String? // "RN", "PT", "OT", etc.

  // Status
  isActive              Boolean @default(true)
  startDate             DateTime @default(now())
  endDate               DateTime?

  // Requirements
  requiredVisitFrequency  SupervisionFrequency
  requiredHoursPerPeriod  Float?

  companyId             String
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  supervisionVisits     SupervisionVisit[]

  @@unique([supervisorId, superviseeId, discipline])
}

enum SupervisorType {
  PRIMARY
  SECONDARY
  CLINICAL
  ADMINISTRATIVE
  PRECEPTOR
  MENTOR
}

enum SupervisionFrequency {
  WEEKLY
  BIWEEKLY
  MONTHLY
  QUARTERLY
  AS_NEEDED
}

model SupervisionVisit {
  id                    String   @id @default(cuid())

  relationshipId        String
  relationship          SupervisoryRelationship @relation(fields: [relationshipId], references: [id])

  // Scheduling
  scheduledDate         DateTime
  scheduledDuration     Int // minutes

  // Actual visit
  visitDate             DateTime?
  actualDuration        Int?
  visitType             SupervisionVisitType

  // Location
  clientId              String? // If observing with client
  client                Client? @relation(fields: [clientId], references: [id])
  location              String?

  // Documentation
  status                VisitStatus

  // Observation
  clinicalObservations  String?
  technicalSkills       String?
  communicationSkills   String?
  documentationReview   String?

  // Assessment
  overallRating         PerformanceRating?
  strengths             String?
  areasForImprovement   String?

  // Feedback
  feedbackProvided      String?
  superviseeResponse    String?

  // Goals
  goalsReviewed         String[]
  newGoalsSet           String[]

  // Follow-up
  followUpRequired      Boolean @default(false)
  followUpItems         String[]
  nextVisitDate         DateTime?

  // Signatures
  supervisorSignature   String?
  supervisorSignedAt    DateTime?
  superviseeSignature   String?
  superviseeSignedAt    DateTime?
  superviseeAcknowledged Boolean @default(false)

  companyId             String
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

enum SupervisionVisitType {
  IN_PERSON_OBSERVATION
  JOINT_VISIT
  CHART_REVIEW
  PHONE_CONFERENCE
  VIDEO_CONFERENCE
  CASE_CONFERENCE
  SKILLS_VALIDATION
  PERFORMANCE_REVIEW
}

enum VisitStatus {
  SCHEDULED
  COMPLETED
  MISSED_BY_SUPERVISOR
  MISSED_BY_SUPERVISEE
  RESCHEDULED
  CANCELLED
}

enum PerformanceRating {
  EXCEEDS_EXPECTATIONS
  MEETS_EXPECTATIONS
  NEEDS_IMPROVEMENT
  UNSATISFACTORY
  NOT_OBSERVED
}

model StaffDevelopmentPlan {
  id                    String   @id @default(cuid())

  userId                String
  user                  User @relation(fields: [userId], references: [id])

  // Plan period
  periodStart           DateTime
  periodEnd             DateTime

  // Status
  status                DevelopmentPlanStatus

  // Goals
  goals                 DevelopmentGoal[]

  // Reviews
  midPeriodReviewDate   DateTime?
  midPeriodReviewNotes  String?
  finalReviewDate       DateTime?
  finalReviewNotes      String?
  overallRating         PerformanceRating?

  // Signatures
  employeeSignedAt      DateTime?
  supervisorSignedAt    DateTime?

  supervisorId          String
  supervisor            User @relation("DevelopmentSupervisor", fields: [supervisorId], references: [id])

  companyId             String
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

model DevelopmentGoal {
  id                    String   @id @default(cuid())

  planId                String
  plan                  StaffDevelopmentPlan @relation(fields: [planId], references: [id])

  // Goal definition
  category              GoalCategory
  description           String
  measurableOutcome     String
  targetDate            DateTime

  // Progress
  status                GoalStatus
  progressNotes         String?
  completedAt           DateTime?

  // Evidence
  evidenceUrls          String[]

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

enum DevelopmentPlanStatus {
  DRAFT
  ACTIVE
  COMPLETED
  EXTENDED
  CANCELLED
}

enum GoalCategory {
  CLINICAL_COMPETENCY
  PROFESSIONAL_DEVELOPMENT
  LEADERSHIP
  COMMUNICATION
  TECHNICAL_SKILLS
  REGULATORY_COMPLIANCE
  PERSONAL_GROWTH
}

enum GoalStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
  PARTIALLY_MET
  NOT_MET
  DEFERRED
}
```

#### API Endpoints

| Method | Endpoint                              | Description                  |
| ------ | ------------------------------------- | ---------------------------- |
| GET    | `/api/supervision/relationships`      | List relationships           |
| POST   | `/api/supervision/relationships`      | Create relationship          |
| PATCH  | `/api/supervision/relationships/[id]` | Update relationship          |
| GET    | `/api/supervision/visits`             | List supervision visits      |
| POST   | `/api/supervision/visits`             | Schedule visit               |
| PATCH  | `/api/supervision/visits/[id]`        | Update/document visit        |
| POST   | `/api/supervision/visits/[id]/sign`   | Sign visit documentation     |
| GET    | `/api/staff/[id]/supervision`         | Get staff supervision record |
| GET    | `/api/supervision/compliance`         | Get compliance metrics       |
| GET    | `/api/development-plans`              | List development plans       |
| POST   | `/api/development-plans`              | Create plan                  |
| PATCH  | `/api/development-plans/[id]`         | Update plan                  |
| POST   | `/api/development-plans/[id]/goals`   | Add goal                     |

#### UI Components

1. **Supervision Dashboard** (`/supervision`)
   - Upcoming visits
   - Overdue supervision alerts
   - My supervisees/supervisor view

2. **Supervision Visit Form** (modal/page)
   - Observation documentation
   - Rating scales
   - Goal review
   - Signature capture

3. **Staff Supervision History** (embedded in staff detail)
   - Visit timeline
   - Performance trending
   - Goal progress

4. **Development Plan Management** (`/staff/[id]/development`)
   - Current plan view
   - Goal tracking
   - Progress documentation

5. **Supervision Compliance Report** (`/reports/supervision`)
   - Compliance rates by supervisor
   - Visit frequency analysis
   - Missing supervision alerts

---

### 5. Root Cause Analysis Module

#### Overview

Structured system for investigating incidents and adverse events, identifying root causes, implementing corrective actions, and verifying effectiveness.

#### Functional Requirements

**FR-5.1: Investigation Initiation**

- Automatic RCA trigger for high-severity incidents
- Manual investigation request
- Investigation team assignment
- Timeline tracking

**FR-5.2: RCA Methodology**

- Support multiple RCA methods (5-Why, Fishbone, FMEA)
- Structured analysis templates
- Causal factor identification
- Contributing factor documentation

**FR-5.3: Corrective Action Planning**

- Create corrective action plans (CAPs)
- Assign responsible parties
- Set due dates
- Track implementation

**FR-5.4: Effectiveness Verification**

- Define verification criteria
- Schedule verification activities
- Document outcomes
- Determine if issue resolved

**FR-5.5: Trending & Prevention**

- Identify recurring issues
- Pattern analysis
- Systemic improvement recommendations
- Lessons learned documentation

#### Data Model

```prisma
model IncidentInvestigation {
  id                    String   @id @default(cuid())

  // Link to incident
  incidentId            String   @unique
  incident              IncidentReport @relation(fields: [incidentId], references: [id])

  // Investigation details
  initiatedAt           DateTime @default(now())
  initiatedById         String
  initiatedBy           User @relation("Initiator", fields: [initiatedById], references: [id])
  triggerReason         InvestigationTrigger

  // Team
  leadInvestigatorId    String
  leadInvestigator      User @relation("LeadInvestigator", fields: [leadInvestigatorId], references: [id])
  teamMemberIds         String[]

  // Timeline
  targetCompletionDate  DateTime
  actualCompletionDate  DateTime?

  // Status
  status                InvestigationStatus

  // Analysis
  methodology           RCAMethodology

  // Findings
  immediateCause        String?
  rootCauses            RootCause[]
  contributingFactors   ContributingFactor[]

  // Documentation
  timeline              String? // Sequence of events
  interviews            InvestigationInterview[]
  evidenceUrls          String[]

  // Conclusions
  summary               String?
  recommendations       String[]
  lessonsLearned        String?

  // Approval
  reviewedById          String?
  reviewedBy            User? @relation("Reviewer", fields: [reviewedById], references: [id])
  reviewedAt            DateTime?
  reviewComments        String?

  // Corrective Actions
  correctiveActions     CorrectiveActionPlan[]

  companyId             String
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

enum InvestigationTrigger {
  SEVERITY_THRESHOLD    // Automatic based on severity
  SENTINEL_EVENT        // Automatic for sentinel events
  REGULATORY_REQUIRED   // Required by regulation
  MANAGEMENT_REQUEST    // Requested by leadership
  PATTERN_DETECTED      // Multiple similar incidents
  NEAR_MISS             // Near-miss analysis
}

enum InvestigationStatus {
  INITIATED
  DATA_COLLECTION
  ANALYSIS
  ACTION_PLANNING
  UNDER_REVIEW
  APPROVED
  CLOSED
  REOPENED
}

enum RCAMethodology {
  FIVE_WHYS
  FISHBONE_DIAGRAM
  FMEA
  FAULT_TREE
  BARRIER_ANALYSIS
  CHANGE_ANALYSIS
  COMBINED
}

model RootCause {
  id                    String   @id @default(cuid())

  investigationId       String
  investigation         IncidentInvestigation @relation(fields: [investigationId], references: [id])

  category              RootCauseCategory
  description           String
  evidence              String?

  // 5-Why chain
  whyLevel              Int? // 1-5
  parentCauseId         String?

  createdAt             DateTime @default(now())
}

enum RootCauseCategory {
  HUMAN_FACTORS
  COMMUNICATION
  TRAINING_EDUCATION
  FATIGUE_SCHEDULING
  ENVIRONMENT
  EQUIPMENT_SUPPLIES
  RULES_POLICIES
  BARRIERS_CONTROLS
  ORGANIZATIONAL
  EXTERNAL_FACTORS
}

model ContributingFactor {
  id                    String   @id @default(cuid())

  investigationId       String
  investigation         IncidentInvestigation @relation(fields: [investigationId], references: [id])

  category              ContributingFactorCategory
  description           String

  createdAt             DateTime @default(now())
}

enum ContributingFactorCategory {
  PATIENT_FACTORS
  TASK_FACTORS
  INDIVIDUAL_FACTORS
  TEAM_FACTORS
  WORK_ENVIRONMENT
  ORGANIZATIONAL_MANAGEMENT
  INSTITUTIONAL_CONTEXT
}

model InvestigationInterview {
  id                    String   @id @default(cuid())

  investigationId       String
  investigation         IncidentInvestigation @relation(fields: [investigationId], references: [id])

  intervieweeId         String?
  interviewee           User? @relation(fields: [intervieweeId], references: [id])
  intervieweeName       String? // For non-system users
  intervieweeRole       String

  interviewedAt         DateTime
  interviewedById       String
  interviewedBy         User @relation("Interviewer", fields: [interviewedById], references: [id])

  summary               String
  keyFindings           String[]
  documentUrl           String?

  createdAt             DateTime @default(now())
}

model CorrectiveActionPlan {
  id                    String   @id @default(cuid())

  investigationId       String
  investigation         IncidentInvestigation @relation(fields: [investigationId], references: [id])

  // Action details
  actionType            CorrectiveActionType
  description           String
  expectedOutcome       String

  // Assignment
  responsibleId         String
  responsible           User @relation(fields: [responsibleId], references: [id])

  // Timeline
  dueDate               DateTime

  // Status
  status                CAPStatus

  // Implementation
  implementedAt         DateTime?
  implementationNotes   String?
  evidenceUrls          String[]

  // Verification
  verificationMethod    String?
  verificationDueDate   DateTime?
  verifiedAt            DateTime?
  verifiedById          String?
  verifiedBy            User? @relation("Verifier", fields: [verifiedById], references: [id])
  verificationResult    VerificationResult?
  verificationNotes     String?

  // If not effective
  followUpActionId      String?

  companyId             String
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

enum CorrectiveActionType {
  POLICY_CHANGE
  PROCEDURE_UPDATE
  TRAINING
  EQUIPMENT_CHANGE
  STAFFING_CHANGE
  ENVIRONMENTAL_MODIFICATION
  COMMUNICATION_IMPROVEMENT
  TECHNOLOGY_SOLUTION
  MONITORING_ENHANCEMENT
  DOCUMENTATION_CHANGE
}

enum CAPStatus {
  PLANNED
  IN_PROGRESS
  IMPLEMENTED
  PENDING_VERIFICATION
  VERIFIED_EFFECTIVE
  VERIFIED_INEFFECTIVE
  CLOSED
  REOPENED
}

enum VerificationResult {
  EFFECTIVE
  PARTIALLY_EFFECTIVE
  NOT_EFFECTIVE
  UNABLE_TO_VERIFY
}
```

#### API Endpoints

| Method | Endpoint                                 | Description               |
| ------ | ---------------------------------------- | ------------------------- |
| GET    | `/api/investigations`                    | List investigations       |
| POST   | `/api/investigations`                    | Initiate investigation    |
| GET    | `/api/investigations/[id]`               | Get investigation details |
| PATCH  | `/api/investigations/[id]`               | Update investigation      |
| POST   | `/api/investigations/[id]/root-causes`   | Add root cause            |
| POST   | `/api/investigations/[id]/interviews`    | Add interview             |
| POST   | `/api/investigations/[id]/actions`       | Add corrective action     |
| PATCH  | `/api/investigations/[id]/submit-review` | Submit for review         |
| POST   | `/api/investigations/[id]/approve`       | Approve investigation     |
| GET    | `/api/corrective-actions`                | List corrective actions   |
| PATCH  | `/api/corrective-actions/[id]`           | Update action status      |
| POST   | `/api/corrective-actions/[id]/verify`    | Verify effectiveness      |
| GET    | `/api/investigations/patterns`           | Get pattern analysis      |

#### UI Components

1. **Investigation Dashboard** (`/investigations`)
   - Active investigations
   - Pending reviews
   - Overdue actions

2. **Investigation Workspace** (`/investigations/[id]`)
   - Timeline view
   - RCA methodology tools
   - Fishbone diagram builder
   - 5-Why analysis

3. **Corrective Action Tracker** (`/corrective-actions`)
   - Action list with filters
   - Due date tracking
   - Status updates

4. **Pattern Analysis** (`/reports/incident-patterns`)
   - Recurring incident types
   - Root cause distribution
   - Trend visualization

---

### 6. Infection Prevention & Control

#### Overview

System to track infections, manage outbreaks, document precautions, and monitor infection prevention compliance.

#### Functional Requirements

**FR-6.1: Infection Surveillance**

- Report and track infections
- Classify by type and source
- Link to client and staff
- Geographic/unit tracking

**FR-6.2: Outbreak Management**

- Detect potential outbreaks
- Create outbreak records
- Track related cases
- Coordinate response

**FR-6.3: Precaution Documentation**

- Document isolation precautions
- Track PPE requirements
- Monitor compliance
- Manage precaution discontinuation

**FR-6.4: Staff Exposure Tracking**

- Document staff exposures
- Track follow-up testing
- Manage work restrictions
- Monitor outcomes

**FR-6.5: Infection Metrics**

- Infection rates by type
- Outbreak frequency
- Precaution compliance
- Trending and benchmarking

#### Data Model

```prisma
model InfectionReport {
  id                    String   @id @default(cuid())

  // Subject
  subjectType           InfectionSubjectType
  clientId              String?
  client                Client? @relation(fields: [clientId], references: [id])
  staffId               String?
  staff                 User? @relation(fields: [staffId], references: [id])

  // Infection details
  infectionType         InfectionType
  infectionSite         String?
  organism              String?

  // Dates
  onsetDate             DateTime
  reportedDate          DateTime @default(now())
  resolvedDate          DateTime?

  // Classification
  classification        InfectionClassification
  source                InfectionSource

  // Clinical
  symptoms              String[]
  diagnosticTests       DiagnosticTest[]
  treatment             String?

  // Status
  status                InfectionStatus

  // Precautions
  precautionsRequired   Boolean @default(false)
  precautionType        PrecautionType?
  precautionStartDate   DateTime?
  precautionEndDate     DateTime?

  // Outbreak link
  outbreakId            String?
  outbreak              Outbreak? @relation(fields: [outbreakId], references: [id])

  // Reporting
  reportedById          String
  reportedBy            User @relation(fields: [reportedById], references: [id])
  reportableToState     Boolean @default(false)
  stateReportedAt       DateTime?

  companyId             String
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  exposures             StaffExposure[]
}

enum InfectionSubjectType {
  CLIENT
  STAFF
}

enum InfectionType {
  RESPIRATORY
  URINARY_TRACT
  SKIN_SOFT_TISSUE
  GASTROINTESTINAL
  BLOODSTREAM
  SURGICAL_SITE
  CATHETER_ASSOCIATED
  COVID_19
  INFLUENZA
  MRSA
  C_DIFF
  VRE
  OTHER
}

enum InfectionClassification {
  COMMUNITY_ACQUIRED
  HEALTHCARE_ASSOCIATED
  DEVICE_ASSOCIATED
  PROCEDURE_ASSOCIATED
  UNKNOWN
}

enum InfectionSource {
  CONFIRMED_LABORATORY
  CLINICAL_DIAGNOSIS
  SUSPECTED
}

enum InfectionStatus {
  ACTIVE
  RESOLVED
  MONITORING
  DECEASED
}

enum PrecautionType {
  STANDARD
  CONTACT
  DROPLET
  AIRBORNE
  CONTACT_PLUS_DROPLET
  CONTACT_PLUS_AIRBORNE
  PROTECTIVE_ISOLATION
}

model DiagnosticTest {
  id                    String   @id @default(cuid())

  infectionReportId     String
  infectionReport       InfectionReport @relation(fields: [infectionReportId], references: [id])

  testType              String
  collectionDate        DateTime
  resultDate            DateTime?
  result                String?
  isPositive            Boolean?

  labName               String?
  documentUrl           String?

  createdAt             DateTime @default(now())
}

model Outbreak {
  id                    String   @id @default(cuid())

  name                  String
  description           String?
  infectionType         InfectionType

  // Timeline
  startDate             DateTime
  endDate               DateTime?

  // Scope
  affectedUnits         String[]

  // Status
  status                OutbreakStatus

  // Response
  responseInitiatedAt   DateTime?
  responseLeadId        String?
  responseLead          User? @relation(fields: [responseLeadId], references: [id])

  // Interventions
  interventions         String[]

  // Metrics
  totalCases            Int @default(0)
  clientCases           Int @default(0)
  staffCases            Int @default(0)

  // Closure
  closedAt              DateTime?
  closedById            String?
  closureReason         String?
  lessonsLearned        String?

  companyId             String
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  infections            InfectionReport[]
}

enum OutbreakStatus {
  SUSPECTED
  CONFIRMED
  CONTROLLED
  RESOLVED
  MONITORING
}

model StaffExposure {
  id                    String   @id @default(cuid())

  staffId               String
  staff                 User @relation(fields: [staffId], references: [id])

  // Exposure source
  infectionReportId     String?
  infectionReport       InfectionReport? @relation(fields: [infectionReportId], references: [id])
  exposureType          ExposureType
  exposureDate          DateTime
  exposureDescription   String

  // Risk assessment
  riskLevel             RiskLevel
  ppeWorn               String[]

  // Follow-up
  status                ExposureStatus

  // Work restrictions
  workRestricted        Boolean @default(false)
  restrictionStartDate  DateTime?
  restrictionEndDate    DateTime?
  restrictionType       String?

  // Testing
  testingRequired       Boolean @default(false)
  tests                 ExposureTest[]

  // Outcome
  developedInfection    Boolean @default(false)
  linkedInfectionId     String?

  // Clearance
  clearedToWorkAt       DateTime?
  clearedById           String?

  reportedById          String
  reportedBy            User @relation("ExposureReporter", fields: [reportedById], references: [id])

  companyId             String
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

enum ExposureType {
  BLOODBORNE
  RESPIRATORY
  CONTACT
  NEEDLE_STICK
  SPLASH
  OTHER
}

enum RiskLevel {
  LOW
  MODERATE
  HIGH
}

enum ExposureStatus {
  REPORTED
  UNDER_EVALUATION
  MONITORING
  CLEARED
  INFECTED
}

model ExposureTest {
  id                    String   @id @default(cuid())

  exposureId            String
  exposure              StaffExposure @relation(fields: [exposureId], references: [id])

  testType              String
  scheduledDate         DateTime
  completedDate         DateTime?
  result                String?
  isPositive            Boolean?

  createdAt             DateTime @default(now())
}
```

#### API Endpoints

| Method | Endpoint                          | Description           |
| ------ | --------------------------------- | --------------------- |
| GET    | `/api/infections`                 | List infections       |
| POST   | `/api/infections`                 | Report infection      |
| GET    | `/api/infections/[id]`            | Get infection details |
| PATCH  | `/api/infections/[id]`            | Update infection      |
| POST   | `/api/infections/[id]/tests`      | Add diagnostic test   |
| GET    | `/api/outbreaks`                  | List outbreaks        |
| POST   | `/api/outbreaks`                  | Create outbreak       |
| PATCH  | `/api/outbreaks/[id]`             | Update outbreak       |
| POST   | `/api/outbreaks/[id]/close`       | Close outbreak        |
| GET    | `/api/staff/exposures`            | List exposures        |
| POST   | `/api/staff/exposures`            | Report exposure       |
| PATCH  | `/api/staff/exposures/[id]`       | Update exposure       |
| POST   | `/api/staff/exposures/[id]/clear` | Clear to work         |
| GET    | `/api/infections/metrics`         | Get infection metrics |

#### UI Components

1. **Infection Control Dashboard** (`/infection-control`)
   - Active infections summary
   - Current outbreaks
   - Staff exposures pending clearance
   - Precaution census

2. **Infection Report Form** (modal)
   - Patient/staff selection
   - Infection classification
   - Symptom checklist
   - Precaution settings

3. **Outbreak Management** (`/infection-control/outbreaks`)
   - Outbreak list
   - Response coordination
   - Case tracking
   - Intervention documentation

4. **Staff Exposure Tracker** (`/infection-control/exposures`)
   - Exposure list
   - Testing schedule
   - Work restriction management
   - Clearance workflow

5. **Infection Metrics Dashboard** (`/reports/infection-control`)
   - Infection rates
   - Type distribution
   - Trending
   - Benchmark comparison

---

### 7. Quality Metrics & Outcomes

#### Overview

System to define, collect, analyze, and report quality metrics and patient outcomes for performance improvement.

#### Functional Requirements

**FR-7.1: Metric Definition**

- Define quality indicators
- Set targets and thresholds
- Configure data sources
- Establish benchmarks

**FR-7.2: Data Collection**

- Automated data extraction
- Manual data entry options
- Integration with existing records
- Validation rules

**FR-7.3: Outcome Tracking**

- Patient outcome measurement
- Functional status tracking
- Rehospitalization monitoring
- Satisfaction surveys

**FR-7.4: Analysis & Reporting**

- Trend analysis
- Variance identification
- Benchmark comparison
- Drill-down capability

**FR-7.5: Performance Improvement**

- Identify improvement opportunities
- Track improvement initiatives
- Measure impact
- Document success

#### Data Model

```prisma
model QualityMetric {
  id                    String   @id @default(cuid())

  name                  String
  description           String?
  category              MetricCategory

  // Calculation
  measureType           MeasureType
  numeratorDefinition   String?
  denominatorDefinition String?
  calculationMethod     String?

  // Targets
  targetValue           Float?
  targetDirection       TargetDirection // HIGHER_IS_BETTER, LOWER_IS_BETTER
  warningThreshold      Float?
  criticalThreshold     Float?

  // Frequency
  reportingFrequency    ReportingFrequency

  // Data source
  dataSource            MetricDataSource
  automatedCollection   Boolean @default(false)

  // Benchmarks
  nationalBenchmark     Float?
  stateBenchmark        Float?

  isActive              Boolean @default(true)
  companyId             String
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  values                MetricValue[]
}

enum MetricCategory {
  PATIENT_SAFETY
  CLINICAL_OUTCOMES
  PATIENT_EXPERIENCE
  CARE_COORDINATION
  EFFICIENCY
  ACCESS
  STAFF_SATISFACTION
  COMPLIANCE
}

enum MeasureType {
  RATE
  PERCENTAGE
  COUNT
  AVERAGE
  RATIO
  SCORE
}

enum TargetDirection {
  HIGHER_IS_BETTER
  LOWER_IS_BETTER
  WITHIN_RANGE
}

enum ReportingFrequency {
  DAILY
  WEEKLY
  MONTHLY
  QUARTERLY
  ANNUALLY
}

enum MetricDataSource {
  VISIT_NOTES
  ASSESSMENTS
  INCIDENTS
  INFECTIONS
  SCHEDULING
  BILLING
  SURVEYS
  MANUAL
}

model MetricValue {
  id                    String   @id @default(cuid())

  metricId              String
  metric                QualityMetric @relation(fields: [metricId], references: [id])

  // Period
  periodStart           DateTime
  periodEnd             DateTime

  // Values
  numerator             Float?
  denominator           Float?
  value                 Float

  // Status
  status                MetricStatus

  // Analysis
  varianceFromTarget    Float?
  trend                 TrendDirection?

  // Documentation
  notes                 String?
  dataSourceDetails     String?

  // Validation
  validatedAt           DateTime?
  validatedById         String?

  companyId             String
  createdAt             DateTime @default(now())
}

enum MetricStatus {
  MEETING_TARGET
  WARNING
  CRITICAL
  NO_DATA
}

enum TrendDirection {
  IMPROVING
  STABLE
  DECLINING
}

model PatientOutcome {
  id                    String   @id @default(cuid())

  clientId              String
  client                Client @relation(fields: [clientId], references: [id])

  // Outcome type
  outcomeType           OutcomeType

  // Measurement
  measurementDate       DateTime
  baselineDate          DateTime?
  baselineValue         Float?
  currentValue          Float

  // Assessment link
  assessmentId          String?
  assessment            Assessment? @relation(fields: [assessmentId], references: [id])

  // Status
  status                OutcomeStatus

  // Goals
  goalValue             Float?
  goalMet               Boolean?

  // Analysis
  changeFromBaseline    Float?
  percentChange         Float?

  documentedById        String
  documentedBy          User @relation(fields: [documentedById], references: [id])

  companyId             String
  createdAt             DateTime @default(now())
}

enum OutcomeType {
  FUNCTIONAL_STATUS
  ADL_SCORE
  IADL_SCORE
  PAIN_LEVEL
  DEPRESSION_SCORE
  COGNITIVE_STATUS
  FALL_RISK
  WOUND_HEALING
  MEDICATION_ADHERENCE
  HOSPITALIZATION
  EMERGENCY_VISIT
  GOAL_ATTAINMENT
  DISCHARGE_STATUS
}

enum OutcomeStatus {
  IMPROVED
  MAINTAINED
  DECLINED
  GOAL_MET
  GOAL_NOT_MET
}

model RehospitalizationEvent {
  id                    String   @id @default(cuid())

  clientId              String
  client                Client @relation(fields: [clientId], references: [id])

  // Event details
  admissionDate         DateTime
  dischargeDate         DateTime?
  facilityName          String
  facilityType          FacilityType

  // Reason
  admissionReason       String
  isPotentiallyPreventable Boolean?
  preventabilityReason  String?

  // Analysis
  daysSinceLastDischarge Int?
  isWithin30Days        Boolean @default(false)

  // Related records
  relatedVisitNoteIds   String[]
  relatedIncidentId     String?

  // Follow-up
  followUpRequired      Boolean @default(false)
  followUpCompleted     Boolean @default(false)
  followUpNotes         String?

  documentedById        String
  documentedBy          User @relation(fields: [documentedById], references: [id])

  companyId             String
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

enum FacilityType {
  ACUTE_HOSPITAL
  SKILLED_NURSING
  REHABILITATION
  PSYCHIATRIC
  LONG_TERM_ACUTE
  EMERGENCY_DEPARTMENT
}

model PatientSatisfactionSurvey {
  id                    String   @id @default(cuid())

  clientId              String?
  client                Client? @relation(fields: [clientId], references: [id])

  // Survey
  surveyType            SurveyType
  sentAt                DateTime
  completedAt           DateTime?

  // Method
  deliveryMethod        SurveyDeliveryMethod

  // Responses
  responses             Json // { question_id: response_value }

  // Scores
  overallScore          Float?
  npsScore              Int? // Net Promoter Score -100 to 100

  // Categories
  categoryScores        Json? // { category: score }

  // Comments
  positiveComments      String?
  improvementComments   String?

  // Follow-up
  requiresFollowUp      Boolean @default(false)
  followUpCompletedAt   DateTime?
  followUpNotes         String?

  companyId             String
  createdAt             DateTime @default(now())
}

enum SurveyType {
  DISCHARGE
  PERIODIC
  ANNUAL
  POST_INCIDENT
  CAREGIVER
}

enum SurveyDeliveryMethod {
  EMAIL
  SMS
  PHONE
  MAIL
  IN_PERSON
}
```

#### API Endpoints

| Method | Endpoint                           | Description                |
| ------ | ---------------------------------- | -------------------------- |
| GET    | `/api/quality/metrics`             | List metrics               |
| POST   | `/api/quality/metrics`             | Create metric              |
| GET    | `/api/quality/metrics/[id]`        | Get metric details         |
| POST   | `/api/quality/metrics/[id]/values` | Record metric value        |
| GET    | `/api/quality/metrics/[id]/trend`  | Get metric trend           |
| GET    | `/api/quality/dashboard`           | Get quality dashboard data |
| GET    | `/api/clients/[id]/outcomes`       | Get patient outcomes       |
| POST   | `/api/clients/[id]/outcomes`       | Record outcome             |
| GET    | `/api/rehospitalizations`          | List rehospitalizations    |
| POST   | `/api/rehospitalizations`          | Record rehospitalization   |
| GET    | `/api/surveys`                     | List surveys               |
| POST   | `/api/surveys`                     | Create/send survey         |
| POST   | `/api/surveys/[id]/responses`      | Submit responses           |
| GET    | `/api/quality/reports`             | Get quality reports        |

#### UI Components

1. **Quality Dashboard** (`/quality`)
   - Key metrics summary cards
   - Trend charts
   - Alert indicators
   - Drill-down capability

2. **Metric Management** (`/settings/quality-metrics`)
   - Metric library
   - Configuration forms
   - Target setting

3. **Patient Outcomes** (embedded in client detail)
   - Outcome history
   - Goal tracking
   - Trend visualization

4. **Rehospitalization Tracker** (`/quality/rehospitalizations`)
   - Event list
   - 30-day rate tracking
   - Analysis tools

5. **Survey Management** (`/quality/surveys`)
   - Survey templates
   - Send surveys
   - Response analysis
   - Follow-up tracking

6. **Quality Reports** (`/reports/quality`)
   - Comprehensive reports
   - Benchmark comparisons
   - Export capability

---

### 8. Document Control & Audit Trail

#### Overview

Enhanced documentation system ensuring immutability, complete change tracking, version control, and comprehensive audit capabilities.

#### Functional Requirements

**FR-8.1: Document Immutability**

- Lock approved documents
- Prevent unauthorized changes
- Require new version for modifications
- Track all access

**FR-8.2: Change Tracking**

- Capture before/after values
- Record change reason
- Track who/when/what
- Support field-level tracking

**FR-8.3: Version Control**

- Version numbering
- Version comparison
- Historical access
- Template version tracking

**FR-8.4: Audit Reporting**

- Comprehensive audit logs
- Searchable history
- Export capability
- Compliance reports

**FR-8.5: Retention Management**

- Define retention policies
- Track document age
- Archive scheduling
- Legal hold support

#### Data Model

```prisma
// Enhanced AuditLog with before/after values
model AuditLog {
  id                    String   @id @default(cuid())

  // Action
  action                String
  actionCategory        AuditActionCategory

  // Entity
  entityType            String
  entityId              String
  entityDescription     String? // Human-readable entity name

  // Changes - ENHANCED
  changes               Json? // Array of { field, oldValue, newValue }
  changesSummary        String? // Human-readable summary

  // Before/After snapshots for critical documents
  beforeSnapshot        Json?
  afterSnapshot         Json?

  // Context
  reason                String?
  ipAddress             String?
  userAgent             String?
  sessionId             String?

  // User
  userId                String?
  user                  User? @relation(fields: [userId], references: [id])

  // Organization
  companyId             String
  createdAt             DateTime @default(now())

  @@index([entityType, entityId])
  @@index([userId])
  @@index([action])
  @@index([createdAt])
}

enum AuditActionCategory {
  CREATE
  READ
  UPDATE
  DELETE
  APPROVE
  REJECT
  SIGN
  SUBMIT
  EXPORT
  PRINT
  ACCESS
  LOGIN
  LOGOUT
  PERMISSION_CHANGE
}

model DocumentVersion {
  id                    String   @id @default(cuid())

  // Document reference
  documentType          DocumentType
  documentId            String

  // Version
  versionNumber         Int
  versionLabel          String? // "1.0", "1.1", etc.

  // Content
  content               Json // Full document snapshot
  templateVersion       String? // Template version used

  // Creation
  createdAt             DateTime @default(now())
  createdById           String
  createdBy             User @relation(fields: [createdById], references: [id])

  // Change info
  changeDescription     String?
  changeType            VersionChangeType

  // Status
  status                DocumentStatus

  // Approval
  approvedAt            DateTime?
  approvedById          String?

  // Signatures
  signatures            DocumentSignature[]

  // Access tracking
  accessLogs            DocumentAccessLog[]

  companyId             String

  @@unique([documentType, documentId, versionNumber])
  @@index([documentType, documentId])
}

enum DocumentType {
  VISIT_NOTE
  ASSESSMENT
  CARE_PLAN
  INCIDENT_REPORT
  CONSENT_FORM
  INVESTIGATION
  SUPERVISION_VISIT
  TRAINING_RECORD
}

enum VersionChangeType {
  INITIAL
  AMENDMENT
  CORRECTION
  ADDENDUM
  SUPERSEDE
}

enum DocumentStatus {
  DRAFT
  PENDING_APPROVAL
  APPROVED
  SUPERSEDED
  VOIDED
}

model DocumentSignature {
  id                    String   @id @default(cuid())

  versionId             String
  version               DocumentVersion @relation(fields: [versionId], references: [id])

  signatureType         SignatureType
  signedById            String?
  signedBy              User? @relation(fields: [signedById], references: [id])
  signerName            String
  signerRole            String

  signedAt              DateTime @default(now())
  signatureData         String? // Base64 for handwritten

  ipAddress             String?

  @@index([versionId])
}

enum SignatureType {
  AUTHOR
  REVIEWER
  APPROVER
  WITNESS
  CO_SIGNER
  AUTHENTICATOR
}

model DocumentAccessLog {
  id                    String   @id @default(cuid())

  versionId             String
  version               DocumentVersion @relation(fields: [versionId], references: [id])

  accessType            AccessType
  accessedById          String
  accessedBy            User @relation(fields: [accessedById], references: [id])
  accessedAt            DateTime @default(now())

  purpose               String?
  ipAddress             String?

  @@index([versionId])
  @@index([accessedById])
}

enum AccessType {
  VIEW
  PRINT
  EXPORT
  DOWNLOAD
  COPY
}

model RetentionPolicy {
  id                    String   @id @default(cuid())

  name                  String
  documentType          DocumentType

  // Retention rules
  retentionYears        Int
  retentionBasis        RetentionBasis // From creation, from discharge, etc.

  // State requirements
  stateRequirements     Json? // { state: years }

  // Disposition
  dispositionAction     DispositionAction

  isActive              Boolean @default(true)
  companyId             String
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

enum RetentionBasis {
  FROM_CREATION
  FROM_DISCHARGE
  FROM_LAST_SERVICE
  FROM_CLIENT_DOB_PLUS_YEARS
}

enum DispositionAction {
  ARCHIVE
  DELETE
  REVIEW_FOR_DELETION
}

model LegalHold {
  id                    String   @id @default(cuid())

  name                  String
  reason                String

  // Scope
  documentTypes         DocumentType[]
  clientIds             String[]
  dateRangeStart        DateTime?
  dateRangeEnd          DateTime?

  // Status
  isActive              Boolean @default(true)
  createdAt             DateTime @default(now())
  releasedAt            DateTime?
  releasedById          String?

  companyId             String
}
```

#### API Endpoints

| Method | Endpoint                                      | Description           |
| ------ | --------------------------------------------- | --------------------- |
| GET    | `/api/audit-logs`                             | Search audit logs     |
| GET    | `/api/audit-logs/export`                      | Export audit logs     |
| GET    | `/api/documents/[type]/[id]/versions`         | Get document versions |
| GET    | `/api/documents/[type]/[id]/versions/[v]`     | Get specific version  |
| GET    | `/api/documents/[type]/[id]/versions/compare` | Compare versions      |
| POST   | `/api/documents/[type]/[id]/amend`            | Create amendment      |
| POST   | `/api/documents/[type]/[id]/addendum`         | Add addendum          |
| GET    | `/api/documents/[type]/[id]/access-log`       | Get access history    |
| GET    | `/api/retention-policies`                     | List policies         |
| POST   | `/api/retention-policies`                     | Create policy         |
| GET    | `/api/retention/due-for-review`               | Get documents due     |
| POST   | `/api/legal-holds`                            | Create legal hold     |
| DELETE | `/api/legal-holds/[id]`                       | Release hold          |

#### UI Components

1. **Audit Log Viewer** (`/admin/audit-logs`)
   - Advanced search
   - Filters by entity, user, action
   - Timeline view
   - Export function

2. **Document History** (embedded in document views)
   - Version list
   - Side-by-side comparison
   - Change highlighting
   - Access log

3. **Version Comparison Tool** (modal)
   - Diff view
   - Field-by-field changes
   - Signature status

4. **Retention Management** (`/admin/retention`)
   - Policy configuration
   - Documents due for review
   - Archive management

5. **Legal Hold Manager** (`/admin/legal-holds`)
   - Active holds
   - Create/release holds
   - Affected documents

---

### 9. Patient Rights & Consent Enhancements

#### Overview

Enhanced consent management with advance directives, capacity assessment, and comprehensive rights documentation.

#### Functional Requirements

**FR-9.1: Advance Directives**

- DNR/POLST form templates
- Healthcare proxy documentation
- Living will capture
- AD availability alerts

**FR-9.2: Capacity Assessment**

- Decision-making capacity evaluation
- Surrogate decision-maker documentation
- Capacity change tracking
- Clinical justification

**FR-9.3: Consent Enhancements**

- Multi-language support
- Consent expiration enforcement
- Renewal workflow
- Comprehension verification

**FR-9.4: Rights Acknowledgment**

- Rights documentation tracking
- Acknowledgment verification
- Rights violation reporting
- Grievance integration

#### Data Model

```prisma
model AdvanceDirective {
  id                    String   @id @default(cuid())

  clientId              String
  client                Client @relation(fields: [clientId], references: [id])

  // Type
  directiveType         AdvanceDirectiveType

  // Document
  documentDate          DateTime
  documentOnFile        Boolean @default(false)
  documentUrl           String?

  // Status
  status                DirectiveStatus

  // Details (varies by type)
  details               Json? // Type-specific fields

  // For DNR
  physicianName         String?
  physicianNPI          String?
  physicianSignedDate   DateTime?

  // For Healthcare Proxy
  proxyName             String?
  proxyPhone            String?
  proxyRelationship     String?
  alternateProxyName    String?
  alternateProxyPhone   String?

  // Verification
  verifiedAt            DateTime?
  verifiedById          String?
  verifiedBy            User? @relation(fields: [verifiedById], references: [id])

  // Expiration (if applicable)
  expiresAt             DateTime?

  // Notes
  notes                 String?
  restrictions          String?

  companyId             String
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

enum AdvanceDirectiveType {
  DNR
  POLST
  LIVING_WILL
  HEALTHCARE_PROXY
  POWER_OF_ATTORNEY_HEALTHCARE
  FIVE_WISHES
  MENTAL_HEALTH_DIRECTIVE
  OTHER
}

enum DirectiveStatus {
  ACTIVE
  REVOKED
  EXPIRED
  SUPERSEDED
  PENDING_VERIFICATION
}

model CapacityAssessment {
  id                    String   @id @default(cuid())

  clientId              String
  client                Client @relation(fields: [clientId], references: [id])

  // Assessment
  assessedAt            DateTime @default(now())
  assessedById          String
  assessedBy            User @relation(fields: [assessedById], references: [id])

  // Decision type
  decisionType          CapacityDecisionType

  // Capacity determination
  hasCapacity           Boolean

  // If has capacity
  capacityEvidence      String?

  // If lacks capacity
  capacityBarriers      String[]
  surrogateDecisionMaker String?
  surrogateRelationship String?
  surrogateContact      String?
  legalDocumentation    String? // POA, guardianship doc

  // Clinical justification
  clinicalJustification String

  // Review
  needsReassessment     Boolean @default(false)
  reassessmentDate      DateTime?

  companyId             String
  createdAt             DateTime @default(now())
}

enum CapacityDecisionType {
  GENERAL_HEALTHCARE
  SPECIFIC_TREATMENT
  RESEARCH_PARTICIPATION
  FINANCIAL
  DISCHARGE_PLANNING
  PLACEMENT
}

// Enhanced ConsentSignature with comprehension verification
model ConsentComprehension {
  id                    String   @id @default(cuid())

  consentSignatureId    String   @unique
  consentSignature      ConsentSignature @relation(fields: [consentSignatureId], references: [id])

  // Verification
  comprehensionVerified Boolean @default(false)
  verificationMethod    ComprehensionMethod?

  // Questions asked
  questionsAsked        String[]
  questionsAnsweredCorrectly Int?

  // Language
  languageUsed          String @default("en")
  interpreterUsed       Boolean @default(false)
  interpreterName       String?
  interpreterService    String?

  // Teaching
  teachingProvided      String?
  teachingMaterials     String[]

  // Staff
  verifiedById          String
  verifiedBy            User @relation(fields: [verifiedById], references: [id])
  verifiedAt            DateTime @default(now())

  notes                 String?
}

enum ComprehensionMethod {
  TEACH_BACK
  QUESTION_ANSWER
  DEMONSTRATION
  WRITTEN_QUIZ
  VERBAL_CONFIRMATION
}

model RightsAcknowledgment {
  id                    String   @id @default(cuid())

  clientId              String
  client                Client @relation(fields: [clientId], references: [id])

  // Document
  rightsDocumentId      String // ConsentFormTemplate ID
  rightsDocumentVersion String

  // Acknowledgment
  acknowledgedAt        DateTime @default(now())
  acknowledgedById      String // Client or representative
  acknowledgedBy        User? @relation(fields: [acknowledgedById], references: [id])
  representativeName    String? // If not the client
  representativeRelation String?

  // Method
  deliveryMethod        RightsDeliveryMethod
  languageProvided      String @default("en")

  // Verification
  questionsAnswered     Boolean @default(false)
  additionalExplanation String?

  // Copy provided
  copyProvided          Boolean @default(false)
  copyMethod            String?

  witnessId             String?
  witness               User? @relation("Witness", fields: [witnessId], references: [id])

  companyId             String
  createdAt             DateTime @default(now())
}

enum RightsDeliveryMethod {
  IN_PERSON_VERBAL
  IN_PERSON_WRITTEN
  MAIL
  EMAIL
  PATIENT_PORTAL
}

model GrievanceReport {
  id                    String   @id @default(cuid())

  // Reporter
  clientId              String?
  client                Client? @relation(fields: [clientId], references: [id])
  reporterName          String
  reporterRelationship  String? // If not client
  reporterContact       String?

  // Grievance
  reportedAt            DateTime @default(now())
  category              GrievanceCategory
  description           String

  // Staff involved
  involvedStaffIds      String[]

  // Status
  status                GrievanceStatus
  priority              GrievancePriority

  // Assignment
  assignedToId          String?
  assignedTo            User? @relation(fields: [assignedToId], references: [id])
  assignedAt            DateTime?

  // Investigation
  investigationNotes    String?
  findingsAndConclusions String?

  // Resolution
  resolution            String?
  resolvedAt            DateTime?
  resolvedById          String?

  // Communication
  clientNotifiedAt      DateTime?
  clientSatisfied       Boolean?
  clientFeedback        String?

  // Appeal
  appealFiled           Boolean @default(false)
  appealDate            DateTime?
  appealResolution      String?

  // Regulatory
  reportedToState       Boolean @default(false)
  stateReportDate       DateTime?
  stateReferenceNumber  String?

  companyId             String
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

enum GrievanceCategory {
  QUALITY_OF_CARE
  STAFF_BEHAVIOR
  TIMELINESS
  COMMUNICATION
  BILLING
  RIGHTS_VIOLATION
  PRIVACY_BREACH
  SAFETY_CONCERN
  DISCRIMINATION
  OTHER
}

enum GrievanceStatus {
  RECEIVED
  UNDER_INVESTIGATION
  PENDING_RESOLUTION
  RESOLVED
  CLOSED
  APPEALED
}

enum GrievancePriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

#### API Endpoints

| Method | Endpoint                                   | Description              |
| ------ | ------------------------------------------ | ------------------------ |
| GET    | `/api/clients/[id]/advance-directives`     | Get client ADs           |
| POST   | `/api/clients/[id]/advance-directives`     | Add AD                   |
| PATCH  | `/api/advance-directives/[id]`             | Update AD                |
| POST   | `/api/advance-directives/[id]/verify`      | Verify AD                |
| GET    | `/api/clients/[id]/capacity`               | Get capacity assessments |
| POST   | `/api/clients/[id]/capacity`               | Document capacity        |
| POST   | `/api/consents/[id]/verify-comprehension`  | Verify understanding     |
| GET    | `/api/clients/[id]/rights-acknowledgments` | Get acknowledgments      |
| POST   | `/api/clients/[id]/rights-acknowledgments` | Document acknowledgment  |
| GET    | `/api/grievances`                          | List grievances          |
| POST   | `/api/grievances`                          | File grievance           |
| PATCH  | `/api/grievances/[id]`                     | Update grievance         |
| POST   | `/api/grievances/[id]/resolve`             | Resolve grievance        |

#### UI Components

1. **Advance Directives Manager** (embedded in client detail)
   - AD list with status
   - Add/edit forms
   - Document upload
   - Alert indicators

2. **Capacity Assessment Form** (modal)
   - Structured assessment
   - Surrogate documentation
   - Clinical justification

3. **Consent Comprehension** (embedded in consent workflow)
   - Teach-back documentation
   - Interpreter tracking
   - Verification checklist

4. **Grievance Management** (`/grievances`)
   - Grievance list
   - Investigation workflow
   - Resolution tracking
   - Reporting

---

### 10. OASIS-C2 Integration

#### Overview

Integration of CMS OASIS-C2 (Outcome and Assessment Information Set) standardized assessment items for Medicare-certified home health agencies.

#### Functional Requirements

**FR-10.1: OASIS Assessment Items**

- All OASIS-C2/D items implemented
- Standardized response options
- Skip logic per CMS guidance
- Item help text

**FR-10.2: OASIS Timing**

- Start of care (SOC)
- Resumption of care (ROC)
- Recertification
- Follow-up
- Transfer/Discharge

**FR-10.3: Data Validation**

- CMS edit checks
- Consistency validation
- Required field enforcement
- Warning/error system

**FR-10.4: Submission**

- Generate OASIS record
- Export for transmission
- Track submission status
- Correction process

**FR-10.5: Outcome Calculation**

- Risk-adjusted outcomes
- HHRG calculation
- Quality measure derivation
- Benchmark comparison

#### Data Model

```prisma
model OASISAssessment {
  id                    String   @id @default(cuid())

  clientId              String
  client                Client @relation(fields: [clientId], references: [id])

  // Assessment info
  assessmentType        OASISAssessmentType
  assessmentDate        DateTime

  // Clinician
  clinicianId           String
  clinician             User @relation(fields: [clinicianId], references: [id])
  clinicianDiscipline   String

  // Status
  status                OASISStatus

  // Episode
  socDate               DateTime
  episodeId             String?

  // OASIS Items (stored as JSON for flexibility)
  // Sections M0 through M2400
  clinicalItems         Json // M1000-M1400 series
  functionalItems       Json // M1600-M1900 series
  serviceItems          Json // M2000-M2200 series

  // Calculated scores
  adlScore              Int?
  iadlScore             Int?

  // Validation
  validationErrors      Json? // Array of validation issues
  validationWarnings    Json?
  isValid               Boolean @default(false)
  validatedAt           DateTime?

  // Submission
  submissionStatus      OASISSubmissionStatus?
  submittedAt           DateTime?
  submissionResponse    Json?
  correctionNumber      Int @default(0)

  // Locking
  isLocked              Boolean @default(false)
  lockedAt              DateTime?
  lockedById            String?

  // Links
  assessmentId          String? // Link to general Assessment

  companyId             String
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

enum OASISAssessmentType {
  START_OF_CARE
  RESUMPTION_OF_CARE
  RECERTIFICATION
  OTHER_FOLLOW_UP
  TRANSFER_TO_INPATIENT
  TRANSFER_DISCHARGE
  DISCHARGE_FROM_AGENCY
  DEATH_AT_HOME
}

enum OASISStatus {
  IN_PROGRESS
  COMPLETED
  PENDING_VALIDATION
  VALIDATED
  LOCKED
  CORRECTED
}

enum OASISSubmissionStatus {
  NOT_SUBMITTED
  PENDING
  ACCEPTED
  REJECTED
  CORRECTION_PENDING
}

// OASIS Item definitions for validation and rendering
model OASISItemDefinition {
  id                    String   @id @default(cuid())

  itemNumber            String   @unique // M0100, M1020, etc.
  itemName              String
  section               OASISSection

  // Item properties
  dataType              OASISDataType
  responseOptions       Json? // Array of { value, label }

  // Skip logic
  skipLogic             Json? // Conditions for when item is skipped

  // Validation
  validationRules       Json? // CMS edit rules
  requiredForTypes      OASISAssessmentType[]

  // Help
  itemGuidance          String?

  // Version
  effectiveDate         DateTime
  endDate               DateTime?
}

enum OASISSection {
  PATIENT_TRACKING
  CLINICAL_RECORD
  PATIENT_HISTORY
  LIVING_ARRANGEMENTS
  SENSORY_STATUS
  INTEGUMENTARY_STATUS
  RESPIRATORY_STATUS
  CARDIAC_STATUS
  ELIMINATION_STATUS
  NEURO_EMOTIONAL
  ADL_IADL
  MEDICATIONS
  CARE_MANAGEMENT
  THERAPY
  EMERGENT_CARE
}

enum OASISDataType {
  DATE
  NUMERIC
  SINGLE_SELECT
  MULTI_SELECT
  TIME
  TEXT
  ICD_CODE
  UK_RESPONSE // Unknown
  NA_RESPONSE // Not Applicable
}

// HHRG (Home Health Resource Group) calculation
model HHRGCalculation {
  id                    String   @id @default(cuid())

  oasisAssessmentId     String
  oasisAssessment       OASISAssessment @relation(fields: [oasisAssessmentId], references: [id])

  // Clinical grouping
  clinicalGroup         String
  clinicalPoints        Int

  // Functional grouping
  functionalGroup       String
  functionalPoints      Int

  // Service utilization
  serviceGroup          String
  servicePoints         Int

  // Final HHRG
  hhrgCode              String
  caseWeight            Float

  // Timing
  earlyOrLate           String? // Early vs Late in episode

  calculatedAt          DateTime @default(now())
}
```

#### API Endpoints

| Method | Endpoint                               | Description             |
| ------ | -------------------------------------- | ----------------------- |
| GET    | `/api/oasis/assessments`               | List OASIS assessments  |
| POST   | `/api/oasis/assessments`               | Create OASIS assessment |
| GET    | `/api/oasis/assessments/[id]`          | Get assessment          |
| PATCH  | `/api/oasis/assessments/[id]`          | Update assessment       |
| POST   | `/api/oasis/assessments/[id]/validate` | Run validation          |
| POST   | `/api/oasis/assessments/[id]/lock`     | Lock assessment         |
| POST   | `/api/oasis/assessments/[id]/submit`   | Submit to CMS           |
| GET    | `/api/oasis/assessments/[id]/hhrg`     | Get HHRG calculation    |
| GET    | `/api/oasis/items`                     | Get item definitions    |
| GET    | `/api/oasis/quality-measures`          | Get quality measures    |

#### UI Components

1. **OASIS Assessment Form** (`/oasis/assessments/[id]`)
   - Section-based navigation
   - Item rendering with help
   - Skip logic handling
   - Real-time validation

2. **OASIS Dashboard** (`/oasis`)
   - Assessment list
   - Status tracking
   - Submission queue
   - Quality measures

3. **OASIS Validation** (embedded)
   - Error/warning display
   - Consistency checks
   - Fix suggestions

4. **HHRG Calculator** (embedded)
   - Score breakdown
   - Case weight display
   - Episode timing

---

## Database Schema Additions

### Summary of New Models

| Module                  | New Models                                                                                         | Count |
| ----------------------- | -------------------------------------------------------------------------------------------------- | ----- |
| Reassessment Scheduling | AssessmentSchedule, AssessmentScheduleConfig                                                       | 2     |
| Competency              | Competency, StaffCompetency, TaskCompetencyRequirement, RemediationPlan, RemediationActivity       | 5     |
| Training                | TrainingCourse, TrainingSession, TrainingAttendance, TrainingAssignment                            | 4     |
| Supervision             | SupervisoryRelationship, SupervisionVisit, StaffDevelopmentPlan, DevelopmentGoal                   | 4     |
| RCA                     | IncidentInvestigation, RootCause, ContributingFactor, InvestigationInterview, CorrectiveActionPlan | 5     |
| Infection Control       | InfectionReport, DiagnosticTest, Outbreak, StaffExposure, ExposureTest                             | 5     |
| Quality                 | QualityMetric, MetricValue, PatientOutcome, RehospitalizationEvent, PatientSatisfactionSurvey      | 5     |
| Document Control        | DocumentVersion, DocumentSignature, DocumentAccessLog, RetentionPolicy, LegalHold                  | 5     |
| Patient Rights          | AdvanceDirective, CapacityAssessment, ConsentComprehension, RightsAcknowledgment, GrievanceReport  | 5     |
| OASIS                   | OASISAssessment, OASISItemDefinition, HHRGCalculation                                              | 3     |

**Total New Models: ~43**

### Enhancements to Existing Models

1. **AuditLog** - Add beforeSnapshot, afterSnapshot, changesSummary
2. **VisitNote** - Add isLocked, versionNumber, amendmentOf
3. **Assessment** - Add isLocked, versionNumber
4. **Client** - Add emergencyContacts (structured), preferredLanguage
5. **IncidentReport** - Link to IncidentInvestigation

---

## API Endpoints

### Summary by Module

| Module                  | Endpoints | Priority |
| ----------------------- | --------- | -------- |
| Reassessment Scheduling | 12        | Critical |
| Competency              | 14        | Critical |
| Training                | 13        | High     |
| Supervision             | 12        | Critical |
| RCA                     | 13        | Critical |
| Infection Control       | 14        | Critical |
| Quality                 | 14        | Medium   |
| Document Control        | 14        | High     |
| Patient Rights          | 13        | High     |
| OASIS                   | 10        | High     |

**Total New Endpoints: ~129**

---

## UI/UX Requirements

### New Pages

| Page                          | Path                           | Priority |
| ----------------------------- | ------------------------------ | -------- |
| Assessment Schedule Dashboard | /assessments/schedule          | Critical |
| Schedule Configuration        | /settings/assessment-schedules | Critical |
| Competency Library            | /settings/competencies         | Critical |
| Staff Competency Profile      | /staff/[id]/competencies       | Critical |
| Remediation Management        | /staff/remediation             | High     |
| Training Catalog              | /training                      | High     |
| Training Management           | /settings/training/courses     | High     |
| Supervision Dashboard         | /supervision                   | Critical |
| Development Plans             | /staff/[id]/development        | Medium   |
| Investigations Dashboard      | /investigations                | Critical |
| Investigation Workspace       | /investigations/[id]           | Critical |
| Corrective Actions            | /corrective-actions            | High     |
| Infection Control Dashboard   | /infection-control             | Critical |
| Outbreak Management           | /infection-control/outbreaks   | High     |
| Staff Exposures               | /infection-control/exposures   | High     |
| Quality Dashboard             | /quality                       | Medium   |
| Rehospitalization Tracker     | /quality/rehospitalizations    | Medium   |
| Survey Management             | /quality/surveys               | Low      |
| Audit Log Viewer              | /admin/audit-logs              | High     |
| Retention Management          | /admin/retention               | Medium   |
| Legal Holds                   | /admin/legal-holds             | Low      |
| Grievance Management          | /grievances                    | High     |
| OASIS Dashboard               | /oasis                         | High     |
| OASIS Assessment Form         | /oasis/assessments/[id]        | High     |

**Total New Pages: ~24**

### Enhanced Components

| Component       | Location        | Enhancement                             |
| --------------- | --------------- | --------------------------------------- |
| Client Detail   | /clients/[id]   | Add AD manager, capacity, outcomes      |
| Staff Detail    | /staff/[id]     | Add competencies, supervision, training |
| Incident Detail | /incidents/[id] | Add investigation workflow              |
| Document Views  | Various         | Add version history, access log         |
| Consent Flow    | /intake/[id]    | Add comprehension verification          |

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-4)

**Focus:** Critical compliance gaps

- [ ] Reassessment scheduling system
- [ ] Document immutability (lock approved docs)
- [ ] Enhanced audit trail (before/after values)
- [ ] Supervision relationships and visits

**Deliverables:**

- 4 core modules operational
- Basic compliance dashboard
- Automated notifications

### Phase 2: HR Compliance (Weeks 5-8)

**Focus:** Staff qualifications

- [ ] Competency management system
- [ ] Training & education module
- [ ] Remediation tracking
- [ ] Staff development plans

**Deliverables:**

- Complete HR compliance
- Training catalog
- Competency dashboard

### Phase 3: Safety & Quality (Weeks 9-12)

**Focus:** Incident management and quality

- [ ] Root cause analysis module
- [ ] Corrective action tracking
- [ ] Quality metrics system
- [ ] Outcome measurement

**Deliverables:**

- Complete PI/QI functionality
- Safety dashboard
- Quality reports

### Phase 4: Specialized (Weeks 13-16)

**Focus:** Clinical compliance

- [ ] Infection prevention & control
- [ ] Advance directives
- [ ] Capacity assessment
- [ ] Grievance management

**Deliverables:**

- Infection control dashboard
- Patient rights compliance
- Grievance workflow

### Phase 5: Advanced (Weeks 17-20)

**Focus:** OASIS and advanced features

- [ ] OASIS-C2 integration
- [ ] Retention management
- [ ] Enhanced reporting
- [ ] Compliance dashboard v2

**Deliverables:**

- OASIS assessment capability
- Complete compliance tracking
- Executive dashboards

---

## Testing & Validation

### Testing Strategy

1. **Unit Tests**
   - All new API endpoints
   - Calculation logic (HHRG, scores)
   - Validation rules
   - Business logic

2. **Integration Tests**
   - Cross-module workflows
   - Notification triggers
   - Audit trail completeness
   - Document versioning

3. **E2E Tests**
   - Critical user journeys
   - Compliance workflows
   - Approval processes
   - Reporting accuracy

4. **Compliance Testing**
   - Joint Commission standard mapping
   - CMS requirement validation
   - State regulation verification
   - Mock survey scenarios

### Validation Checklist

- [ ] All Joint Commission standards mapped to features
- [ ] CMS Conditions of Participation verified
- [ ] State-specific requirements documented
- [ ] Mock survey conducted
- [ ] Staff training completed
- [ ] Documentation complete

---

## Compliance Dashboard

### Executive Dashboard Components

1. **Overall Compliance Score**
   - Weighted aggregate of all areas
   - Trend over time
   - Benchmark comparison

2. **Standard-by-Standard Status**
   - HR compliance %
   - PC compliance %
   - PI compliance %
   - IC compliance %
   - IM compliance %
   - RI compliance %

3. **Critical Alerts**
   - Overdue assessments
   - Expired credentials
   - Missing supervision
   - Unresolved incidents
   - Overdue training

4. **Trending Indicators**
   - Incident rates
   - Infection rates
   - Rehospitalization rates
   - Patient satisfaction
   - Staff compliance

5. **Upcoming Requirements**
   - Assessments due
   - Training due
   - Supervision due
   - Credential renewals
   - Policy reviews

---

## Appendix A: Joint Commission Standards Reference

| Standard    | Description              | Module Coverage         |
| ----------- | ------------------------ | ----------------------- |
| HR.01.02.05 | Competency verification  | Competency Management   |
| HR.01.05.03 | Ongoing education        | Training Module         |
| HR.01.06.01 | Supervision              | Supervision System      |
| PC.01.02.01 | Comprehensive assessment | Assessment + OASIS      |
| PC.01.02.03 | Reassessment             | Reassessment Scheduling |
| PC.01.03.01 | Individualized care plan | Care Plan (existing)    |
| PI.01.01.01 | Adverse event analysis   | RCA Module              |
| PI.03.01.01 | Outcome measurement      | Quality Metrics         |
| IC.01.01.01 | Infection prevention     | Infection Control       |
| IM.02.02.01 | Complete documentation   | Document Control        |
| RI.01.01.01 | Patient rights           | Patient Rights          |

---

## Appendix B: Glossary

| Term  | Definition                                     |
| ----- | ---------------------------------------------- |
| OASIS | Outcome and Assessment Information Set         |
| HHRG  | Home Health Resource Group                     |
| RCA   | Root Cause Analysis                            |
| CAP   | Corrective Action Plan                         |
| CEU   | Continuing Education Unit                      |
| DNR   | Do Not Resuscitate                             |
| POLST | Physician Orders for Life-Sustaining Treatment |
| AD    | Advance Directive                              |
| EVV   | Electronic Visit Verification                  |
| QA    | Quality Assurance                              |
| PI    | Performance Improvement                        |

---

## Document History

| Version | Date     | Author      | Changes                    |
| ------- | -------- | ----------- | -------------------------- |
| 1.0     | Feb 2026 | Claude Code | Initial comprehensive plan |

---

_This document serves as the master specification for Joint Commission compliance implementation. All development should reference this document for requirements and specifications._
