import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError, z } from "zod";

export class ChecklistError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

export async function checklistRoute(action: () => Promise<Response>) {
  try {
    return await action();
  } catch (error) {
    if (error instanceof ChecklistError)
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    if (error instanceof ZodError)
      return NextResponse.json(
        { error: error.issues[0]?.message || "Invalid request" },
        { status: 400 },
      );
    if (error instanceof SyntaxError)
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    console.error("Checklist request failed:", error);
    return NextResponse.json(
      { error: "Unable to process checklist request" },
      { status: 500 },
    );
  }
}

export async function checklistUser(
  options: { admin?: boolean; allowDisabled?: boolean } = {},
) {
  const session = await auth();
  if (!session?.user) throw new ChecklistError("Unauthorized", 401);
  const user = await prisma.user.findFirst({
    where: {
      id: session.user.id,
      companyId: session.user.companyId,
      isActive: true,
    },
    select: {
      id: true,
      role: true,
      companyId: true,
      company: {
        select: { checklistsEnabled: true, checklistsDashboardVisible: true },
      },
    },
  });
  if (!user) throw new ChecklistError("Unauthorized", 401);
  if (options.admin && user.role !== "ADMIN")
    throw new ChecklistError("Only admins can manage checklists", 403);
  if (!options.allowDisabled && !user.company.checklistsEnabled)
    throw new ChecklistError("Checklists are disabled for your company", 403);
  return user;
}

export type ChecklistActor = Awaited<ReturnType<typeof checklistUser>>;
export function accessibleChecklists(
  user: ChecklistActor,
): Prisma.ChecklistWhereInput {
  return {
    companyId: user.companyId,
    ...(user.role === "ADMIN" ? {} : { assigneeId: user.id }),
  };
}

export async function accessibleItem(user: ChecklistActor, id: string) {
  const item = await prisma.checklistItem.findFirst({
    where: { id, checklist: accessibleChecklists(user) },
  });
  if (!item) throw new ChecklistError("Checklist item not found", 404);
  return item;
}

export const personSelect = {
  id: true,
  firstName: true,
  lastName: true,
} as const;
export const attachmentSelect = {
  id: true,
  fileName: true,
  contentType: true,
  size: true,
  createdAt: true,
  author: { select: personSelect },
} as const;
export const checklistInclude = {
  assignee: { select: personSelect },
  items: {
    orderBy: { position: "asc" as const },
    include: {
      submittedBy: { select: personSelect },
      approvedBy: { select: personSelect },
      comments: {
        orderBy: { createdAt: "asc" as const },
        include: { author: { select: personSelect } },
      },
      attachments: {
        orderBy: { createdAt: "asc" as const },
        select: attachmentSelect,
      },
    },
  },
} satisfies Prisma.ChecklistInclude;

export const templateSchema = z.object({
  title: z.string().trim().min(1, "A title is required").max(200),
  description: z.string().trim().max(5000).default(""),
  items: z
    .array(z.string().trim().min(1, "Each item needs a title").max(500))
    .min(1, "Add at least one item")
    .max(100),
});

export const unfinishedItems = {
  some: { status: { not: "APPROVED" as const } },
};
