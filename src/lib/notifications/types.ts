/**
 * Notification System Types
 *
 * Core types and interfaces for the multi-channel notification system
 */

import { NotificationChannel, NotificationEventType, NotificationStatus } from "@prisma/client";

// ============================================
// Core Types
// ============================================

export type { NotificationChannel, NotificationEventType, NotificationStatus };

export interface NotificationRecipient {
  userId: string;
  email: string;
  phone?: string | null;
  firstName: string;
  lastName: string;
  companyId: string;
}

export interface NotificationPayload {
  eventType: NotificationEventType;
  recipientIds: string[];
  data: Record<string, unknown>;
  // Optional overrides
  channels?: NotificationChannel[];
  scheduledFor?: Date;
  // Related entity for tracking
  relatedEntityType?: string;
  relatedEntityId?: string;
}

export interface NotificationResult {
  success: boolean;
  channel: NotificationChannel;
  recipientId: string;
  notificationLogId?: string;
  error?: string;
}

export interface SendNotificationResult {
  totalSent: number;
  totalFailed: number;
  results: NotificationResult[];
}

// ============================================
// Template Types
// ============================================

export interface TemplateVariables {
  // Common variables
  recipientName: string;
  companyName: string;
  currentDate: string;
  appUrl: string;

  // Dynamic variables based on event type
  [key: string]: unknown;
}

export interface RenderedTemplate {
  subject?: string;
  body: string;
}

// ============================================
// Channel Provider Types
// ============================================

export interface ChannelSendOptions {
  to: string; // email address, phone number, etc.
  subject?: string;
  body: string;
  metadata?: Record<string, unknown>;
}

export interface ChannelSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationChannelProvider {
  name: NotificationChannel;
  send(options: ChannelSendOptions): Promise<ChannelSendResult>;
  isConfigured(): boolean;
}

// ============================================
// Event Configuration Types
// ============================================

export type RecipientRole =
  | "CARER"
  | "SUPERVISOR"
  | "ADMIN"
  | "OPS_MANAGER"
  | "SPONSOR"
  | "CLINICAL_DIRECTOR"
  | "STAFF";

export type NotificationPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface EventConfig {
  eventType: NotificationEventType;
  description: string;
  defaultRecipientRoles: RecipientRole[];
  priority: NotificationPriority;
  defaultChannels: NotificationChannel[];
  // Template variable names this event provides
  variables: string[];
}

// ============================================
// Preference Types
// ============================================

export interface UserNotificationPreferences {
  userId: string;
  preferences: {
    eventType: NotificationEventType;
    channel: NotificationChannel;
    enabled: boolean;
  }[];
}

// ============================================
// Queue Types
// ============================================

export interface QueuedNotification {
  id: string;
  eventType: NotificationEventType;
  channel: NotificationChannel;
  recipientId: string;
  subject?: string;
  body: string;
  metadata?: Record<string, unknown>;
  scheduledFor?: Date;
  retryCount: number;
  maxRetries: number;
  relatedEntityType?: string;
  relatedEntityId?: string;
}
