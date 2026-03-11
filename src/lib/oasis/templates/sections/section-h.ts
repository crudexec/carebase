/**
 * OASIS-E2 Section H: Bladder and Bowel
 */

import type { OasisItemData } from "../../types";

export const SECTION_H_ITEMS: Omit<OasisItemData, "id" | "sectionId">[] = [
  {
    code: "M1600",
    label: "Urinary Tract Infection",
    order: 1,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes - Patient treated for UTI in the past 14 days" },
        { value: "NA", label: "Patient on prophylactic treatment" },
        { value: "UK", label: "Unknown" }
      ]
    },
    helpText: "Has the patient been treated for a urinary tract infection in the past 14 days?"
  },
  {
    code: "M1610",
    label: "Urinary Incontinence or Urinary Catheter Presence",
    order: 2,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "No incontinence or catheter (includes anuria or ostomy for urinary drainage)" },
        { value: "1", label: "Patient is incontinent" },
        { value: "2", label: "Patient requires a urinary catheter (external, indwelling, intermittent, or suprapubic)" }
      ]
    },
    helpText: "Indicate the patient's urinary continence status."
  },
  {
    code: "M1620",
    label: "Bowel Incontinence Frequency",
    order: 3,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "Very rarely or never has bowel incontinence" },
        { value: "1", label: "Less than once weekly" },
        { value: "2", label: "One to three times weekly" },
        { value: "3", label: "Four to six times weekly" },
        { value: "4", label: "On a daily basis" },
        { value: "5", label: "More often than once daily" },
        { value: "NA", label: "Patient has ostomy for bowel elimination" },
        { value: "UK", label: "Unknown" }
      ]
    },
    helpText: "How often does the patient have bowel incontinence?"
  },
  {
    code: "M1630",
    label: "Ostomy for Bowel Elimination",
    order: 4,
    fieldType: "CODE_ENTRY",
    required: true,
    visibleAt: ["SOC", "ROC", "FU", "DC"],
    config: {
      digits: 1,
      options: [
        { value: "0", label: "Patient does not have an ostomy for bowel elimination" },
        { value: "1", label: "Patient has an ostomy for bowel elimination" }
      ]
    }
  }
];
