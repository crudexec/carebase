/**
 * OASIS-E2 Full Template
 * Complete template combining all sections for OASIS-E2 assessments
 */

import { SECTION_A_ITEMS } from "./sections/section-a";
import { SECTION_B_ITEMS } from "./sections/section-b";
import { SECTION_C_ITEMS } from "./sections/section-c";
import { SECTION_D_ITEMS } from "./sections/section-d";
import { SECTION_GG_ITEMS } from "./sections/section-gg";
import { SECTION_H_ITEMS } from "./sections/section-h";
import { SECTION_J_ITEMS } from "./sections/section-j";
import { SECTION_M_ITEMS } from "./sections/section-m";
import { SECTION_N_ITEMS } from "./sections/section-n";
import { SECTION_O_ITEMS } from "./sections/section-o";
import type { OasisTimePoint } from "../types";

export interface OasisTemplateSection {
  code: string;
  name: string;
  description: string;
  order: number;
  items: typeof SECTION_A_ITEMS;
}

export interface OasisTemplate {
  id: string;
  name: string;
  version: string;
  effectiveDate: string;
  description: string;
  sections: OasisTemplateSection[];
}

/**
 * All OASIS-E2 sections with their metadata
 */
export const OASIS_E2_SECTIONS: OasisTemplateSection[] = [
  {
    code: "A",
    name: "Administrative Information",
    description: "Patient identification and assessment information including demographics, Medicare/Medicaid numbers, and assessment dates.",
    order: 1,
    items: SECTION_A_ITEMS
  },
  {
    code: "B",
    name: "Patient History and Diagnoses",
    description: "Patient diagnoses, risk factors, inpatient stays, and therapies at home.",
    order: 2,
    items: SECTION_B_ITEMS
  },
  {
    code: "C",
    name: "Cognitive Patterns",
    description: "Brief Interview for Mental Status (BIMS), cognitive functioning, and memory assessment.",
    order: 3,
    items: SECTION_C_ITEMS
  },
  {
    code: "D",
    name: "Mood",
    description: "Patient Health Questionnaire (PHQ-2 to PHQ-9) for depression screening.",
    order: 4,
    items: SECTION_D_ITEMS
  },
  {
    code: "GG",
    name: "Functional Abilities and Goals",
    description: "Self-care and mobility abilities, including prior functioning and discharge goals.",
    order: 5,
    items: SECTION_GG_ITEMS
  },
  {
    code: "H",
    name: "Bladder and Bowel",
    description: "Urinary and bowel continence status, including catheter use and ostomy presence.",
    order: 6,
    items: SECTION_H_ITEMS
  },
  {
    code: "J",
    name: "Health Conditions",
    description: "Pain assessment, falls, pressure ulcers, wounds, and respiratory status.",
    order: 7,
    items: SECTION_J_ITEMS
  },
  {
    code: "M",
    name: "Skin Conditions",
    description: "Detailed pressure ulcer/injury staging and tracking.",
    order: 8,
    items: SECTION_M_ITEMS
  },
  {
    code: "N",
    name: "Medications",
    description: "High-risk drug classes, drug regimen review, and medication management abilities.",
    order: 9,
    items: SECTION_N_ITEMS
  },
  {
    code: "O",
    name: "Special Treatments and Interventions",
    description: "Special treatments (chemotherapy, IV, dialysis, oxygen, etc.), assistance types, therapy needs, and emergent care.",
    order: 10,
    items: SECTION_O_ITEMS
  }
];

/**
 * Full OASIS-E2 Template Definition
 */
export const OASIS_E2_TEMPLATE: OasisTemplate = {
  id: "oasis-e2",
  name: "OASIS-E2",
  version: "E2",
  effectiveDate: "2023-01-01",
  description: "Outcome and Assessment Information Set (OASIS-E2) for Home Health Agencies. Effective January 1, 2023.",
  sections: OASIS_E2_SECTIONS
};

/**
 * Get items for a specific time point
 */
export function getItemsForTimePoint(timePoint: OasisTimePoint): typeof SECTION_A_ITEMS {
  const allItems: typeof SECTION_A_ITEMS = [];

  for (const section of OASIS_E2_SECTIONS) {
    for (const item of section.items) {
      if (item.visibleAt.includes(timePoint)) {
        allItems.push(item);
      }
    }
  }

  return allItems;
}

/**
 * Get total item count
 */
export function getTotalItemCount(): number {
  return OASIS_E2_SECTIONS.reduce((total, section) => total + section.items.length, 0);
}

/**
 * Get section by code
 */
export function getSectionByCode(code: string): OasisTemplateSection | undefined {
  return OASIS_E2_SECTIONS.find(s => s.code === code);
}

/**
 * Get item by code
 */
export function getItemByCode(code: string): typeof SECTION_A_ITEMS[0] | undefined {
  for (const section of OASIS_E2_SECTIONS) {
    const item = section.items.find(i => i.code === code);
    if (item) return item;
  }
  return undefined;
}

/**
 * Create OASIS-E2 template data for database seeding
 */
export function createOasisE2Template() {
  return {
    name: OASIS_E2_TEMPLATE.name,
    version: OASIS_E2_TEMPLATE.version,
    description: OASIS_E2_TEMPLATE.description,
    effectiveDate: new Date(OASIS_E2_TEMPLATE.effectiveDate),
    status: "ACTIVE" as const,
    isDefault: true,
    sections: OASIS_E2_SECTIONS.map(section => ({
      code: section.code,
      name: section.name,
      description: section.description,
      order: section.order,
      items: section.items.map((item, index) => ({
        code: item.code,
        label: item.label,
        description: item.description || null,
        helpText: item.helpText || null,
        fieldType: item.fieldType,
        required: item.required,
        order: item.order || index + 1,
        visibleAt: item.visibleAt,
        config: item.config || {},
        skipLogic: item.skipLogic || [],
        validation: null
      }))
    }))
  };
}

/**
 * Summary statistics for the template
 */
export const OASIS_E2_STATS = {
  totalSections: OASIS_E2_SECTIONS.length,
  totalItems: getTotalItemCount(),
  itemsBySection: OASIS_E2_SECTIONS.map(s => ({
    code: s.code,
    name: s.name,
    itemCount: s.items.length
  })),
  itemsByTimePoint: {
    SOC: getItemsForTimePoint("SOC").length,
    ROC: getItemsForTimePoint("ROC").length,
    FU: getItemsForTimePoint("FU").length,
    TRN: getItemsForTimePoint("TRN").length,
    DC: getItemsForTimePoint("DC").length,
    DAH: getItemsForTimePoint("DAH").length
  }
};
