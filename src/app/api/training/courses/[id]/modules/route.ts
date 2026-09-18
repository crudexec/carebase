import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";

const createSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  orderIndex: z.number().int().min(0).optional(),
  isRequired: z.boolean().default(true),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, id: userId } = session.user;
    const { id: courseId } = await params;

    const course = await prisma.trainingCourse.findFirst({
      where: { id: courseId, companyId },
      select: { id: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const modules = await prisma.courseModule.findMany({
      where: { courseId, companyId },
      orderBy: { orderIndex: "asc" },
      include: {
        lessons: {
          orderBy: { orderIndex: "asc" },
          include: {
            progress: {
              where: { userId },
            },
          },
        },
      },
    });

    return NextResponse.json(modules.map((module) => ({
      ...module,
      lessons: module.lessons.map((lesson) => ({
        ...lesson,
        isCompleted: lesson.progress.some((progress) => progress.completedAt),
        progress: undefined,
      })),
    })));
  } catch (error) {
    console.error("Error fetching course modules:", error);
    return NextResponse.json(
      { error: "Failed to fetch course modules" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role } = session.user;
    const { id: courseId } = await params;

    const canManage = hasAnyPermission(role, [
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]);

    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const course = await prisma.trainingCourse.findFirst({
      where: { id: courseId, companyId },
      select: { id: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const body = await request.json();
    const parseResult = createSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    let orderIndex = data.orderIndex;
    if (orderIndex === undefined) {
      const maxOrder = await prisma.courseModule.aggregate({
        where: { courseId, companyId },
        _max: { orderIndex: true },
      });
      orderIndex = (maxOrder._max.orderIndex ?? -1) + 1;
    }

    const courseModule = await prisma.courseModule.create({
      data: {
        title: data.title,
        description: data.description,
        isRequired: data.isRequired,
        orderIndex,
        courseId,
        companyId,
      },
    });

    return NextResponse.json(courseModule, { status: 201 });
  } catch (error) {
    console.error("Error creating course module:", error);
    return NextResponse.json(
      { error: "Failed to create course module" },
      { status: 500 }
    );
  }
}
