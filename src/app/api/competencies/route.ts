import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";
import { CompetencyCategory, CompetencyAssessmentMethod, UserRole } from "@prisma/client";

// Query validation schema
const querySchema = z.object({
  category: z.nativeEnum(CompetencyCategory).optional(),
  isActive: z.enum(["true", "false"]).optional().transform(v => v === "true"),
  requiredForRole: z.nativeEnum(UserRole).optional(),
});

// Create competency schema
const createSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.nativeEnum(CompetencyCategory),
  assessmentMethod: z.nativeEnum(CompetencyAssessmentMethod),
  passingScore: z.number().min(0).max(100).optional(),
  validityMonths: z.number().int().min(1).default(12),
  requiresRevalidation: z.boolean().default(true),
  prerequisiteIds: z.array(z.string()).default([]),
  requiredForRoles: z.array(z.nativeEnum(UserRole)).default([]),
  requiredForServices: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

// GET - List competencies
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role } = session.user;

    const canView = hasAnyPermission(role, [
      PERMISSIONS.USER_VIEW,
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]);

    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const queryResult = querySchema.safeParse(Object.fromEntries(searchParams));

    if (!queryResult.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: queryResult.error.flatten() },
        { status: 400 }
      );
    }

    const { category, isActive, requiredForRole } = queryResult.data;

    const competencies = await prisma.competency.findMany({
      where: {
        companyId,
        ...(category && { category }),
        ...(isActive !== undefined && { isActive }),
        ...(requiredForRole && { requiredForRoles: { has: requiredForRole } }),
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: {
            staffCompetencies: true,
            taskCompetencies: true,
          },
        },
      },
    });

    return NextResponse.json(competencies);
  } catch (error) {
    console.error("Error fetching competencies:", error);
    return NextResponse.json(
      { error: "Failed to fetch competencies" },
      { status: 500 }
    );
  }
}

// POST - Create competency
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

    // Check for duplicate name
    const existing = await prisma.competency.findFirst({
      where: {
        companyId,
        name: data.name,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A competency with this name already exists" },
        { status: 400 }
      );
    }

    const competency = await prisma.competency.create({
      data: {
        ...data,
        companyId,
      },
      include: {
        _count: {
          select: {
            staffCompetencies: true,
            taskCompetencies: true,
          },
        },
      },
    });

    return NextResponse.json(competency, { status: 201 });
  } catch (error) {
    console.error("Error creating competency:", error);
    return NextResponse.json(
      { error: "Failed to create competency" },
      { status: 500 }
    );
  }
}
