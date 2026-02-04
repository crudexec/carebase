/**
 * Default Notification Templates
 *
 * Hardcoded default templates for all notification events
 */

import { NotificationChannel, NotificationEventType } from "@prisma/client";

interface DefaultTemplate {
  subject?: string;
  body: string;
}

type TemplateMap = Partial<Record<NotificationChannel, DefaultTemplate>>;

// ============================================
// Default Templates by Event Type
// ============================================

const DEFAULT_TEMPLATES: Record<NotificationEventType, TemplateMap> = {
  // -------------------- Shift-Related --------------------
  SHIFT_ASSIGNED: {
    EMAIL: {
      subject: "New Shift Assigned - {{clientName}} on {{shiftDate}}",
      body: `
<p>Hi {{recipientName}},</p>

<p>You have been assigned a new shift:</p>

<table class="info-table">
  <tr>
    <td>Client</td>
    <td><strong>{{clientName}}</strong></td>
  </tr>
  <tr>
    <td>Date</td>
    <td>{{shiftDate}}</td>
  </tr>
  <tr>
    <td>Time</td>
    <td>{{shiftTime}} - {{shiftEndTime}}</td>
  </tr>
  <tr>
    <td>Location</td>
    <td>{{address}}</td>
  </tr>
</table>

<p>
  <a href="{{shiftUrl}}" class="button">View Shift Details</a>
</p>

<p>Thanks,<br>{{companyName}}</p>
      `.trim(),
    },
    IN_APP: {
      body: "You have been assigned a shift with {{clientName}} on {{shiftDate}} at {{shiftTime}}.",
    },
  },

  SHIFT_REMINDER_24H: {
    EMAIL: {
      subject: "Shift Reminder - {{clientName}} Tomorrow",
      body: `
<p>Hi {{recipientName}},</p>

<div class="alert-box alert-info">
  <strong>Reminder:</strong> You have a shift scheduled for tomorrow.
</div>

<table class="info-table">
  <tr>
    <td>Client</td>
    <td><strong>{{clientName}}</strong></td>
  </tr>
  <tr>
    <td>Date</td>
    <td>{{shiftDate}}</td>
  </tr>
  <tr>
    <td>Time</td>
    <td>{{shiftTime}}</td>
  </tr>
  <tr>
    <td>Location</td>
    <td>{{address}}</td>
  </tr>
</table>

<p>
  <a href="{{shiftUrl}}" class="button">View Shift</a>
</p>

<p>Thanks,<br>{{companyName}}</p>
      `.trim(),
    },
    IN_APP: {
      body: "Reminder: You have a shift with {{clientName}} tomorrow at {{shiftTime}}.",
    },
  },

  SHIFT_REMINDER_1H: {
    EMAIL: {
      subject: "Shift Starting Soon - {{clientName}}",
      body: `
<p>Hi {{recipientName}},</p>

<div class="alert-box alert-warning">
  <strong>Your shift starts in 1 hour!</strong>
</div>

<table class="info-table">
  <tr>
    <td>Client</td>
    <td><strong>{{clientName}}</strong></td>
  </tr>
  <tr>
    <td>Time</td>
    <td>{{shiftTime}}</td>
  </tr>
  <tr>
    <td>Location</td>
    <td>{{address}}</td>
  </tr>
</table>

<p>Please make sure to arrive on time and check in when you get there.</p>

<p>Thanks,<br>{{companyName}}</p>
      `.trim(),
    },
    SMS: {
      body: "Reminder: Your shift with {{clientName}} starts at {{shiftTime}}. Address: {{address}}",
    },
    IN_APP: {
      body: "Your shift with {{clientName}} starts in 1 hour at {{shiftTime}}.",
    },
  },

  SHIFT_CANCELLED: {
    EMAIL: {
      subject: "Shift Cancelled - {{clientName}} on {{shiftDate}}",
      body: `
<p>Hi {{recipientName}},</p>

<div class="alert-box alert-warning">
  <strong>Your shift has been cancelled.</strong>
</div>

<table class="info-table">
  <tr>
    <td>Client</td>
    <td>{{clientName}}</td>
  </tr>
  <tr>
    <td>Date</td>
    <td>{{shiftDate}}</td>
  </tr>
  <tr>
    <td>Time</td>
    <td>{{shiftTime}}</td>
  </tr>
  <tr>
    <td>Reason</td>
    <td>{{cancellationReason}}</td>
  </tr>
</table>

<p>If you have any questions, please contact your supervisor.</p>

<p>Thanks,<br>{{companyName}}</p>
      `.trim(),
    },
    SMS: {
      body: "Your shift with {{clientName}} on {{shiftDate}} has been cancelled. Reason: {{cancellationReason}}",
    },
    IN_APP: {
      body: "Your shift with {{clientName}} on {{shiftDate}} has been cancelled.",
    },
  },

  SHIFT_RESCHEDULED: {
    EMAIL: {
      subject: "Shift Rescheduled - {{clientName}}",
      body: `
<p>Hi {{recipientName}},</p>

<p>Your shift has been rescheduled:</p>

<table class="info-table">
  <tr>
    <td>Client</td>
    <td><strong>{{clientName}}</strong></td>
  </tr>
  <tr>
    <td>Original</td>
    <td>{{originalDate}} at {{originalTime}}</td>
  </tr>
  <tr>
    <td>New Schedule</td>
    <td><strong>{{newDate}} at {{newTime}}</strong></td>
  </tr>
</table>

<p>
  <a href="{{shiftUrl}}" class="button">View Updated Shift</a>
</p>

<p>Thanks,<br>{{companyName}}</p>
      `.trim(),
    },
    IN_APP: {
      body: "Your shift with {{clientName}} has been rescheduled from {{originalDate}} to {{newDate}} at {{newTime}}.",
    },
  },

  CHECK_IN_CONFIRMATION: {
    EMAIL: {
      subject: "Check-In Confirmation - {{carerName}} with {{clientName}}",
      body: `
<p>Hi {{recipientName}},</p>

<div class="alert-box alert-success">
  <strong>{{carerName}}</strong> has checked in for their shift.
</div>

<table class="info-table">
  <tr>
    <td>Client</td>
    <td>{{clientName}}</td>
  </tr>
  <tr>
    <td>Carer</td>
    <td>{{carerName}}</td>
  </tr>
  <tr>
    <td>Check-In Time</td>
    <td>{{checkInTime}}</td>
  </tr>
  <tr>
    <td>Date</td>
    <td>{{shiftDate}}</td>
  </tr>
</table>

<p>Thanks,<br>{{companyName}}</p>
      `.trim(),
    },
    IN_APP: {
      body: "{{carerName}} checked in for their shift with {{clientName}} at {{checkInTime}}.",
    },
  },

  CHECK_OUT_CONFIRMATION: {
    EMAIL: {
      subject: "Check-Out Confirmation - {{carerName}} with {{clientName}}",
      body: `
<p>Hi {{recipientName}},</p>

<div class="alert-box alert-success">
  <strong>{{carerName}}</strong> has checked out from their shift.
</div>

<table class="info-table">
  <tr>
    <td>Client</td>
    <td>{{clientName}}</td>
  </tr>
  <tr>
    <td>Carer</td>
    <td>{{carerName}}</td>
  </tr>
  <tr>
    <td>Check-Out Time</td>
    <td>{{checkOutTime}}</td>
  </tr>
  <tr>
    <td>Date</td>
    <td>{{shiftDate}}</td>
  </tr>
  <tr>
    <td>Total Hours</td>
    <td>{{totalHours}}</td>
  </tr>
</table>

<p>Thanks,<br>{{companyName}}</p>
      `.trim(),
    },
    IN_APP: {
      body: "{{carerName}} checked out from their shift with {{clientName}}. Total hours: {{totalHours}}.",
    },
  },

  MISSED_CHECK_IN: {
    EMAIL: {
      subject: "URGENT: Missed Check-In Alert - {{clientName}}",
      body: `
<p>Hi {{recipientName}},</p>

<div class="alert-box alert-critical">
  <strong>ALERT:</strong> A carer has missed their scheduled check-in.
</div>

<table class="info-table">
  <tr>
    <td>Carer</td>
    <td><strong>{{carerName}}</strong></td>
  </tr>
  <tr>
    <td>Client</td>
    <td>{{clientName}}</td>
  </tr>
  <tr>
    <td>Expected Check-In</td>
    <td>{{expectedCheckInTime}}</td>
  </tr>
  <tr>
    <td>Date</td>
    <td>{{shiftDate}}</td>
  </tr>
</table>

<p>Please contact the carer immediately to confirm their status.</p>

<p>
  <a href="{{shiftUrl}}" class="button">View Shift Details</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    SMS: {
      body: "ALERT: {{carerName}} missed check-in for {{clientName}} at {{expectedCheckInTime}}. Please contact immediately.",
    },
    IN_APP: {
      body: "ALERT: {{carerName}} missed their check-in for {{clientName}}. Expected at {{expectedCheckInTime}}.",
    },
  },

  LATE_CHECK_IN: {
    EMAIL: {
      subject: "Late Check-In Alert - {{carerName}} for {{clientName}}",
      body: `
<p>Hi {{recipientName}},</p>

<div class="alert-box alert-warning">
  <strong>Late Check-In:</strong> A carer checked in late for their shift.
</div>

<table class="info-table">
  <tr>
    <td>Carer</td>
    <td><strong>{{carerName}}</strong></td>
  </tr>
  <tr>
    <td>Client</td>
    <td>{{clientName}}</td>
  </tr>
  <tr>
    <td>Scheduled Time</td>
    <td>{{scheduledTime}}</td>
  </tr>
  <tr>
    <td>Actual Check-In</td>
    <td>{{actualCheckInTime}}</td>
  </tr>
  <tr>
    <td>Minutes Late</td>
    <td><strong>{{minutesLate}} minutes</strong></td>
  </tr>
  <tr>
    <td>Date</td>
    <td>{{shiftDate}}</td>
  </tr>
</table>

<p>
  <a href="{{shiftUrl}}" class="button">View Shift Details</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    IN_APP: {
      body: "{{carerName}} checked in {{minutesLate}} minutes late for {{clientName}} on {{shiftDate}}.",
    },
  },

  EARLY_CHECK_OUT: {
    EMAIL: {
      subject: "Early Check-Out Alert - {{carerName}} for {{clientName}}",
      body: `
<p>Hi {{recipientName}},</p>

<div class="alert-box alert-warning">
  <strong>Early Check-Out:</strong> A carer checked out before the scheduled end time.
</div>

<table class="info-table">
  <tr>
    <td>Carer</td>
    <td><strong>{{carerName}}</strong></td>
  </tr>
  <tr>
    <td>Client</td>
    <td>{{clientName}}</td>
  </tr>
  <tr>
    <td>Scheduled End</td>
    <td>{{scheduledEndTime}}</td>
  </tr>
  <tr>
    <td>Actual Check-Out</td>
    <td>{{actualCheckOutTime}}</td>
  </tr>
  <tr>
    <td>Minutes Early</td>
    <td><strong>{{minutesEarly}} minutes</strong></td>
  </tr>
  <tr>
    <td>Date</td>
    <td>{{shiftDate}}</td>
  </tr>
</table>

<p>
  <a href="{{shiftUrl}}" class="button">View Shift Details</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    IN_APP: {
      body: "{{carerName}} checked out {{minutesEarly}} minutes early from {{clientName}} on {{shiftDate}}.",
    },
  },

  OVERTIME_ALERT: {
    EMAIL: {
      subject: "Overtime Alert - {{carerName}} for {{clientName}}",
      body: `
<p>Hi {{recipientName}},</p>

<div class="alert-box alert-warning">
  <strong>Overtime:</strong> A shift has exceeded the scheduled hours.
</div>

<table class="info-table">
  <tr>
    <td>Carer</td>
    <td><strong>{{carerName}}</strong></td>
  </tr>
  <tr>
    <td>Client</td>
    <td>{{clientName}}</td>
  </tr>
  <tr>
    <td>Scheduled Hours</td>
    <td>{{scheduledHours}}</td>
  </tr>
  <tr>
    <td>Actual Hours</td>
    <td>{{actualHours}}</td>
  </tr>
  <tr>
    <td>Overtime</td>
    <td><strong>{{overtimeMinutes}} minutes</strong></td>
  </tr>
  <tr>
    <td>Date</td>
    <td>{{shiftDate}}</td>
  </tr>
</table>

<p>
  <a href="{{shiftUrl}}" class="button">View Shift Details</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    IN_APP: {
      body: "{{carerName}} worked {{overtimeMinutes}} minutes overtime for {{clientName}} on {{shiftDate}}.",
    },
  },

  NO_SHOW_ALERT: {
    EMAIL: {
      subject: "CRITICAL: No-Show Alert - {{clientName}}",
      body: `
<p>Hi {{recipientName}},</p>

<div class="alert-box alert-critical">
  <strong>NO-SHOW ALERT:</strong> A scheduled shift was missed entirely.
</div>

<table class="info-table">
  <tr>
    <td>Carer</td>
    <td><strong>{{carerName}}</strong></td>
  </tr>
  <tr>
    <td>Client</td>
    <td>{{clientName}}</td>
  </tr>
  <tr>
    <td>Scheduled Date</td>
    <td>{{shiftDate}}</td>
  </tr>
  <tr>
    <td>Scheduled Time</td>
    <td>{{shiftTime}}</td>
  </tr>
</table>

<p>The carer did not check in for this shift. Please take immediate action to ensure client care.</p>

<p>
  <a href="{{shiftUrl}}" class="button">View Shift Details</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    SMS: {
      body: "CRITICAL: No-show for {{clientName}} on {{shiftDate}}. {{carerName}} did not check in. Immediate action required.",
    },
    IN_APP: {
      body: "CRITICAL: {{carerName}} did not show up for shift with {{clientName}} on {{shiftDate}}.",
    },
  },

  SHIFT_COMPLETED: {
    EMAIL: {
      subject: "Shift Completed - {{clientName}}",
      body: `
<p>Hi {{recipientName}},</p>

<div class="alert-box alert-success">
  <strong>Shift Completed</strong>
</div>

<p>A care shift has been completed for your loved one.</p>

<table class="info-table">
  <tr>
    <td>Client</td>
    <td><strong>{{clientName}}</strong></td>
  </tr>
  <tr>
    <td>Caregiver</td>
    <td>{{carerName}}</td>
  </tr>
  <tr>
    <td>Date</td>
    <td>{{shiftDate}}</td>
  </tr>
  <tr>
    <td>Check-In</td>
    <td>{{checkInTime}}</td>
  </tr>
  <tr>
    <td>Check-Out</td>
    <td>{{checkOutTime}}</td>
  </tr>
  <tr>
    <td>Total Hours</td>
    <td>{{totalHours}}</td>
  </tr>
</table>

<p>{{companyName}}</p>
      `.trim(),
    },
    IN_APP: {
      body: "Shift completed for {{clientName}} by {{carerName}}. Total hours: {{totalHours}}.",
    },
  },

  COVERAGE_NEEDED: {
    EMAIL: {
      subject: "Coverage Needed - {{clientName}} on {{shiftDate}}",
      body: `
<p>Hi {{recipientName}},</p>

<div class="alert-box alert-warning">
  <strong>Open Shift Available</strong>
</div>

<p>A shift needs coverage. Are you available?</p>

<table class="info-table">
  <tr>
    <td>Client</td>
    <td><strong>{{clientName}}</strong></td>
  </tr>
  <tr>
    <td>Date</td>
    <td>{{shiftDate}}</td>
  </tr>
  <tr>
    <td>Time</td>
    <td>{{shiftTime}} - {{shiftEndTime}}</td>
  </tr>
  <tr>
    <td>Location</td>
    <td>{{address}}</td>
  </tr>
</table>

<p>
  <a href="{{shiftUrl}}" class="button">View & Accept Shift</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    SMS: {
      body: "Coverage needed: {{clientName}} on {{shiftDate}} at {{shiftTime}}. Reply or check app to accept.",
    },
    IN_APP: {
      body: "Open shift available: {{clientName}} on {{shiftDate}} at {{shiftTime}}.",
    },
  },

  WEEKLY_SCHEDULE_PUBLISHED: {
    EMAIL: {
      subject: "Your Weekly Schedule - {{weekStartDate}} to {{weekEndDate}}",
      body: `
<p>Hi {{recipientName}},</p>

<div class="alert-box alert-info">
  <strong>Weekly Schedule Published</strong>
</div>

<p>Your schedule for the upcoming week has been published.</p>

<table class="info-table">
  <tr>
    <td>Week</td>
    <td>{{weekStartDate}} - {{weekEndDate}}</td>
  </tr>
  <tr>
    <td>Total Shifts</td>
    <td>{{totalShifts}}</td>
  </tr>
  <tr>
    <td>Total Hours</td>
    <td>{{totalHours}}</td>
  </tr>
</table>

<p>
  <a href="{{scheduleUrl}}" class="button">View Your Schedule</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    IN_APP: {
      body: "Your weekly schedule is ready: {{totalShifts}} shifts, {{totalHours}} hours from {{weekStartDate}} to {{weekEndDate}}.",
    },
  },

  // -------------------- Authorization Alerts --------------------
  AUTH_UNITS_80_PERCENT: {
    EMAIL: {
      subject: "Authorization Alert: 80% Units Used - {{clientName}}",
      body: `
<p>Hi {{recipientName}},</p>

<div class="alert-box alert-warning">
  <strong>Authorization units at 80%</strong>
</div>

<table class="info-table">
  <tr>
    <td>Client</td>
    <td><strong>{{clientName}}</strong></td>
  </tr>
  <tr>
    <td>Auth Number</td>
    <td>{{authNumber}}</td>
  </tr>
  <tr>
    <td>Used</td>
    <td>{{usedUnits}} of {{totalUnits}} units ({{percentUsed}}%)</td>
  </tr>
  <tr>
    <td>Remaining</td>
    <td>{{remainingUnits}} units</td>
  </tr>
</table>

<p>Consider requesting a reauthorization soon.</p>

<p>
  <a href="{{authUrl}}" class="button">View Authorization</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    IN_APP: {
      body: "{{clientName}}'s authorization is at 80% usage ({{usedUnits}}/{{totalUnits}} units).",
    },
  },

  AUTH_UNITS_90_PERCENT: {
    EMAIL: {
      subject: "URGENT: Authorization at 90% - {{clientName}}",
      body: `
<p>Hi {{recipientName}},</p>

<div class="alert-box alert-critical">
  <strong>Authorization units at 90%</strong> - Reauthorization needed soon!
</div>

<table class="info-table">
  <tr>
    <td>Client</td>
    <td><strong>{{clientName}}</strong></td>
  </tr>
  <tr>
    <td>Auth Number</td>
    <td>{{authNumber}}</td>
  </tr>
  <tr>
    <td>Used</td>
    <td>{{usedUnits}} of {{totalUnits}} units ({{percentUsed}}%)</td>
  </tr>
  <tr>
    <td>Remaining</td>
    <td>{{remainingUnits}} units</td>
  </tr>
</table>

<p>Please initiate the reauthorization process immediately.</p>

<p>
  <a href="{{authUrl}}" class="button">View Authorization</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    SMS: {
      body: "URGENT: {{clientName}}'s authorization at 90% ({{remainingUnits}} units left). Request reauth now.",
    },
    IN_APP: {
      body: "URGENT: {{clientName}}'s authorization is at 90% usage. Only {{remainingUnits}} units remaining.",
    },
  },

  AUTH_UNITS_EXHAUSTED: {
    EMAIL: {
      subject: "CRITICAL: Authorization Units Exhausted - {{clientName}}",
      body: `
<p>Hi {{recipientName}},</p>

<div class="alert-box alert-critical">
  <strong>CRITICAL:</strong> Authorization units have been exhausted!
</div>

<table class="info-table">
  <tr>
    <td>Client</td>
    <td><strong>{{clientName}}</strong></td>
  </tr>
  <tr>
    <td>Auth Number</td>
    <td>{{authNumber}}</td>
  </tr>
  <tr>
    <td>Total Used</td>
    <td>{{usedUnits}} of {{totalUnits}} units</td>
  </tr>
</table>

<p>No more services can be provided under this authorization. Immediate action required.</p>

<p>
  <a href="{{authUrl}}" class="button">View Authorization</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    SMS: {
      body: "CRITICAL: {{clientName}}'s authorization units exhausted. No services can be billed. Action required!",
    },
    IN_APP: {
      body: "CRITICAL: {{clientName}}'s authorization units are exhausted. Immediate action required.",
    },
  },

  AUTH_EXPIRING_30_DAYS: {
    EMAIL: {
      subject: "Authorization Expiring in 30 Days - {{clientName}}",
      body: `
<p>Hi {{recipientName}},</p>

<div class="alert-box alert-info">
  Authorization expiring in 30 days
</div>

<table class="info-table">
  <tr>
    <td>Client</td>
    <td><strong>{{clientName}}</strong></td>
  </tr>
  <tr>
    <td>Auth Number</td>
    <td>{{authNumber}}</td>
  </tr>
  <tr>
    <td>Expiration Date</td>
    <td>{{expirationDate}}</td>
  </tr>
  <tr>
    <td>Days Remaining</td>
    <td>{{daysRemaining}}</td>
  </tr>
</table>

<p>Consider starting the reauthorization process.</p>

<p>
  <a href="{{authUrl}}" class="button">View Authorization</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    IN_APP: {
      body: "{{clientName}}'s authorization expires in {{daysRemaining}} days ({{expirationDate}}).",
    },
  },

  AUTH_EXPIRING_7_DAYS: {
    EMAIL: {
      subject: "URGENT: Authorization Expiring in 7 Days - {{clientName}}",
      body: `
<p>Hi {{recipientName}},</p>

<div class="alert-box alert-critical">
  <strong>URGENT:</strong> Authorization expiring in 7 days!
</div>

<table class="info-table">
  <tr>
    <td>Client</td>
    <td><strong>{{clientName}}</strong></td>
  </tr>
  <tr>
    <td>Auth Number</td>
    <td>{{authNumber}}</td>
  </tr>
  <tr>
    <td>Expiration Date</td>
    <td>{{expirationDate}}</td>
  </tr>
  <tr>
    <td>Days Remaining</td>
    <td>{{daysRemaining}}</td>
  </tr>
</table>

<p>Please ensure reauthorization is in progress.</p>

<p>
  <a href="{{authUrl}}" class="button">View Authorization</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    SMS: {
      body: "URGENT: {{clientName}}'s authorization expires in {{daysRemaining}} days. Ensure reauth is in progress.",
    },
    IN_APP: {
      body: "URGENT: {{clientName}}'s authorization expires in {{daysRemaining}} days!",
    },
  },

  AUTH_EXPIRED: {
    EMAIL: {
      subject: "CRITICAL: Authorization Expired - {{clientName}}",
      body: `
<p>Hi {{recipientName}},</p>

<div class="alert-box alert-critical">
  <strong>CRITICAL:</strong> Authorization has expired!
</div>

<table class="info-table">
  <tr>
    <td>Client</td>
    <td><strong>{{clientName}}</strong></td>
  </tr>
  <tr>
    <td>Auth Number</td>
    <td>{{authNumber}}</td>
  </tr>
  <tr>
    <td>Expired On</td>
    <td>{{expirationDate}}</td>
  </tr>
</table>

<p>No more services can be provided under this authorization. Immediate action required.</p>

<p>
  <a href="{{authUrl}}" class="button">View Authorization</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    SMS: {
      body: "CRITICAL: {{clientName}}'s authorization has EXPIRED. No services can be billed. Action required!",
    },
    IN_APP: {
      body: "CRITICAL: {{clientName}}'s authorization has expired. Immediate action required.",
    },
  },

  // -------------------- Care Events --------------------
  INCIDENT_REPORTED: {
    EMAIL: {
      subject: "INCIDENT REPORTED: {{incidentType}} - {{clientName}}",
      body: `
<p>Hi {{recipientName}},</p>

<div class="alert-box alert-critical">
  <strong>Incident Report</strong> - Immediate attention may be required
</div>

<table class="info-table">
  <tr>
    <td>Client</td>
    <td><strong>{{clientName}}</strong></td>
  </tr>
  <tr>
    <td>Incident Type</td>
    <td>{{incidentType}}</td>
  </tr>
  <tr>
    <td>Severity</td>
    <td>{{severity}}</td>
  </tr>
  <tr>
    <td>Reported By</td>
    <td>{{reportedBy}}</td>
  </tr>
  <tr>
    <td>Date</td>
    <td>{{incidentDate}}</td>
  </tr>
</table>

<p>
  <a href="{{incidentUrl}}" class="button">View Incident Report</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    SMS: {
      body: "INCIDENT: {{incidentType}} for {{clientName}} ({{severity}}). Reported by {{reportedBy}}. Review ASAP.",
    },
    IN_APP: {
      body: "Incident reported for {{clientName}}: {{incidentType}} ({{severity}}).",
    },
  },

  INCIDENT_RESOLVED: {
    EMAIL: {
      subject: "Incident Resolved - {{clientName}}",
      body: `
<p>Hi {{recipientName}},</p>

<div class="alert-box alert-success">
  An incident has been resolved
</div>

<table class="info-table">
  <tr>
    <td>Client</td>
    <td><strong>{{clientName}}</strong></td>
  </tr>
  <tr>
    <td>Incident Type</td>
    <td>{{incidentType}}</td>
  </tr>
  <tr>
    <td>Resolution</td>
    <td>{{resolution}}</td>
  </tr>
  <tr>
    <td>Resolved By</td>
    <td>{{resolvedBy}}</td>
  </tr>
  <tr>
    <td>Date</td>
    <td>{{resolvedDate}}</td>
  </tr>
</table>

<p>{{companyName}}</p>
      `.trim(),
    },
    IN_APP: {
      body: "Incident for {{clientName}} has been resolved: {{resolution}}.",
    },
  },

  CARE_PLAN_UPDATED: {
    EMAIL: {
      subject: "Care Plan Updated - {{clientName}}",
      body: `
<p>Hi {{recipientName}},</p>

<p>A care plan has been updated:</p>

<table class="info-table">
  <tr>
    <td>Client</td>
    <td><strong>{{clientName}}</strong></td>
  </tr>
  <tr>
    <td>Plan Number</td>
    <td>{{planNumber}}</td>
  </tr>
  <tr>
    <td>Updated By</td>
    <td>{{updatedBy}}</td>
  </tr>
  <tr>
    <td>Summary</td>
    <td>{{updateSummary}}</td>
  </tr>
</table>

<p>
  <a href="{{carePlanUrl}}" class="button">View Care Plan</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    IN_APP: {
      body: "Care plan for {{clientName}} has been updated by {{updatedBy}}.",
    },
  },

  CARE_PLAN_APPROVED: {
    EMAIL: {
      subject: "Care Plan Approved - {{clientName}}",
      body: `
<p>Hi {{recipientName}},</p>

<div class="alert-box alert-success">
  A care plan has been approved
</div>

<table class="info-table">
  <tr>
    <td>Client</td>
    <td><strong>{{clientName}}</strong></td>
  </tr>
  <tr>
    <td>Plan Number</td>
    <td>{{planNumber}}</td>
  </tr>
  <tr>
    <td>Approved By</td>
    <td>{{approvedBy}}</td>
  </tr>
  <tr>
    <td>Effective Date</td>
    <td>{{effectiveDate}}</td>
  </tr>
</table>

<p>
  <a href="{{carePlanUrl}}" class="button">View Care Plan</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    IN_APP: {
      body: "Care plan for {{clientName}} has been approved. Effective: {{effectiveDate}}.",
    },
  },

  ASSESSMENT_DUE: {
    EMAIL: {
      subject: "Assessment Due - {{clientName}}",
      body: `
<p>Hi {{recipientName}},</p>

<div class="alert-box alert-info">
  An assessment is due
</div>

<table class="info-table">
  <tr>
    <td>Client</td>
    <td><strong>{{clientName}}</strong></td>
  </tr>
  <tr>
    <td>Assessment Type</td>
    <td>{{assessmentType}}</td>
  </tr>
  <tr>
    <td>Due Date</td>
    <td>{{dueDate}}</td>
  </tr>
</table>

<p>
  <a href="{{assessmentUrl}}" class="button">Start Assessment</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    IN_APP: {
      body: "Assessment due for {{clientName}}: {{assessmentType}} by {{dueDate}}.",
    },
  },

  ASSESSMENT_COMPLETED: {
    EMAIL: {
      subject: "Assessment Completed - {{clientName}}",
      body: `
<p>Hi {{recipientName}},</p>

<p>An assessment has been completed:</p>

<table class="info-table">
  <tr>
    <td>Client</td>
    <td><strong>{{clientName}}</strong></td>
  </tr>
  <tr>
    <td>Assessment Type</td>
    <td>{{assessmentType}}</td>
  </tr>
  <tr>
    <td>Completed By</td>
    <td>{{completedBy}}</td>
  </tr>
  <tr>
    <td>Date</td>
    <td>{{completedDate}}</td>
  </tr>
  <tr>
    <td>Score</td>
    <td>{{score}}</td>
  </tr>
</table>

<p>
  <a href="{{assessmentUrl}}" class="button">View Assessment</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    IN_APP: {
      body: "Assessment completed for {{clientName}} by {{completedBy}}. Score: {{score}}.",
    },
  },

  VISIT_NOTE_SUBMITTED: {
    EMAIL: {
      subject: "Visit Note Submitted - {{clientName}}",
      body: `
<p>Hi {{recipientName}},</p>

<p>A visit note has been submitted:</p>

<table class="info-table">
  <tr>
    <td>Client</td>
    <td><strong>{{clientName}}</strong></td>
  </tr>
  <tr>
    <td>Carer</td>
    <td>{{carerName}}</td>
  </tr>
  <tr>
    <td>Visit Date</td>
    <td>{{visitDate}}</td>
  </tr>
</table>

<p>
  <a href="{{visitNoteUrl}}" class="button">View Visit Note</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    IN_APP: {
      body: "{{carerName}} submitted a visit note for {{clientName}} on {{visitDate}}.",
    },
  },

  THRESHOLD_BREACH: {
    EMAIL: {
      subject: "ALERT: Threshold Breach - {{fieldLabel}} for {{clientName}}",
      body: `
<p>Hi {{recipientName}},</p>

<div class="alert-box alert-warning">
  <strong>Threshold Alert:</strong> A visit note field value exceeded the configured threshold.
</div>

<table class="info-table">
  <tr>
    <td>Client</td>
    <td><strong>{{clientName}}</strong></td>
  </tr>
  <tr>
    <td>Carer</td>
    <td>{{carerName}}</td>
  </tr>
  <tr>
    <td>Visit Date</td>
    <td>{{visitDate}}</td>
  </tr>
  <tr>
    <td>Field</td>
    <td>{{fieldLabel}}</td>
  </tr>
  <tr>
    <td>Value Entered</td>
    <td><strong>{{enteredValue}}</strong></td>
  </tr>
  <tr>
    <td>Threshold Exceeded</td>
    <td>{{thresholdType}} threshold: {{thresholdValue}}</td>
  </tr>
</table>

{{#customMessage}}
<div class="alert-box alert-info">
  <strong>Note:</strong> {{customMessage}}
</div>
{{/customMessage}}

<p>
  <a href="{{visitNoteUrl}}" class="button">View Visit Note</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    IN_APP: {
      body: "Threshold alert for {{clientName}}: {{fieldLabel}} value ({{enteredValue}}) exceeds {{thresholdType}} threshold ({{thresholdValue}}).",
    },
  },

  // -------------------- Administrative --------------------
  USER_ACCOUNT_CREATED: {
    EMAIL: {
      subject: "Welcome to CareBase - Your Account is Ready",
      body: `
<p>Hi {{firstName}},</p>

<p>Welcome to CareBase! Your account has been created and is ready to use.</p>

<table class="info-table">
  <tr>
    <td>Email</td>
    <td>{{email}}</td>
  </tr>
  {{#tempPassword}}
  <tr>
    <td>Temporary Password</td>
    <td><strong>{{tempPassword}}</strong></td>
  </tr>
  {{/tempPassword}}
</table>

{{#tempPassword}}
<div class="alert-box alert-warning">
  <strong>Important:</strong> Please change your password after your first login for security.
</div>
{{/tempPassword}}

<p>
  <a href="{{loginUrl}}" class="button">Log In to CareBase</a>
</p>

<p>If you have any questions, please contact your administrator.</p>

<p>Welcome aboard!</p>
      `.trim(),
    },
  },

  PASSWORD_RESET: {
    EMAIL: {
      subject: "Password Reset Request - CareBase",
      body: `
<p>Hi {{firstName}},</p>

<p>We received a request to reset your password.</p>

<p>
  <a href="{{resetUrl}}" class="button">Reset Your Password</a>
</p>

<div class="alert-box alert-warning">
  This link will expire in {{expiresIn}}.
</div>

<p>If you didn't request a password reset, please ignore this email or contact your administrator if you're concerned.</p>

<p>{{companyName}}</p>
      `.trim(),
    },
  },

  WEEKLY_SUMMARY: {
    EMAIL: {
      subject: "Weekly Summary Report - {{weekStartDate}} to {{weekEndDate}}",
      body: `
<p>Hi {{recipientName}},</p>

<p>Here's your weekly summary for {{weekStartDate}} to {{weekEndDate}}:</p>

<table class="info-table">
  <tr>
    <td>Total Shifts</td>
    <td>{{totalShifts}}</td>
  </tr>
  <tr>
    <td>Completed Shifts</td>
    <td>{{completedShifts}}</td>
  </tr>
  <tr>
    <td>Total Hours</td>
    <td>{{totalHours}}</td>
  </tr>
  <tr>
    <td>Incidents</td>
    <td>{{incidentCount}}</td>
  </tr>
</table>

<p>
  <a href="{{summaryUrl}}" class="button">View Full Report</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
  },
};

// ============================================
// Helper Functions
// ============================================

/**
 * Get default template for an event type and channel
 */
export function getDefaultTemplate(
  eventType: NotificationEventType,
  channel: NotificationChannel
): DefaultTemplate {
  const eventTemplates = DEFAULT_TEMPLATES[eventType];
  const template = eventTemplates?.[channel];

  if (template) {
    return template;
  }

  // Fallback to generic template
  return {
    subject: `Notification: ${eventType.replace(/_/g, " ").toLowerCase()}`,
    body: `<p>Hi {{recipientName}},</p><p>You have a new notification.</p><p>{{companyName}}</p>`,
  };
}

/**
 * Get all default templates for an event type
 */
export function getDefaultTemplatesForEvent(
  eventType: NotificationEventType
): TemplateMap {
  return DEFAULT_TEMPLATES[eventType] || {};
}
