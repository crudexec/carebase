import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  ChecklistError,
  checklistRoute,
  checklistUser,
  templateSchema,
} from "@/lib/checklists/server";

export async function GET() {
  return checklistRoute(async () => {
    const user = await checklistUser({ admin: true });
    const [templates, users] = await Promise.all([
      prisma.checklistTemplate.findMany({
        where: { companyId: user.companyId },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.user.findMany({
        where: { companyId: user.companyId, isActive: true },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
        orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      }),
    ]);
    return NextResponse.json({ templates, users });
  });
}

export async function POST(request: Request) {
  return checklistRoute(async () => {
    const user = await checklistUser({ admin: true });
    const data = templateSchema.parse(await request.json());
    const template = await prisma.checklistTemplate.create({
      data: { ...data, companyId: user.companyId, createdById: user.id },
    });
    return NextResponse.json({ template }, { status: 201 });
  });
}

export async function PATCH(request: Request) {
  return checklistRoute(async () => {
    const user = await checklistUser({ admin: true });
    const body = z
      .object({
        id: z.string().min(1),
        archived: z.boolean().optional(),
        ...templateSchema.partial().shape,
      })
      .strict()
      .parse(await request.json());
    const { id, ...data } = body;
    const result = await prisma.checklistTemplate.updateMany({
      where: { id, companyId: user.companyId },
      data,
    });
    if (!result.count) throw new ChecklistError("Template not found", 404);
    return NextResponse.json({ success: true });
  });
}
