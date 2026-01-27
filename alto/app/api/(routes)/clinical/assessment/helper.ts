import { isActive } from "@/app/api/lib";
import prisma from "@/prisma";

export async function getAssessments(patientId?: string, status?: string) {
  const result = await prisma.assessment.findMany({
    where: {
      patientId,
      active: isActive(status),
    },
  });
  return { assessments: result, totalCount: result.length };
}
