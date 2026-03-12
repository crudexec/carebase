/**
 * Migration script to update Treatment Goals child fields:
 * - Rename "Current Baseline" to "Current Skill Level"
 * - Change "Target/Expected Outcome" to "Target Performance Level" with dropdown options
 *
 * Usage:
 *   npx tsx scripts/update-treatment-goals-fields.ts
 */

import { PrismaClient, FormFieldType } from "@prisma/client";

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

interface RepeatableGroupChildField {
  key: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  config?: Record<string, unknown>;
}

interface RepeatableGroupConfig {
  childFields: RepeatableGroupChildField[];
  minItems?: number;
  maxItems?: number;
  addButtonLabel?: string;
  itemLabel?: string;
  collapsible?: boolean;
}

async function updateTreatmentGoalsFields() {
  console.log("Updating Treatment Goals Fields");
  console.log("=".repeat(60));

  // Find all REPEATABLE_GROUP fields with "Treatment Goals" label
  const treatmentGoalsFields = await prisma.carePlanTemplateField.findMany({
    where: {
      type: FormFieldType.REPEATABLE_GROUP,
      label: "Treatment Goals",
    },
    include: {
      section: {
        include: {
          template: true,
        },
      },
    },
  });

  console.log(`Found ${treatmentGoalsFields.length} Treatment Goals field(s)\n`);

  for (const field of treatmentGoalsFields) {
    const templateName = field.section.template.name;
    console.log(`\nUpdating: ${templateName}`);
    console.log("-".repeat(40));

    const config = field.config as RepeatableGroupConfig;

    if (!config.childFields || !Array.isArray(config.childFields)) {
      console.log("  No child fields found. Skipping...");
      continue;
    }

    let updated = false;
    // Filter out Short-Term Objectives/Strategies field
    let newChildFields = config.childFields.filter((childField) => {
      if (childField.key === "shortTermObjectives") {
        console.log("  - Removing 'Short-Term Objectives/Strategies' field");
        updated = true;
        return false;
      }
      return true;
    }).map((childField) => {
      // Update "Current Baseline" to "Current Skill Level" with dropdown
      if (childField.key === "baseline" &&
          (childField.label === "Current Baseline" || childField.label === "Current Skill Level")) {
        if (childField.type !== "SINGLE_CHOICE") {
          console.log("  - Changing 'Current Baseline' to 'Current Skill Level' dropdown");
          updated = true;
        }
        return {
          ...childField,
          label: "Current Skill Level",
          type: "SINGLE_CHOICE" as FormFieldType,
          config: {
            options: TARGET_PERFORMANCE_OPTIONS,
          },
        };
      }

      // Update "Target/Expected Outcome" to "Target Performance Level" with dropdown
      if (childField.key === "target" &&
          (childField.label === "Target/Expected Outcome" || childField.label === "Target Performance Level")) {
        if (childField.type !== "SINGLE_CHOICE") {
          console.log("  - Changing 'Target/Expected Outcome' to 'Target Performance Level' dropdown");
          updated = true;
        }
        return {
          ...childField,
          label: "Target Performance Level",
          type: "SINGLE_CHOICE" as FormFieldType,
          config: {
            options: TARGET_PERFORMANCE_OPTIONS,
          },
        };
      }

      return childField;
    });

    // Add Goal Background field if it doesn't exist
    const hasGoalBackgroundField = newChildFields.some((f) => f.key === "goalBackground");
    if (!hasGoalBackgroundField) {
      console.log("  - Adding 'Goal Background' text field");
      updated = true;
      newChildFields.push({
        key: "goalBackground",
        label: "Goal Background (the problem we are addressing)",
        type: "TEXT_LONG" as FormFieldType,
        required: false,
        config: {
          placeholder: "Describe the problem or challenge being addressed...",
        },
      });
    }

    // Add Goal Statement field if it doesn't exist
    const hasGoalStatementField = newChildFields.some((f) => f.key === "goalStatement");
    if (!hasGoalStatementField) {
      console.log("  - Adding 'Goal Statement' text field");
      updated = true;
      newChildFields.push({
        key: "goalStatement",
        label: "Goal Statement",
        type: "TEXT_LONG" as FormFieldType,
        required: false,
        config: {
          placeholder: "Enter the goal statement...",
        },
      });
    }

    // Add Implementation Procedure field if it doesn't exist
    const hasImplementationProcedureField = newChildFields.some((f) => f.key === "implementationProcedure");
    if (!hasImplementationProcedureField) {
      console.log("  - Adding 'Implementation Procedure' text field");
      updated = true;
      newChildFields.push({
        key: "implementationProcedure",
        label: "Implementation Procedure",
        type: "TEXT_LONG" as FormFieldType,
        required: false,
        config: {
          placeholder: "Describe the implementation procedure...",
        },
      });
    }

    // Add Number of Trials field if it doesn't exist
    const hasTrialsField = newChildFields.some((f) => f.key === "numberOfTrials");
    if (!hasTrialsField) {
      console.log("  - Adding 'Number of Trials (out of 5)' dropdown");
      updated = true;
      newChildFields.push({
        key: "numberOfTrials",
        label: "Number of Trials (out of 5)",
        type: "SINGLE_CHOICE" as FormFieldType,
        required: false,
        config: {
          options: NUMBER_OF_TRIALS_OPTIONS,
        },
      });
    }

    // Add Frequency field if it doesn't exist
    const hasFrequencyField = newChildFields.some((f) => f.key === "frequency");
    if (!hasFrequencyField) {
      console.log("  - Adding 'Frequency' dropdown");
      updated = true;
      newChildFields.push({
        key: "frequency",
        label: "Frequency",
        type: "SINGLE_CHOICE" as FormFieldType,
        required: false,
        config: {
          options: FREQUENCY_OPTIONS,
        },
      });
    }

    // Always update to ensure field order
    if (true) {
      // Update the field with new config
      await prisma.carePlanTemplateField.update({
        where: { id: field.id },
        data: {
          config: {
            ...config,
            childFields: newChildFields,
          },
        },
      });

      console.log("  Updated successfully!");

      // Verify the update
      const updatedField = await prisma.carePlanTemplateField.findUnique({
        where: { id: field.id },
      });

      const updatedConfig = updatedField?.config as RepeatableGroupConfig;
      console.log("\n  New child fields:");
      updatedConfig.childFields.forEach((cf) => {
        console.log(`    - [${cf.type}] ${cf.label} (key: ${cf.key})`);
        if (cf.type === "SINGLE_CHOICE" && cf.config?.options) {
          const options = cf.config.options as Array<{ label: string }>;
          console.log(`      Options: ${options.map((o) => o.label).join(", ")}`);
        }
      });
    } else {
      console.log("  No changes needed (fields may already be updated).");
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log("Update complete!");
  console.log("=".repeat(60));
}

updateTreatmentGoalsFields()
  .catch((e) => {
    console.error("Error during update:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
