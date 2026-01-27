import prisma from "@/prisma";

import { CustomRequest, getQuery, isActive } from "../../../lib";

export async function getPriorAuthorizations(req: CustomRequest) {
  const { status, id } = getQuery(req);
  const result = await prisma.$transaction([
    prisma.insurancePriorAuthorization.count({
      where: {
        patientInsuranceId: id as string,
        active: isActive(status),
        providerId: req.user.providerId as string,
      },
    }),
    prisma.insurancePriorAuthorization.findMany({
      where: {
        patientInsuranceId: id as string,
        active: isActive(status),
        providerId: req.user.providerId as string,
      },
      include: {
        discipline: true,
        patientInsurance: true,
      },
    }),
  ]);
  return { priorAuthorizations: result[1], totalCount: result[0] };
}
