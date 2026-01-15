# API Reference

## Overview

CareBase exposes RESTful API endpoints for all functionality. All endpoints require authentication unless noted otherwise.

**Base URL:** `/api`

---

## Authentication

### POST /api/auth/login

Login with email and password.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "user": { "id": "...", "email": "...", "role": "..." },
  "token": "..."
}
```

### POST /api/auth/logout

End current session.

### GET /api/auth/me

Get current authenticated user.

---

## Users

### GET /api/users

List users (Admin only). Supports filtering by role.

### POST /api/users

Create new user (Admin only).

### GET /api/users/:id

Get user by ID.

### PATCH /api/users/:id

Update user.

### DELETE /api/users/:id

Deactivate user (soft delete).

---

## Clients

### GET /api/clients

List clients. Filtered by role permissions.

### POST /api/clients

Create new client.

### GET /api/clients/:id

Get client details.

### PATCH /api/clients/:id

Update client.

---

## Onboarding

### GET /api/onboarding

Get all onboarding records (Kanban board data).

### GET /api/onboarding/:clientId

Get onboarding record for specific client.

### PATCH /api/onboarding/:clientId/stage

Move client to new stage.

**Request Body:**

```json
{
  "stage": "CLINICAL_AUTHORIZATION",
  "notes": "Ready for clinical review"
}
```

### POST /api/onboarding/:clientId/documents

Upload document to onboarding stage.

---

## Scheduling

### GET /api/shifts

List shifts. Supports date range and user filters.

### POST /api/shifts

Create new shift.

### GET /api/shifts/:id

Get shift details.

### PATCH /api/shifts/:id

Update shift.

### POST /api/shifts/:id/check-in

Record check-in with GPS location.

### POST /api/shifts/:id/check-out

Record check-out with GPS location.

---

## Payroll

### GET /api/payroll

List payroll records. Supports status and date filters.

### POST /api/payroll

Create payroll record for completed shift.

### PATCH /api/payroll/:id/approve

Supervisor approves payroll record.

### PATCH /api/payroll/:id/process

Clinical Director processes payment.

---

## Incidents

### GET /api/incidents

List incident reports.

### POST /api/incidents

Create incident report.

### GET /api/incidents/:id

Get incident details.

### PATCH /api/incidents/:id/approve

Approve incident (triggers sponsor notification).

### PATCH /api/incidents/:id/reject

Reject incident report.

---

## Daily Reports

### GET /api/daily-reports

List daily reports.

### POST /api/daily-reports

Submit daily report.

### GET /api/daily-reports/:id

Get report details.

### GET /api/daily-reports/client/:clientId

Get reports for specific client (Sponsor access).

---

## Monthly Reports

### GET /api/monthly-reports

List monthly reports.

### GET /api/monthly-reports/:clientId/:month

Get monthly report for client.

---

## Chat

### GET /api/chat/conversations

List conversations for current user.

### GET /api/chat/messages/:conversationId

Get messages in conversation.

### POST /api/chat/messages

Send message.

### PATCH /api/chat/messages/:id/read

Mark message as read.

---

## Invoices

### GET /api/invoices

List invoices.

### POST /api/invoices

Create invoice (Admin/Staff).

### GET /api/invoices/:id

Get invoice details.

### PATCH /api/invoices/:id/mark-paid

Mark invoice as paid (Sponsor).

---

## Escalations

### GET /api/escalations

List escalations.

### POST /api/escalations

Create escalation (Carer).

### PATCH /api/escalations/:id

Update escalation status (Supervisor).

---

## Notifications

### GET /api/notifications

List notifications for current user.

### PATCH /api/notifications/:id/read

Mark notification as read.

### PATCH /api/notifications/read-all

Mark all notifications as read.

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "You do not have permission to perform this action"
  }
}
```

### Common Error Codes

| Code             | HTTP Status | Description                              |
| ---------------- | ----------- | ---------------------------------------- |
| UNAUTHORIZED     | 401         | Not authenticated                        |
| FORBIDDEN        | 403         | Insufficient permissions                 |
| NOT_FOUND        | 404         | Resource not found                       |
| VALIDATION_ERROR | 400         | Invalid request data                     |
| CONFLICT         | 409         | Resource conflict (e.g., double booking) |
| SERVER_ERROR     | 500         | Internal server error                    |

---

**Last Updated:** 2026-01-13
