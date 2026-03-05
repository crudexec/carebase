import { z } from "zod";
import {
  MedicationStatus,
  MedicationRoute,
  MedicationFrequency,
  ControlledSubstanceSchedule,
  AdministrationResult,
  RefillRequestStatus,
} from "@prisma/client";

// ============================================
// MEDICATION VALIDATION SCHEMAS
// ============================================

export const createMedicationSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  genericName: z.string().optional(),
  ndc: z.string().optional(),
  strength: z.string().min(1, "Strength is required"),
  form: z.string().min(1, "Form is required"),
  route: z.nativeEnum(MedicationRoute),
  doseAmount: z.string().min(1, "Dose amount is required"),
  frequency: z.nativeEnum(MedicationFrequency),
  frequencyOther: z.string().optional(),
  scheduledTimes: z.array(z.string()).default([]),
  prnReason: z.string().optional(),
  maxDailyDoses: z.number().int().positive().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  controlledSchedule: z
    .nativeEnum(ControlledSubstanceSchedule)
    .default("NOT_CONTROLLED"),
  requiresWitness: z.boolean().default(false),
  prescriberId: z.string().optional(),
  prescriptionNumber: z.string().optional(),
  lastFillDate: z.coerce.date().optional(),
  refillsRemaining: z.number().int().min(0).optional(),
  indication: z.string().optional(),
  specialInstructions: z.string().optional(),
  interactions: z.array(z.string()).default([]),
  sideEffects: z.array(z.string()).default([]),
  clientId: z.string().min(1, "Client is required"),
});

export const updateMedicationSchema = createMedicationSchema.partial().extend({
  status: z.nativeEnum(MedicationStatus).optional(),
});

export const discontinueMedicationSchema = z.object({
  reason: z.string().min(1, "Discontinuation reason is required"),
});

export const holdMedicationSchema = z.object({
  reason: z.string().optional(),
});

// ============================================
// ADMINISTRATION VALIDATION SCHEMAS
// ============================================

export const createAdministrationSchema = z.object({
  scheduledDoseId: z.string().optional(),
  medicationId: z.string().min(1, "Medication is required"),
  clientId: z.string().min(1, "Client is required"),
  shiftId: z.string().optional(),
  scheduledTime: z.coerce.date(),
  administeredAt: z.coerce.date().optional(),
  result: z.nativeEnum(AdministrationResult),
  resultNotes: z.string().optional(),
  amountGiven: z.string().optional(),
  witnessId: z.string().optional(),
  witnessSignature: z.string().optional(),
  administrationSite: z.string().optional(),
  vitalsBeforeAdmin: z
    .object({
      bloodPressureSystolic: z.number().int().min(0).max(300).optional(),
      bloodPressureDiastolic: z.number().int().min(0).max(200).optional(),
      pulse: z.number().int().min(0).max(300).optional(),
      temperature: z.number().min(90).max(110).optional(),
      respiratoryRate: z.number().int().min(0).max(100).optional(),
      oxygenSaturation: z.number().int().min(0).max(100).optional(),
    })
    .optional(),
  prnAssessment: z.string().optional(),
  prnFollowupTime: z.coerce.date().optional(),
});

export const prnFollowupSchema = z.object({
  prnFollowupAssessment: z.string().min(1, "Follow-up assessment is required"),
  prnEffective: z.boolean(),
});

// ============================================
// NARCOTIC COUNT VALIDATION SCHEMAS
// ============================================

export const createNarcoticCountSchema = z.object({
  inventoryId: z.string().min(1, "Inventory item is required"),
  shiftType: z.enum(["DAY", "EVENING", "NIGHT"]),
  previousCount: z.number().int().min(0),
  currentCount: z.number().int().min(0),
  expectedCount: z.number().int().min(0),
  countedBySignature: z.string().optional(),
});

export const verifyNarcoticCountSchema = z.object({
  verifiedBySignature: z.string().min(1, "Witness signature is required"),
  discrepancyNotes: z.string().optional(),
});

export const resolveDiscrepancySchema = z.object({
  discrepancyResolution: z
    .string()
    .min(1, "Resolution explanation is required"),
});

// ============================================
// INVENTORY VALIDATION SCHEMAS
// ============================================

export const updateInventorySchema = z.object({
  quantityOnHand: z.number().int().min(0),
  lotNumber: z.string().optional(),
  expirationDate: z.coerce.date().optional(),
  lowInventoryThreshold: z.number().int().min(0).optional(),
});

// ============================================
// REFILL REQUEST VALIDATION SCHEMAS
// ============================================

export const createRefillRequestSchema = z.object({
  medicationId: z.string().min(1, "Medication is required"),
  clientId: z.string().min(1, "Client is required"),
  quantityRequested: z.number().int().positive().optional(),
  requestNotes: z.string().optional(),
  pharmacyName: z.string().optional(),
  pharmacyPhone: z.string().optional(),
  pharmacyFax: z.string().optional(),
});

export const updateRefillRequestSchema = z.object({
  status: z.nativeEnum(RefillRequestStatus).optional(),
  responseNotes: z.string().optional(),
  orderedAt: z.coerce.date().optional(),
  expectedDelivery: z.coerce.date().optional(),
  receivedAt: z.coerce.date().optional(),
  quantityReceived: z.number().int().positive().optional(),
});

// ============================================
// QUERY PARAMETER SCHEMAS
// ============================================

export const medicationsQuerySchema = z.object({
  clientId: z.string().nullable().optional(),
  status: z.preprocess(
    (val) => (val === "all" || val === "" || val === null ? undefined : val),
    z.nativeEnum(MedicationStatus).optional()
  ),
  controlledOnly: z.preprocess(
    (val) => val === "true" || val === true,
    z.boolean().optional()
  ),
  withoutInventory: z.preprocess(
    (val) => val === "true" || val === true,
    z.boolean().optional()
  ),
  search: z.string().nullable().optional(),
  page: z.preprocess(
    (val) => (val === null || val === "" ? 1 : val),
    z.coerce.number().int().positive().default(1)
  ),
  limit: z.preprocess(
    (val) => (val === null || val === "" ? 20 : val),
    z.coerce.number().int().positive().max(100).default(20)
  ),
});

export const medPassQuerySchema = z.object({
  clientId: z.string().optional(),
  shiftId: z.string().optional(),
  date: z.coerce.date().optional(),
});

export const administrationsQuerySchema = z.object({
  clientId: z.string().optional(),
  medicationId: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  result: z.nativeEnum(AdministrationResult).optional(),
  page: z.preprocess(
    (val) => (val === null || val === "" ? 1 : val),
    z.coerce.number().int().positive().default(1)
  ),
  limit: z.preprocess(
    (val) => (val === null || val === "" ? 20 : val),
    z.coerce.number().int().positive().max(100).default(20)
  ),
});

export const refillsQuerySchema = z.object({
  clientId: z.string().nullish().transform(val => val || undefined),
  medicationId: z.string().nullish().transform(val => val || undefined),
  status: z.string().nullish().transform(val => {
    if (!val || val === "") return undefined;
    return val as RefillRequestStatus;
  }).pipe(z.nativeEnum(RefillRequestStatus).optional()),
  page: z.coerce.number().int().positive().default(1).catch(1),
  limit: z.coerce.number().int().positive().max(100).default(20).catch(20),
});

// Type exports
export type CreateMedicationInput = z.infer<typeof createMedicationSchema>;
export type UpdateMedicationInput = z.infer<typeof updateMedicationSchema>;
export type CreateAdministrationInput = z.infer<
  typeof createAdministrationSchema
>;
export type CreateRefillRequestInput = z.infer<
  typeof createRefillRequestSchema
>;
export type MedicationsQuery = z.infer<typeof medicationsQuerySchema>;
export type MedPassQuery = z.infer<typeof medPassQuerySchema>;
