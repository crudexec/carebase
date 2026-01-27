import { isActive } from "@/app/api/lib";
import prisma from "@/prisma";

export async function getOrdersAndGoals(
  providerId: string,
  planOfCareId: string,
  status: string,
) {
  const result = await prisma.$transaction([
    prisma.ordersAndGoals.count({
      where: {
        active: isActive(status),
        planOfCare: { id: planOfCareId, providerId },
      },
    }),
    prisma.ordersAndGoals.findMany({
      where: {
        active: isActive(status),
        planOfCare: { id: planOfCareId, providerId },
      },
      include: { discipline: true },
    }),
  ]);

  return { ordersAndGoals: result[1], totalCount: result[0] };
}
