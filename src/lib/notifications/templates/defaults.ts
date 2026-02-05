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
      subject: "You've been assigned to {{clientName}} on {{shiftDate}}",
      body: `
<p>Hi {{recipientName}},</p>

<p>You've been assigned a new shift with <strong>{{clientName}}</strong> on <strong>{{shiftDate}}</strong> from <strong>{{shiftTime}} to {{shiftEndTime}}</strong>.</p>

<p>The visit will be at {{address}}.</p>

<p>
  <a href="{{shiftUrl}}" class="button">View Shift Details</a>
</p>

<p>Thanks,<br>{{companyName}}</p>
      `.trim(),
    },
    IN_APP: {
      body: "You've been assigned to {{clientName}} on {{shiftDate}} from {{shiftTime}} to {{shiftEndTime}}.",
    },
  },

  SHIFT_REMINDER_24H: {
    EMAIL: {
      subject: "Reminder: You're visiting {{clientName}} tomorrow",
      body: `
<p>Hi {{recipientName}},</p>

<p>Just a friendly reminder that you have a shift with <strong>{{clientName}}</strong> tomorrow at <strong>{{shiftTime}}</strong>.</p>

<p>The visit will be at {{address}}.</p>

<p>
  <a href="{{shiftUrl}}" class="button">View Shift Details</a>
</p>

<p>Thanks,<br>{{companyName}}</p>
      `.trim(),
    },
    IN_APP: {
      body: "Reminder: You're visiting {{clientName}} tomorrow at {{shiftTime}}.",
    },
  },

  SHIFT_REMINDER_1H: {
    EMAIL: {
      subject: "Your shift with {{clientName}} starts in 1 hour",
      body: `
<p>Hi {{recipientName}},</p>

<p>Your shift with <strong>{{clientName}}</strong> starts in 1 hour at <strong>{{shiftTime}}</strong>.</p>

<p>The address is {{address}}. Please make sure to check in when you arrive.</p>

<p>Thanks,<br>{{companyName}}</p>
      `.trim(),
    },
    SMS: {
      body: "Your shift with {{clientName}} starts in 1 hour at {{shiftTime}}. Address: {{address}}",
    },
    IN_APP: {
      body: "Your shift with {{clientName}} starts in 1 hour at {{shiftTime}}.",
    },
  },

  SHIFT_CANCELLED: {
    EMAIL: {
      subject: "Your shift with {{clientName}} on {{shiftDate}} has been cancelled",
      body: `
<p>Hi {{recipientName}},</p>

<p>Your shift with <strong>{{clientName}}</strong> on <strong>{{shiftDate}}</strong> at <strong>{{shiftTime}}</strong> has been cancelled.</p>

<p><strong>Reason:</strong> {{cancellationReason}}</p>

<p>If you have any questions, please contact your supervisor.</p>

<p>Thanks,<br>{{companyName}}</p>
      `.trim(),
    },
    SMS: {
      body: "Your shift with {{clientName}} on {{shiftDate}} has been cancelled. Reason: {{cancellationReason}}",
    },
    IN_APP: {
      body: "Your shift with {{clientName}} on {{shiftDate}} has been cancelled. Reason: {{cancellationReason}}",
    },
  },

  SHIFT_RESCHEDULED: {
    EMAIL: {
      subject: "Your shift with {{clientName}} has been rescheduled",
      body: `
<p>Hi {{recipientName}},</p>

<p>Your shift with <strong>{{clientName}}</strong> has been rescheduled.</p>

<p><strong>Originally:</strong> {{originalDate}} at {{originalTime}}<br>
<strong>New time:</strong> {{newDate}} at {{newTime}}</p>

<p>
  <a href="{{shiftUrl}}" class="button">View Updated Shift</a>
</p>

<p>Thanks,<br>{{companyName}}</p>
      `.trim(),
    },
    IN_APP: {
      body: "Your shift with {{clientName}} has been moved from {{originalDate}} at {{originalTime}} to {{newDate}} at {{newTime}}.",
    },
  },

  CHECK_IN_CONFIRMATION: {
    EMAIL: {
      subject: "{{carerName}} has arrived at {{clientName}}'s",
      body: `
<p>Hi {{recipientName}},</p>

<p><strong>{{carerName}}</strong> checked in for their shift with <strong>{{clientName}}</strong> at <strong>{{checkInTime}}</strong> on {{shiftDate}}.</p>

<p>Thanks,<br>{{companyName}}</p>
      `.trim(),
    },
    IN_APP: {
      body: "{{carerName}} has arrived at {{clientName}}'s and checked in at {{checkInTime}}.",
    },
  },

  CHECK_OUT_CONFIRMATION: {
    EMAIL: {
      subject: "{{carerName}} has completed their visit with {{clientName}}",
      body: `
<p>Hi {{recipientName}},</p>

<p><strong>{{carerName}}</strong> has completed their visit with <strong>{{clientName}}</strong> and checked out at <strong>{{checkOutTime}}</strong>.</p>

<p>The visit lasted <strong>{{totalHours}} hours</strong>.</p>

<p>Thanks,<br>{{companyName}}</p>
      `.trim(),
    },
    IN_APP: {
      body: "{{carerName}} has completed their visit with {{clientName}}. Total time: {{totalHours}} hours.",
    },
  },

  MISSED_CHECK_IN: {
    EMAIL: {
      subject: "{{carerName}} hasn't checked in for {{clientName}}'s visit",
      body: `
<p>Hi {{recipientName}},</p>

<p><strong>{{carerName}}</strong> was expected to check in for their shift with <strong>{{clientName}}</strong> at <strong>{{expectedCheckInTime}}</strong> on {{shiftDate}}, but hasn't done so yet.</p>

<p>Please contact them to confirm their status.</p>

<p>
  <a href="{{shiftUrl}}" class="button">View Shift Details</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    SMS: {
      body: "{{carerName}} hasn't checked in for {{clientName}}'s visit (expected at {{expectedCheckInTime}}). Please follow up.",
    },
    IN_APP: {
      body: "{{carerName}} hasn't checked in for {{clientName}}'s visit. They were expected at {{expectedCheckInTime}}.",
    },
  },

  LATE_CHECK_IN: {
    EMAIL: {
      subject: "{{carerName}} checked in {{minutesLate}} minutes late for {{clientName}}",
      body: `
<p>Hi {{recipientName}},</p>

<p><strong>{{carerName}}</strong> checked in <strong>{{minutesLate}} minutes late</strong> for their shift with <strong>{{clientName}}</strong> on {{shiftDate}}.</p>

<p>They were scheduled to arrive at {{scheduledTime}} but checked in at {{actualCheckInTime}}.</p>

<p>
  <a href="{{shiftUrl}}" class="button">View Shift Details</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    IN_APP: {
      body: "{{carerName}} checked in {{minutesLate}} minutes late for {{clientName}} (arrived at {{actualCheckInTime}} instead of {{scheduledTime}}).",
    },
  },

  EARLY_CHECK_OUT: {
    EMAIL: {
      subject: "{{carerName}} left {{clientName}}'s {{minutesEarly}} minutes early",
      body: `
<p>Hi {{recipientName}},</p>

<p><strong>{{carerName}}</strong> checked out <strong>{{minutesEarly}} minutes early</strong> from their shift with <strong>{{clientName}}</strong> on {{shiftDate}}.</p>

<p>They were scheduled to stay until {{scheduledEndTime}} but left at {{actualCheckOutTime}}.</p>

<p>
  <a href="{{shiftUrl}}" class="button">View Shift Details</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    IN_APP: {
      body: "{{carerName}} left {{clientName}}'s {{minutesEarly}} minutes early (left at {{actualCheckOutTime}} instead of {{scheduledEndTime}}).",
    },
  },

  OVERTIME_ALERT: {
    EMAIL: {
      subject: "{{carerName}} worked {{overtimeMinutes}} minutes overtime at {{clientName}}'s",
      body: `
<p>Hi {{recipientName}},</p>

<p><strong>{{carerName}}</strong> worked <strong>{{overtimeMinutes}} minutes overtime</strong> during their visit with <strong>{{clientName}}</strong> on {{shiftDate}}.</p>

<p>They were scheduled for {{scheduledHours}} hours but worked {{actualHours}} hours.</p>

<p>
  <a href="{{shiftUrl}}" class="button">View Shift Details</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    IN_APP: {
      body: "{{carerName}} worked {{overtimeMinutes}} minutes overtime at {{clientName}}'s ({{actualHours}} hours instead of {{scheduledHours}}).",
    },
  },

  NO_SHOW_ALERT: {
    EMAIL: {
      subject: "{{carerName}} didn't show up for {{clientName}}'s visit",
      body: `
<p>Hi {{recipientName}},</p>

<p><strong>{{carerName}}</strong> did not show up for their scheduled visit with <strong>{{clientName}}</strong> on {{shiftDate}} at {{shiftTime}}.</p>

<p>Please take immediate action to ensure the client receives the care they need.</p>

<p>
  <a href="{{shiftUrl}}" class="button">View Shift Details</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    SMS: {
      body: "{{carerName}} didn't show up for {{clientName}}'s visit on {{shiftDate}} at {{shiftTime}}. Please follow up urgently.",
    },
    IN_APP: {
      body: "{{carerName}} didn't show up for {{clientName}}'s visit on {{shiftDate}} at {{shiftTime}}.",
    },
  },

  SHIFT_COMPLETED: {
    EMAIL: {
      subject: "{{carerName}} has completed their visit with {{clientName}}",
      body: `
<p>Hi {{recipientName}},</p>

<p><strong>{{carerName}}</strong> has completed their visit with <strong>{{clientName}}</strong> on {{shiftDate}}.</p>

<p>They arrived at {{checkInTime}} and left at {{checkOutTime}}, for a total of <strong>{{totalHours}} hours</strong>.</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    IN_APP: {
      body: "{{carerName}} completed their visit with {{clientName}} ({{checkInTime}} - {{checkOutTime}}, {{totalHours}} hours).",
    },
  },

  COVERAGE_NEEDED: {
    EMAIL: {
      subject: "Can you cover a shift with {{clientName}} on {{shiftDate}}?",
      body: `
<p>Hi {{recipientName}},</p>

<p>We need someone to cover a shift with <strong>{{clientName}}</strong> on <strong>{{shiftDate}}</strong> from <strong>{{shiftTime}} to {{shiftEndTime}}</strong>.</p>

<p>The visit will be at {{address}}.</p>

<p>Are you available?</p>

<p>
  <a href="{{shiftUrl}}" class="button">View & Accept Shift</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    SMS: {
      body: "Can you cover {{clientName}} on {{shiftDate}} at {{shiftTime}}? Check the app to accept.",
    },
    IN_APP: {
      body: "Coverage needed: {{clientName}} on {{shiftDate}} from {{shiftTime}} to {{shiftEndTime}}. Are you available?",
    },
  },

  WEEKLY_SCHEDULE_PUBLISHED: {
    EMAIL: {
      subject: "Your schedule for {{weekStartDate}} - {{weekEndDate}} is ready",
      body: `
<p>Hi {{recipientName}},</p>

<p>Your schedule for the week of <strong>{{weekStartDate}} to {{weekEndDate}}</strong> has been published.</p>

<p>You have <strong>{{totalShifts}} shifts</strong> totaling <strong>{{totalHours}} hours</strong>.</p>

<p>
  <a href="{{scheduleUrl}}" class="button">View Your Schedule</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    IN_APP: {
      body: "Your schedule for {{weekStartDate}} - {{weekEndDate}} is ready: {{totalShifts}} shifts, {{totalHours}} hours.",
    },
  },

  // -------------------- Authorization Alerts --------------------
  AUTH_UNITS_80_PERCENT: {
    EMAIL: {
      subject: "{{clientName}}'s authorization is 80% used",
      body: `
<p>Hi {{recipientName}},</p>

<p><strong>{{clientName}}</strong>'s authorization ({{authNumber}}) has reached <strong>80% usage</strong>.</p>

<p>They've used {{usedUnits}} of {{totalUnits}} units, with <strong>{{remainingUnits}} units remaining</strong>.</p>

<p>You may want to start the reauthorization process soon.</p>

<p>
  <a href="{{authUrl}}" class="button">View Authorization</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    IN_APP: {
      body: "{{clientName}}'s authorization is 80% used ({{remainingUnits}} units remaining).",
    },
  },

  AUTH_UNITS_90_PERCENT: {
    EMAIL: {
      subject: "{{clientName}}'s authorization is almost used up (90%)",
      body: `
<p>Hi {{recipientName}},</p>

<p><strong>{{clientName}}</strong>'s authorization ({{authNumber}}) is almost used up at <strong>90%</strong>.</p>

<p>Only <strong>{{remainingUnits}} units remaining</strong> out of {{totalUnits}}.</p>

<p>Please start the reauthorization process now to avoid any interruption in care.</p>

<p>
  <a href="{{authUrl}}" class="button">View Authorization</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    SMS: {
      body: "{{clientName}}'s authorization is 90% used - only {{remainingUnits}} units left. Please request reauthorization.",
    },
    IN_APP: {
      body: "{{clientName}}'s authorization is 90% used. Only {{remainingUnits}} units remaining - please request reauthorization.",
    },
  },

  AUTH_UNITS_EXHAUSTED: {
    EMAIL: {
      subject: "{{clientName}}'s authorization has run out of units",
      body: `
<p>Hi {{recipientName}},</p>

<p><strong>{{clientName}}</strong>'s authorization ({{authNumber}}) has <strong>run out of units</strong>.</p>

<p>All {{totalUnits}} authorized units have been used. No more services can be billed under this authorization.</p>

<p>Please arrange for reauthorization immediately to continue providing care.</p>

<p>
  <a href="{{authUrl}}" class="button">View Authorization</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    SMS: {
      body: "{{clientName}}'s authorization has run out of units. Please arrange reauthorization immediately.",
    },
    IN_APP: {
      body: "{{clientName}}'s authorization has run out of units. Reauthorization needed immediately.",
    },
  },

  AUTH_EXPIRING_30_DAYS: {
    EMAIL: {
      subject: "{{clientName}}'s authorization expires in {{daysRemaining}} days",
      body: `
<p>Hi {{recipientName}},</p>

<p><strong>{{clientName}}</strong>'s authorization ({{authNumber}}) will expire on <strong>{{expirationDate}}</strong>, which is {{daysRemaining}} days away.</p>

<p>You may want to start the reauthorization process soon.</p>

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
      subject: "{{clientName}}'s authorization expires in {{daysRemaining}} days - action needed",
      body: `
<p>Hi {{recipientName}},</p>

<p><strong>{{clientName}}</strong>'s authorization ({{authNumber}}) expires on <strong>{{expirationDate}}</strong>, which is only {{daysRemaining}} days away.</p>

<p>Please ensure the reauthorization process is underway to avoid any interruption in care.</p>

<p>
  <a href="{{authUrl}}" class="button">View Authorization</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    SMS: {
      body: "{{clientName}}'s authorization expires in {{daysRemaining}} days. Please ensure reauthorization is in progress.",
    },
    IN_APP: {
      body: "{{clientName}}'s authorization expires in {{daysRemaining}} days - please ensure reauthorization is in progress.",
    },
  },

  AUTH_EXPIRED: {
    EMAIL: {
      subject: "{{clientName}}'s authorization has expired",
      body: `
<p>Hi {{recipientName}},</p>

<p><strong>{{clientName}}</strong>'s authorization ({{authNumber}}) <strong>expired on {{expirationDate}}</strong>.</p>

<p>No more services can be billed under this authorization. Please arrange for reauthorization immediately to continue providing care.</p>

<p>
  <a href="{{authUrl}}" class="button">View Authorization</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    SMS: {
      body: "{{clientName}}'s authorization has expired. Please arrange reauthorization immediately.",
    },
    IN_APP: {
      body: "{{clientName}}'s authorization has expired. Reauthorization needed immediately.",
    },
  },

  // -------------------- Care Events --------------------
  INCIDENT_REPORTED: {
    EMAIL: {
      subject: "{{reportedBy}} reported a {{incidentType}} incident for {{clientName}}",
      body: `
<p>Hi {{recipientName}},</p>

<p><strong>{{reportedBy}}</strong> has reported a <strong>{{incidentType}}</strong> incident for <strong>{{clientName}}</strong> on {{incidentDate}}.</p>

<p>Severity: <strong>{{severity}}</strong></p>

<p>Please review the incident report for more details.</p>

<p>
  <a href="{{incidentUrl}}" class="button">View Incident Report</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    SMS: {
      body: "{{reportedBy}} reported a {{incidentType}} incident ({{severity}}) for {{clientName}}. Please review.",
    },
    IN_APP: {
      body: "{{reportedBy}} reported a {{incidentType}} incident ({{severity}}) for {{clientName}}.",
    },
  },

  INCIDENT_RESOLVED: {
    EMAIL: {
      subject: "{{clientName}}'s {{incidentType}} incident has been resolved",
      body: `
<p>Hi {{recipientName}},</p>

<p>The <strong>{{incidentType}}</strong> incident for <strong>{{clientName}}</strong> has been resolved by <strong>{{resolvedBy}}</strong> on {{resolvedDate}}.</p>

<p><strong>Resolution:</strong> {{resolution}}</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    IN_APP: {
      body: "{{clientName}}'s {{incidentType}} incident has been resolved by {{resolvedBy}}: {{resolution}}",
    },
  },

  CARE_PLAN_UPDATED: {
    EMAIL: {
      subject: "{{updatedBy}} updated {{clientName}}'s care plan",
      body: `
<p>Hi {{recipientName}},</p>

<p><strong>{{updatedBy}}</strong> has updated the care plan ({{planNumber}}) for <strong>{{clientName}}</strong>.</p>

<p><strong>Changes:</strong> {{updateSummary}}</p>

<p>
  <a href="{{carePlanUrl}}" class="button">View Care Plan</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    IN_APP: {
      body: "{{updatedBy}} updated {{clientName}}'s care plan: {{updateSummary}}",
    },
  },

  CARE_PLAN_APPROVED: {
    EMAIL: {
      subject: "{{clientName}}'s care plan has been approved",
      body: `
<p>Hi {{recipientName}},</p>

<p><strong>{{clientName}}</strong>'s care plan ({{planNumber}}) has been approved by <strong>{{approvedBy}}</strong>.</p>

<p>The plan is effective starting <strong>{{effectiveDate}}</strong>.</p>

<p>
  <a href="{{carePlanUrl}}" class="button">View Care Plan</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    IN_APP: {
      body: "{{clientName}}'s care plan has been approved by {{approvedBy}}. Effective from {{effectiveDate}}.",
    },
  },

  ASSESSMENT_DUE: {
    EMAIL: {
      subject: "{{clientName}}'s {{assessmentType}} assessment is due by {{dueDate}}",
      body: `
<p>Hi {{recipientName}},</p>

<p>A <strong>{{assessmentType}}</strong> assessment for <strong>{{clientName}}</strong> is due by <strong>{{dueDate}}</strong>.</p>

<p>
  <a href="{{assessmentUrl}}" class="button">Start Assessment</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    IN_APP: {
      body: "{{clientName}}'s {{assessmentType}} assessment is due by {{dueDate}}.",
    },
  },

  ASSESSMENT_COMPLETED: {
    EMAIL: {
      subject: "{{completedBy}} completed {{clientName}}'s {{assessmentType}} assessment",
      body: `
<p>Hi {{recipientName}},</p>

<p><strong>{{completedBy}}</strong> completed a <strong>{{assessmentType}}</strong> assessment for <strong>{{clientName}}</strong> on {{completedDate}}.</p>

<p>Score: <strong>{{score}}</strong></p>

<p>
  <a href="{{assessmentUrl}}" class="button">View Assessment</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    IN_APP: {
      body: "{{completedBy}} completed {{clientName}}'s {{assessmentType}} assessment with a score of {{score}}.",
    },
  },

  VISIT_NOTE_SUBMITTED: {
    EMAIL: {
      subject: "{{carerName}} submitted a visit note for {{clientName}}",
      body: `
<p>Hi {{recipientName}},</p>

<p><strong>{{carerName}}</strong> has submitted a visit note for <strong>{{clientName}}</strong> from their visit on <strong>{{visitDate}}</strong>.</p>

<p>
  <a href="{{visitNoteUrl}}" class="button">View Visit Note</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    IN_APP: {
      body: "{{carerName}} submitted a visit note for {{clientName}} ({{visitDate}}).",
    },
  },

  THRESHOLD_BREACH: {
    EMAIL: {
      subject: "{{clientName}}'s {{fieldLabel}} requires attention",
      body: `
<p>Hi {{recipientName}},</p>

<p>{{carerName}} recorded a {{fieldLabel}} of <strong>{{enteredValue}}</strong> for {{clientName}}, which is {{thresholdDescription}}.</p>

<table class="info-table">
  <tr>
    <td>Client</td>
    <td><strong>{{clientName}}</strong></td>
  </tr>
  <tr>
    <td>Recorded by</td>
    <td>{{carerName}}</td>
  </tr>
  <tr>
    <td>Visit Date</td>
    <td>{{visitDate}}</td>
  </tr>
  <tr>
    <td>{{fieldLabel}}</td>
    <td><strong>{{enteredValue}}</strong></td>
  </tr>
  <tr>
    <td>Expected Range</td>
    <td>{{expectedRange}}</td>
  </tr>
</table>

{{#customMessage}}
<div class="alert-box alert-info">
  {{customMessage}}
</div>
{{/customMessage}}

<p>
  <a href="{{visitNoteUrl}}" class="button">View Visit Note</a>
</p>

<p>{{companyName}}</p>
      `.trim(),
    },
    IN_APP: {
      body: "{{carerName}} recorded {{clientName}}'s {{fieldLabel}} as {{enteredValue}}, which is {{thresholdDescription}}.",
    },
  },

  // -------------------- Administrative --------------------
  USER_ACCOUNT_CREATED: {
    EMAIL: {
      subject: "Welcome to CareBase, {{firstName}}!",
      body: `
<p>Hi {{firstName}},</p>

<p>Your CareBase account has been created and is ready to use.</p>

<p>Your login email is <strong>{{email}}</strong>.</p>

{{#tempPassword}}
<p>Your temporary password is: <strong>{{tempPassword}}</strong></p>

<p>Please change your password after your first login for security.</p>
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
      subject: "Reset your CareBase password",
      body: `
<p>Hi {{firstName}},</p>

<p>We received a request to reset your CareBase password. Click the button below to create a new password.</p>

<p>
  <a href="{{resetUrl}}" class="button">Reset Your Password</a>
</p>

<p>This link will expire in {{expiresIn}}.</p>

<p>If you didn't request this, you can safely ignore this email - your password won't be changed.</p>

<p>{{companyName}}</p>
      `.trim(),
    },
  },

  WEEKLY_SUMMARY: {
    EMAIL: {
      subject: "Your week in review: {{weekStartDate}} - {{weekEndDate}}",
      body: `
<p>Hi {{recipientName}},</p>

<p>Here's a summary of the week from {{weekStartDate}} to {{weekEndDate}}:</p>

<ul>
  <li><strong>{{completedShifts}}</strong> of {{totalShifts}} shifts completed</li>
  <li><strong>{{totalHours}} hours</strong> of care provided</li>
  <li><strong>{{incidentCount}}</strong> incidents reported</li>
</ul>

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
