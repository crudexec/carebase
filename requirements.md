# Care Agency Management System

## Software Requirements Specification

**Document Version:** 1.0  
**Date:** January 13, 2026  
**Status:** Draft

---

## 1. Executive Summary

This document outlines the functional and non-functional requirements for a Care Agency Management System designed to streamline operations for home care service providers. The system supports end-to-end workflow management including client onboarding, caregiver scheduling, payroll processing, incident reporting, and communication between caregivers and sponsors (clients/family members).

---

## 2. Stakeholders and User Roles

### 2.1 Role Hierarchy Overview

| Role               | Description                                       | Access Level             |
| ------------------ | ------------------------------------------------- | ------------------------ |
| Admin              | System administrator with full access             | Full system access       |
| Operations Manager | Oversees daily operations and approvals           | Administrative functions |
| Clinical Director  | Medical oversight and authorization               | Approval authority       |
| Staff              | Internal employees handling administrative tasks  | Department-specific      |
| Supervisor         | Field management and caregiver coordination       | Operational oversight    |
| Carer (Caregiver)  | Front-line care providers                         | Mobile/field access      |
| Sponsor            | Client or family member receiving/paying for care | Limited portal access    |

---

## 3. User Role Specifications

### 3.1 Admin

**Description:** System administrator with unrestricted access to all system functions and data.

**Permissions:**

- Full read/write access to all modules
- User management (create, modify, deactivate accounts)
- System configuration and settings
- Access to all reports and analytics
- Audit log access
- Incident report approval authority

### 3.2 Operations Manager

**Description:** Manages day-to-day operational workflows and handles escalations.

**Permissions:**

- Client Onboarding management
- Incident management and approval
- HR Management functions
- Approval workflows (payroll, incidents, onboarding stages)

**Key Responsibilities:**

- Review and approve incident reports before sponsor notification
- Oversee client onboarding pipeline
- Manage HR-related tasks

### 3.3 Clinical Director

**Description:** Provides clinical oversight and authorization for care-related decisions.

**Permissions:**

- Authorize supervisor actions during client onboarding
- Process payroll payments on designated payment cycles
- Review and approve caregiver health assessments
- Receive notifications when supervisors approve caregiver payments

**Key Responsibilities:**

- Final authorization during assessment phase
- Payroll disbursement (Monday, Wednesday, Friday cycles)

### 3.4 Staff

**Description:** Internal employees handling administrative and back-office functions.

**Permissions:**

- Payroll data entry and management
- Staff onboarding processes
- Scheduling functions

**Module Access:**

- Payroll module
- Staff onboarding module
- Scheduling module

### 3.5 Supervisor

**Description:** Field supervisors managing caregiver teams and client relationships.

**Permissions:**

- Client relations management
- Direct communication with Carers
- Escalation handling
- Scheduling management
- Payroll data input
- Daily report compliance review
- Incident report creation

**Key Responsibilities:**

- Input payroll data after shift completion
- Approve caregiver payments (triggers Clinical Director notification)
- Manage caregiver escalations
- Conduct 1-on-1 assessments

### 3.6 Carer (Caregiver)

**Description:** Front-line care providers delivering services to clients.

**Permissions:**

- Check-in / Check-out functionality
- Daily reporting (notes and image uploads)
- Escalation submission
- Chat communication with assigned Sponsor

**Features:**

- Mobile-optimized interface
- GPS-enabled check-in/check-out
- Photo upload capability for daily reports
- Real-time chat with Sponsor

### 3.7 Sponsor

**Description:** Client or authorized family member receiving and/or paying for care services.

**Permissions:**

- Chat communication with assigned Carer
- View and manage invoices (mark as paid)
- View daily reports
- View monthly summary reports

**Portal Features:**

- Read-only access to care documentation
- Invoice payment tracking
- Communication with assigned caregiver

---

## 4. Functional Requirements

### 4.1 Client Onboarding Module

**Display Style:** Kanban board interface with drag-and-drop functionality

**Pipeline Stages:**

| Stage                     | Description                             | Owner              | Actions                               |
| ------------------------- | --------------------------------------- | ------------------ | ------------------------------------- |
| 1. Reach Out              | Initial contact with prospective client | Operations Manager | Log contact, capture basic info       |
| 2. Assessment             | Initial needs assessment                | Supervisor         | Schedule assessment, document needs   |
| 3. Schedule Appointment   | Book formal assessment meeting          | Staff/Supervisor   | Calendar integration                  |
| 4. Assessment Report      | Document findings and recommendations   | Supervisor         | Generate report, attach documentation |
| 5. Clinical Authorization | Clinical Director approval              | Clinical Director  | Approve/reject/request changes        |
| 6. Assign Caregiver       | Match appropriate caregiver to client   | Supervisor         | View available caregivers, assign     |
| 7. Health Check           | Caregiver health verification           | Staff              | Document health status                |
| 8. Health Assessment      | Formal caregiver health assessment      | Clinical Director  | Verify fitness for assignment         |
| 9. 1-on-1 Assessment      | Caregiver-client compatibility check    | Supervisor         | Conduct meeting, document outcome     |
| 10. Contract Start        | Activate service agreement              | Operations Manager | Finalize contract, begin service      |

**Requirements:**

- REQ-ONB-001: System shall display onboarding pipeline as a Kanban board
- REQ-ONB-002: Cards shall be draggable between stages with appropriate permissions
- REQ-ONB-003: Stage transitions shall trigger notifications to relevant stakeholders
- REQ-ONB-004: Clinical Director authorization is required before caregiver assignment
- REQ-ONB-005: System shall maintain audit trail of all stage transitions
- REQ-ONB-006: Each stage shall support document attachments and notes

### 4.2 Scheduling Module

**Status:** Requirements pending - Solution to be proposed by Sparkplug

**Placeholder Requirements:**

- REQ-SCH-001: System shall support shift scheduling for caregivers
- REQ-SCH-002: Supervisors and Staff shall have scheduling permissions
- REQ-SCH-003: Schedule changes shall notify affected caregivers
- REQ-SCH-004: System shall prevent double-booking of caregivers

_Note: Detailed scheduling requirements to be defined following Sparkplug solution proposal._

### 4.3 Payroll Module

**Workflow:**

```
Carer Completes Shift
        ↓
Supervisor Inputs Payroll Data
(with daily report compliance visibility)
        ↓
Notification → Clinical Director
        ↓
Clinical Director Processes Payment
(Payment Cycles: Monday, Wednesday, Friday)
```

**Requirements:**

- REQ-PAY-001: System shall capture payroll data upon shift completion
- REQ-PAY-002: Supervisors shall input/verify payroll data with visibility into daily report compliance status
- REQ-PAY-003: System shall notify Clinical Director when Supervisor approves caregiver payment
- REQ-PAY-004: Clinical Director shall process payments on designated cycles (Monday, Wednesday, Friday)
- REQ-PAY-005: System shall maintain complete payroll audit trail
- REQ-PAY-006: Daily report compliance status must be visible during payroll data entry

**Notification Rules:**
| Event | Recipient | Notification Type |
|-------|-----------|-------------------|
| Supervisor approves payment | Clinical Director | In-app + Email |
| Payment processed | Carer | In-app + Email/SMS |
| Payment cycle reminder | Clinical Director | In-app |

### 4.4 Incident Reporting Module

**Workflow:**

```
Carer or Supervisor Creates Incident Report
        ↓
Notification → Admin
        ↓
Review by Operations Manager or Admin
        ↓
Approval Decision
        ↓
[If Approved] Notification → Sponsor
```

**Requirements:**

- REQ-INC-001: Carers and Supervisors shall be able to create incident reports
- REQ-INC-002: System shall immediately notify Admin upon incident report creation
- REQ-INC-003: Operations Manager or Admin approval is required before Sponsor notification
- REQ-INC-004: Sponsors shall only receive incident notifications after approval
- REQ-INC-005: System shall support incident categorization and severity levels
- REQ-INC-006: All incident reports shall be timestamped and include reporter identification

**Incident Report Data Fields:**

- Incident date/time
- Location
- Client involved
- Carer involved
- Incident type/category
- Severity level
- Description
- Immediate actions taken
- Attachments (photos, documents)
- Witness information (if applicable)

### 4.5 Daily Reporting Module

**Description:** Enables caregivers to document daily care activities and observations.

**Requirements:**

- REQ-RPT-001: Carers shall submit daily reports for each shift
- REQ-RPT-002: Reports shall support image uploads
- REQ-RPT-003: Reports shall support text notes
- REQ-RPT-004: Sponsors shall have read access to daily reports
- REQ-RPT-005: System shall track report compliance for payroll integration

**Report Contents:**

- Shift date and time
- Client status observations
- Activities performed
- Medications administered (if applicable)
- Photo documentation
- Notes and observations
- Any concerns or escalations

### 4.6 Monthly Reporting Module

**Description:** Aggregated monthly summary reports for Sponsors.

**Requirements:**

- REQ-MRP-001: System shall generate monthly summary reports
- REQ-MRP-002: Sponsors shall have access to view monthly reports
- REQ-MRP-003: Reports shall aggregate daily report data
- REQ-MRP-004: Reports shall be available by the 5th of the following month

### 4.7 Communication Module

**Chat Feature:**

- REQ-COM-001: Carers shall be able to chat with assigned Sponsors
- REQ-COM-002: Sponsors shall be able to chat with assigned Carers
- REQ-COM-003: Chat history shall be persisted and searchable
- REQ-COM-004: System shall support text messages
- REQ-COM-005: Chat shall be accessible via mobile and web interfaces

### 4.8 Invoice Management Module

**Description:** Invoice viewing and payment tracking for Sponsors.

**Requirements:**

- REQ-INV-001: Sponsors shall view invoices
- REQ-INV-002: Sponsors shall be able to mark invoices as paid
- REQ-INV-003: System shall track invoice payment status
- REQ-INV-004: Payment confirmation shall update invoice status

### 4.9 Escalation Module

**Description:** Enables caregivers to escalate issues requiring immediate attention.

**Requirements:**

- REQ-ESC-001: Carers shall be able to submit escalations
- REQ-ESC-002: Escalations shall notify assigned Supervisor immediately
- REQ-ESC-003: Supervisors shall manage and resolve escalations
- REQ-ESC-004: Escalation status shall be trackable (Open, In Progress, Resolved)

---

## 5. Non-Functional Requirements

### 5.1 Performance

- REQ-NFR-001: Page load time shall not exceed 3 seconds
- REQ-NFR-002: System shall support minimum 500 concurrent users
- REQ-NFR-003: Real-time notifications shall be delivered within 5 seconds

### 5.2 Security

- REQ-NFR-004: All data transmission shall be encrypted (TLS 1.3+)
- REQ-NFR-005: Role-based access control (RBAC) shall be enforced
- REQ-NFR-006: Session timeout after 30 minutes of inactivity
- REQ-NFR-007: Password policy shall enforce complexity requirements
- REQ-NFR-008: System shall maintain audit logs for all sensitive operations

### 5.3 Availability

- REQ-NFR-009: System uptime shall be 99.5% minimum
- REQ-NFR-010: Scheduled maintenance windows shall be communicated 48 hours in advance

### 5.4 Compliance

- REQ-NFR-011: System shall comply with HIPAA requirements for health data
- REQ-NFR-012: Data retention policies shall comply with applicable regulations

### 5.5 Usability

- REQ-NFR-013: Mobile interface shall be responsive (iOS and Android)
- REQ-NFR-014: System shall support modern browsers (Chrome, Safari, Firefox, Edge)

---

## 6. Permission Matrix

| Module            | Admin | Ops Manager | Clinical Director | Staff  | Supervisor  | Carer       | Sponsor         |
| ----------------- | ----- | ----------- | ----------------- | ------ | ----------- | ----------- | --------------- |
| Client Onboarding | Full  | Full        | Approve           | View   | Edit        | —           | —               |
| Scheduling        | Full  | View        | View              | Edit   | Edit        | View        | —               |
| Payroll           | Full  | View        | Process           | Edit   | Edit        | View Own    | —               |
| Incident Reports  | Full  | Approve     | View              | View   | Create/View | Create      | View (approved) |
| Daily Reports     | Full  | View        | View              | View   | View        | Create      | View            |
| Monthly Reports   | Full  | View        | View              | View   | View        | —           | View            |
| Chat              | Full  | Monitor     | —                 | —      | —           | Own Clients | Own Carer       |
| Invoices          | Full  | Manage      | —                 | Manage | —           | —           | View/Mark Paid  |
| User Management   | Full  | —           | —                 | —      | —           | —           | —               |
| System Config     | Full  | —           | —                 | —      | —           | —           | —               |

---

## 7. Integration Points

### 7.1 Identified Integrations

- Scheduling solution (Sparkplug - pending)
- Payment processing gateway (TBD)
- SMS/Email notification service
- Cloud storage for document/image uploads

### 7.2 API Requirements

- REQ-INT-001: System shall expose RESTful APIs for third-party integrations
- REQ-INT-002: API authentication via OAuth 2.0 or API keys
- REQ-INT-003: Webhook support for real-time event notifications

---

## 8. Open Items and Assumptions

### 8.1 Open Items

| ID     | Item                                            | Owner | Target Date |
| ------ | ----------------------------------------------- | ----- | ----------- |
| OI-001 | Scheduling module solution from Sparkplug       | TBD   | TBD         |
| OI-002 | Payment gateway selection                       | TBD   | TBD         |
| OI-003 | Mobile app platform decision (native vs hybrid) | TBD   | TBD         |

### 8.2 Assumptions

- Users will have access to internet-connected devices
- Carers will use mobile devices for field operations
- Clinical Director is a single role (not multiple users)
- Payment cycles are fixed (Monday, Wednesday, Friday)

---

## 9. Glossary

| Term              | Definition                                                                     |
| ----------------- | ------------------------------------------------------------------------------ |
| Carer             | Caregiver providing direct care services to clients                            |
| Sponsor           | Client or authorized family member responsible for care decisions and payments |
| Clinical Director | Medical authority responsible for clinical oversight and payment authorization |
| Kanban            | Visual project management board with cards moving through stages               |
| Escalation        | Urgent issue requiring immediate supervisor attention                          |

---

## 10. Document Revision History

| Version | Date             | Author | Changes       |
| ------- | ---------------- | ------ | ------------- |
| 1.0     | January 13, 2026 | —      | Initial draft |

---

_End of Document_
