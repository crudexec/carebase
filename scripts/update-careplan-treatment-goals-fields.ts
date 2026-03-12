/**
 * Migration script to update existing CarePlan formSchemaSnapshot:
 * - Rename "Current Baseline" to "Current Skill Level"
 * - Change "Target/Expected Outcome" to "Target Performance Level" with dropdown options
 *
 * This updates the snapshot stored in existing care plans so they render correctly.
 *
 * Usage:
 *   npx tsx scripts/update-careplan-treatment-goals-fields.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Target Performance Level dropdown options
const TARGET_PERFORMANCE_OPTIONS = [
  { value: "hand_over_hand", label: "Hand over Hand" },
  { value: "physical_prompt", label: "Physical Prompt" },
  { value: "model_prompt", label: "Model Prompt" },
  { value: "gesture_prompt", label: "Gesture Prompt" },
  { value: "visual_cue", label: "Visual Cue" },
  { value: "verbal_prompts", label: "Verbal Prompts" },
  { value: "intermittent_verbal_prompt", label: "Intermittent Verbal Prompt" },
  { value: "independence", label: "Independence" },
  { value: "refused", label: "Refused" },
  { value: "unable", label: "Unable" },
];

// Number of trials options
const NUMBER_OF_TRIALS_OPTIONS = [
  { value: "0", label: "0" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
];

// Frequency options
const FREQUENCY_OPTIONS = [
  { value: "1_time_per_day", label: "1 time per day" },
  { value: "1_time_per_week", label: "1 time per week" },
  { value: "2_times_per_week", label: "2 times per week" },
  { value: "3_times_per_week", label: "3 times per week" },
  { value: "4_times_per_week", label: "4 times per week" },
  { value: "5_times_per_week", label: "5 times per week" },
  { value: "3_consecutive_opportunities", label: "3 consecutive opportunities" },
  { value: "3_consecutive_days_sessions", label: "3 consecutive days/sessions" },
  { value: "5_consecutive_days_sessions_opportunities", label: "5 consecutive days/sessions/opportunities" },
  { value: "30_day_period", label: "30 day period" },
  { value: "90_day_period", label: "90 day period" },
];

interface ChildField {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  config?: Record<string, unknown>;
}

interface FieldConfig {
  childFields?: ChildField[];
  [key: string]: unknown;
}

interface Field {
  id: string;
  label: string;
  type: string;
  required: boolean;
  order: number;
  config: FieldConfig | null;
}

interface Section {
  id: string;
  title: string;
  description: string | null;
  order: number;
  fields: Field[];
}

interface FormSchemaSnapshot {
  templateId: string;
  templateName: string;
  version: number;
  sections: Section[];
}

async function updateCarePlanSnapshots() {
  console.log("Updating CarePlan formSchemaSnapshot fields");
  console.log("=".repeat(60));

  // Find all care plans with formSchemaSnapshot
  const carePlans = await prisma.carePlan.findMany({
    where: {
      formSchemaSnapshot: {
        not: null,
      },
    },
    select: {
      id: true,
      planNumber: true,
      formSchemaSnapshot: true,
    },
  });

  console.log(`Found ${carePlans.length} care plan(s) with form schema snapshots\n`);

  let updatedCount = 0;

  for (const carePlan of carePlans) {
    const snapshot = carePlan.formSchemaSnapshot as FormSchemaSnapshot | null;
    if (!snapshot || !snapshot.sections) continue;

    let updated = false;

    // Iterate through sections and fields
    for (const section of snapshot.sections) {
      for (const field of section.fields) {
        // Look for REPEATABLE_GROUP fields with "Treatment Goals" label
        if (field.type === "REPEATABLE_GROUP" && field.label === "Treatment Goals") {
          const config = field.config;
          if (!config?.childFields || !Array.isArray(config.childFields)) continue;

          // Filter out Short-Term Objectives/Strategies field
          let newChildFields = config.childFields.filter((childField: ChildField) => {
            if (childField.key === "shortTermObjectives") {
              console.log(`  [${carePlan.planNumber}] Removing 'Short-Term Objectives/Strategies' field`);
              updated = true;
              return false;
            }
            return true;
          }).map((childField: ChildField) => {
            // Update "Current Baseline" to "Current Skill Level" with dropdown
            if (childField.key === "baseline" &&
                (childField.label === "Current Baseline" || childField.label === "Current Skill Level")) {
              // Only update if it's not already a SINGLE_CHOICE
              if (childField.type !== "SINGLE_CHOICE") {
                console.log(`  [${carePlan.planNumber}] Changing 'Current Skill Level' to dropdown`);
                updated = true;
              }
              return {
                ...childField,
                label: "Current Skill Level",
                type: "SINGLE_CHOICE",
                config: {
                  options: TARGET_PERFORMANCE_OPTIONS,
                },
              };
            }

            // Update "Target/Expected Outcome" to "Target Performance Level" with dropdown
            if (childField.key === "target" &&
                (childField.label === "Target/Expected Outcome" || childField.label === "Target Performance Level")) {
              // Only update if it's not already a SINGLE_CHOICE
              if (childField.type !== "SINGLE_CHOICE") {
                console.log(`  [${carePlan.planNumber}] Changing 'Target/Expected Outcome' to 'Target Performance Level' dropdown`);
                updated = true;
              }
              return {
                ...childField,
                label: "Target Performance Level",
                type: "SINGLE_CHOICE",
                config: {
                  options: TARGET_PERFORMANCE_OPTIONS,
                },
              };
            }

            return childField;
          });

          // Add Goal Background field if it doesn't exist
          const hasGoalBackgroundField = newChildFields.some((f: ChildField) => f.key === "goalBackground");
          if (!hasGoalBackgroundField) {
            console.log(`  [${carePlan.planNumber}] Adding 'Goal Background' text field`);
            updated = true;
            newChildFields.push({
              key: "goalBackground",
              label: "Goal Background (the problem we are addressing)",
              type: "TEXT_LONG",
              required: false,
              config: {
                placeholder: "Describe the problem or challenge being addressed...",
              },
            });
          }

          // Add Goal Statement field if it doesn't exist
          const hasGoalStatementField = newChildFields.some((f: ChildField) => f.key === "goalStatement");
          if (!hasGoalStatementField) {
            console.log(`  [${carePlan.planNumber}] Adding 'Goal Statement' text field`);
            updated = true;
            newChildFields.push({
              key: "goalStatement",
              label: "Goal Statement",
              type: "TEXT_LONG",
              required: false,
              config: {
                placeholder: "Enter the goal statement...",
              },
            });
          }

          // Add Implementation Procedure field if it doesn't exist
          const hasImplementationProcedureField = newChildFields.some((f: ChildField) => f.key === "implementationProcedure");
          if (!hasImplementationProcedureField) {
            console.log(`  [${carePlan.planNumber}] Adding 'Implementation Procedure' text field`);
            updated = true;
            newChildFields.push({
              key: "implementationProcedure",
              label: "Implementation Procedure",
              type: "TEXT_LONG",
              required: false,
              config: {
                placeholder: "Describe the implementation procedure...",
              },
            });
          }

          // Add Number of Trials field if it doesn't exist
          const hasTrialsField = newChildFields.some((f: ChildField) => f.key === "numberOfTrials");
          if (!hasTrialsField) {
            console.log(`  [${carePlan.planNumber}] Adding 'Number of Trials (out of 5)' dropdown`);
            updated = true;
            newChildFields.push({
              key: "numberOfTrials",
              label: "Number of Trials (out of 5)",
              type: "SINGLE_CHOICE",
              required: false,
              config: {
                options: NUMBER_OF_TRIALS_OPTIONS,
              },
            });
          }

          // Add Frequency field if it doesn't exist
          const hasFrequencyField = newChildFields.some((f: ChildField) => f.key === "frequency");
          if (!hasFrequencyField) {
            console.log(`  [${carePlan.planNumber}] Adding 'Frequency' dropdown`);
            updated = true;
            newChildFields.push({
              key: "frequency",
              label: "Frequency",
              type: "SINGLE_CHOICE",
              required: false,
              config: {
                options: FREQUENCY_OPTIONS,
              },
            });
          }

          // Always update config with modified childFields
          field.config = {
            ...config,
            childFields: newChildFields,
          };
        }
      }
    }

    if (updated) {
      await prisma.carePlan.update({
        where: { id: carePlan.id },
        data: {
          formSchemaSnapshot: snapshot,
        },
      });
      updatedCount++;
      console.log(`  Updated ${carePlan.planNumber}`);
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`Updated ${updatedCount} care plan(s)`);
  console.log("=".repeat(60));
}

updateCarePlanSnapshots()
  .catch((e) => {
    console.error("Error during update:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
