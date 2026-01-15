# Authentication & Authorization

## Overview

CareBase implements role-based access control (RBAC) with 7 distinct user roles. This document details authentication flows and permission matrices.

---

## Authentication Flow

### Login

1. User submits email + password
2. System validates credentials
3. Session created with 30-minute inactivity timeout
4. User redirected to role-appropriate dashboard

### Session Management

- Sessions expire after 30 minutes of inactivity (REQ-NFR-006)
- Active sessions refresh on each request
- Users can have one active session at a time

### Password Policy

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

---

## User Roles

### 1. Admin

**Description:** System administrator with unrestricted access.

**Access:**

- Full read/write on all modules
- User management (CRUD)
- System configuration
- Audit log access
- All reports and analytics

### 2. Operations Manager

**Description:** Manages daily operations and handles escalations.

**Access:**

- Client onboarding management
- Incident approval authority
- HR management functions
- View payroll data

### 3. Clinical Director

**Description:** Clinical oversight and payment authorization.

**Access:**

- Authorize onboarding (stage 5)
- Process payroll payments (Mon/Wed/Fri)
- Review health assessments
- View clinical reports

### 4. Staff

**Description:** Administrative back-office functions.

**Access:**

- Payroll data entry
- Staff onboarding processes
- Scheduling functions
- Invoice management

### 5. Supervisor

**Description:** Field management and caregiver coordination.

**Access:**

- Client relations
- Caregiver communication
- Scheduling management
- Payroll data input
- Daily report review
- Incident report creation
- Escalation handling

### 6. Carer (Caregiver)

**Description:** Front-line care providers.

**Access:**

- Check-in/check-out
- Daily report submission
- Escalation submission
- Chat with assigned Sponsor
- View own payroll history
- View own schedule

### 7. Sponsor

**Description:** Client or family member.

**Access:**

- Chat with assigned Carer
- View/pay invoices
- View daily reports
- View monthly reports
- View approved incidents

---

## Permission Matrix

### Module Access by Role

| Module            | Admin | Ops Mgr | Clinical Dir | Staff  | Supervisor  | Carer       | Sponsor       |
| ----------------- | ----- | ------- | ------------ | ------ | ----------- | ----------- | ------------- |
| Client Onboarding | Full  | Full    | Approve      | View   | Edit        | -           | -             |
| Scheduling        | Full  | View    | View         | Edit   | Edit        | View Own    | -             |
| Payroll           | Full  | View    | Process      | Edit   | Edit        | View Own    | -             |
| Incident Reports  | Full  | Approve | View         | View   | Create/View | Create      | View Approved |
| Daily Reports     | Full  | View    | View         | View   | View        | Create      | View          |
| Monthly Reports   | Full  | View    | View         | View   | View        | -           | View          |
| Chat              | Full  | Monitor | -            | -      | -           | Own Clients | Own Carer     |
| Invoices          | Full  | Manage  | -            | Manage | -           | -           | View/Pay      |
| User Management   | Full  | -       | -            | -      | -           | -           | -             |
| System Config     | Full  | -       | -            | -      | -           | -           | -             |
| Audit Logs        | Full  | -       | -            | -      | -           | -           | -             |

### Action Permissions

| Action                         | Allowed Roles                                           |
| ------------------------------ | ------------------------------------------------------- |
| Create User                    | Admin                                                   |
| Deactivate User                | Admin                                                   |
| Move Onboarding Stage          | Admin, Ops Manager, Staff, Supervisor (stage-dependent) |
| Approve Clinical Authorization | Clinical Director                                       |
| Create Shift                   | Admin, Staff, Supervisor                                |
| Check-in/Check-out             | Carer                                                   |
| Submit Daily Report            | Carer                                                   |
| Input Payroll Data             | Supervisor                                              |
| Approve Payroll                | Supervisor                                              |
| Process Payment                | Clinical Director                                       |
| Create Incident                | Carer, Supervisor                                       |
| Approve Incident               | Admin, Ops Manager                                      |
| Submit Escalation              | Carer                                                   |
| Resolve Escalation             | Supervisor                                              |
| Create Invoice                 | Admin, Staff                                            |
| Mark Invoice Paid              | Sponsor                                                 |

---

## Route Protection

### Public Routes

- `/login`
- `/forgot-password`
- `/reset-password`

### Protected Routes (Authenticated)

All other routes require authentication.

### Role-Specific Routes

```
/admin/*           → Admin only
/onboarding/*      → Admin, Ops Manager, Staff, Supervisor
/scheduling/*      → Admin, Staff, Supervisor, Carer (view only)
/payroll/*         → Admin, Clinical Director, Staff, Supervisor, Carer (own)
/incidents/*       → Admin, Ops Manager, Clinical Director, Staff, Supervisor, Carer, Sponsor (approved)
/reports/*         → All authenticated (filtered by role)
/chat/*            → Admin, Carer, Sponsor
/invoices/*        → Admin, Ops Manager, Staff, Sponsor
/settings/*        → Admin
```

---

## Audit Logging

All sensitive operations are logged:

- User login/logout
- User creation/modification/deactivation
- Role changes
- Onboarding stage transitions
- Payroll approvals and processing
- Incident approvals
- Data exports

Log entries include:

- Timestamp
- User ID
- Action type
- Affected entity
- IP address
- Before/after values (where applicable)

---

**Last Updated:** 2026-01-13
