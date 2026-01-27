/**
 * Seed script for Skilled Nursing Visit Note Template
 *
 * This creates a comprehensive form template for skilled nursing visits,
 * based on the alto SN note structure but using carebase's FormTemplate system.
 *
 * Run with: npx tsx prisma/seeds/skilled-nursing-template.ts
 */

import { PrismaClient, FormFieldType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Creating Skilled Nursing Visit Note Template...");

  // Get the default company and admin user
  const company = await prisma.company.findFirst();
  const adminUser = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (!company || !adminUser) {
    console.error("No company or admin user found. Please run main seed first.");
    process.exit(1);
  }

  // Check if template already exists
  const existing = await prisma.formTemplate.findFirst({
    where: {
      name: "Skilled Nursing Visit Note",
      companyId: company.id,
    },
  });

  if (existing) {
    console.log("Template already exists, deleting and recreating...");
    await prisma.formTemplate.delete({ where: { id: existing.id } });
  }

  // Create the template
  const template = await prisma.formTemplate.create({
    data: {
      name: "Skilled Nursing Visit Note",
      description: "Comprehensive skilled nursing visit documentation including vital signs, assessments, interventions, and care coordination.",
      type: "VISIT_NOTE",
      status: "ACTIVE",
      version: 1,
      isEnabled: true,
      companyId: company.id,
      createdById: adminUser.id,
      sections: {
        create: [
          // Section 1: Visit Information
          {
            title: "Visit Information",
            description: "Basic visit details and type",
            order: 1,
            fields: {
              create: [
                {
                  label: "Visit Date",
                  type: FormFieldType.DATE,
                  required: true,
                  order: 1,
                },
                {
                  label: "Start Time",
                  type: FormFieldType.TIME,
                  required: true,
                  order: 2,
                },
                {
                  label: "End Time",
                  type: FormFieldType.TIME,
                  required: true,
                  order: 3,
                },
                {
                  label: "Visit Type",
                  type: FormFieldType.SINGLE_CHOICE,
                  required: true,
                  order: 4,
                  config: {
                    options: [
                      { value: "skilled-nursing", label: "Skilled Nursing" },
                      { value: "sn-supervisory", label: "SN and Supervisory" },
                      { value: "supervisory", label: "Supervisory" },
                      { value: "discharge", label: "Discharge" },
                      { value: "telehealth", label: "Telehealth Visit" },
                      { value: "other", label: "Other" },
                    ],
                  },
                },
                {
                  label: "Homebound Reason",
                  type: FormFieldType.MULTIPLE_CHOICE,
                  required: false,
                  order: 5,
                  config: {
                    options: [
                      { value: "requires-assistance", label: "Requires assistance for most/all ADLs" },
                      { value: "unsafe-to-leave", label: "Unsafe to leave home unassisted" },
                      { value: "bedridden", label: "Patient is bedridden" },
                      { value: "medical-restriction", label: "Medical restrictions" },
                      { value: "taxing-effort", label: "Taxing effort to leave home" },
                      { value: "dependent-device", label: "Dependent upon supportive device(s)" },
                      { value: "sob-exertion", label: "SOB on exertion" },
                    ],
                  },
                },
                {
                  label: "Homebound Comments",
                  type: FormFieldType.TEXT_LONG,
                  required: false,
                  order: 6,
                },
              ],
            },
          },

          // Section 2: Vital Signs
          {
            title: "Vital Signs",
            description: "Patient vital signs measurements",
            order: 2,
            fields: {
              create: [
                {
                  label: "Temperature",
                  description: "Temperature in Fahrenheit",
                  type: FormFieldType.NUMBER,
                  required: false,
                  order: 1,
                  config: { min: 90, max: 110, step: 0.1, suffix: "°F" },
                },
                {
                  label: "Temperature Method",
                  type: FormFieldType.SINGLE_CHOICE,
                  required: false,
                  order: 2,
                  config: {
                    options: [
                      { value: "oral", label: "Oral" },
                      { value: "axillary", label: "Axillary" },
                      { value: "rectal", label: "Rectal" },
                      { value: "tympanic", label: "Tympanic" },
                    ],
                  },
                },
                {
                  label: "Pulse",
                  description: "Beats per minute",
                  type: FormFieldType.NUMBER,
                  required: false,
                  order: 3,
                  config: { min: 30, max: 200, suffix: "bpm" },
                },
                {
                  label: "Pulse Type",
                  type: FormFieldType.SINGLE_CHOICE,
                  required: false,
                  order: 4,
                  config: {
                    options: [
                      { value: "radial", label: "Radial" },
                      { value: "apical", label: "Apical" },
                      { value: "brachial", label: "Brachial" },
                    ],
                  },
                },
                {
                  label: "Pulse Rhythm",
                  type: FormFieldType.SINGLE_CHOICE,
                  required: false,
                  order: 5,
                  config: {
                    options: [
                      { value: "regular", label: "Regular" },
                      { value: "irregular", label: "Irregular" },
                    ],
                  },
                },
                {
                  label: "Respirations",
                  description: "Breaths per minute",
                  type: FormFieldType.NUMBER,
                  required: false,
                  order: 6,
                  config: { min: 5, max: 60, suffix: "breaths/min" },
                },
                {
                  label: "Respiration Pattern",
                  type: FormFieldType.SINGLE_CHOICE,
                  required: false,
                  order: 7,
                  config: {
                    options: [
                      { value: "regular", label: "Regular" },
                      { value: "irregular", label: "Irregular" },
                    ],
                  },
                },
                {
                  label: "Blood Pressure (Systolic)",
                  type: FormFieldType.NUMBER,
                  required: false,
                  order: 8,
                  config: { min: 60, max: 250, suffix: "mmHg" },
                },
                {
                  label: "Blood Pressure (Diastolic)",
                  type: FormFieldType.NUMBER,
                  required: false,
                  order: 9,
                  config: { min: 30, max: 150, suffix: "mmHg" },
                },
                {
                  label: "BP Position",
                  type: FormFieldType.SINGLE_CHOICE,
                  required: false,
                  order: 10,
                  config: {
                    options: [
                      { value: "sitting", label: "Sitting" },
                      { value: "lying", label: "Lying" },
                      { value: "standing", label: "Standing" },
                    ],
                  },
                },
                {
                  label: "Weight",
                  description: "Weight in pounds",
                  type: FormFieldType.NUMBER,
                  required: false,
                  order: 11,
                  config: { min: 50, max: 500, step: 0.1, suffix: "lbs" },
                },
                {
                  label: "Oxygen Saturation",
                  description: "SpO2 percentage",
                  type: FormFieldType.NUMBER,
                  required: false,
                  order: 12,
                  config: { min: 50, max: 100, suffix: "%" },
                },
                {
                  label: "On Supplemental Oxygen",
                  type: FormFieldType.YES_NO,
                  required: false,
                  order: 13,
                },
                {
                  label: "Oxygen Flow Rate",
                  description: "Liters per minute if on oxygen",
                  type: FormFieldType.NUMBER,
                  required: false,
                  order: 14,
                  config: { min: 0.5, max: 15, step: 0.5, suffix: "LPM" },
                },
                {
                  label: "Vital Signs Notes",
                  type: FormFieldType.TEXT_LONG,
                  required: false,
                  order: 15,
                },
              ],
            },
          },

          // Section 3: Pain Assessment
          {
            title: "Pain Assessment",
            description: "Evaluate patient's pain status",
            order: 3,
            fields: {
              create: [
                {
                  label: "Patient Denies Pain",
                  type: FormFieldType.YES_NO,
                  required: false,
                  order: 1,
                },
                {
                  label: "Pain Level (0-10)",
                  description: "0 = No pain, 10 = Worst pain imaginable",
                  type: FormFieldType.NUMBER,
                  required: false,
                  order: 2,
                  config: { min: 0, max: 10 },
                },
                {
                  label: "Pain Location",
                  type: FormFieldType.TEXT_SHORT,
                  required: false,
                  order: 3,
                },
                {
                  label: "Pain Duration",
                  type: FormFieldType.TEXT_SHORT,
                  required: false,
                  order: 4,
                },
                {
                  label: "Pain Description",
                  type: FormFieldType.MULTIPLE_CHOICE,
                  required: false,
                  order: 5,
                  config: {
                    options: [
                      { value: "sharp", label: "Sharp" },
                      { value: "dull", label: "Dull" },
                      { value: "aching", label: "Aching" },
                      { value: "burning", label: "Burning" },
                      { value: "throbbing", label: "Throbbing" },
                      { value: "constant", label: "Constant" },
                      { value: "intermittent", label: "Intermittent" },
                    ],
                  },
                },
                {
                  label: "Acceptable Pain Level",
                  description: "Patient's acceptable pain level (0-10)",
                  type: FormFieldType.NUMBER,
                  required: false,
                  order: 6,
                  config: { min: 0, max: 10 },
                },
                {
                  label: "Pain Medication Last Taken",
                  type: FormFieldType.TEXT_SHORT,
                  required: false,
                  order: 7,
                },
                {
                  label: "Other Pain Management",
                  type: FormFieldType.TEXT_LONG,
                  required: false,
                  order: 8,
                },
              ],
            },
          },

          // Section 4: Cardiovascular Assessment
          {
            title: "Cardiovascular Assessment",
            description: "Heart and circulation assessment",
            order: 4,
            fields: {
              create: [
                {
                  label: "Cardiovascular Normal",
                  type: FormFieldType.YES_NO,
                  required: false,
                  order: 1,
                },
                {
                  label: "Heart Sounds",
                  type: FormFieldType.SINGLE_CHOICE,
                  required: false,
                  order: 2,
                  config: {
                    options: [
                      { value: "regular", label: "Regular" },
                      { value: "irregular", label: "Irregular" },
                      { value: "murmur", label: "Murmur" },
                    ],
                  },
                },
                {
                  label: "Edema Present",
                  type: FormFieldType.MULTIPLE_CHOICE,
                  required: false,
                  order: 3,
                  config: {
                    options: [
                      { value: "none", label: "None" },
                      { value: "sacral", label: "Sacral" },
                      { value: "pedal", label: "Pedal" },
                      { value: "pitting", label: "Pitting" },
                      { value: "non-pitting", label: "Non-Pitting" },
                    ],
                  },
                },
                {
                  label: "Edema Severity",
                  type: FormFieldType.SINGLE_CHOICE,
                  required: false,
                  order: 4,
                  config: {
                    options: [
                      { value: "1", label: "+1" },
                      { value: "2", label: "+2" },
                      { value: "3", label: "+3" },
                      { value: "4", label: "+4" },
                    ],
                  },
                },
                {
                  label: "Edema Location",
                  type: FormFieldType.TEXT_SHORT,
                  required: false,
                  order: 5,
                },
                {
                  label: "Chest Pain Present",
                  type: FormFieldType.YES_NO,
                  required: false,
                  order: 6,
                },
                {
                  label: "Cardiovascular Notes",
                  type: FormFieldType.TEXT_LONG,
                  required: false,
                  order: 7,
                },
              ],
            },
          },

          // Section 5: Pulmonary Assessment
          {
            title: "Pulmonary Assessment",
            description: "Respiratory system assessment",
            order: 5,
            fields: {
              create: [
                {
                  label: "Pulmonary Normal",
                  type: FormFieldType.YES_NO,
                  required: false,
                  order: 1,
                },
                {
                  label: "Lung Sounds",
                  type: FormFieldType.MULTIPLE_CHOICE,
                  required: false,
                  order: 2,
                  config: {
                    options: [
                      { value: "clear", label: "Clear" },
                      { value: "crackles", label: "Crackles" },
                      { value: "rales", label: "Rales" },
                      { value: "wheeze", label: "Wheeze" },
                      { value: "rhonchi", label: "Rhonchi" },
                      { value: "diminished", label: "Diminished" },
                      { value: "absent", label: "Absent" },
                    ],
                  },
                },
                {
                  label: "Cough",
                  type: FormFieldType.MULTIPLE_CHOICE,
                  required: false,
                  order: 3,
                  config: {
                    options: [
                      { value: "none", label: "None" },
                      { value: "dry", label: "Dry" },
                      { value: "productive", label: "Productive" },
                      { value: "chronic", label: "Chronic" },
                    ],
                  },
                },
                {
                  label: "Respiratory Status",
                  type: FormFieldType.MULTIPLE_CHOICE,
                  required: false,
                  order: 4,
                  config: {
                    options: [
                      { value: "normal", label: "Normal" },
                      { value: "sob", label: "Shortness of Breath" },
                      { value: "dyspnea", label: "Dyspnea" },
                      { value: "orthopnea", label: "Orthopnea" },
                    ],
                  },
                },
                {
                  label: "Pulmonary Notes",
                  type: FormFieldType.TEXT_LONG,
                  required: false,
                  order: 5,
                },
              ],
            },
          },

          // Section 6: Neurological Assessment
          {
            title: "Neurological Assessment",
            description: "Mental status and neurological function",
            order: 6,
            fields: {
              create: [
                {
                  label: "Neurological Normal",
                  type: FormFieldType.YES_NO,
                  required: false,
                  order: 1,
                },
                {
                  label: "Level of Consciousness",
                  type: FormFieldType.SINGLE_CHOICE,
                  required: false,
                  order: 2,
                  config: {
                    options: [
                      { value: "alert", label: "Alert" },
                      { value: "lethargic", label: "Lethargic" },
                      { value: "obtunded", label: "Obtunded" },
                      { value: "stuporous", label: "Stuporous" },
                      { value: "comatose", label: "Comatose" },
                    ],
                  },
                },
                {
                  label: "Orientation",
                  type: FormFieldType.MULTIPLE_CHOICE,
                  required: false,
                  order: 3,
                  config: {
                    options: [
                      { value: "person", label: "Person" },
                      { value: "place", label: "Place" },
                      { value: "time", label: "Time" },
                      { value: "situation", label: "Situation" },
                    ],
                  },
                },
                {
                  label: "Speech",
                  type: FormFieldType.SINGLE_CHOICE,
                  required: false,
                  order: 4,
                  config: {
                    options: [
                      { value: "clear", label: "Clear" },
                      { value: "slurred", label: "Slurred" },
                      { value: "aphasia", label: "Aphasia" },
                      { value: "dysarthria", label: "Dysarthria" },
                    ],
                  },
                },
                {
                  label: "Pupils",
                  type: FormFieldType.SINGLE_CHOICE,
                  required: false,
                  order: 5,
                  config: {
                    options: [
                      { value: "equal-reactive", label: "Equal and Reactive" },
                      { value: "unequal", label: "Unequal" },
                      { value: "fixed", label: "Fixed" },
                      { value: "dilated", label: "Dilated" },
                      { value: "constricted", label: "Constricted" },
                    ],
                  },
                },
                {
                  label: "Neurological Notes",
                  type: FormFieldType.TEXT_LONG,
                  required: false,
                  order: 6,
                },
              ],
            },
          },

          // Section 7: Skin Assessment
          {
            title: "Skin Assessment",
            description: "Skin integrity and wound assessment",
            order: 7,
            fields: {
              create: [
                {
                  label: "Skin Intact",
                  type: FormFieldType.YES_NO,
                  required: false,
                  order: 1,
                },
                {
                  label: "Skin Color",
                  type: FormFieldType.SINGLE_CHOICE,
                  required: false,
                  order: 2,
                  config: {
                    options: [
                      { value: "normal", label: "Normal" },
                      { value: "pale", label: "Pale" },
                      { value: "jaundiced", label: "Jaundiced" },
                      { value: "cyanotic", label: "Cyanotic" },
                      { value: "flushed", label: "Flushed" },
                    ],
                  },
                },
                {
                  label: "Skin Turgor",
                  type: FormFieldType.SINGLE_CHOICE,
                  required: false,
                  order: 3,
                  config: {
                    options: [
                      { value: "good", label: "Good" },
                      { value: "poor", label: "Poor" },
                    ],
                  },
                },
                {
                  label: "Wounds/Lesions Present",
                  type: FormFieldType.YES_NO,
                  required: false,
                  order: 4,
                },
                {
                  label: "Wound Location",
                  type: FormFieldType.TEXT_SHORT,
                  required: false,
                  order: 5,
                },
                {
                  label: "Wound Type",
                  type: FormFieldType.MULTIPLE_CHOICE,
                  required: false,
                  order: 6,
                  config: {
                    options: [
                      { value: "pressure-ulcer", label: "Pressure Ulcer" },
                      { value: "surgical", label: "Surgical" },
                      { value: "diabetic", label: "Diabetic Ulcer" },
                      { value: "venous", label: "Venous Ulcer" },
                      { value: "arterial", label: "Arterial Ulcer" },
                      { value: "laceration", label: "Laceration" },
                      { value: "abrasion", label: "Abrasion" },
                    ],
                  },
                },
                {
                  label: "Wound Stage",
                  type: FormFieldType.SINGLE_CHOICE,
                  required: false,
                  order: 7,
                  config: {
                    options: [
                      { value: "stage-1", label: "Stage 1" },
                      { value: "stage-2", label: "Stage 2" },
                      { value: "stage-3", label: "Stage 3" },
                      { value: "stage-4", label: "Stage 4" },
                      { value: "unstageable", label: "Unstageable" },
                      { value: "dti", label: "Deep Tissue Injury" },
                    ],
                  },
                },
                {
                  label: "Wound Size (Length cm)",
                  type: FormFieldType.NUMBER,
                  required: false,
                  order: 8,
                  config: { min: 0, max: 50, step: 0.1 },
                },
                {
                  label: "Wound Size (Width cm)",
                  type: FormFieldType.NUMBER,
                  required: false,
                  order: 9,
                  config: { min: 0, max: 50, step: 0.1 },
                },
                {
                  label: "Wound Size (Depth cm)",
                  type: FormFieldType.NUMBER,
                  required: false,
                  order: 10,
                  config: { min: 0, max: 20, step: 0.1 },
                },
                {
                  label: "Wound Bed",
                  type: FormFieldType.MULTIPLE_CHOICE,
                  required: false,
                  order: 11,
                  config: {
                    options: [
                      { value: "granulation", label: "Granulation" },
                      { value: "slough", label: "Slough" },
                      { value: "eschar", label: "Eschar" },
                      { value: "epithelializing", label: "Epithelializing" },
                    ],
                  },
                },
                {
                  label: "Drainage",
                  type: FormFieldType.SINGLE_CHOICE,
                  required: false,
                  order: 12,
                  config: {
                    options: [
                      { value: "none", label: "None" },
                      { value: "serous", label: "Serous" },
                      { value: "sanguineous", label: "Sanguineous" },
                      { value: "serosanguineous", label: "Serosanguineous" },
                      { value: "purulent", label: "Purulent" },
                    ],
                  },
                },
                {
                  label: "Skin/Wound Notes",
                  type: FormFieldType.TEXT_LONG,
                  required: false,
                  order: 13,
                },
              ],
            },
          },

          // Section 8: Interventions
          {
            title: "Interventions Performed",
            description: "Skilled nursing interventions during visit",
            order: 8,
            fields: {
              create: [
                {
                  label: "Interventions Performed",
                  type: FormFieldType.MULTIPLE_CHOICE,
                  required: false,
                  order: 1,
                  config: {
                    options: [
                      { value: "assessment", label: "Comprehensive Assessment" },
                      { value: "vital-signs", label: "Vital Signs Monitoring" },
                      { value: "medication-management", label: "Medication Management" },
                      { value: "medication-teaching", label: "Medication Teaching" },
                      { value: "wound-care", label: "Wound Care" },
                      { value: "dressing-change", label: "Dressing Change" },
                      { value: "catheter-care", label: "Catheter Care" },
                      { value: "iv-therapy", label: "IV Therapy" },
                      { value: "blood-draw", label: "Blood Draw" },
                      { value: "injection", label: "Injection Administration" },
                      { value: "tube-feeding", label: "Tube Feeding Management" },
                      { value: "ostomy-care", label: "Ostomy Care" },
                      { value: "oxygen-management", label: "Oxygen Management" },
                      { value: "disease-teaching", label: "Disease Process Teaching" },
                      { value: "diet-teaching", label: "Diet/Nutrition Teaching" },
                      { value: "fall-prevention", label: "Fall Prevention Teaching" },
                      { value: "care-coordination", label: "Care Coordination" },
                      { value: "physician-communication", label: "Physician Communication" },
                    ],
                  },
                },
                {
                  label: "Intervention Details",
                  type: FormFieldType.TEXT_LONG,
                  required: false,
                  order: 2,
                },
                {
                  label: "Patient/Caregiver Response",
                  type: FormFieldType.SINGLE_CHOICE,
                  required: false,
                  order: 3,
                  config: {
                    options: [
                      { value: "receptive", label: "Receptive to Teaching" },
                      { value: "demonstrated", label: "Demonstrated Understanding" },
                      { value: "needs-reinforcement", label: "Needs Reinforcement" },
                      { value: "declined", label: "Declined Intervention" },
                    ],
                  },
                },
                {
                  label: "Teaching Topics",
                  type: FormFieldType.TEXT_LONG,
                  required: false,
                  order: 4,
                  description: "Document specific teaching provided",
                },
              ],
            },
          },

          // Section 9: Medications
          {
            title: "Medication Review",
            description: "Medication assessment and reconciliation",
            order: 9,
            fields: {
              create: [
                {
                  label: "Medication Review Completed",
                  type: FormFieldType.YES_NO,
                  required: false,
                  order: 1,
                },
                {
                  label: "Medication Compliance",
                  type: FormFieldType.SINGLE_CHOICE,
                  required: false,
                  order: 2,
                  config: {
                    options: [
                      { value: "compliant", label: "Patient is Compliant" },
                      { value: "partial", label: "Partially Compliant" },
                      { value: "non-compliant", label: "Non-Compliant" },
                    ],
                  },
                },
                {
                  label: "Medication Changes",
                  type: FormFieldType.TEXT_LONG,
                  required: false,
                  order: 3,
                  description: "Document any medication changes",
                },
                {
                  label: "Medication Concerns",
                  type: FormFieldType.TEXT_LONG,
                  required: false,
                  order: 4,
                },
                {
                  label: "PRN Medications Given",
                  type: FormFieldType.TEXT_SHORT,
                  required: false,
                  order: 5,
                },
              ],
            },
          },

          // Section 10: Care Plan & Goals
          {
            title: "Care Plan Progress",
            description: "Progress toward care plan goals",
            order: 10,
            fields: {
              create: [
                {
                  label: "Goals Addressed This Visit",
                  type: FormFieldType.TEXT_LONG,
                  required: false,
                  order: 1,
                },
                {
                  label: "Progress Toward Goals",
                  type: FormFieldType.SINGLE_CHOICE,
                  required: false,
                  order: 2,
                  config: {
                    options: [
                      { value: "progressing", label: "Progressing as Expected" },
                      { value: "met", label: "Goal Met" },
                      { value: "slow", label: "Slower Progress than Expected" },
                      { value: "regression", label: "Regression Noted" },
                      { value: "reassess", label: "Needs Goal Reassessment" },
                    ],
                  },
                },
                {
                  label: "Care Plan Modifications Needed",
                  type: FormFieldType.YES_NO,
                  required: false,
                  order: 3,
                },
                {
                  label: "Suggested Modifications",
                  type: FormFieldType.TEXT_LONG,
                  required: false,
                  order: 4,
                },
                {
                  label: "Next Visit Focus",
                  type: FormFieldType.TEXT_LONG,
                  required: false,
                  order: 5,
                },
              ],
            },
          },

          // Section 11: Communication
          {
            title: "Communication & Coordination",
            description: "Communication with healthcare team",
            order: 11,
            fields: {
              create: [
                {
                  label: "Physician Notified",
                  type: FormFieldType.YES_NO,
                  required: false,
                  order: 1,
                },
                {
                  label: "Reason for Notification",
                  type: FormFieldType.TEXT_SHORT,
                  required: false,
                  order: 2,
                },
                {
                  label: "Orders Received",
                  type: FormFieldType.TEXT_LONG,
                  required: false,
                  order: 3,
                },
                {
                  label: "Referrals Made",
                  type: FormFieldType.TEXT_SHORT,
                  required: false,
                  order: 4,
                },
                {
                  label: "Other Team Communication",
                  type: FormFieldType.TEXT_LONG,
                  required: false,
                  order: 5,
                },
              ],
            },
          },

          // Section 12: Visit Summary
          {
            title: "Visit Summary",
            description: "Overall assessment and plan",
            order: 12,
            fields: {
              create: [
                {
                  label: "Patient Overall Status",
                  type: FormFieldType.SINGLE_CHOICE,
                  required: true,
                  order: 1,
                  config: {
                    options: [
                      { value: "stable", label: "Stable" },
                      { value: "improved", label: "Improved" },
                      { value: "declined", label: "Declined" },
                      { value: "unstable", label: "Unstable" },
                    ],
                  },
                },
                {
                  label: "Skilled Nursing Still Required",
                  type: FormFieldType.YES_NO,
                  required: false,
                  order: 2,
                },
                {
                  label: "Narrative Summary",
                  description: "Brief summary of visit findings and actions",
                  type: FormFieldType.TEXT_LONG,
                  required: true,
                  order: 3,
                },
                {
                  label: "Follow-up Needed",
                  type: FormFieldType.MULTIPLE_CHOICE,
                  required: false,
                  order: 4,
                  config: {
                    options: [
                      { value: "routine-visit", label: "Routine Follow-up Visit" },
                      { value: "urgent-visit", label: "Urgent Visit Needed" },
                      { value: "physician-followup", label: "Physician Follow-up" },
                      { value: "lab-work", label: "Lab Work Ordered" },
                      { value: "pt-ot", label: "PT/OT Coordination" },
                      { value: "social-work", label: "Social Work Referral" },
                    ],
                  },
                },
                {
                  label: "Next Scheduled Visit",
                  type: FormFieldType.DATE,
                  required: false,
                  order: 5,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`Created Skilled Nursing Visit Note template: ${template.id}`);

  // Count fields
  const fieldCount = await prisma.formField.count({
    where: {
      section: {
        templateId: template.id,
      },
    },
  });
  console.log(`Total fields: ${fieldCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
