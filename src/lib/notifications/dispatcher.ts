/**
 * Notification Dispatcher
 *
 * Routes notifications to the correct channels based on user preferences
 */

import { NotificationChannel, NotificationEventType, NotificationStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getChannelProvider, isChannelAvailable } from "./channels";
import { renderTemplate, buildCommonVariables } from "./templates";
import { getEventConfig, getDefaultChannels } from "./events";
import {
  NotificationPayload,
  NotificationResult,
  SendNotificationResult,
  TemplateVariables,
  NotificationRecipient,
} from "./types";

/**
 * Main dispatch function - sends notifications to recipients via their preferred channels
 */
export async function dispatch(payload: NotificationPayload): Promise<SendNotificationResult> {
  const { eventType, recipientIds, data, channels, scheduledFor, relatedEntityType, relatedEntityId } = payload;

  const results: NotificationResult[] = [];
  let totalSent = 0;
  let totalFailed = 0;

  // Get event configuration (may be used for future enhancements)
  const _eventConfig = getEventConfig(eventType);

  // Fetch recipients with their details
  const recipients = await fetchRecipients(recipientIds);

  for (const recipient of recipients) {
    // Determine which channels to use for this recipient
    const recipientChannels = await getRecipientChannels(
      recipient.userId,
      eventType,
      channels
    );

    // Fetch company name for templates
    const company = await prisma.company.findUnique({
      where: { id: recipient.companyId },
      select: { name: true },
    });

    // Build template variables
    const templateVariables: TemplateVariables = {
      ...buildCommonVariables(
        `${recipient.firstName} ${recipient.lastName}`,
        company?.name || "CareBase"
      ),
      ...data,
    } as TemplateVariables;

    // Send to each channel
    for (const channel of recipientChannels) {
      const result = await sendToChannel(
        recipient,
        eventType,
        channel,
        templateVariables,
        scheduledFor,
        relatedEntityType,
        relatedEntityId
      );

      results.push(result);

      if (result.success) {
        totalSent++;
      } else {
        totalFailed++;
      }
    }
  }

  return {
    totalSent,
    totalFailed,
    results,
  };
}

/**
 * Fetch recipient details from the database
 */
async function fetchRecipients(recipientIds: string[]): Promise<NotificationRecipient[]> {
  const users = await prisma.user.findMany({
    where: {
      id: { in: recipientIds },
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      companyId: true,
    },
  });

  return users.map((user) => ({
    userId: user.id,
    email: user.email,
    phone: user.phone,
    firstName: user.firstName,
    lastName: user.lastName,
    companyId: user.companyId,
  }));
}

/**
 * Get the channels a recipient should receive notifications on
 */
async function getRecipientChannels(
  userId: string,
  eventType: NotificationEventType,
  overrideChannels?: NotificationChannel[]
): Promise<NotificationChannel[]> {
  // If specific channels are requested, use those
  if (overrideChannels && overrideChannels.length > 0) {
    return overrideChannels.filter((channel) => isChannelAvailable(channel));
  }

  // Fetch user preferences
  const preferences = await prisma.notificationPreference.findMany({
    where: {
      userId,
      eventType,
      enabled: true,
    },
    select: {
      channel: true,
    },
  });

  // If user has preferences, use them
  if (preferences.length > 0) {
    return preferences
      .map((p) => p.channel)
      .filter((channel) => isChannelAvailable(channel));
  }

  // Fall back to default channels for this event type
  const defaultChannels = getDefaultChannels(eventType);
  return defaultChannels.filter((channel) => isChannelAvailable(channel));
}

/**
 * Send a notification to a specific channel
 */
async function sendToChannel(
  recipient: NotificationRecipient,
  eventType: NotificationEventType,
  channel: NotificationChannel,
  variables: TemplateVariables,
  scheduledFor?: Date,
  relatedEntityType?: string,
  relatedEntityId?: string
): Promise<NotificationResult> {
  const provider = getChannelProvider(channel);

  if (!provider) {
    return {
      success: false,
      channel,
      recipientId: recipient.userId,
      error: `Channel provider not found for ${channel}`,
    };
  }

  try {
    // Render the template
    const rendered = await renderTemplate(
      eventType,
      channel,
      variables,
      recipient.companyId
    );

    // Create notification log entry
    const notificationLog = await prisma.notificationLog.create({
      data: {
        eventType,
        channel,
        status: scheduledFor ? "PENDING" : "QUEUED",
        subject: rendered.subject,
        body: rendered.body,
        userId: recipient.userId,
        companyId: recipient.companyId,
        scheduledFor,
        relatedEntityType,
        relatedEntityId,
      },
    });

    // If scheduled for later, don't send now
    if (scheduledFor && scheduledFor > new Date()) {
      return {
        success: true,
        channel,
        recipientId: recipient.userId,
        notificationLogId: notificationLog.id,
      };
    }

    // Determine the recipient address based on channel
    let recipientAddress: string;
    switch (channel) {
      case "EMAIL":
        recipientAddress = recipient.email;
        break;
      case "SMS":
      case "WHATSAPP":
        if (!recipient.phone) {
          await updateNotificationLog(notificationLog.id, "FAILED", "No phone number available");
          return {
            success: false,
            channel,
            recipientId: recipient.userId,
            notificationLogId: notificationLog.id,
            error: "No phone number available",
          };
        }
        recipientAddress = recipient.phone;
        break;
      case "IN_APP":
        recipientAddress = recipient.userId;
        break;
      default:
        recipientAddress = recipient.email;
    }

    // Send the notification
    const result = await provider.send({
      to: recipientAddress,
      subject: rendered.subject,
      body: rendered.body,
      metadata: {
        userId: recipient.userId,
        companyId: recipient.companyId,
        eventType,
        title: rendered.subject,
      },
    });

    // Update notification log
    if (result.success) {
      await updateNotificationLog(notificationLog.id, "SENT", undefined, result.messageId);
    } else {
      await updateNotificationLog(notificationLog.id, "FAILED", result.error);
    }

    return {
      success: result.success,
      channel,
      recipientId: recipient.userId,
      notificationLogId: notificationLog.id,
      error: result.error,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return {
      success: false,
      channel,
      recipientId: recipient.userId,
      error: errorMessage,
    };
  }
}

/**
 * Update notification log status
 */
async function updateNotificationLog(
  id: string,
  status: NotificationStatus,
  error?: string,
  messageId?: string
): Promise<void> {
  const updateData: {
    status: NotificationStatus;
    lastError?: string;
    metadata?: { messageId: string };
    sentAt?: Date;
    failedAt?: Date;
  } = {
    status,
  };

  if (error) {
    updateData.lastError = error;
    updateData.failedAt = new Date();
  }

  if (messageId) {
    updateData.metadata = { messageId };
    updateData.sentAt = new Date();
  }

  await prisma.notificationLog.update({
    where: { id },
    data: updateData,
  });
}

/**
 * Process scheduled notifications (called by cron job)
 */
export async function processScheduledNotifications(): Promise<number> {
  const now = new Date();

  // Find pending notifications that are scheduled for now or earlier
  const pendingNotifications = await prisma.notificationLog.findMany({
    where: {
      status: "PENDING",
      scheduledFor: {
        lte: now,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          phone: true,
          firstName: true,
          lastName: true,
          companyId: true,
        },
      },
    },
    take: 100, // Process in batches
  });

  let processedCount = 0;

  for (const notification of pendingNotifications) {
    const provider = getChannelProvider(notification.channel);
    if (!provider) continue;

    // Determine recipient address
    let recipientAddress: string;
    switch (notification.channel) {
      case "EMAIL":
        recipientAddress = notification.user.email;
        break;
      case "SMS":
      case "WHATSAPP":
        if (!notification.user.phone) continue;
        recipientAddress = notification.user.phone;
        break;
      case "IN_APP":
        recipientAddress = notification.user.id;
        break;
      default:
        recipientAddress = notification.user.email;
    }

    const result = await provider.send({
      to: recipientAddress,
      subject: notification.subject || undefined,
      body: notification.body,
      metadata: {
        userId: notification.user.id,
        companyId: notification.user.companyId,
        eventType: notification.eventType,
      },
    });

    await updateNotificationLog(
      notification.id,
      result.success ? "SENT" : "FAILED",
      result.error,
      result.messageId
    );

    processedCount++;
  }

  return processedCount;
}

/**
 * Retry failed notifications
 */
export async function retryFailedNotifications(): Promise<number> {
  // Find failed notifications that haven't exceeded retry limit
  const failedNotifications = await prisma.notificationLog.findMany({
    where: {
      status: "FAILED",
      retryCount: {
        lt: prisma.notificationLog.fields.maxRetries,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          phone: true,
          firstName: true,
          lastName: true,
          companyId: true,
        },
      },
    },
    take: 50,
  });

  let retriedCount = 0;

  for (const notification of failedNotifications) {
    // Increment retry count
    await prisma.notificationLog.update({
      where: { id: notification.id },
      data: {
        retryCount: { increment: 1 },
        status: "QUEUED",
      },
    });

    const provider = getChannelProvider(notification.channel);
    if (!provider) continue;

    // Determine recipient address
    let recipientAddress: string;
    switch (notification.channel) {
      case "EMAIL":
        recipientAddress = notification.user.email;
        break;
      case "SMS":
      case "WHATSAPP":
        if (!notification.user.phone) continue;
        recipientAddress = notification.user.phone;
        break;
      case "IN_APP":
        recipientAddress = notification.user.id;
        break;
      default:
        recipientAddress = notification.user.email;
    }

    const result = await provider.send({
      to: recipientAddress,
      subject: notification.subject || undefined,
      body: notification.body,
      metadata: {
        userId: notification.user.id,
        companyId: notification.user.companyId,
        eventType: notification.eventType,
      },
    });

    await updateNotificationLog(
      notification.id,
      result.success ? "SENT" : "FAILED",
      result.error,
      result.messageId
    );

    retriedCount++;
  }

  return retriedCount;
}
