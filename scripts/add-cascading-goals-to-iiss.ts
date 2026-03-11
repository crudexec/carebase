/**
 * Script to update the IISS Care Plan template to use cascading goal selection
 *
 * This adds a CASCADING_SELECT field to the Treatment Goals section that
 * allows users to select goals from the pre-defined IISS goal hierarchy.
 *
 * Usage:
 *   npx tsx scripts/add-cascading-goals-to-iiss.ts
 */

import { PrismaClient, FormFieldType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Updating IISS Care Plan Template with Cascading Goal Selection...\n");

  // Find the IISS template
  const template = await prisma.carePlanTemplate.findFirst({
    where: {
      name: { contains: "IISS" },
    },
    include: {
      sections: {
        include: {
          fields: true,
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!template) {
    console.error("IISS template not found. Please run the seed script first.");
    process.exit(1);
  }

  console.log(`Found template: ${template.name} (ID: ${template.id})`);

  // Find the Treatment Goals section
  const goalsSection = template.sections.find(
    (s) => s.title === "Treatment Goals"
  );

  if (!goalsSection) {
    console.error("Treatment Goals section not found in template.");
    process.exit(1);
  }

  console.log(`Found section: ${goalsSection.title} (ID: ${goalsSection.id})`);
  console.log(`Current fields: ${goalsSection.fields.length}`);

  // Get the max field order
  const maxOrder = Math.max(...goalsSection.fields.map((f) => f.order), -1);

  // Add the cascading select field
  const newField = await prisma.carePlanTemplateField.create({
    data: {
      sectionId: goalsSection.id,
      label: "Select Treatment Goal",
      type: FormFieldType.CASCADING_SELECT,
      required: false,
      order: 0, // Put it at the top
      config: {
        templateType: "IISS",
        allowMultipleSteps: true,
        showSteps: true,
      },
    },
  });

  console.log(`\nCreated new field: ${newField.label} (ID: ${newField.id})`);

  // Shift existing fields down
  await prisma.carePlanTemplateField.updateMany({
    where: {
      sectionId: goalsSection.id,
      id: { not: newField.id },
    },
    data: {
      order: { increment: 1 },
    },
  });

  console.log("Shifted existing fields down.");

  // Also add a second cascading select for Goal 2
  const secondGoalField = await prisma.carePlanTemplateField.create({
    data: {
      sectionId: goalsSection.id,
      label: "Select Treatment Goal 2 (Optional)",
      type: FormFieldType.CASCADING_SELECT,
      required: false,
      order: 7, // After first goal fields
      config: {
        templateType: "IISS",
        allowMultipleSteps: true,
        showSteps: true,
      },
    },
  });

  console.log(`Created second goal field: ${secondGoalField.label}`);

  // Verify the update
  const updatedSection = await prisma.carePlanTemplateSection.findUnique({
    where: { id: goalsSection.id },
    include: {
      fields: {
        orderBy: { order: "asc" },
      },
    },
  });

  console.log(`\nUpdated section now has ${updatedSection?.fields.length} fields:`);
  updatedSection?.fields.forEach((f, i) => {
    console.log(`  ${i + 1}. [${f.type}] ${f.label}`);
  });

  console.log("\nDone! You can now test the cascading goal selection in the IISS care plan.");
}

main()
  .catch((e) => {
    console.error("Error updating template:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
