/**
 * Template Renderer
 *
 * Renders notification templates with variable substitution
 */

import { NotificationChannel, NotificationEventType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { RenderedTemplate, TemplateVariables } from "../types";
import { getDefaultTemplate } from "./defaults";

/**
 * Render a notification template with variables
 */
export async function renderTemplate(
  eventType: NotificationEventType,
  channel: NotificationChannel,
  variables: TemplateVariables,
  companyId?: string
): Promise<RenderedTemplate> {
  // Try to find a custom template for this company
  let template = companyId
    ? await prisma.notificationTemplate.findFirst({
        where: {
          companyId,
          eventType,
          channel,
          isActive: true,
        },
      })
    : null;

  // Fall back to default system template
  if (!template) {
    template = await prisma.notificationTemplate.findFirst({
      where: {
        companyId: null,
        eventType,
        channel,
        isDefault: true,
        isActive: true,
      },
    });
  }

  // If no template in DB, use hardcoded defaults
  if (!template) {
    const defaultTemplate = getDefaultTemplate(eventType, channel);
    return {
      subject: defaultTemplate.subject
        ? replaceVariables(defaultTemplate.subject, variables)
        : undefined,
      body: replaceVariables(defaultTemplate.body, variables),
    };
  }

  return {
    subject: template.subject
      ? replaceVariables(template.subject, variables)
      : undefined,
    body: replaceVariables(template.body, variables),
  };
}

/**
 * Replace {{variable}} placeholders with actual values
 * Also supports {{#variable}}...{{/variable}} conditional blocks
 */
function replaceVariables(
  template: string,
  variables: TemplateVariables
): string {
  // First, handle conditional blocks {{#variable}}...{{/variable}}
  // These blocks are only rendered if the variable is truthy (not empty, not null, not undefined)
  let result = template.replace(
    /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g,
    (match, key, content) => {
      const value = variables[key];
      // Show content only if value is truthy (not empty string, null, or undefined)
      if (value !== undefined && value !== null && value !== "") {
        return content;
      }
      return ""; // Remove the block if variable is falsy
    }
  );

  // Then replace simple {{variable}} placeholders
  result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = variables[key];
    if (value === undefined || value === null) {
      return ""; // Return empty string for undefined values
    }
    return String(value);
  });

  return result;
}

/**
 * Get all available template variables for preview
 */
export function getTemplateVariables(_eventType: NotificationEventType): string[] {
  // Common variables available to all templates
  const commonVariables = [
    "recipientName",
    "companyName",
    "currentDate",
    "appUrl",
  ];

  // Event-specific variables are defined in events.ts
  // This function just returns the common ones
  return commonVariables;
}

/**
 * Build common template variables
 */
export function buildCommonVariables(
  recipientName: string,
  companyName: string
): Partial<TemplateVariables> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.carebasehealth.com";

  return {
    recipientName,
    companyName,
    currentDate: new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    appUrl,
  };
}
