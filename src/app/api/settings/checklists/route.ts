import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { checklistRoute, checklistUser } from "@/lib/checklists/server";

export async function GET() {
  return checklistRoute(async () => {
    const user = await checklistUser({ allowDisabled: true });
    return NextResponse.json(user.company);
  });
}

export async function PATCH(request: Request) {
  return checklistRoute(async () => {
    const user = await checklistUser({ admin: true, allowDisabled: true });
    const data = z
      .object({
        checklistsEnabled: z.boolean(),
        checklistsDashboardVisible: z.boolean(),
      })
      .strict()
      .parse(await request.json());
    const company = await prisma.$transaction(async (tx) => {
      const updated = await tx.company.update({
        where: { id: user.companyId },
        data,
        select: { checklistsEnabled: true, checklistsDashboardVisible: true },
      });
      await tx.auditLog.create({
        data: {
          userId: user.id,
          companyId: user.companyId,
          action: "CHECKLIST_SETTINGS_UPDATED",
          entityType: "Company",
          entityId: user.companyId,
          changes: data,
        },
      });
      return updated;
    });
    return NextResponse.json(company);
  });
}
