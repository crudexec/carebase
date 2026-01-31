/**
 * Notification Service
 *
 * Multi-channel notification system for CareBase
 *
 * Usage:
 * ```typescript
 * import { sendNotification } from "@/lib/notifications";
 *
 * await sendNotification({
 *   eventType: "SHIFT_ASSIGNED",
 *   recipientIds: ["user-123"],
 *   data: {
 *     clientName: "John Doe",
 *     shiftDate: "January 30, 2026",
 *     shiftTime: "9:00 AM",
 *     shiftEndTime: "1:00 PM",
 *     address: "123 Main St",
 *     shiftUrl: "https://app.carebase.com/shifts/123",
 *   },
 * });
 * ```
 */

import { NotificationEventType, NotificationChannel } from "@prisma/client";
import { prisma } from "@/lib/db";
import { dispatch, processScheduledNotifications, retryFailedNotifications } from "./dispatcher";
import { getEventsForRole } from "./events";
import {
  NotificationPayload,
  SendNotificationResult,
  UserNotificationPreferences,
  RecipientRole,
} from "./types";

// ============================================
// Main API
// ============================================

/**
 * Send a notification to one or more recipients
 */
export async function sendNotification(
  payload: NotificationPayload
): Promise<SendNotificationResult> {
  return dispatch(payload);
}

/**
 * Send notification to all users with a specific role
 */
export async function sendNotificationToRole(
  eventType: NotificationEventType,
  roles: RecipientRole[],
  companyId: string,
  data: Record<string, unknown>,
  options?: {
    channels?: NotificationChannel[];
    scheduledFor?: Date;
    relatedEntityType?: string;
    relatedEntityId?: string;
  }
): Promise<SendNotificationResult> {
  // Fetch all users with the specified roles in the company
  const users = await prisma.user.findMany({
    where: {
      companyId,
      role: { in: roles },
      isActive: true,
    },
    select: { id: true },
  });

  if (users.length === 0) {
    return { totalSent: 0, totalFailed: 0, results: [] };
  }

  return sendNotification({
    eventType,
    recipientIds: users.map((u) => u.id),
    data,
    ...options,
  });
}

/**
 * Send notification to a client's sponsor
 */
export async function sendNotificationToSponsor(
  eventType: NotificationEventType,
  clientId: string,
  data: Record<string, unknown>,
  options?: {
    channels?: NotificationChannel[];
    scheduledFor?: Date;
    relatedEntityType?: string;
    relatedEntityId?: string;
  }
): Promise<SendNotificationResult> {
  // Fetch the client's sponsor
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { sponsorId: true },
  });

  if (!client?.sponsorId) {
    return { totalSent: 0, totalFailed: 0, results: [] };
  }

  return sendNotification({
    eventType,
    recipientIds: [client.sponsorId],
    data,
    ...options,
  });
}

// ============================================
// Preference Management
// ============================================

/**
 * Get notification preferences for a user
 */
export async function getUserPreferences(
  userId: string
): Promise<UserNotificationPreferences> {
  const preferences = await prisma.notificationPreference.findMany({
    where: { userId },
  });

  return {
    userId,
    preferences: preferences.map((p) => ({
      eventType: p.eventType,
      channel: p.channel,
      enabled: p.enabled,
    })),
  };
}

/**
 * Update notification preferences for a user
 */
export async function updateUserPreferences(
  userId: string,
  companyId: string,
  preferences: { eventType: NotificationEventType; channel: NotificationChannel; enabled: boolean }[]
): Promise<void> {
  // Use upsert for each preference
  await Promise.all(
    preferences.map((pref) =>
      prisma.notificationPreference.upsert({
        where: {
          userId_eventType_channel: {
            userId,
            eventType: pref.eventType,
            channel: pref.channel,
          },
        },
        update: {
          enabled: pref.enabled,
        },
        create: {
          userId,
          companyId,
          eventType: pref.eventType,
          channel: pref.channel,
          enabled: pref.enabled,
        },
      })
    )
  );
}

/**
 * Initialize default preferences for a new user
 */
export async function initializeUserPreferences(
  userId: string,
  companyId: string,
  role: RecipientRole
): Promise<void> {
  // Get events that should be enabled by default for this role
  const relevantEvents = getEventsForRole(role);

  const preferences: { eventType: NotificationEventType; channel: NotificationChannel; enabled: boolean }[] = [];

  for (const eventConfig of relevantEvents) {
    for (const channel of eventConfig.defaultChannels) {
      preferences.push({
        eventType: eventConfig.eventType,
        channel,
        enabled: true,
      });
    }
  }

  await updateUserPreferences(userId, companyId, preferences);
}

// ============================================
// Background Jobs
// ============================================

/**
 * Process scheduled notifications (for cron job)
 */
export { processScheduledNotifications };

/**
 * Retry failed notifications (for cron job)
 */
export { retryFailedNotifications };

// ============================================
// Type Exports
// ============================================

export type {
  NotificationPayload,
  SendNotificationResult,
  NotificationRecipient,
  TemplateVariables,
  UserNotificationPreferences,
  NotificationPriority,
  RecipientRole,
  EventConfig,
} from "./types";

export { EVENT_CONFIGS, getEventConfig, getEventsForRole } from "./events";
export { getConfiguredChannels, isChannelAvailable } from "./channels";
