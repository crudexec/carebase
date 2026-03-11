import {
  Medication,
  ScheduledDose,
  MedicationAdministration,
  RefillRequest,
  MedicationStatus,
  MedicationRoute,
  MedicationFrequency,
  ControlledSubstanceSchedule,
  AdministrationResult,
  MedPassStatus,
  NarcoticCountStatus,
  RefillRequestStatus,
  Client,
  User,
  Physician,
  Shift,
} from "@prisma/client";

// Re-export enums for convenience
export {
  MedicationStatus,
  MedicationRoute,
  MedicationFrequency,
  ControlledSubstanceSchedule,
  AdministrationResult,
  MedPassStatus,
  NarcoticCountStatus,
  RefillRequestStatus,
};

// ============================================
// RXNORM SEARCH TYPES
// ============================================

export interface MedicationSearchResult {
  rxcui: string;
  name: string;           // Full drug name e.g., "Lipitor 10 MG Oral Tablet"
  genericName: string;    // Generic name e.g., "atorvastatin calcium"
  strength: string;       // Strength e.g., "10 MG"
  form: string;           // Form e.g., "Tablet"
  route: MedicationRoute; // Mapped route e.g., ORAL
}

// ============================================
// MEDICATION TYPES
// ============================================

export interface MedicationWithRelations extends Medication {
  client: Pick<Client, "id" | "firstName" | "lastName">;
  prescriber?: Pick<Physician, "id" | "firstName" | "lastName" | "npi"> | null;
  discontinuedBy?: Pick<User, "id" | "firstName" | "lastName"> | null;
  _count?: {
    scheduledDoses: number;
    administrations: number;
    refillRequests: number;
  };
}

export interface MedicationListItem {
  id: string;
  name: string;
  genericName: string | null;
  strength: string;
  form: string;
  route: MedicationRoute;
  status: MedicationStatus;
  frequency: MedicationFrequency;
  scheduledTimes: string[];
  controlledSchedule: ControlledSubstanceSchedule;
  startDate: Date;
  endDate: Date | null;
  clientId: string;
  clientName: string;
  prescriberName: string | null;
}

export interface MedicationFormData {
  name: string;
  genericName?: string;
  ndc?: string;
  strength: string;
  form: string;
  route: MedicationRoute;
  doseAmount: string;
  frequency: MedicationFrequency;
  frequencyOther?: string;
  scheduledTimes: string[];
  prnReason?: string;
  maxDailyDoses?: number;
  startDate: Date;
  endDate?: Date;
  controlledSchedule: ControlledSubstanceSchedule;
  requiresWitness?: boolean;
  prescriberId?: string;
  prescriptionNumber?: string;
  lastFillDate?: Date;
  refillsRemaining?: number;
  indication?: string;
  specialInstructions?: string;
  interactions?: string[];
  sideEffects?: string[];
  clientId: string;
}

// ============================================
// SCHEDULED DOSE TYPES
// ============================================

export interface ScheduledDoseWithRelations extends ScheduledDose {
  medication: Pick<
    Medication,
    | "id"
    | "name"
    | "strength"
    | "form"
    | "route"
    | "doseAmount"
    | "controlledSchedule"
    | "requiresWitness"
    | "specialInstructions"
  >;
  shift?: Pick<Shift, "id" | "carerId"> | null;
  administration?: MedicationAdministration | null;
}

export interface MedPassDose {
  id: string;
  scheduledTime: Date;
  windowStart: Date;
  windowEnd: Date;
  status: MedPassStatus;
  medication: {
    id: string;
    name: string;
    strength: string;
    form: string;
    route: MedicationRoute;
    doseAmount: string;
    controlledSchedule: ControlledSubstanceSchedule;
    requiresWitness: boolean;
    specialInstructions: string | null;
  };
  client: {
    id: string;
    firstName: string;
    lastName: string;
  };
  administration?: {
    id: string;
    result: AdministrationResult;
    administeredAt: Date | null;
  } | null;
}

// ============================================
// ADMINISTRATION TYPES
// ============================================

export interface AdministrationFormData {
  scheduledDoseId?: string;
  medicationId: string;
  clientId: string;
  shiftId?: string;
  scheduledTime: Date;
  administeredAt?: Date;
  result: AdministrationResult;
  resultNotes?: string;
  amountGiven?: string;
  witnessId?: string;
  witnessSignature?: string;
  administrationSite?: string;
  vitalsBeforeAdmin?: {
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    pulse?: number;
    temperature?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
  };
  // PRN fields
  prnAssessment?: string;
  prnFollowupTime?: Date;
}

export interface AdministrationWithRelations extends MedicationAdministration {
  medication: Pick<Medication, "id" | "name" | "strength" | "form" | "route">;
  client: Pick<Client, "id" | "firstName" | "lastName">;
  administeredBy?: Pick<User, "id" | "firstName" | "lastName"> | null;
  witness?: Pick<User, "id" | "firstName" | "lastName"> | null;
  scheduledDose?: ScheduledDose | null;
}

// ============================================
// NARCOTIC COUNT TYPES
// ============================================

export interface NarcoticCountFormData {
  inventoryId: string;
  shiftType: "DAY" | "EVENING" | "NIGHT";
  previousCount: number;
  currentCount: number;
  expectedCount: number;
  countedBySignature?: string;
}

export interface NarcoticCountVerifyData {
  verifiedBySignature: string;
  discrepancyNotes?: string;
}

export interface NarcoticInventoryItem {
  id: string;
  medicationId: string;
  medicationName: string;
  medicationStrength: string;
  controlledSchedule: ControlledSubstanceSchedule;
  quantityOnHand: number;
  lotNumber: string | null;
  expirationDate: Date | null;
  lastVerifiedAt: Date;
  lastVerifiedByName: string;
}

// ============================================
// REFILL REQUEST TYPES
// ============================================

export interface RefillRequestFormData {
  medicationId: string;
  clientId: string;
  quantityRequested?: number;
  requestNotes?: string;
  pharmacyName?: string;
  pharmacyPhone?: string;
  pharmacyFax?: string;
}

export interface RefillRequestWithRelations extends RefillRequest {
  medication: Pick<Medication, "id" | "name" | "strength" | "form">;
  client: Pick<Client, "id" | "firstName" | "lastName">;
  requestedBy: Pick<User, "id" | "firstName" | "lastName">;
  respondedBy?: Pick<User, "id" | "firstName" | "lastName"> | null;
  receivedBy?: Pick<User, "id" | "firstName" | "lastName"> | null;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface MedicationsListResponse {
  medications: MedicationListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MedPassResponse {
  date: string;
  timeSlots: {
    label: string;
    startHour: number;
    endHour: number;
    doses: MedPassDose[];
  }[];
  stats: {
    total: number;
    pending: number;
    completed: number;
    missed: number;
  };
}

// ============================================
// UI HELPER TYPES
// ============================================

export const MEDICATION_ROUTE_LABELS: Record<MedicationRoute, string> = {
  ORAL: "Oral",
  TOPICAL: "Topical",
  INJECTION_IM: "Injection (IM)",
  INJECTION_SC: "Injection (SC)",
  INJECTION_IV: "Injection (IV)",
  INHALATION: "Inhalation",
  SUBLINGUAL: "Sublingual",
  RECTAL: "Rectal",
  OPHTHALMIC: "Ophthalmic (Eye)",
  OTIC: "Otic (Ear)",
  NASAL: "Nasal",
  TRANSDERMAL: "Transdermal (Patch)",
  OTHER: "Other",
};

export const MEDICATION_FREQUENCY_LABELS: Record<MedicationFrequency, string> =
  {
    ONCE_DAILY: "Once Daily",
    TWICE_DAILY: "Twice Daily (BID)",
    THREE_TIMES_DAILY: "Three Times Daily (TID)",
    FOUR_TIMES_DAILY: "Four Times Daily (QID)",
    EVERY_4_HOURS: "Every 4 Hours",
    EVERY_6_HOURS: "Every 6 Hours",
    EVERY_8_HOURS: "Every 8 Hours",
    EVERY_12_HOURS: "Every 12 Hours",
    WEEKLY: "Weekly",
    MONTHLY: "Monthly",
    AS_NEEDED_PRN: "As Needed (PRN)",
    BEFORE_MEALS: "Before Meals",
    AFTER_MEALS: "After Meals",
    AT_BEDTIME: "At Bedtime",
    OTHER: "Other",
  };

export const MEDICATION_STATUS_LABELS: Record<MedicationStatus, string> = {
  ACTIVE: "Active",
  ON_HOLD: "On Hold",
  DISCONTINUED: "Discontinued",
  COMPLETED: "Completed",
};

export const CONTROLLED_SCHEDULE_LABELS: Record<
  ControlledSubstanceSchedule,
  string
> = {
  NOT_CONTROLLED: "Not Controlled",
  SCHEDULE_II: "Schedule II",
  SCHEDULE_III: "Schedule III",
  SCHEDULE_IV: "Schedule IV",
  SCHEDULE_V: "Schedule V",
};

export const ADMINISTRATION_RESULT_LABELS: Record<AdministrationResult, string> =
  {
    GIVEN: "Given",
    HELD: "Held",
    REFUSED: "Refused",
    NOT_AVAILABLE: "Not Available",
    SELF_ADMINISTERED: "Self-Administered",
    DESTROYED: "Destroyed",
    WASTED: "Wasted",
  };

export const MED_PASS_STATUS_LABELS: Record<MedPassStatus, string> = {
  PENDING: "Pending",
  COMPLETED: "Completed",
  MISSED: "Missed",
  LATE: "Late",
};

export const REFILL_STATUS_LABELS: Record<RefillRequestStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  DENIED: "Denied",
  ORDERED: "Ordered",
  RECEIVED: "Received",
  CANCELLED: "Cancelled",
};

// Time slots for Med Pass grouping
export const MED_PASS_TIME_SLOTS = [
  { label: "Morning", startHour: 6, endHour: 12 },
  { label: "Afternoon", startHour: 12, endHour: 18 },
  { label: "Evening", startHour: 18, endHour: 22 },
  { label: "Night", startHour: 22, endHour: 6 },
] as const;
