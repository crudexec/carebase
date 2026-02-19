import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";
import { CompetencyCategory, CompetencyAssessmentMethod, UserRole } from "@prisma/client";

// Update competency schema
const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.nativeEnum(CompetencyCategory).optional(),
  assessmentMethod: z.nativeEnum(CompetencyAssessmentMethod).optional(),
  passingScore: z.number().min(0).max(100).nullable().optional(),
  validityMonths: z.number().int().min(1).optional(),
  requiresRevalidation: z.boolean().optional(),
  prerequisiteIds: z.array(z.string()).optional(),
  requiredForRoles: z.array(z.nativeEnum(UserRole)).optional(),
  requiredForServices: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

// GET - Get single competency
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role } = session.user;
    const { id } = await params;

    const canView = hasAnyPermission(role, [
      PERMISSIONS.USER_VIEW,
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]);

    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const competency = await prisma.competency.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        staffCompetencies: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              },
            },
            assessedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { assessedAt: "desc" },
        },
        taskCompetencies: {
          include: {
            serviceType: true,
          },
        },
        _count: {
          select: {
            staffCompetencies: true,
            taskCompetencies: true,
          },
        },
      },
    });

    if (!competency) {
      return NextResponse.json({ error: "Competency not found" }, { status: 404 });
    }

    return NextResponse.json(competency);
  } catch (error) {
    console.error("Error fetching competency:", error);
    return NextResponse.json(
      { error: "Failed to fetch competency" },
      { status: 500 }
    );
  }
}

// PATCH - Update competency
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role } = session.user;
    const { id } = await params;

    const canManage = hasAnyPermission(role, [
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]);

    if (!canManage) {
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

    // Check if competency exists
    const existing = await prisma.competency.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Competency not found" }, { status: 404 });
    }

    // Check for duplicate name if name is being updated
    if (parseResult.data.name && parseResult.data.name !== existing.name) {
      const duplicate = await prisma.competency.findFirst({
        where: {
          companyId,
          name: parseResult.data.name,
          NOT: { id },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: "A competency with this name already exists" },
          { status: 400 }
        );
      }
    }

    const competency = await prisma.competency.update({
      where: { id },
      data: parseResult.data,
      include: {
        _count: {
          select: {
            staffCompetencies: true,
            taskCompetencies: true,
          },
        },
      },
    });

    return NextResponse.json(competency);
  } catch (error) {
    console.error("Error updating competency:", error);
    return NextResponse.json(
      { error: "Failed to update competency" },
      { status: 500 }
    );
  }
}

// DELETE - Delete competency
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role } = session.user;
    const { id } = await params;

    const canManage = hasAnyPermission(role, [
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]);

    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if competency exists
    const existing = await prisma.competency.findFirst({
      where: { id, companyId },
      include: {
        _count: {
          select: {
            staffCompetencies: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Competency not found" }, { status: 404 });
    }

    // Prevent deletion if there are staff competencies
    if (existing._count.staffCompetencies > 0) {
      return NextResponse.json(
        { error: "Cannot delete competency with existing staff assessments. Deactivate it instead." },
        { status: 400 }
      );
    }

    await prisma.competency.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting competency:", error);
    return NextResponse.json(
      { error: "Failed to delete competency" },
      { status: 500 }
    );
  }
}
