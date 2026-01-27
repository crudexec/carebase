import { PrismaClient } from "@prisma/client";

import { seed } from "./helper.ts";
export const prisma = new PrismaClient();

const isTest = process.env.NODE_ENV === "test";
export const log = (text: string) => (!isTest ? console.log(text) : null);

export const createLog = async (
  context: string,
  text: string,
  contextId: string,
) => {
  return await prisma.log.create({
    data: {
      context,
      text,
      contextId,
    },
  });
};

async function deleteAll() {
  await prisma.assessment.deleteMany();
  await prisma.userProvider.deleteMany();
  await prisma.pocDiagnosisProcedure.deleteMany();
  await prisma.planOfCare.deleteMany();
  await prisma.payer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.provider.deleteMany();
}

async function main() {
  console.log("Seeding started");

  await deleteAll();

  for (let i = 0; i < 2; i++) {
    await seed();
  }

  console.log("Seeding completed");

  process.exit();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
