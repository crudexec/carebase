import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createHierarchySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  templateTypes: z.array(z.string()).default([]),
});

// GET /api/goal-hierarchies - List all goal hierarchies for the company
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const templateType = searchParams.get("templateType");
    const includeData = searchParams.get("includeData") === "true";

    // Build the where clause
    const where: {
      companyId: string;
      isActive: boolean;
      templateTypes?: { has: string };
    } = {
      companyId: session.user.companyId,
      isActive: true,
    };

    // Filter by template type if provided
    if (templateType) {
      where.templateTypes = { has: templateType };
    }

    // If we need the full data (for cascading selects), include all nested relations
    if (includeData) {
      const hierarchies = await prisma.goalHierarchy.findMany({
        where,
        include: {
          goalAreas: {
            where: { isActive: true },
            orderBy: { displayOrder: "asc" },
            include: {
              targetSkills: {
                where: { isActive: true },
                orderBy: { displayOrder: "asc" },
                include: {
                  objectives: {
                    where: { isActive: true },
                    orderBy: { displayOrder: "asc" },
                    include: {
                      steps: {
                        where: { isActive: true },
                        orderBy: { displayOrder: "asc" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { name: "asc" },
      });

      return NextResponse.json({ hierarchies });
    }

    // Otherwise just return the basic hierarchy info
    const hierarchies = await prisma.goalHierarchy.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        templateTypes: true,
        isActive: true,
        _count: {
          select: {
            goalAreas: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ hierarchies });
  } catch (error) {
    console.error("Error fetching goal hierarchies:", error);
    return NextResponse.json(
      { error: "Failed to fetch goal hierarchies" },
      { status: 500 }
    );
  }
}

// POST /api/goal-hierarchies - Create a new goal hierarchy
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = createHierarchySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name, description, templateTypes } = validation.data;

    const hierarchy = await prisma.goalHierarchy.create({
      data: {
        name,
        description,
        templateTypes,
        companyId: session.user.companyId,
        isActive: true,
      },
    });

    return NextResponse.json({ hierarchy }, { status: 201 });
  } catch (error) {
    console.error("Error creating goal hierarchy:", error);
    return NextResponse.json(
      { error: "Failed to create goal hierarchy" },
      { status: 500 }
    );
  }
}
