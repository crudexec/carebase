/**
 * In-App Channel Provider
 *
 * Creates in-app notifications that appear in the bell icon drawer
 */

import { NotificationChannel, NotificationEventType } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  NotificationChannelProvider,
  ChannelSendOptions,
  ChannelSendResult,
} from "../types";

// Map event types to notification types for the existing Notification model
const EVENT_TYPE_MAP: Record<NotificationEventType, string> = {
  // Shifts
  SHIFT_ASSIGNED: "shift_assigned",
  SHIFT_REMINDER_24H: "shift_reminder",
  SHIFT_REMINDER_1H: "shift_reminder",
  SHIFT_CANCELLED: "shift_cancelled",
  SHIFT_RESCHEDULED: "shift_rescheduled",
  CHECK_IN_CONFIRMATION: "check_in",
  CHECK_OUT_CONFIRMATION: "check_out",
  MISSED_CHECK_IN: "missed_check_in",
  LATE_CHECK_IN: "late_check_in",
  EARLY_CHECK_OUT: "early_check_out",
  OVERTIME_ALERT: "overtime_alert",
  NO_SHOW_ALERT: "no_show_alert",
  SHIFT_COMPLETED: "shift_completed",
  COVERAGE_NEEDED: "coverage_needed",
  WEEKLY_SCHEDULE_PUBLISHED: "weekly_schedule",
  // Authorization
  AUTH_UNITS_80_PERCENT: "authorization_alert",
  AUTH_UNITS_90_PERCENT: "authorization_alert",
  AUTH_UNITS_EXHAUSTED: "authorization_alert",
  AUTH_EXPIRING_30_DAYS: "authorization_expiring",
  AUTH_EXPIRING_7_DAYS: "authorization_expiring",
  AUTH_EXPIRED: "authorization_expired",
  // Care Events
  INCIDENT_REPORTED: "incident_reported",
  INCIDENT_RESOLVED: "incident_resolved",
  CARE_PLAN_UPDATED: "care_plan_updated",
  CARE_PLAN_APPROVED: "care_plan_approved",
  ASSESSMENT_DUE: "assessment_due",
  ASSESSMENT_COMPLETED: "assessment_completed",
  VISIT_NOTE_SUBMITTED: "visit_note_submitted",
  THRESHOLD_BREACH: "threshold_breach",
  // Administrative
  USER_ACCOUNT_CREATED: "account_created",
  PASSWORD_RESET: "password_reset",
  WEEKLY_SUMMARY: "weekly_summary",
  SPONSOR_INVITED: "sponsor_invited",
  // Inbox
  NEW_INBOX_MESSAGE: "inbox_message",
};

export class InAppChannelProvider implements NotificationChannelProvider {
  name: NotificationChannel = "IN_APP";

  isConfigured(): boolean {
    return true; // Always available - uses database
  }

  async send(options: ChannelSendOptions): Promise<ChannelSendResult> {
    try {
      const metadata = options.metadata as {
        userId: string;
        companyId: string;
        eventType: NotificationEventType;
        title?: string;
        link?: string;
      };

      if (!metadata?.userId || !metadata?.companyId) {
        return {
          success: false,
          error: "Missing userId or companyId in metadata",
        };
      }

      const notificationType = EVENT_TYPE_MAP[metadata.eventType] || "general";

      // Create notification in the existing Notification model
      const notification = await prisma.notification.create({
        data: {
          type: notificationType,
          title: metadata.title || options.subject || "Notification",
          message: this.stripHtml(options.body),
          link: metadata.link,
          userId: metadata.userId,
          companyId: metadata.companyId,
        },
      });

      return {
        success: true,
        messageId: notification.id,
        metadata: { notificationId: notification.id },
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error creating in-app notification";
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Strip HTML tags from content for in-app display
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/&nbsp;/g, " ") // Replace nbsp
      .replace(/&amp;/g, "&") // Replace ampersand
      .replace(/&lt;/g, "<") // Replace less than
      .replace(/&gt;/g, ">") // Replace greater than
      .replace(/\s+/g, " ") // Collapse whitespace
      .trim();
  }
}

// Export singleton instance
export const inAppChannel = new InAppChannelProvider();
