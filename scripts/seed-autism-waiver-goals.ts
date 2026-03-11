/**
 * Seed script for Autism Waiver Goal Hierarchies
 *
 * This script imports the goal data from the oron JSON files into the database.
 * Each JSON file corresponds to a treatment plan type:
 * - iiss-goals.json → IISS (Intensive Individual Support Services)
 * - fc-goals.json → FC (Family Consultation)
 * - ti-goals.json → ITI (Intensive Therapeutic Integration)
 *
 * The goal hierarchy has 4 levels:
 * 1. Goal Area (e.g., "Improving Compliance")
 * 2. Target Skill (e.g., "Task Engagement")
 * 3. Short Term Objective (e.g., "Attend to an activity from 5 to 20 minutes")
 * 4. Task Analysis Steps (e.g., "Present schedule to technician")
 *
 * Usage:
 *   npx ts-node scripts/seed-autism-waiver-goals.ts
 *
 * Note: This script requires a company ID to associate the goals with.
 *       It will look for the first company in the database.
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

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
  console.log("Starting Autism Waiver Goal Hierarchy Seed...\n");

  // Find the first company (or a specific one if needed)
  const company = await prisma.company.findFirst({
    where: { isActive: true },
  });

  if (!company) {
    console.error("Error: No active company found in the database.");
    console.error("Please create a company first or specify a company ID.");
    process.exit(1);
  }

  console.log(`Using company: ${company.name} (${company.id})\n`);

  // Seed each goal hierarchy
  for (const config of goalConfigs) {
    console.log(`Processing ${config.name}...`);
    await seedGoalHierarchy(company.id, config);
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
