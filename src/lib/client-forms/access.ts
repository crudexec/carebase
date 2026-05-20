import { ClientFormRequestStatus } from "@prisma/client";
import type { ClientFormTemplateSettings } from "@/lib/client-forms/types";

export function isRequestExpired(expiresAt: Date | null | undefined): boolean {
  return Boolean(expiresAt && expiresAt.getTime() < Date.now());
}

export function resolveRequestStatus(
  status: ClientFormRequestStatus,
  expiresAt: Date | null | undefined
): ClientFormRequestStatus {
  if (status === "ACTIVE" && isRequestExpired(expiresAt)) {
    return "EXPIRED";
  }

  return status;
}

export function canUseRequest(
  status: ClientFormRequestStatus,
  expiresAt: Date | null | undefined,
  maxSubmissions: number | null | undefined,
  submissionCount: number
): { allowed: boolean; reason?: string } {
  const effectiveStatus = resolveRequestStatus(status, expiresAt);

  if (effectiveStatus === "REVOKED") {
    return { allowed: false, reason: "This link has been revoked." };
  }

  if (effectiveStatus === "EXPIRED") {
    return { allowed: false, reason: "This link has expired." };
  }

  if (effectiveStatus === "USED" && (!maxSubmissions || maxSubmissions <= 1)) {
    return { allowed: false, reason: "This link has already been used." };
  }

  if (maxSubmissions && submissionCount >= maxSubmissions) {
    return { allowed: false, reason: "This link has reached its submission limit." };
  }

  return { allowed: true };
}

export function assertTemplateSupportsPublicAccess(settings: ClientFormTemplateSettings): {
  allowed: boolean;
  reason?: string;
} {
  if (!settings.access.isPublic) {
    return { allowed: false, reason: "This form is not configured for public access." };
  }

  if (!settings.access.requireRequestTokenForPublic) {
    return { allowed: false, reason: "This form requires a configured public request." };
  }

  return { allowed: true };
}
