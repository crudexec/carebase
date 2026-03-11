import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/goal-hierarchies/[id] - Get a single goal hierarchy with all data
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const hierarchy = await prisma.goalHierarchy.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
      include: {
        goalAreas: {
          orderBy: { displayOrder: "asc" },
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
        },
      },
    });

    if (!hierarchy) {
      return NextResponse.json({ error: "Goal hierarchy not found" }, { status: 404 });
    }

    return NextResponse.json({ hierarchy });
  } catch (error) {
    console.error("Error fetching goal hierarchy:", error);
    return NextResponse.json({ error: "Failed to fetch goal hierarchy" }, { status: 500 });
  }
}

const updateHierarchySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  templateTypes: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

// PATCH /api/goal-hierarchies/[id] - Update a goal hierarchy
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.goalHierarchy.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Goal hierarchy not found" }, { status: 404 });
    }

    const body = await request.json();
    const validation = updateHierarchySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const hierarchy = await prisma.goalHierarchy.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json({ hierarchy });
  } catch (error) {
    console.error("Error updating goal hierarchy:", error);
    return NextResponse.json({ error: "Failed to update goal hierarchy" }, { status: 500 });
  }
}

// DELETE /api/goal-hierarchies/[id] - Delete a goal hierarchy (soft delete by setting isActive = false)
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.goalHierarchy.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Goal hierarchy not found" }, { status: 404 });
    }

    // Soft delete
    await prisma.goalHierarchy.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting goal hierarchy:", error);
    return NextResponse.json({ error: "Failed to delete goal hierarchy" }, { status: 500 });
  }
}
