import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  ChecklistError,
  accessibleChecklists,
  checklistInclude,
  checklistRoute,
  checklistUser,
  personSelect,
  unfinishedItems,
} from "@/lib/checklists/server";

export async function GET(request: Request) {
  return checklistRoute(async () => {
    const params = new URL(request.url).searchParams;
    const user = await checklistUser({
      allowDisabled: params.get("widget") === "true",
    });
    if (params.get("widget") === "true") {
      if (
        !user.company.checklistsEnabled ||
        !user.company.checklistsDashboardVisible
      )
        return NextResponse.json({ checklist: null, visible: false });
      const checklist = await prisma.checklist.findFirst({
        where: {
          companyId: user.companyId,
          assigneeId: user.id,
          items: unfinishedItems,
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        include: checklistInclude,
      });
      return NextResponse.json({
        checklist,
        visible: true,
        userId: user.id,
        isAdmin: user.role === "ADMIN",
      });
    }
    const filter = params.get("status");
    const checklists = await prisma.checklist.findMany({
      where: {
        ...accessibleChecklists(user),
        ...(filter === "completed"
          ? { items: { every: { status: "APPROVED" }, some: {} } }
          : filter === "active"
            ? { items: unfinishedItems }
            : {}),
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        assigneeId: true,
        assignee: { select: personSelect },
        items: { select: { id: true, status: true } },
      },
    });
    return NextResponse.json({
      checklists,
      isAdmin: user.role === "ADMIN",
      userId: user.id,
    });
  });
}

export async function POST(request: Request) {
  return checklistRoute(async () => {
    const user = await checklistUser({ admin: true });
    const { templateId, assigneeIds } = z
      .object({
        templateId: z.string().min(1),
        assigneeIds: z
          .array(z.string().min(1))
          .min(1, "Select at least one user")
          .max(500),
      })
      .parse(await request.json());
    const ids = [...new Set(assigneeIds)];
    const checklists = await prisma.$transaction(
      async (tx) => {
        const template = await tx.checklistTemplate.findFirst({
          where: { id: templateId, companyId: user.companyId, archived: false },
        });
        if (!template)
          throw new ChecklistError("Active template not found", 404);
        if (!template.items.length)
          throw new ChecklistError("Template must have at least one item");
        const count = await tx.user.count({
          where: { id: { in: ids }, companyId: user.companyId, isActive: true },
        });
        if (count !== ids.length)
          throw new ChecklistError(
            "All assignees must be active users in your company",
          );
        const copies = [];
        for (const assigneeId of ids) {
          copies.push(
            await tx.checklist.create({
              data: {
                companyId: user.companyId,
                templateId,
                assigneeId,
                createdById: user.id,
                title: template.title,
                description: template.description,
                items: {
                  create: template.items.map((title, position) => ({
                    title,
                    position,
                  })),
                },
              },
              select: { id: true },
            }),
          );
        }
        await tx.auditLog.create({
          data: {
            userId: user.id,
            companyId: user.companyId,
            action: "CHECKLISTS_ASSIGNED",
            entityType: "ChecklistTemplate",
            entityId: templateId,
            changes: {
              assigneeIds: ids,
              checklistIds: copies.map((c) => c.id),
            },
          },
        });
        return copies;
      },
      { timeout: 30000 },
    );
    return NextResponse.json({ checklists }, { status: 201 });
  });
}
