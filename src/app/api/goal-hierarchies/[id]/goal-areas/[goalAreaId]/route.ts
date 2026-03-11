import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string; goalAreaId: string }>;
}

const updateGoalAreaSchema = z.object({
  name: z.string().min(1).optional(),
  displayOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/goal-hierarchies/[id]/goal-areas/[goalAreaId] - Get a goal area with children
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, goalAreaId } = await params;

    // Verify hierarchy ownership
    const hierarchy = await prisma.goalHierarchy.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
    });

    if (!hierarchy) {
      return NextResponse.json({ error: "Goal hierarchy not found" }, { status: 404 });
    }

    const goalArea = await prisma.goalArea.findFirst({
      where: {
        id: goalAreaId,
        hierarchyId: id,
      },
      include: {
        targetSkills: {
          orderBy: { displayOrder: "asc" },
          include: {
            objectives: {
              orderBy: { displayOrder: "asc" },
              include: {
                steps: {
                  orderBy: { displayOrder: "asc" },
                },
              },
            },
          },
        },
      },
    });

    if (!goalArea) {
      return NextResponse.json({ error: "Goal area not found" }, { status: 404 });
    }

    return NextResponse.json({ goalArea });
  } catch (error) {
    console.error("Error fetching goal area:", error);
    return NextResponse.json({ error: "Failed to fetch goal area" }, { status: 500 });
  }
}

// PATCH /api/goal-hierarchies/[id]/goal-areas/[goalAreaId] - Update a goal area
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, goalAreaId } = await params;

    // Verify hierarchy ownership
    const hierarchy = await prisma.goalHierarchy.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
    });

    if (!hierarchy) {
      return NextResponse.json({ error: "Goal hierarchy not found" }, { status: 404 });
    }

    // Verify goal area exists
    const existing = await prisma.goalArea.findFirst({
      where: {
        id: goalAreaId,
        hierarchyId: id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Goal area not found" }, { status: 404 });
    }

    const body = await request.json();
    const validation = updateGoalAreaSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const goalArea = await prisma.goalArea.update({
      where: { id: goalAreaId },
      data: validation.data,
    });

    return NextResponse.json({ goalArea });
  } catch (error) {
    console.error("Error updating goal area:", error);
    return NextResponse.json({ error: "Failed to update goal area" }, { status: 500 });
  }
}

// DELETE /api/goal-hierarchies/[id]/goal-areas/[goalAreaId] - Delete a goal area
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, goalAreaId } = await params;

    // Verify hierarchy ownership
    const hierarchy = await prisma.goalHierarchy.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
    });

    if (!hierarchy) {
      return NextResponse.json({ error: "Goal hierarchy not found" }, { status: 404 });
    }

    // Verify goal area exists
    const existing = await prisma.goalArea.findFirst({
      where: {
        id: goalAreaId,
        hierarchyId: id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Goal area not found" }, { status: 404 });
    }

    // Soft delete by setting isActive = false
    await prisma.goalArea.update({
      where: { id: goalAreaId },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting goal area:", error);
    return NextResponse.json({ error: "Failed to delete goal area" }, { status: 500 });
  }
}
