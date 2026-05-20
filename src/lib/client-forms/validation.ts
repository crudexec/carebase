import { z } from "zod";
import { ClientFormRequestStatus } from "@prisma/client";

export const clientFormTemplateSettingsSchema = z.object({
  access: z.object({
    isPublic: z.boolean(),
    allowAuthenticatedAccess: z.boolean(),
    requireRequestTokenForPublic: z.boolean(),
    allowMultipleSubmissionsPerRequest: z.boolean(),
    defaultExpirationDays: z.number().int().positive().nullable().optional(),
  }),
  display: z.object({
    showClientName: z.boolean(),
    showClientDob: z.boolean(),
    publicTitle: z.string().max(200).nullable().optional(),
    publicDescription: z.string().max(2000).nullable().optional(),
    successMessage: z.string().max(1000).nullable().optional(),
  }),
  collection: z.object({
    collectSubmitterName: z.boolean(),
    collectSubmitterEmail: z.boolean(),
  }),
});

export const createClientFormRequestSchema = z.object({
  clientId: z.string().min(1),
  templateId: z.string().min(1),
  recipientName: z.string().max(200).nullable().optional(),
  recipientEmail: z.string().email().max(320).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  maxSubmissions: z.number().int().positive().nullable().optional(),
});

export const updateClientFormRequestSchema = z.object({
  status: z.nativeEnum(ClientFormRequestStatus).optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  maxSubmissions: z.number().int().positive().nullable().optional(),
  recipientName: z.string().max(200).nullable().optional(),
  recipientEmail: z.string().email().max(320).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export const createAuthenticatedClientFormSubmissionSchema = z.object({
  clientId: z.string().min(1),
  templateId: z.string().min(1),
  data: z.record(z.string(), z.any()),
});

export const createPublicClientFormSubmissionSchema = z.object({
  submitterName: z.string().max(200).nullable().optional(),
  submitterEmail: z.string().email().max(320).nullable().optional(),
  data: z.record(z.string(), z.any()),
});
