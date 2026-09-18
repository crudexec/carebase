import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { UserRole } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  moduleId: z.string().nullable().optional(),
  orderIndex: z.number().int().min(0).optional(),
  videoUrl: z.string().url().nullable().optional(),
  estimatedMinutes: z.number().int().min(1).optional(),
});

function assertCanManage(role: UserRole) {
  return hasAnyPermission(role, [
    PERMISSIONS.USER_MANAGE,
    PERMISSIONS.USER_FULL,
  ]);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role } = session.user;
    const { id: courseId, lessonId } = await params;

    if (!assertCanManage(role)) {
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

    const existing = await prisma.courseLesson.findFirst({
      where: { id: lessonId, courseId, companyId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const data = parseResult.data;

    if (data.moduleId) {
      const courseModule = await prisma.courseModule.findFirst({
        where: { id: data.moduleId, courseId, companyId },
      });

      if (!courseModule) {
        return NextResponse.json({ error: "Module not found" }, { status: 404 });
      }
    }

    const lesson = await prisma.courseLesson.update({
      where: { id: lessonId },
      data,
    });

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("Error updating lesson:", error);
    return NextResponse.json(
      { error: "Failed to update lesson" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role } = session.user;
    const { id: courseId, lessonId } = await params;

    if (!assertCanManage(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existing = await prisma.courseLesson.findFirst({
      where: { id: lessonId, courseId, companyId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    await prisma.courseLesson.delete({ where: { id: lessonId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    return NextResponse.json(
      { error: "Failed to delete lesson" },
      { status: 500 }
    );
  }
}
