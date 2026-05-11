import { PrismaClient } from "@prisma/client";
import { seedNursingFlowSheetTemplate } from "../prisma/seeds/nursing-flow-sheet-template";

const prisma = new PrismaClient();

async function main() {
  await seedNursingFlowSheetTemplate(prisma);
}

main()
  .catch((error) => {
    console.error("Failed to seed Nursing Flow Sheet template:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
