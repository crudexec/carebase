/**
 * Notification Channels
 *
 * Exports all channel providers
 */

export { emailChannel, EmailChannelProvider } from "./email";
export { inAppChannel, InAppChannelProvider } from "./in-app";

// SMS and WhatsApp channels will be added in Phase 2/3
// export { smsChannel, SmsChannelProvider } from "./sms";
// export { whatsappChannel, WhatsAppChannelProvider } from "./whatsapp";

import { NotificationChannel } from "@prisma/client";
import { NotificationChannelProvider } from "../types";
import { emailChannel } from "./email";
import { inAppChannel } from "./in-app";

// Channel registry
const channelProviders = new Map<NotificationChannel, NotificationChannelProvider>();
channelProviders.set("EMAIL", emailChannel);
channelProviders.set("IN_APP", inAppChannel);
// SMS and WhatsApp will be added later

/**
 * Get a channel provider by channel type
 */
export function getChannelProvider(channel: NotificationChannel): NotificationChannelProvider | undefined {
  return channelProviders.get(channel);
}

/**
 * Get all configured channel providers
 */
export function getConfiguredChannels(): NotificationChannelProvider[] {
  return Array.from(channelProviders.values()).filter((provider) => provider.isConfigured());
}

/**
 * Check if a channel is available
 */
export function isChannelAvailable(channel: NotificationChannel): boolean {
  const provider = channelProviders.get(channel);
  return provider?.isConfigured() ?? false;
}
