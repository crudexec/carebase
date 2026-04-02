/**
 * Terminology customization system
 *
 * Allows companies to customize labels for key terms throughout the app
 * to match their care model (e.g., "Visit Notes" vs "Daily Reports")
 */

// ============================================
// TYPES
// ============================================

export type TerminologyKey = "visitNote" | "client" | "carer" | "shift";

export interface TermOption {
  singular: string;
  plural: string;
}

export type TerminologySettings = {
  [K in TerminologyKey]?: string; // The option key (e.g., "daily_report", "patient")
};

// ============================================
// TERMINOLOGY OPTIONS
// ============================================

export const TERMINOLOGY_OPTIONS: Record<TerminologyKey, Record<string, TermOption>> = {
  visitNote: {
    visit_note: { singular: "Visit Note", plural: "Visit Notes" },
    daily_report: { singular: "Daily Report", plural: "Daily Reports" },
  },
  client: {
    client: { singular: "Client", plural: "Clients" },
    patient: { singular: "Patient", plural: "Patients" },
    resident: { singular: "Resident", plural: "Residents" },
  },
  carer: {
    carer: { singular: "Carer", plural: "Carers" },
    caregiver: { singular: "Caregiver", plural: "Caregivers" },
    staff_member: { singular: "Staff Member", plural: "Staff Members" },
  },
  shift: {
    shift: { singular: "Shift", plural: "Shifts" },
    visit: { singular: "Visit", plural: "Visits" },
    appointment: { singular: "Appointment", plural: "Appointments" },
  },
};

// ============================================
// DEFAULT OPTIONS
// ============================================

export const DEFAULT_TERMINOLOGY: Record<TerminologyKey, string> = {
  visitNote: "visit_note",
  client: "client",
  carer: "carer",
  shift: "shift",
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get the term for a given key, using company settings or defaults
 */
export function getTerm(
  key: TerminologyKey,
  plural: boolean = false,
  settings?: TerminologySettings | null
): string {
  const optionKey = settings?.[key] || DEFAULT_TERMINOLOGY[key];
  const option = TERMINOLOGY_OPTIONS[key][optionKey] || TERMINOLOGY_OPTIONS[key][DEFAULT_TERMINOLOGY[key]];
  return plural ? option.plural : option.singular;
}

/**
 * Get all terms as an object for easy access
 */
export function getTerms(settings?: TerminologySettings | null): Record<TerminologyKey, TermOption> {
  return {
    visitNote: {
      singular: getTerm("visitNote", false, settings),
      plural: getTerm("visitNote", true, settings),
    },
    client: {
      singular: getTerm("client", false, settings),
      plural: getTerm("client", true, settings),
    },
    carer: {
      singular: getTerm("carer", false, settings),
      plural: getTerm("carer", true, settings),
    },
    shift: {
      singular: getTerm("shift", false, settings),
      plural: getTerm("shift", true, settings),
    },
  };
}

/**
 * Get display name for a terminology category (for settings UI)
 */
export function getTerminologyCategoryLabel(key: TerminologyKey): string {
  const labels: Record<TerminologyKey, string> = {
    visitNote: "Visit Notes / Daily Reports",
    client: "Clients / Patients / Residents",
    carer: "Carers / Caregivers / Staff",
    shift: "Shifts / Visits / Appointments",
  };
  return labels[key];
}

/**
 * Get description for a terminology category (for settings UI)
 */
export function getTerminologyCategoryDescription(key: TerminologyKey): string {
  const descriptions: Record<TerminologyKey, string> = {
    visitNote: "What do you call the daily documentation submitted by caregivers?",
    client: "What do you call the people receiving care?",
    carer: "What do you call the people providing care?",
    shift: "What do you call scheduled care periods?",
  };
  return descriptions[key];
}

/**
 * Validate terminology settings
 */
export function validateTerminologySettings(settings: unknown): settings is TerminologySettings {
  if (!settings || typeof settings !== "object") {
    return true; // null/undefined is valid (uses defaults)
  }

  const validKeys: TerminologyKey[] = ["visitNote", "client", "carer", "shift"];

  for (const [key, value] of Object.entries(settings)) {
    if (!validKeys.includes(key as TerminologyKey)) {
      return false;
    }
    if (typeof value !== "string") {
      return false;
    }
    if (!TERMINOLOGY_OPTIONS[key as TerminologyKey][value]) {
      return false;
    }
  }

  return true;
}

/**
 * Get all option keys for a terminology category
 */
export function getTerminologyOptionKeys(key: TerminologyKey): string[] {
  return Object.keys(TERMINOLOGY_OPTIONS[key]);
}
