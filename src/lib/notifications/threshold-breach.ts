/**
 * Threshold Breach Notification Helper
 *
 * Detects threshold breaches in visit note submissions and sends notifications
 */

import { prisma } from "@/lib/db";
import { sendNotification } from "./index";
import { FormSchemaSnapshot, NumberFieldConfig } from "@/lib/visit-notes/types";

interface ThresholdBreachInfo {
  fieldId: string;
  fieldLabel: string;
  value: number;
  minThreshold?: number;
  maxThreshold?: number;
  breachType: "BELOW_MIN" | "ABOVE_MAX";
  customMessage?: string;
}

interface ProcessThresholdBreachesParams {
  visitNoteId: string;
  companyId: string;
  clientId: string;
  carerId: string;
  clientName: string;
  carerName: string;
  visitDate: string;
  formSchemaSnapshot: FormSchemaSnapshot;
  data: Record<string, unknown>;
}

/**
 * Detect threshold breaches in the submitted data
 */
export function detectThresholdBreaches(
  formSchemaSnapshot: FormSchemaSnapshot,
  data: Record<string, unknown>
): ThresholdBreachInfo[] {
  const breaches: ThresholdBreachInfo[] = [];

  for (const section of formSchemaSnapshot.sections) {
    for (const field of section.fields) {
      if (field.type !== "NUMBER") continue;

      const config = field.config as NumberFieldConfig | null;
      if (!config) continue;

      // Check if thresholds are enabled (default to true if min/max exists)
      const thresholdEnabled =
        config.thresholdEnabled ?? (config.min !== undefined || config.max !== undefined);
      if (!thresholdEnabled) continue;

      const value = data[field.id];
      if (value === null || value === undefined || typeof value !== "number") continue;

      // Check min threshold
      if (config.min !== undefined && value < config.min) {
        breaches.push({
          fieldId: field.id,
          fieldLabel: field.label,
          value,
          minThreshold: config.min,
          maxThreshold: config.max,
          breachType: "BELOW_MIN",
          customMessage: config.customMessage,
        });
      }

      // Check max threshold
      if (config.max !== undefined && value > config.max) {
        breaches.push({
          fieldId: field.id,
          fieldLabel: field.label,
          value,
          minThreshold: config.min,
          maxThreshold: config.max,
          breachType: "ABOVE_MAX",
          customMessage: config.customMessage,
        });
      }
    }
  }

  return breaches;
}

/**
 * Process threshold breaches: create records and send notifications
 */
export async function processThresholdBreaches(
  params: ProcessThresholdBreachesParams
): Promise<void> {
  const {
    visitNoteId,
    companyId,
    clientId,
    carerId,
    clientName,
    carerName,
    visitDate,
    formSchemaSnapshot,
    data,
  } = params;

  // Detect breaches
  const breaches = detectThresholdBreaches(formSchemaSnapshot, data);

  if (breaches.length === 0) {
    return;
  }

  console.log(`[Threshold Breach] Detected ${breaches.length} breach(es) for visit note ${visitNoteId}`);

  // Create ThresholdBreach records
  await prisma.thresholdBreach.createMany({
    data: breaches.map((breach) => ({
      visitNoteId,
      companyId,
      clientId,
      carerId,
      fieldId: breach.fieldId,
      fieldLabel: breach.fieldLabel,
      value: breach.value,
      minThreshold: breach.minThreshold,
      maxThreshold: breach.maxThreshold,
      breachType: breach.breachType,
      customMessage: breach.customMessage,
    })),
  });

  // Get all users to notify (carer + management roles)
  const managementRoles = ["SUPERVISOR", "CLINICAL_DIRECTOR", "OPS_MANAGER", "ADMIN"] as const;

  const managementUsers = await prisma.user.findMany({
    where: {
      companyId,
      role: { in: [...managementRoles] },
      isActive: true,
    },
    select: { id: true },
  });

  // Combine carer and management users (avoid duplicates)
  const recipientIds = [...new Set([carerId, ...managementUsers.map((u) => u.id)])];

  // Generate visit note URL
  const visitNoteUrl = `/visit-notes/${visitNoteId}`;

  // Send notifications for each breach
  for (const breach of breaches) {
    const thresholdType = breach.breachType === "BELOW_MIN" ? "minimum" : "maximum";
    const thresholdValue =
      breach.breachType === "BELOW_MIN" ? breach.minThreshold : breach.maxThreshold;

    await sendNotification({
      eventType: "THRESHOLD_BREACH",
      recipientIds,
      channels: ["EMAIL", "IN_APP"],
      data: {
        clientName,
        carerName,
        visitDate,
        fieldLabel: breach.fieldLabel,
        enteredValue: breach.value.toString(),
        thresholdType,
        thresholdValue: thresholdValue?.toString() || "",
        customMessage: breach.customMessage || "",
        visitNoteUrl,
      },
      relatedEntityType: "VisitNote",
      relatedEntityId: visitNoteId,
    });
  }

  console.log(`[Threshold Breach] Sent notifications to ${recipientIds.length} recipient(s)`);
}
