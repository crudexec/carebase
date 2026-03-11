import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const createGoalAreaSchema = z.object({
  name: z.string().min(1, "Name is required"),
  displayOrder: z.number().optional(),
});

// GET /api/goal-hierarchies/[id]/goal-areas - List goal areas
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

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

    const goalAreas = await prisma.goalArea.findMany({
      where: { hierarchyId: id },
      orderBy: { displayOrder: "asc" },
      include: {
        _count: {
          select: { targetSkills: true },
        },
      },
    });

    return NextResponse.json({ goalAreas });
  } catch (error) {
    console.error("Error fetching goal areas:", error);
    return NextResponse.json({ error: "Failed to fetch goal areas" }, { status: 500 });
  }
}

// POST /api/goal-hierarchies/[id]/goal-areas - Create a new goal area
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

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

    const body = await request.json();
    const validation = createGoalAreaSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    // Get the max display order
    const maxOrder = await prisma.goalArea.aggregate({
      where: { hierarchyId: id },
      _max: { displayOrder: true },
    });

    const goalArea = await prisma.goalArea.create({
      data: {
        name: validation.data.name,
        displayOrder: validation.data.displayOrder ?? (maxOrder._max.displayOrder ?? -1) + 1,
        hierarchyId: id,
      },
    });

    return NextResponse.json({ goalArea }, { status: 201 });
  } catch (error) {
    console.error("Error creating goal area:", error);
    return NextResponse.json({ error: "Failed to create goal area" }, { status: 500 });
  }
}
