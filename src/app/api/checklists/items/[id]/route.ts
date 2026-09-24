import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  ChecklistError,
  accessibleItem,
  checklistRoute,
  checklistUser,
} from "@/lib/checklists/server";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return checklistRoute(async () => {
    const user = await checklistUser();
    const { id } = await context.params;
    const { action } = z
      .object({ action: z.enum(["submit", "uncheck", "approve", "reopen"]) })
      .parse(await request.json());
    const item = await accessibleItem(user, id);
    const isAdmin = user.role === "ADMIN";
    if ((action === "approve" || action === "reopen") && !isAdmin)
      throw new ChecklistError("Only admins can approve or reopen items", 403);
    const expected =
      action === "submit"
        ? "PENDING"
        : action === "reopen"
          ? "APPROVED"
          : "SUBMITTED";
    if (item.status !== expected)
      throw new ChecklistError(
        "This item has changed. Refresh and try again.",
        409,
      );
    const status =
      action === "approve"
        ? "APPROVED"
        : action === "submit"
          ? "SUBMITTED"
          : "PENDING";
    await prisma.$transaction(async (tx) => {
      const result = await tx.checklistItem.updateMany({
        where: {
          id,
          status: expected,
          submittedAt: item.submittedAt,
          approvedAt: item.approvedAt,
        },
        data: {
          status,
          submittedAt:
            action === "submit"
              ? new Date()
              : action === "approve"
                ? item.submittedAt
                : null,
          submittedById:
            action === "submit"
              ? user.id
              : action === "approve"
                ? item.submittedById
                : null,
          approvedAt: action === "approve" ? new Date() : null,
          approvedById: action === "approve" ? user.id : null,
        },
      });
      if (!result.count)
        throw new ChecklistError(
          "This item has changed. Refresh and try again.",
          409,
        );
      await tx.auditLog.create({
        data: {
          userId: user.id,
          companyId: user.companyId,
          action: `CHECKLIST_ITEM_${action.toUpperCase()}`,
          entityType: "ChecklistItem",
          entityId: id,
          changes: { from: expected, to: status },
        },
      });
    });
    return NextResponse.json({ success: true });
  });
}
