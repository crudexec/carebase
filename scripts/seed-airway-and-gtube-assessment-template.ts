import { PrismaClient } from "@prisma/client";
import { seedAirwayAndGTubeAssessmentTemplate } from "../prisma/seeds/airway-and-gtube-assessment-template";

const prisma = new PrismaClient();

async function main() {
  await seedAirwayAndGTubeAssessmentTemplate(prisma);
}

main()
  .catch((error) => {
    console.error("Failed to seed airway and G-tube assessment template:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
