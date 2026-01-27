import prisma from "@/prisma";

import { isActive } from "../../../lib";

export async function getFrequencies(providerId: string, status: string) {
  const result = await prisma.$transaction([
    prisma.patientFrequency.count({
      where: { active: isActive(status), patient: { providerId } },
    }),
    prisma.patientFrequency.findMany({
      where: { active: isActive(status), patient: { providerId } },
      include: { discipline: true },
    }),
  ]);

  return { frequencies: result[1], totalCount: result[0] };
}
