import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { UserRole } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  orderIndex: z.number().int().min(0).optional(),
  isRequired: z.boolean().optional(),
});

function requireManager(role: UserRole) {
  return hasAnyPermission(role, [
    PERMISSIONS.USER_MANAGE,
    PERMISSIONS.USER_FULL,
  ]);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role } = session.user;
    const { id: courseId, moduleId } = await params;

    if (!requireManager(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parseResult = updateSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.courseModule.findFirst({
      where: { id: moduleId, courseId, companyId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    const courseModule = await prisma.courseModule.update({
      where: { id: moduleId },
      data: parseResult.data,
    });

    return NextResponse.json(courseModule);
  } catch (error) {
    console.error("Error updating course module:", error);
    return NextResponse.json(
      { error: "Failed to update course module" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role } = session.user;
    const { id: courseId, moduleId } = await params;

    if (!requireManager(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existing = await prisma.courseModule.findFirst({
      where: { id: moduleId, courseId, companyId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.courseLesson.updateMany({
        where: { moduleId, courseId, companyId },
        data: { moduleId: null },
      }),
      prisma.courseModule.delete({ where: { id: moduleId } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting course module:", error);
    return NextResponse.json(
      { error: "Failed to delete course module" },
      { status: 500 }
    );
  }
}
