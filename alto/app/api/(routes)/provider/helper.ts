import prisma from "@/prisma";

export async function getProviders() {
  const result = await prisma.$transaction([
    prisma.provider.count({ where: { active: true } }),
    prisma.provider.findMany({ where: { active: true } }),
  ]);
  return { providers: result[1], totalCount: result[0] };
}
