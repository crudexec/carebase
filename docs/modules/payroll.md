# Payroll Module

## Overview

The Payroll module manages payment processing for completed shifts, following a Supervisor → Clinical Director approval workflow.

---

## Workflow

```
Carer Completes Shift
        ↓
Supervisor Inputs Payroll Data
(views daily report compliance)
        ↓
Supervisor Approves
        ↓
Notification → Clinical Director
        ↓
Clinical Director Processes Payment
(Monday, Wednesday, Friday cycles)
        ↓
Notification → Carer
```

---

## Roles & Permissions

| Role              | Permissions                               |
| ----------------- | ----------------------------------------- |
| Admin             | Full access to all payroll data           |
| Clinical Director | Process payments on payment cycles        |
| Staff             | Edit payroll data                         |
| Supervisor        | Input/edit payroll data, approve payments |
| Carer             | View own payment history                  |

---

## Supervisor Workflow

### Entering Payroll Data

1. Go to **Payroll**
2. Find completed shifts pending payroll entry
3. Click **Enter Payroll Data**
4. Fill in:
   - Hours worked
   - Hourly rate
   - Any adjustments
5. Note: Daily report compliance status is displayed
6. Click **Save**

### Approving Payroll

1. Review entered payroll data
2. Verify daily report was submitted
3. Click **Approve**
4. Clinical Director is notified

---

## Clinical Director Workflow

### Processing Payments

Payments are processed on designated cycles: **Monday, Wednesday, Friday**

1. Go to **Payroll > Pending Payments**
2. Review supervisor-approved records
3. Select records for current cycle
4. Click **Process Payments**
5. Carers are notified of payment

---

## Daily Report Compliance

Payroll entries display compliance status:

- **Compliant** - Daily report submitted for shift
- **Non-Compliant** - Daily report missing

Supervisors should verify compliance before approving.

---

## Carer View

Carers can view their payment history:

1. Go to **My Payments**
2. See list of all payments
3. Status shows: Pending, Approved, Processed
4. Click any record for details

---

## Notifications

| Event                  | Recipient         | Type               |
| ---------------------- | ----------------- | ------------------ |
| Supervisor approves    | Clinical Director | In-app + Email     |
| Payment processed      | Carer             | In-app + Email/SMS |
| Payment cycle reminder | Clinical Director | In-app             |

---

**Last Updated:** 2026-01-13
