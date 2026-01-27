import { isActive } from "@/app/api/lib";
import prisma from "@/prisma";

export async function getplanOfCareDiagnosis(
  providerId: string,
  parentId: string,
  scope: string,
  status: string,
) {
  const result = await prisma.$transaction([
    prisma.pocDiagnosisProcedure.count({
      where: {
        active: isActive(status),
        planOfCare: { id: parentId, providerId },
        diagnosisProcedure: { scope },
      },
    }),
    prisma.pocDiagnosisProcedure.findMany({
      where: {
        active: isActive(status),
        planOfCare: { id: parentId, providerId },
        diagnosisProcedure: { scope },
      },
      include: { diagnosisProcedure: true },
    }),
  ]);
  return { diagnosisProcedures: result[1], totalCount: result[0] };
}
