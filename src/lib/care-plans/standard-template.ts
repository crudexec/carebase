import { FormFieldType } from "@prisma/client";

interface TemplateField {
  id: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  order: number;
  config: Record<string, unknown> | null;
}

interface TemplateSection {
  id: string;
  title: string;
  description: string | null;
  order: number;
  fields: TemplateField[];
}

interface StandardTemplate {
  id: string;
  name: string;
  description: string | null;
  version: number;
  sections: TemplateSection[];
}

/**
 * Standard Care Plan Template
 * This mirrors the structure of the legacy CarePlanForm for consistency
 */
export const STANDARD_CARE_PLAN_TEMPLATE: StandardTemplate = {
  id: "standard-care-plan",
  name: "Standard Plan of Care",
  description: "Standard care plan form with all required sections",
  version: 1,
  sections: [
    // Section 1: Basic Information
    {
      id: "basic-info",
      title: "Basic Information",
      description: "Certification dates and case management",
      order: 0,
      fields: [
        {
          id: "effectiveDate",
          label: "Effective Date",
          type: "DATE",
          required: true,
          order: 0,
          config: {},
        },
        {
          id: "endDate",
          label: "End Date",
          type: "DATE",
          required: false,
          order: 1,
          config: {},
        },
        {
          id: "certStartDate",
          label: "Certification Start Date",
          type: "DATE",
          required: false,
          order: 2,
          config: {},
        },
        {
          id: "certEndDate",
          label: "Certification End Date",
          type: "DATE",
          required: false,
          order: 3,
          config: {},
        },
        {
          id: "verbalSOCDate",
          label: "Verbal SOC Date",
          type: "DATE",
          required: false,
          order: 4,
          config: {},
        },
        {
          id: "signatureSentDate",
          label: "Signature Sent Date",
          type: "DATE",
          required: false,
          order: 5,
          config: {},
        },
        {
          id: "signatureReceivedDate",
          label: "Signature Received Date",
          type: "DATE",
          required: false,
          order: 6,
          config: {},
        },
      ],
    },
    // Section 2: Physician Information
    {
      id: "physician-info",
      title: "Physician Information",
      description: "Attending physician details",
      order: 1,
      fields: [
        {
          id: "physicianName",
          label: "Physician Name",
          type: "TEXT_SHORT",
          required: false,
          order: 0,
          config: { placeholder: "Enter physician name" },
        },
        {
          id: "physicianNpi",
          label: "NPI Number",
          type: "TEXT_SHORT",
          required: false,
          order: 1,
          config: { placeholder: "Enter NPI number" },
        },
        {
          id: "physicianPhone",
          label: "Phone Number",
          type: "TEXT_SHORT",
          required: false,
          order: 2,
          config: { placeholder: "Enter phone number" },
        },
        {
          id: "physicianFax",
          label: "Fax Number",
          type: "TEXT_SHORT",
          required: false,
          order: 3,
          config: { placeholder: "+1234567890 (E.164 format)" },
        },
      ],
    },
    // Section 3: Diagnoses
    {
      id: "diagnoses",
      title: "Diagnoses (ICD-10)",
      description: "Primary and secondary diagnoses",
      order: 2,
      fields: [
        {
          id: "diagnoses",
          label: "ICD-10 Diagnoses",
          type: "ICD10_DIAGNOSIS",
          required: true,
          order: 0,
          config: {},
        },
      ],
    },
    // Section 4: Medications & Allergies
    {
      id: "medications",
      title: "Medications & Allergies",
      description: "Current medications and known allergies",
      order: 3,
      fields: [
        {
          id: "medications",
          label: "Current Medications",
          type: "TEXT_LONG",
          required: false,
          order: 0,
          config: { placeholder: "List all current medications with dosages and frequency..." },
        },
        {
          id: "allergies",
          label: "Allergies",
          type: "TEXT_LONG",
          required: false,
          order: 1,
          config: { placeholder: "List all known allergies..." },
        },
      ],
    },
    // Section 5: DME / Safety / Nutrition
    {
      id: "dme-safety",
      title: "DME / Safety / Nutrition",
      description: "Equipment, safety measures, and dietary requirements",
      order: 4,
      fields: [
        {
          id: "dmeSupplies",
          label: "DME and Supplies",
          type: "TEXT_LONG",
          required: false,
          order: 0,
          config: { placeholder: "List durable medical equipment and supplies..." },
        },
        {
          id: "safetyMeasures",
          label: "Safety Measures",
          type: "TEXT_LONG",
          required: false,
          order: 1,
          config: { placeholder: "List safety measures and precautions..." },
        },
        {
          id: "nutritionalRequirements",
          label: "Nutritional Requirements",
          type: "TEXT_LONG",
          required: false,
          order: 2,
          config: { placeholder: "Dietary restrictions, requirements, and recommendations..." },
        },
      ],
    },
    // Section 6: Functional Status
    {
      id: "functional-status",
      title: "Functional Status",
      description: "Limitations, activities, and mental status",
      order: 5,
      fields: [
        {
          id: "functionalLimitations",
          label: "Functional Limitations",
          type: "MULTIPLE_CHOICE",
          required: false,
          order: 0,
          config: {
            options: [
              "Amputation",
              "Bowel/Bladder Incontinence",
              "Contracture",
              "Hearing",
              "Paralysis",
              "Endurance",
              "Ambulation",
              "Speech",
              "Legally Blind",
              "Dyspnea with Minimal Exertion",
              "Other",
            ],
          },
        },
        {
          id: "otherFunctionalLimit",
          label: "Other Functional Limitation",
          type: "TEXT_SHORT",
          required: false,
          order: 1,
          config: { placeholder: "Specify if Other selected above" },
        },
        {
          id: "activitiesPermitted",
          label: "Activities Permitted",
          type: "MULTIPLE_CHOICE",
          required: false,
          order: 2,
          config: {
            options: [
              "Complete Bedrest",
              "Bedrest BRP",
              "Up as Tolerated",
              "Transfer Bed/Chair",
              "Exercises Prescribed",
              "Partial Weight Bearing",
              "Independent at Home",
              "Crutches",
              "Cane",
              "Wheelchair",
              "Walker",
              "No Restrictions",
              "Other",
            ],
          },
        },
        {
          id: "otherActivitiesPermit",
          label: "Other Activities Permitted",
          type: "TEXT_SHORT",
          required: false,
          order: 3,
          config: { placeholder: "Specify if Other selected above" },
        },
        {
          id: "mentalStatus",
          label: "Mental Status",
          type: "MULTIPLE_CHOICE",
          required: false,
          order: 4,
          config: {
            options: [
              "Oriented",
              "Comatose",
              "Forgetful",
              "Depressed",
              "Disoriented",
              "Lethargic",
              "Agitated",
              "Other",
            ],
          },
        },
        {
          id: "otherMentalStatus",
          label: "Other Mental Status",
          type: "TEXT_SHORT",
          required: false,
          order: 5,
          config: { placeholder: "Specify if Other selected above" },
        },
        {
          id: "prognosis",
          label: "Prognosis",
          type: "SINGLE_CHOICE",
          required: false,
          order: 6,
          config: {
            options: ["Poor", "Guarded", "Fair", "Good", "Excellent"],
          },
        },
      ],
    },
    // Section 7: Clinical Narratives
    {
      id: "clinical-narratives",
      title: "Clinical Narratives",
      description: "Care preferences, rehab potential, and discharge planning",
      order: 6,
      fields: [
        {
          id: "cognitiveStatus",
          label: "Cognitive Status",
          type: "TEXT_LONG",
          required: false,
          order: 0,
          config: {},
        },
        {
          id: "rehabPotential",
          label: "Rehabilitation Potential",
          type: "TEXT_LONG",
          required: false,
          order: 1,
          config: {},
        },
        {
          id: "homeboundStatus",
          label: "Homebound Status",
          type: "TEXT_LONG",
          required: false,
          order: 2,
          config: {},
        },
        {
          id: "caregiverNeeds",
          label: "Caregiver Needs",
          type: "TEXT_LONG",
          required: false,
          order: 3,
          config: {},
        },
        {
          id: "riskIntervention",
          label: "Risk Interventions",
          type: "TEXT_LONG",
          required: false,
          order: 4,
          config: {},
        },
        {
          id: "advancedDirectives",
          label: "Advanced Directives",
          type: "TEXT_LONG",
          required: false,
          order: 5,
          config: {},
        },
        {
          id: "dischargePlan",
          label: "Discharge Plan",
          type: "TEXT_LONG",
          required: false,
          order: 6,
          config: {},
        },
        {
          id: "carePreferences",
          label: "Care Preferences",
          type: "TEXT_LONG",
          required: false,
          order: 7,
          config: {},
        },
      ],
    },
    // Section 8: Clinical Summary
    {
      id: "clinical-summary",
      title: "Clinical Summary",
      description: "Plan summary and care level",
      order: 7,
      fields: [
        {
          id: "summary",
          label: "Care Plan Summary",
          type: "TEXT_LONG",
          required: false,
          order: 0,
          config: { placeholder: "Provide a comprehensive summary of the care plan..." },
        },
        {
          id: "physicianCertStatement",
          label: "Physician Certification Statement",
          type: "TEXT_LONG",
          required: false,
          order: 1,
          config: { placeholder: "Physician certification statement..." },
        },
        {
          id: "careLevel",
          label: "Care Level",
          type: "SINGLE_CHOICE",
          required: false,
          order: 2,
          config: {
            options: [
              "Skilled Nursing",
              "Personal Care",
              "Companion Care",
              "Respite Care",
              "Hospice Support",
            ],
          },
        },
        {
          id: "recommendedHours",
          label: "Recommended Hours Per Week",
          type: "NUMBER",
          required: false,
          order: 3,
          config: { min: 0, max: 168 },
        },
        {
          id: "internalNotes",
          label: "Internal Notes",
          type: "TEXT_LONG",
          required: false,
          order: 4,
          config: { placeholder: "Notes visible only to staff..." },
        },
      ],
    },
    // Section 9: Signatures
    {
      id: "signatures",
      title: "Signatures",
      description: "Required signatures for care plan approval",
      order: 8,
      fields: [
        {
          id: "nurseSignature",
          label: "Nurse Signature",
          type: "SIGNATURE",
          required: false,
          order: 0,
          config: {},
        },
        {
          id: "clientSignerName",
          label: "Client/Representative Name",
          type: "TEXT_SHORT",
          required: false,
          order: 1,
          config: { placeholder: "Name of signer" },
        },
        {
          id: "clientSignerRelation",
          label: "Relationship to Client",
          type: "SINGLE_CHOICE",
          required: false,
          order: 2,
          config: {
            options: [
              "Self",
              "Spouse",
              "Parent",
              "Child",
              "Sibling",
              "Legal Guardian",
              "Power of Attorney",
              "Other",
            ],
          },
        },
        {
          id: "clientSignature",
          label: "Client/Representative Signature",
          type: "SIGNATURE",
          required: false,
          order: 3,
          config: {},
        },
      ],
    },
  ],
};

/**
 * Convert legacy care plan data to the new form data format
 */
export function convertLegacyCarePlanToFormData(
  carePlan: Record<string, unknown>
): Record<string, unknown> {
  const formData: Record<string, unknown> = {};

  // Map all fields from the legacy format
  const fieldMappings = [
    "effectiveDate",
    "endDate",
    "certStartDate",
    "certEndDate",
    "verbalSOCDate",
    "signatureSentDate",
    "signatureReceivedDate",
    "physicianName",
    "physicianNpi",
    "physicianPhone",
    "physicianFax",
    "medications",
    "allergies",
    "dmeSupplies",
    "safetyMeasures",
    "nutritionalRequirements",
    "functionalLimitations",
    "otherFunctionalLimit",
    "activitiesPermitted",
    "otherActivitiesPermit",
    "mentalStatus",
    "otherMentalStatus",
    "prognosis",
    "cognitiveStatus",
    "rehabPotential",
    "homeboundStatus",
    "caregiverNeeds",
    "riskIntervention",
    "advancedDirectives",
    "dischargePlan",
    "carePreferences",
    "summary",
    "physicianCertStatement",
    "careLevel",
    "recommendedHours",
    "internalNotes",
    "nurseSignature",
    "clientSignerName",
    "clientSignerRelation",
    "clientSignature",
  ];

  for (const field of fieldMappings) {
    if (carePlan[field] !== undefined && carePlan[field] !== null) {
      // Handle date fields - extract just the date part
      if (field.includes("Date") && typeof carePlan[field] === "string") {
        formData[field] = (carePlan[field] as string).split("T")[0];
      } else {
        formData[field] = carePlan[field];
      }
    }
  }

  // Convert diagnoses array to ICD10DiagnosisValue format
  const diagnoses = carePlan.diagnoses as Array<{
    icdCode: string;
    icdDescription: string;
    diagnosisType: string;
  }> | undefined;

  if (diagnoses && Array.isArray(diagnoses)) {
    formData.diagnoses = diagnoses.map((d) => ({
      code: d.icdCode,
      description: d.icdDescription,
      type: d.diagnosisType as "PRIMARY" | "SECONDARY" | "ADMITTING" | "PRINCIPAL",
    }));
  }

  return formData;
}
