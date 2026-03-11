/**
 * Seed script for Autism Waiver Goal Hierarchies for admin@carebase.com
 *
 * This script imports the goal data from the oron JSON files into the database
 * specifically for the Carebase company (admin@carebase.com account).
 *
 * Usage:
 *   npx tsx scripts/seed-goals-for-carebase.ts
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

const COMPANY_ID = "default-company-001"; // Carebase company

interface ShortTermObjective {
  sto: string;
  taskAnalysis: string[];
}

interface TargetSkillData {
  targetSkill: string;
  shortTermObjectives: ShortTermObjective[];
}

interface GoalAreaData {
  goalArea: string;
  targetSkills: TargetSkillData[];
}

interface GoalConfig {
  name: string;
  description: string;
  templateTypes: string[];
  jsonFile: string;
}

const goalConfigs: GoalConfig[] = [
  {
    name: "IISS Goals",
    description: "Goal hierarchy for Intensive Individual Support Services treatment plans",
    templateTypes: ["IISS", "iiss"],
    jsonFile: "iiss-goals.json",
  },
  {
    name: "FC Goals",
    description: "Goal hierarchy for Family Consultation treatment plans",
    templateTypes: ["FC", "fc"],
    jsonFile: "fc-goals.json",
  },
  {
    name: "ITI Goals",
    description: "Goal hierarchy for Intensive Therapeutic Integration treatment plans",
    templateTypes: ["ITI", "TI", "ti", "iti"],
    jsonFile: "ti-goals.json",
  },
];

async function seedGoalHierarchy(companyId: string, config: GoalConfig): Promise<void> {
  const jsonPath = path.join(__dirname, "..", "oron", "frontend", "src", "data", config.jsonFile);

  if (!fs.existsSync(jsonPath)) {
    console.log(`  Skipping ${config.name}: JSON file not found at ${jsonPath}`);
    return;
  }

  const jsonContent = fs.readFileSync(jsonPath, "utf-8");
  const goalAreas: GoalAreaData[] = JSON.parse(jsonContent);

  console.log(`  Creating hierarchy: ${config.name}`);
  console.log(`    - ${goalAreas.length} goal areas`);

  // Check if hierarchy already exists
  const existingHierarchy = await prisma.goalHierarchy.findFirst({
    where: {
      companyId,
      name: config.name,
    },
  });

  if (existingHierarchy) {
    console.log(`  Hierarchy "${config.name}" already exists, skipping...`);
    return;
  }

  // Create the goal hierarchy
  const hierarchy = await prisma.goalHierarchy.create({
    data: {
      name: config.name,
      description: config.description,
      templateTypes: config.templateTypes,
      isActive: true,
      companyId,
    },
  });

  let totalTargetSkills = 0;
  let totalObjectives = 0;
  let totalSteps = 0;

  // Create goal areas with their children
  for (let areaIndex = 0; areaIndex < goalAreas.length; areaIndex++) {
    const areaData = goalAreas[areaIndex];

    const goalArea = await prisma.goalArea.create({
      data: {
        name: areaData.goalArea,
        displayOrder: areaIndex,
        isActive: true,
        hierarchyId: hierarchy.id,
      },
    });

    // Create target skills
    for (let skillIndex = 0; skillIndex < areaData.targetSkills.length; skillIndex++) {
      const skillData = areaData.targetSkills[skillIndex];
      totalTargetSkills++;

      const targetSkill = await prisma.targetSkill.create({
        data: {
          name: skillData.targetSkill,
          displayOrder: skillIndex,
          isActive: true,
          goalAreaId: goalArea.id,
        },
      });

      // Create short term objectives
      for (let objIndex = 0; objIndex < skillData.shortTermObjectives.length; objIndex++) {
        const objData = skillData.shortTermObjectives[objIndex];
        totalObjectives++;

        const objective = await prisma.shortTermObjective.create({
          data: {
            name: objData.sto,
            displayOrder: objIndex,
            isActive: true,
            targetSkillId: targetSkill.id,
          },
        });

        // Create task analysis steps
        for (let stepIndex = 0; stepIndex < objData.taskAnalysis.length; stepIndex++) {
          const stepText = objData.taskAnalysis[stepIndex];
          totalSteps++;

          // Clean up the step text (remove leading bullet points and whitespace)
          const cleanedStep = stepText.replace(/^[·•\-\s]+/, "").trim();

          await prisma.taskAnalysisStep.create({
            data: {
              name: cleanedStep,
              displayOrder: stepIndex,
              isActive: true,
              objectiveId: objective.id,
            },
          });
        }
      }
    }
  }

  console.log(`    - ${totalTargetSkills} target skills`);
  console.log(`    - ${totalObjectives} short term objectives`);
  console.log(`    - ${totalSteps} task analysis steps`);
  console.log(`  Created hierarchy: ${hierarchy.id}`);
}

async function main() {
  console.log("Seeding Goal Hierarchies for admin@carebase.com (Carebase company)\n");
  console.log(`Company ID: ${COMPANY_ID}\n`);

  // Verify the company exists
  const company = await prisma.company.findUnique({
    where: { id: COMPANY_ID },
  });

  if (!company) {
    console.error(`Error: Company with ID ${COMPANY_ID} not found.`);
    process.exit(1);
  }

  console.log(`Company: ${company.name}\n`);

  // Seed each goal hierarchy
  for (const config of goalConfigs) {
    console.log(`Processing ${config.name}...`);
    await seedGoalHierarchy(COMPANY_ID, config);
    console.log();
  }

  console.log("Goal hierarchy seeding complete!");
}

main()
  .catch((e) => {
    console.error("Error seeding goal hierarchies:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
