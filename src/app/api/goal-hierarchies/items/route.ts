import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

/**
 * Unified API for managing goal hierarchy items (target skills, objectives, steps)
 * This provides a simpler interface than deeply nested routes.
 */

const createTargetSkillSchema = z.object({
  type: z.literal("targetSkill"),
  goalAreaId: z.string(),
  name: z.string().min(1),
  displayOrder: z.number().optional(),
});

const createObjectiveSchema = z.object({
  type: z.literal("objective"),
  targetSkillId: z.string(),
  name: z.string().min(1),
  displayOrder: z.number().optional(),
});

const createStepSchema = z.object({
  type: z.literal("step"),
  objectiveId: z.string(),
  name: z.string().min(1),
  displayOrder: z.number().optional(),
});

const createItemSchema = z.discriminatedUnion("type", [
  createTargetSkillSchema,
  createObjectiveSchema,
  createStepSchema,
]);

const updateItemSchema = z.object({
  itemType: z.enum(["goalArea", "targetSkill", "objective", "step"]),
  itemId: z.string(),
  name: z.string().min(1).optional(),
  displayOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

const deleteItemSchema = z.object({
  itemType: z.enum(["goalArea", "targetSkill", "objective", "step"]),
  itemId: z.string(),
});

// Helper to verify company ownership of a goal area
async function verifyGoalAreaOwnership(goalAreaId: string, companyId: string) {
  const goalArea = await prisma.goalArea.findFirst({
    where: { id: goalAreaId },
    include: {
      hierarchy: {
        select: { companyId: true },
      },
    },
  });
  return goalArea?.hierarchy?.companyId === companyId;
}

// Helper to verify company ownership of a target skill
async function verifyTargetSkillOwnership(targetSkillId: string, companyId: string) {
  const targetSkill = await prisma.targetSkill.findFirst({
    where: { id: targetSkillId },
    include: {
      goalArea: {
        include: {
          hierarchy: {
            select: { companyId: true },
          },
        },
      },
    },
  });
  return targetSkill?.goalArea?.hierarchy?.companyId === companyId;
}

// Helper to verify company ownership of an objective
async function verifyObjectiveOwnership(objectiveId: string, companyId: string) {
  const objective = await prisma.shortTermObjective.findFirst({
    where: { id: objectiveId },
    include: {
      targetSkill: {
        include: {
          goalArea: {
            include: {
              hierarchy: {
                select: { companyId: true },
              },
            },
          },
        },
      },
    },
  });
  return objective?.targetSkill?.goalArea?.hierarchy?.companyId === companyId;
}

// Helper to verify company ownership of a step
async function verifyStepOwnership(stepId: string, companyId: string) {
  const step = await prisma.taskAnalysisStep.findFirst({
    where: { id: stepId },
    include: {
      objective: {
        include: {
          targetSkill: {
            include: {
              goalArea: {
                include: {
                  hierarchy: {
                    select: { companyId: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  return step?.objective?.targetSkill?.goalArea?.hierarchy?.companyId === companyId;
}

// POST /api/goal-hierarchies/items - Create a new item
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = createItemSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    if (data.type === "targetSkill") {
      // Verify ownership
      if (!(await verifyGoalAreaOwnership(data.goalAreaId, session.user.companyId))) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
      }

      const maxOrder = await prisma.targetSkill.aggregate({
        where: { goalAreaId: data.goalAreaId },
        _max: { displayOrder: true },
      });

      const item = await prisma.targetSkill.create({
        data: {
          name: data.name,
          displayOrder: data.displayOrder ?? (maxOrder._max.displayOrder ?? -1) + 1,
          goalAreaId: data.goalAreaId,
        },
      });

      return NextResponse.json({ item, itemType: "targetSkill" }, { status: 201 });
    }

    if (data.type === "objective") {
      // Verify ownership
      if (!(await verifyTargetSkillOwnership(data.targetSkillId, session.user.companyId))) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
      }

      const maxOrder = await prisma.shortTermObjective.aggregate({
        where: { targetSkillId: data.targetSkillId },
        _max: { displayOrder: true },
      });

      const item = await prisma.shortTermObjective.create({
        data: {
          name: data.name,
          displayOrder: data.displayOrder ?? (maxOrder._max.displayOrder ?? -1) + 1,
          targetSkillId: data.targetSkillId,
        },
      });

      return NextResponse.json({ item, itemType: "objective" }, { status: 201 });
    }

    if (data.type === "step") {
      // Verify ownership
      if (!(await verifyObjectiveOwnership(data.objectiveId, session.user.companyId))) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
      }

      const maxOrder = await prisma.taskAnalysisStep.aggregate({
        where: { objectiveId: data.objectiveId },
        _max: { displayOrder: true },
      });

      const item = await prisma.taskAnalysisStep.create({
        data: {
          name: data.name,
          displayOrder: data.displayOrder ?? (maxOrder._max.displayOrder ?? -1) + 1,
          objectiveId: data.objectiveId,
        },
      });

      return NextResponse.json({ item, itemType: "step" }, { status: 201 });
    }

    return NextResponse.json({ error: "Unknown item type" }, { status: 400 });
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}

// PATCH /api/goal-hierarchies/items - Update an item
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = updateItemSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { itemType, itemId, name, displayOrder, isActive } = validation.data;
    const updateData: { name?: string; displayOrder?: number; isActive?: boolean } = {};
    if (name !== undefined) updateData.name = name;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    if (isActive !== undefined) updateData.isActive = isActive;

    switch (itemType) {
      case "goalArea": {
        const goalArea = await prisma.goalArea.findFirst({
          where: { id: itemId },
          include: { hierarchy: { select: { companyId: true } } },
        });
        if (goalArea?.hierarchy?.companyId !== session.user.companyId) {
          return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        }
        const item = await prisma.goalArea.update({
          where: { id: itemId },
          data: updateData,
        });
        return NextResponse.json({ item, itemType });
      }

      case "targetSkill": {
        if (!(await verifyTargetSkillOwnership(itemId, session.user.companyId))) {
          return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        }
        const item = await prisma.targetSkill.update({
          where: { id: itemId },
          data: updateData,
        });
        return NextResponse.json({ item, itemType });
      }

      case "objective": {
        if (!(await verifyObjectiveOwnership(itemId, session.user.companyId))) {
          return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        }
        const item = await prisma.shortTermObjective.update({
          where: { id: itemId },
          data: updateData,
        });
        return NextResponse.json({ item, itemType });
      }

      case "step": {
        if (!(await verifyStepOwnership(itemId, session.user.companyId))) {
          return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        }
        const item = await prisma.taskAnalysisStep.update({
          where: { id: itemId },
          data: updateData,
        });
        return NextResponse.json({ item, itemType });
      }
    }
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

// DELETE /api/goal-hierarchies/items - Delete an item (soft delete)
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = deleteItemSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { itemType, itemId } = validation.data;

    switch (itemType) {
      case "goalArea": {
        const goalArea = await prisma.goalArea.findFirst({
          where: { id: itemId },
          include: { hierarchy: { select: { companyId: true } } },
        });
        if (goalArea?.hierarchy?.companyId !== session.user.companyId) {
          return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        }
        await prisma.goalArea.update({
          where: { id: itemId },
          data: { isActive: false },
        });
        return NextResponse.json({ success: true });
      }

      case "targetSkill": {
        if (!(await verifyTargetSkillOwnership(itemId, session.user.companyId))) {
          return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        }
        await prisma.targetSkill.update({
          where: { id: itemId },
          data: { isActive: false },
        });
        return NextResponse.json({ success: true });
      }

      case "objective": {
        if (!(await verifyObjectiveOwnership(itemId, session.user.companyId))) {
          return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        }
        await prisma.shortTermObjective.update({
          where: { id: itemId },
          data: { isActive: false },
        });
        return NextResponse.json({ success: true });
      }

      case "step": {
        if (!(await verifyStepOwnership(itemId, session.user.companyId))) {
          return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        }
        await prisma.taskAnalysisStep.update({
          where: { id: itemId },
          data: { isActive: false },
        });
        return NextResponse.json({ success: true });
      }
    }
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
