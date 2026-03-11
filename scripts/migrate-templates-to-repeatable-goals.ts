/**
 * Migration script to update IISS/FC/ITI templates to use REPEATABLE_GROUP for goals
 *
 * This script:
 * 1. Finds the Treatment Goals sections in each template
 * 2. Removes existing fixed Goal 1, Goal 2, Goal 3 fields and cascading selects
 * 3. Adds a single REPEATABLE_GROUP field with configurable child fields
 *
 * Usage:
 *   npx tsx scripts/migrate-templates-to-repeatable-goals.ts
 */

import { PrismaClient, FormFieldType } from "@prisma/client";

const prisma = new PrismaClient();

interface TemplateConfig {
  templateName: string;
  templateType: string;  // For cascading select
}

const TEMPLATES_TO_MIGRATE: TemplateConfig[] = [
  { templateName: "IISS Treatment Plan", templateType: "IISS" },
  { templateName: "FC Treatment Plan", templateType: "FC" },
  { templateName: "ITI Treatment Plan", templateType: "ITI" },
];

// Child fields for each treatment goal
const GOAL_CHILD_FIELDS = (templateType: string) => [
  {
    key: "goalSelection",
    label: "Goal Selection",
    type: "CASCADING_SELECT" as FormFieldType,
    required: true,
    config: {
      templateType,
      allowMultipleSteps: true,
      showSteps: true,
    },
  },
  {
    key: "domain",
    label: "Domain",
    type: "SINGLE_CHOICE" as FormFieldType,
    required: false,
    config: {
      options: [
        "Communication",
        "Self-Care",
        "Socialization",
        "Behavior",
        "Daily Living",
        "Community Integration",
        "Vocational",
        "Other",
      ],
    },
  },
  {
    key: "baseline",
    label: "Current Baseline",
    type: "TEXT_LONG" as FormFieldType,
    required: false,
    config: {
      placeholder: "Describe the client's current level of functioning...",
    },
  },
  {
    key: "target",
    label: "Target/Expected Outcome",
    type: "TEXT_LONG" as FormFieldType,
    required: false,
    config: {
      placeholder: "Describe the expected outcome when the goal is achieved...",
    },
  },
  {
    key: "shortTermObjectives",
    label: "Short-Term Objectives/Strategies",
    type: "TEXT_LONG" as FormFieldType,
    required: false,
    config: {
      placeholder: "List the specific short-term objectives and strategies to achieve this goal...",
    },
  },
];

async function migrateTemplate(config: TemplateConfig) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Migrating: ${config.templateName}`);
  console.log("=".repeat(60));

  // Find the template
  const template = await prisma.carePlanTemplate.findFirst({
    where: {
      name: config.templateName,
      companyId: "default-company-001",
    },
    include: {
      sections: {
        include: {
          fields: {
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!template) {
    console.log(`  Template not found. Skipping...`);
    return;
  }

  console.log(`  Found template: ${template.id}`);

  // Find the Treatment Goals section
  const goalsSection = template.sections.find((s) => s.title === "Treatment Goals");

  if (!goalsSection) {
    console.log(`  Treatment Goals section not found. Skipping...`);
    return;
  }

  console.log(`  Found section: ${goalsSection.title} (${goalsSection.fields.length} fields)`);

  // Check if already migrated (has REPEATABLE_GROUP field)
  const hasRepeatableGroup = goalsSection.fields.some(
    (f) => f.type === FormFieldType.REPEATABLE_GROUP
  );

  if (hasRepeatableGroup) {
    console.log(`  Already migrated (has REPEATABLE_GROUP). Skipping...`);
    return;
  }

  // Delete all existing fields in the section
  console.log(`  Deleting ${goalsSection.fields.length} existing fields...`);
  await prisma.carePlanTemplateField.deleteMany({
    where: { sectionId: goalsSection.id },
  });

  // Create the new REPEATABLE_GROUP field
  const repeatableGroupField = await prisma.carePlanTemplateField.create({
    data: {
      sectionId: goalsSection.id,
      label: "Treatment Goals",
      type: FormFieldType.REPEATABLE_GROUP,
      required: true,
      order: 0,
      config: {
        childFields: GOAL_CHILD_FIELDS(config.templateType),
        minItems: 1,
        maxItems: 10,
        addButtonLabel: "Add Treatment Goal",
        itemLabel: "Goal",
        collapsible: true,
      },
    },
  });

  console.log(`  Created REPEATABLE_GROUP field: ${repeatableGroupField.id}`);

  // Verify the update
  const updatedSection = await prisma.carePlanTemplateSection.findUnique({
    where: { id: goalsSection.id },
    include: {
      fields: {
        orderBy: { order: "asc" },
      },
    },
  });

  console.log(`\n  Section now has ${updatedSection?.fields.length} field(s):`);
  updatedSection?.fields.forEach((f) => {
    console.log(`    - [${f.type}] ${f.label}`);
    if (f.type === FormFieldType.REPEATABLE_GROUP) {
      const config = f.config as { childFields?: { key: string; label: string }[] };
      console.log(`      Child fields: ${config.childFields?.map((c) => c.key).join(", ")}`);
    }
  });

  console.log(`\n  Migration complete for ${config.templateName}!`);
}

async function main() {
  console.log("Migrating Treatment Plan Templates to Repeatable Goals");
  console.log("=".repeat(60));

  for (const config of TEMPLATES_TO_MIGRATE) {
    await migrateTemplate(config);
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log("All migrations complete!");
  console.log("=".repeat(60));
}

main()
  .catch((e) => {
    console.error("Error during migration:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
