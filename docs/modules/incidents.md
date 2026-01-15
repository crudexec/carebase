# Incident Reporting Module

## Overview

The Incident Reporting module enables documentation and controlled communication of incidents, with an approval workflow to protect sensitive information.

---

## Workflow

```
Carer or Supervisor Creates Report
        ↓
Notification → Admin
        ↓
Review by Ops Manager or Admin
        ↓
Approve / Reject
        ↓
[If Approved] Notification → Sponsor
```

---

## Creating an Incident Report

### Required Fields

- Incident date/time
- Location
- Client involved
- Carer involved
- Incident type/category
- Severity level
- Description
- Immediate actions taken

### Optional Fields

- Attachments (photos, documents)
- Witness information

### Severity Levels

| Level    | Description                                    |
| -------- | ---------------------------------------------- |
| Low      | Minor issues, no immediate risk                |
| Medium   | Moderate concern, requires attention           |
| High     | Significant issue, urgent attention needed     |
| Critical | Emergency situation, immediate action required |

---

## Submitting a Report

1. Go to **Incidents > New Report**
2. Fill in all required fields
3. Select appropriate severity level
4. Add attachments if needed
5. Click **Submit**
6. Admin is notified immediately

---

## Approval Workflow

### For Ops Manager / Admin

1. Receive notification of new incident
2. Go to **Incidents > Pending Review**
3. Review incident details
4. Choose action:
   - **Approve** - Sponsor will be notified
   - **Reject** - Add rejection reason
5. Add any notes
6. Confirm action

### Important

- Sponsors only see approved incidents
- Rejected incidents remain internal
- All decisions are logged

---

## Viewing Incidents

### Admin / Ops Manager

Full access to all incidents, all statuses.

### Clinical Director / Staff / Supervisor

View access to all incidents.

### Carer

View incidents they created.

### Sponsor

View only approved incidents involving their care recipient.

---

## Notifications

| Event           | Recipient |
| --------------- | --------- |
| Report created  | Admin     |
| Report approved | Sponsor   |
| Report rejected | Reporter  |

---

**Last Updated:** 2026-01-13
