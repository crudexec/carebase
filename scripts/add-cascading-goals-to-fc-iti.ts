/**
 * Script to update FC and ITI Care Plan templates to use cascading goal selection
 *
 * Usage:
 *   npx tsx scripts/add-cascading-goals-to-fc-iti.ts
 */

import { PrismaClient, FormFieldType } from "@prisma/client";

const prisma = new PrismaClient();

async function updateTemplate(templateName: string, templateType: string) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Updating ${templateName}...`);
  console.log("=".repeat(60));

  // Find the template
  const template = await prisma.carePlanTemplate.findFirst({
    where: {
      name: { contains: templateName },
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
    console.error(`${templateName} template not found. Skipping...`);
    return;
  }

  console.log(`Found template: ${template.name} (ID: ${template.id})`);

  // Find the Treatment Goals section
  const goalsSection = template.sections.find(
    (s) => s.title === "Treatment Goals"
  );

  if (!goalsSection) {
    console.error("Treatment Goals section not found in template. Skipping...");
    return;
  }

  console.log(`Found section: ${goalsSection.title} (ID: ${goalsSection.id})`);

  // Check if cascading select already exists
  const existingCascading = goalsSection.fields.find(
    (f) => f.type === FormFieldType.CASCADING_SELECT
  );

  if (existingCascading) {
    console.log("Cascading select field already exists. Skipping...");
    return;
  }

  // Add the first cascading select field at the top
  const newField = await prisma.carePlanTemplateField.create({
    data: {
      sectionId: goalsSection.id,
      label: "Select Treatment Goal",
      type: FormFieldType.CASCADING_SELECT,
      required: false,
      order: 0,
      config: {
        templateType: templateType,
        allowMultipleSteps: true,
        showSteps: true,
      },
    },
  });

  console.log(`Created field: ${newField.label}`);

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

  // Add a second cascading select for Goal 2
  const secondGoalField = await prisma.carePlanTemplateField.create({
    data: {
      sectionId: goalsSection.id,
      label: "Select Treatment Goal 2 (Optional)",
      type: FormFieldType.CASCADING_SELECT,
      required: false,
      order: 7, // After first goal fields
      config: {
        templateType: templateType,
        allowMultipleSteps: true,
        showSteps: true,
      },
    },
  });

  console.log(`Created field: ${secondGoalField.label}`);

  // Verify the update
  const updatedSection = await prisma.carePlanTemplateSection.findUnique({
    where: { id: goalsSection.id },
    include: {
      fields: {
        orderBy: { order: "asc" },
      },
    },
  });

  console.log(`\nSection now has ${updatedSection?.fields.length} fields:`);
  updatedSection?.fields.slice(0, 10).forEach((f, i) => {
    console.log(`  ${i + 1}. [${f.type}] ${f.label}`);
  });
  if ((updatedSection?.fields.length || 0) > 10) {
    console.log(`  ... and ${(updatedSection?.fields.length || 0) - 10} more`);
  }
}

async function main() {
  console.log("Adding Cascading Goal Selection to FC and ITI Templates");

  // Update FC template
  await updateTemplate("FC Treatment Plan", "FC");

  // Update ITI template
  await updateTemplate("ITI Treatment Plan", "ITI");

  console.log("\n" + "=".repeat(60));
  console.log("Done! All templates have been updated.");
  console.log("=".repeat(60));
}

main()
  .catch((e) => {
    console.error("Error updating templates:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
