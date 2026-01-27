import prisma from "@/prisma";

import { isActive } from "../../../lib";

export async function getInsurances(providerId: string, status?: string) {
  const result = await prisma.$transaction([
    prisma.patientInsurance.count({
      where: { active: isActive(status), patient: { providerId } },
    }),
    prisma.patientInsurance.findMany({
      where: { active: isActive(status), patient: { providerId } },
      include: {
        payer: true,
        insuranceCaseManager: true,
        relatedCaregiver: true,
      },
    }),
  ]);
  return { insurances: result[1], totalCount: result[0] };
}
