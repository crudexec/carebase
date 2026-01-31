/**
 * Notification Event Configurations
 *
 * Defines all notification events with their default recipients,
 * priority, channels, and available template variables.
 */

import { NotificationChannel, NotificationEventType } from "@prisma/client";
import { EventConfig, NotificationPriority, RecipientRole } from "./types";

// ============================================
// Event Configurations
// ============================================

export const EVENT_CONFIGS: Record<NotificationEventType, EventConfig> = {
  // -------------------- Shift-Related --------------------
  SHIFT_ASSIGNED: {
    eventType: "SHIFT_ASSIGNED",
    description: "Notification when a shift is assigned to a carer",
    defaultRecipientRoles: ["CARER"],
    priority: "HIGH",
    defaultChannels: ["EMAIL", "IN_APP"],
    variables: [
      "clientName",
      "shiftDate",
      "shiftTime",
      "shiftEndTime",
      "address",
      "shiftUrl",
    ],
  },
  SHIFT_REMINDER_24H: {
    eventType: "SHIFT_REMINDER_24H",
    description: "Reminder 24 hours before shift starts",
    defaultRecipientRoles: ["CARER"],
    priority: "MEDIUM",
    defaultChannels: ["EMAIL", "IN_APP"],
    variables: ["clientName", "shiftDate", "shiftTime", "address", "shiftUrl"],
  },
  SHIFT_REMINDER_1H: {
    eventType: "SHIFT_REMINDER_1H",
    description: "Reminder 1 hour before shift starts",
    defaultRecipientRoles: ["CARER"],
    priority: "HIGH",
    defaultChannels: ["EMAIL", "SMS", "IN_APP"],
    variables: ["clientName", "shiftTime", "address"],
  },
  SHIFT_CANCELLED: {
    eventType: "SHIFT_CANCELLED",
    description: "Notification when a shift is cancelled",
    defaultRecipientRoles: ["CARER"],
    priority: "HIGH",
    defaultChannels: ["EMAIL", "SMS", "IN_APP"],
    variables: ["clientName", "shiftDate", "shiftTime", "cancellationReason"],
  },
  SHIFT_RESCHEDULED: {
    eventType: "SHIFT_RESCHEDULED",
    description: "Notification when a shift is rescheduled",
    defaultRecipientRoles: ["CARER"],
    priority: "HIGH",
    defaultChannels: ["EMAIL", "IN_APP"],
    variables: [
      "clientName",
      "originalDate",
      "originalTime",
      "newDate",
      "newTime",
      "shiftUrl",
    ],
  },
  CHECK_IN_CONFIRMATION: {
    eventType: "CHECK_IN_CONFIRMATION",
    description: "Confirmation when carer checks in for a shift",
    defaultRecipientRoles: ["SPONSOR", "SUPERVISOR"],
    priority: "LOW",
    defaultChannels: ["EMAIL", "IN_APP"],
    variables: ["carerName", "clientName", "checkInTime", "shiftDate"],
  },
  CHECK_OUT_CONFIRMATION: {
    eventType: "CHECK_OUT_CONFIRMATION",
    description: "Confirmation when carer checks out from a shift",
    defaultRecipientRoles: ["SPONSOR", "SUPERVISOR"],
    priority: "LOW",
    defaultChannels: ["EMAIL", "IN_APP"],
    variables: [
      "carerName",
      "clientName",
      "checkOutTime",
      "shiftDate",
      "totalHours",
    ],
  },
  MISSED_CHECK_IN: {
    eventType: "MISSED_CHECK_IN",
    description: "Alert when a carer misses their scheduled check-in",
    defaultRecipientRoles: ["SUPERVISOR", "ADMIN"],
    priority: "CRITICAL",
    defaultChannels: ["EMAIL", "SMS", "IN_APP"],
    variables: [
      "carerName",
      "clientName",
      "expectedCheckInTime",
      "shiftDate",
      "shiftUrl",
    ],
  },
  LATE_CHECK_IN: {
    eventType: "LATE_CHECK_IN",
    description: "Alert when a carer checks in late (15+ minutes)",
    defaultRecipientRoles: ["SUPERVISOR", "ADMIN"],
    priority: "MEDIUM",
    defaultChannels: ["EMAIL", "IN_APP"],
    variables: [
      "carerName",
      "clientName",
      "scheduledTime",
      "actualCheckInTime",
      "minutesLate",
      "shiftDate",
      "shiftUrl",
    ],
  },
  EARLY_CHECK_OUT: {
    eventType: "EARLY_CHECK_OUT",
    description: "Alert when a carer checks out before scheduled end time",
    defaultRecipientRoles: ["SUPERVISOR", "ADMIN"],
    priority: "MEDIUM",
    defaultChannels: ["EMAIL", "IN_APP"],
    variables: [
      "carerName",
      "clientName",
      "scheduledEndTime",
      "actualCheckOutTime",
      "minutesEarly",
      "shiftDate",
      "shiftUrl",
    ],
  },
  OVERTIME_ALERT: {
    eventType: "OVERTIME_ALERT",
    description: "Alert when a shift exceeds scheduled hours",
    defaultRecipientRoles: ["SUPERVISOR", "ADMIN"],
    priority: "MEDIUM",
    defaultChannels: ["EMAIL", "IN_APP"],
    variables: [
      "carerName",
      "clientName",
      "scheduledHours",
      "actualHours",
      "overtimeMinutes",
      "shiftDate",
      "shiftUrl",
    ],
  },
  NO_SHOW_ALERT: {
    eventType: "NO_SHOW_ALERT",
    description: "Alert when a shift is missed entirely (no check-in)",
    defaultRecipientRoles: ["SUPERVISOR", "ADMIN", "SPONSOR"],
    priority: "CRITICAL",
    defaultChannels: ["EMAIL", "SMS", "IN_APP"],
    variables: [
      "carerName",
      "clientName",
      "shiftDate",
      "shiftTime",
      "shiftUrl",
    ],
  },
  SHIFT_COMPLETED: {
    eventType: "SHIFT_COMPLETED",
    description: "Confirmation when a shift is completed",
    defaultRecipientRoles: ["SPONSOR"],
    priority: "LOW",
    defaultChannels: ["EMAIL", "IN_APP"],
    variables: [
      "carerName",
      "clientName",
      "shiftDate",
      "totalHours",
      "checkInTime",
      "checkOutTime",
    ],
  },
  COVERAGE_NEEDED: {
    eventType: "COVERAGE_NEEDED",
    description: "Alert when an open shift needs coverage",
    defaultRecipientRoles: ["CARER"],
    priority: "HIGH",
    defaultChannels: ["EMAIL", "SMS", "IN_APP"],
    variables: [
      "clientName",
      "shiftDate",
      "shiftTime",
      "shiftEndTime",
      "address",
      "shiftUrl",
    ],
  },
  WEEKLY_SCHEDULE_PUBLISHED: {
    eventType: "WEEKLY_SCHEDULE_PUBLISHED",
    description: "Notification when weekly schedule is published",
    defaultRecipientRoles: ["CARER"],
    priority: "MEDIUM",
    defaultChannels: ["EMAIL", "IN_APP"],
    variables: [
      "weekStartDate",
      "weekEndDate",
      "totalShifts",
      "totalHours",
      "scheduleUrl",
    ],
  },

  // -------------------- Authorization Alerts --------------------
  AUTH_UNITS_80_PERCENT: {
    eventType: "AUTH_UNITS_80_PERCENT",
    description: "Alert when authorization units reach 80% usage",
    defaultRecipientRoles: ["ADMIN", "OPS_MANAGER"],
    priority: "MEDIUM",
    defaultChannels: ["EMAIL", "IN_APP"],
    variables: [
      "clientName",
      "authNumber",
      "usedUnits",
      "totalUnits",
      "remainingUnits",
      "percentUsed",
      "authUrl",
    ],
  },
  AUTH_UNITS_90_PERCENT: {
    eventType: "AUTH_UNITS_90_PERCENT",
    description: "Alert when authorization units reach 90% usage",
    defaultRecipientRoles: ["ADMIN", "OPS_MANAGER"],
    priority: "HIGH",
    defaultChannels: ["EMAIL", "SMS", "IN_APP"],
    variables: [
      "clientName",
      "authNumber",
      "usedUnits",
      "totalUnits",
      "remainingUnits",
      "percentUsed",
      "authUrl",
    ],
  },
  AUTH_UNITS_EXHAUSTED: {
    eventType: "AUTH_UNITS_EXHAUSTED",
    description: "Alert when authorization units are exhausted",
    defaultRecipientRoles: ["ADMIN", "OPS_MANAGER", "SUPERVISOR"],
    priority: "CRITICAL",
    defaultChannels: ["EMAIL", "SMS", "IN_APP"],
    variables: ["clientName", "authNumber", "usedUnits", "totalUnits", "authUrl"],
  },
  AUTH_EXPIRING_30_DAYS: {
    eventType: "AUTH_EXPIRING_30_DAYS",
    description: "Alert when authorization expires in 30 days",
    defaultRecipientRoles: ["ADMIN", "OPS_MANAGER"],
    priority: "LOW",
    defaultChannels: ["EMAIL", "IN_APP"],
    variables: ["clientName", "authNumber", "expirationDate", "daysRemaining", "authUrl"],
  },
  AUTH_EXPIRING_7_DAYS: {
    eventType: "AUTH_EXPIRING_7_DAYS",
    description: "Alert when authorization expires in 7 days",
    defaultRecipientRoles: ["ADMIN", "OPS_MANAGER"],
    priority: "HIGH",
    defaultChannels: ["EMAIL", "SMS", "IN_APP"],
    variables: ["clientName", "authNumber", "expirationDate", "daysRemaining", "authUrl"],
  },
  AUTH_EXPIRED: {
    eventType: "AUTH_EXPIRED",
    description: "Alert when authorization has expired",
    defaultRecipientRoles: ["ADMIN", "OPS_MANAGER"],
    priority: "CRITICAL",
    defaultChannels: ["EMAIL", "SMS", "IN_APP"],
    variables: ["clientName", "authNumber", "expirationDate", "authUrl"],
  },

  // -------------------- Care Events --------------------
  INCIDENT_REPORTED: {
    eventType: "INCIDENT_REPORTED",
    description: "Alert when an incident is reported",
    defaultRecipientRoles: ["SUPERVISOR", "ADMIN", "SPONSOR"],
    priority: "CRITICAL",
    defaultChannels: ["EMAIL", "SMS", "IN_APP"],
    variables: [
      "clientName",
      "incidentType",
      "severity",
      "reportedBy",
      "incidentDate",
      "incidentUrl",
    ],
  },
  INCIDENT_RESOLVED: {
    eventType: "INCIDENT_RESOLVED",
    description: "Notification when an incident is resolved",
    defaultRecipientRoles: ["SPONSOR"],
    priority: "MEDIUM",
    defaultChannels: ["EMAIL", "IN_APP"],
    variables: [
      "clientName",
      "incidentType",
      "resolution",
      "resolvedBy",
      "resolvedDate",
    ],
  },
  CARE_PLAN_UPDATED: {
    eventType: "CARE_PLAN_UPDATED",
    description: "Notification when a care plan is updated",
    defaultRecipientRoles: ["SPONSOR", "CARER"],
    priority: "MEDIUM",
    defaultChannels: ["EMAIL", "IN_APP"],
    variables: ["clientName", "planNumber", "updatedBy", "updateSummary", "carePlanUrl"],
  },
  CARE_PLAN_APPROVED: {
    eventType: "CARE_PLAN_APPROVED",
    description: "Notification when a care plan is approved",
    defaultRecipientRoles: ["CARER"],
    priority: "MEDIUM",
    defaultChannels: ["EMAIL", "IN_APP"],
    variables: ["clientName", "planNumber", "approvedBy", "effectiveDate", "carePlanUrl"],
  },
  ASSESSMENT_DUE: {
    eventType: "ASSESSMENT_DUE",
    description: "Reminder when an assessment is due",
    defaultRecipientRoles: ["CARER", "SUPERVISOR"],
    priority: "MEDIUM",
    defaultChannels: ["EMAIL", "IN_APP"],
    variables: ["clientName", "assessmentType", "dueDate", "assessmentUrl"],
  },
  ASSESSMENT_COMPLETED: {
    eventType: "ASSESSMENT_COMPLETED",
    description: "Notification when an assessment is completed",
    defaultRecipientRoles: ["SUPERVISOR"],
    priority: "LOW",
    defaultChannels: ["EMAIL", "IN_APP"],
    variables: [
      "clientName",
      "assessmentType",
      "completedBy",
      "completedDate",
      "score",
      "assessmentUrl",
    ],
  },
  VISIT_NOTE_SUBMITTED: {
    eventType: "VISIT_NOTE_SUBMITTED",
    description: "Notification when a visit note is submitted",
    defaultRecipientRoles: ["SPONSOR"],
    priority: "LOW",
    defaultChannels: ["EMAIL", "IN_APP"],
    variables: ["clientName", "carerName", "visitDate", "visitNoteUrl"],
  },

  // -------------------- Administrative --------------------
  USER_ACCOUNT_CREATED: {
    eventType: "USER_ACCOUNT_CREATED",
    description: "Welcome notification for new user accounts",
    defaultRecipientRoles: [], // Sent to the created user directly
    priority: "HIGH",
    defaultChannels: ["EMAIL"],
    variables: ["firstName", "email", "tempPassword", "loginUrl"],
  },
  PASSWORD_RESET: {
    eventType: "PASSWORD_RESET",
    description: "Password reset notification",
    defaultRecipientRoles: [], // Sent to the requesting user directly
    priority: "HIGH",
    defaultChannels: ["EMAIL"],
    variables: ["firstName", "resetUrl", "expiresIn"],
  },
  WEEKLY_SUMMARY: {
    eventType: "WEEKLY_SUMMARY",
    description: "Weekly summary report",
    defaultRecipientRoles: ["ADMIN", "OPS_MANAGER"],
    priority: "LOW",
    defaultChannels: ["EMAIL"],
    variables: [
      "weekStartDate",
      "weekEndDate",
      "totalShifts",
      "completedShifts",
      "totalHours",
      "incidentCount",
      "summaryUrl",
    ],
  },
};

// ============================================
// Helper Functions
// ============================================

export function getEventConfig(eventType: NotificationEventType): EventConfig {
  return EVENT_CONFIGS[eventType];
}

export function getEventsByPriority(priority: NotificationPriority): EventConfig[] {
  return Object.values(EVENT_CONFIGS).filter((config) => config.priority === priority);
}

export function getEventsForRole(role: RecipientRole): EventConfig[] {
  return Object.values(EVENT_CONFIGS).filter((config) =>
    config.defaultRecipientRoles.includes(role)
  );
}

export function getDefaultChannels(eventType: NotificationEventType): NotificationChannel[] {
  return EVENT_CONFIGS[eventType]?.defaultChannels || ["EMAIL", "IN_APP"];
}

export function getEventVariables(eventType: NotificationEventType): string[] {
  return EVENT_CONFIGS[eventType]?.variables || [];
}
