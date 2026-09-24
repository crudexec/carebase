import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  ChecklistError,
  accessibleChecklists,
  checklistInclude,
  checklistRoute,
  checklistUser,
} from "@/lib/checklists/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return checklistRoute(async () => {
    const user = await checklistUser();
    const { id } = await context.params;
    const checklist = await prisma.checklist.findFirst({
      where: { id, ...accessibleChecklists(user) },
      include: checklistInclude,
    });
    if (!checklist) throw new ChecklistError("Checklist not found", 404);
    return NextResponse.json({
      checklist,
      userId: user.id,
      isAdmin: user.role === "ADMIN",
    });
  });
}
