# Roles and Permissions

This document outlines all user roles and their associated permissions in the Carebase application.

---

## User Roles (7 total)

| Role                | Label              | Description                            |
| ------------------- | ------------------ | -------------------------------------- |
| `ADMIN`             | Administrator      | Full system access                     |
| `OPS_MANAGER`       | Operations Manager | Manages operations, staff, scheduling  |
| `CLINICAL_DIRECTOR` | Clinical Director  | Oversees clinical care, approvals      |
| `STAFF`             | Staff              | Office/admin staff                     |
| `SUPERVISOR`        | Supervisor         | Supervises carers, handles escalations |
| `CARER`             | Caregiver          | Frontline care provider                |
| `SPONSOR`           | Sponsor            | Client's family/payer (limited view)   |

---

## Permissions by Role

### 1. ADMIN (Administrator)

**Full access to everything** - all permissions granted.

This role has complete control over:

- Client onboarding
- Scheduling
- Payroll
- Incidents
- Visit notes
- Form templates
- Monthly reports
- Chat
- Invoices
- User management
- System configuration
- Escalations
- Audit logs
- Billing/Claims

---

### 2. OPS_MANAGER (Operations Manager)

| Area              | Permissions            |
| ----------------- | ---------------------- |
| Client Onboarding | Full control           |
| Scheduling        | View only              |
| Payroll           | View only              |
| Incidents         | Approve + Full control |
| Visit Notes       | View all               |
| Form Templates    | Manage                 |
| Monthly Reports   | View                   |
| Chat              | Monitor all            |
| Invoices          | Manage                 |
| Users             | View + Manage          |
| Escalations       | Full control           |
| Billing           | Manage + Submit claims |
| Audit Logs        | View                   |

---

### 3. CLINICAL_DIRECTOR

| Area              | Permissions    |
| ----------------- | -------------- |
| Client Onboarding | View + Approve |
| Scheduling        | View only      |
| Payroll           | View + Process |
| Incidents         | View only      |
| Visit Notes       | View all       |
| Form Templates    | View only      |
| Monthly Reports   | View           |
| Billing           | View only      |

---

### 4. STAFF

| Area              | Permissions |
| ----------------- | ----------- |
| Client Onboarding | View only   |
| Scheduling        | Edit        |
| Payroll           | Edit        |
| Incidents         | View only   |
| Visit Notes       | View all    |
| Form Templates    | View only   |
| Monthly Reports   | View        |
| Invoices          | Manage      |
| Billing           | View only   |

---

### 5. SUPERVISOR

| Area              | Permissions   |
| ----------------- | ------------- |
| Client Onboarding | View + Edit   |
| Scheduling        | Edit          |
| Payroll           | Edit          |
| Incidents         | Create + View |
| Visit Notes       | View all      |
| Form Templates    | View only     |
| Monthly Reports   | View          |
| Escalations       | Manage        |

---

### 6. CARER (Caregiver)

| Area        | Permissions                       |
| ----------- | --------------------------------- |
| Scheduling  | View only (their assigned shifts) |
| Payroll     | View own only                     |
| Incidents   | Create                            |
| Visit Notes | Create + View own                 |
| Chat        | Own conversations                 |
| Escalations | Create                            |

**Note:** Carers can only see shifts and clients assigned to them.

---

### 7. SPONSOR (Client's Family/Payer)

| Area            | Permissions             |
| --------------- | ----------------------- |
| Incidents       | View approved only      |
| Visit Notes     | View (for their client) |
| Monthly Reports | View                    |
| Chat            | Own conversations       |
| Invoices        | View + Mark as paid     |

**Note:** Sponsors have the most restricted access, limited to viewing information about their associated client(s).

---

## Permission Categories

### Overview of Permission Levels

| Category        | Levels (Low → High)                            |
| --------------- | ---------------------------------------------- |
| **Onboarding**  | View → Edit → Approve → Full                   |
| **Scheduling**  | View → Edit → Full                             |
| **Payroll**     | View Own → View → Edit → Process → Full        |
| **Incidents**   | Create → View → View Approved → Approve → Full |
| **Visit Notes** | Create → View → View All → Full                |
| **Billing**     | View → Manage → Submit → Full                  |
| **Users**       | View → Manage → Full                           |
| **Chat**        | Own → Monitor → Full                           |

---

## Detailed Permission Definitions

### Client Onboarding

- `onboarding:view` - View client onboarding information
- `onboarding:edit` - Edit client onboarding details
- `onboarding:approve` - Approve client onboarding
- `onboarding:full` - Full control over onboarding

### Scheduling

- `scheduling:view` - View schedules and shifts
- `scheduling:edit` - Create and edit shifts
- `scheduling:full` - Full control over scheduling

### Payroll

- `payroll:view_own` - View own payroll information only
- `payroll:view` - View all payroll information
- `payroll:edit` - Edit payroll data
- `payroll:process` - Process payroll
- `payroll:full` - Full control over payroll

### Incident Reports

- `incident:create` - Create incident reports
- `incident:view` - View all incident reports
- `incident:view_approved` - View approved incidents only
- `incident:approve` - Approve/reject incident reports
- `incident:full` - Full control over incidents

### Visit Notes

- `visit_note:create` - Create visit notes
- `visit_note:view` - View own visit notes
- `visit_note:view_all` - View all visit notes
- `visit_note:full` - Full control over visit notes

### Form Templates

- `form_template:view` - View form templates
- `form_template:manage` - Create and edit form templates
- `form_template:full` - Full control over form templates

### Monthly Reports

- `monthly_report:view` - View monthly reports
- `monthly_report:full` - Full control over monthly reports

### Chat

- `chat:own` - Access own chat conversations
- `chat:monitor` - Monitor all chat conversations
- `chat:full` - Full control over chat

### Invoices

- `invoice:view` - View invoices
- `invoice:mark_paid` - Mark invoices as paid
- `invoice:manage` - Create and manage invoices
- `invoice:full` - Full control over invoices

### User Management

- `user:view` - View user information
- `user:manage` - Create, edit, and manage users
- `user:full` - Full control over users

### System Configuration

- `system:config` - Access to system configuration settings

### Escalations

- `escalation:create` - Create escalations
- `escalation:manage` - Manage escalations
- `escalation:full` - Full control over escalations

### Audit Logs

- `audit_log:view` - View audit logs

### Billing / Claims

- `billing:view` - View billing information
- `billing:manage` - Manage billing records
- `billing:submit` - Submit claims
- `billing:full` - Full control over billing

---

## Role Assignment

### How to Assign Roles

1. **Admin users** can assign roles through the Staff/Users management page
2. Navigate to `/staff` or `/users`
3. Click on a user to view their profile
4. Edit the user and select the appropriate role from the dropdown
5. Save changes

### Role Hierarchy

```
ADMIN (highest)
  └── OPS_MANAGER
        └── CLINICAL_DIRECTOR
        └── STAFF
        └── SUPERVISOR
              └── CARER
  └── SPONSOR (separate branch - client family)
```

---

## Code Reference

The permissions system is implemented in:

- `/src/lib/permissions.ts` - Permission definitions and role mappings
- `/prisma/schema.prisma` - UserRole enum definition

### Checking Permissions in Code

```typescript
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

// Check if a user has a specific permission
if (hasPermission(user.role, PERMISSIONS.SCHEDULING_EDIT)) {
  // Allow scheduling edit
}

// Check if user has any of multiple permissions
if (
  hasAnyPermission(user.role, [
    PERMISSIONS.INCIDENT_VIEW,
    PERMISSIONS.INCIDENT_FULL,
  ])
) {
  // Allow incident viewing
}
```
