import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";
import { TrainingCategory, TrainingFormat, UserRole } from "@prisma/client";

// Query validation schema
const querySchema = z.object({
  category: z.nativeEnum(TrainingCategory).optional(),
  isActive: z.enum(["true", "false"]).optional().transform(v => v === "true"),
  requiredForRole: z.nativeEnum(UserRole).optional(),
  requiredForNewHires: z.enum(["true", "false"]).optional().transform(v => v === "true"),
});

// Create course schema
const createSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.nativeEnum(TrainingCategory),
  format: z.nativeEnum(TrainingFormat),
  durationMinutes: z.number().int().min(1),
  ceuCredits: z.number().min(0).default(0),
  contactHours: z.number().min(0).default(0),
  learningObjectives: z.array(z.string()).default([]),
  materials: z.array(z.string()).default([]),
  requiresAssessment: z.boolean().default(false),
  passingScore: z.number().min(0).max(100).optional(),
  isRecurring: z.boolean().default(false),
  recurrenceMonths: z.number().int().min(1).optional(),
  prerequisites: z.array(z.string()).default([]),
  requiredForRoles: z.array(z.nativeEnum(UserRole)).default([]),
  requiredForNewHires: z.boolean().default(false),
  newHireDueDays: z.number().int().min(1).optional(),
  isActive: z.boolean().default(true),
});

// GET - List training courses
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId } = session.user;

    const { searchParams } = new URL(request.url);
    const queryResult = querySchema.safeParse(Object.fromEntries(searchParams));

    if (!queryResult.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: queryResult.error.flatten() },
        { status: 400 }
      );
    }

    const { category, isActive, requiredForRole, requiredForNewHires } = queryResult.data;

    const courses = await prisma.trainingCourse.findMany({
      where: {
        companyId,
        ...(category && { category }),
        ...(isActive !== undefined && { isActive }),
        ...(requiredForRole && { requiredForRoles: { has: requiredForRole } }),
        ...(requiredForNewHires !== undefined && { requiredForNewHires }),
      },
      orderBy: [{ category: "asc" }, { title: "asc" }],
      include: {
        _count: {
          select: {
            sessions: true,
            assignments: true,
          },
        },
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching training courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch training courses" },
      { status: 500 }
    );
  }
}

// POST - Create training course
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role } = session.user;

    const canManage = hasAnyPermission(role, [
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]);

    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

    // Validate prerequisites exist
    if (data.prerequisites.length > 0) {
      const prereqs = await prisma.trainingCourse.count({
        where: { id: { in: data.prerequisites }, companyId },
      });
      if (prereqs !== data.prerequisites.length) {
        return NextResponse.json(
          { error: "One or more prerequisites not found" },
          { status: 400 }
        );
      }
    }

    const course = await prisma.trainingCourse.create({
      data: {
        ...data,
        companyId,
      },
      include: {
        _count: {
          select: {
            sessions: true,
            assignments: true,
          },
        },
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Error creating training course:", error);
    return NextResponse.json(
      { error: "Failed to create training course" },
      { status: 500 }
    );
  }
}
