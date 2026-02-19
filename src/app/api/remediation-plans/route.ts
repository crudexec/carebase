import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";
import { RemediationStatus, RemediationActivityType } from "@prisma/client";

// Query validation schema
const querySchema = z.object({
  userId: z.string().optional(),
  status: z.nativeEnum(RemediationStatus).optional(),
});

// Create remediation plan schema
const createSchema = z.object({
  userId: z.string().min(1, "Staff member is required"),
  competencyGaps: z.array(z.string()).min(1, "At least one competency gap is required"),
  planDescription: z.string().min(1, "Plan description is required"),
  targetCompletionDate: z.string().transform((s) => new Date(s)),
  activities: z.array(
    z.object({
      activityType: z.nativeEnum(RemediationActivityType),
      description: z.string().min(1),
      dueDate: z.string().transform((s) => new Date(s)),
    })
  ).min(1, "At least one activity is required"),
});

// GET - List remediation plans
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role, id: currentUserId } = session.user;

    const canViewAll = hasAnyPermission(role, [
      PERMISSIONS.USER_VIEW,
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]);

    const { searchParams } = new URL(request.url);
    const queryResult = querySchema.safeParse(Object.fromEntries(searchParams));

    if (!queryResult.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: queryResult.error.flatten() },
        { status: 400 }
      );
    }

    const { userId, status } = queryResult.data;

    // Non-managers can only view their own plans
    const filterUserId = canViewAll ? userId : currentUserId;

    const plans = await prisma.remediationPlan.findMany({
      where: {
        companyId,
        ...(filterUserId && { userId: filterUserId }),
        ...(status && { status }),
      },
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
        identifiedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        verifiedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        activities: {
          orderBy: { dueDate: "asc" },
          include: {
            completedBy: {
              select: { id: true, firstName: true, lastName: true },
            },
            trainingSession: {
              select: { id: true, scheduledDate: true },
              include: {
                course: {
                  select: { id: true, title: true },
                },
              },
            },
          },
        },
        _count: {
          select: {
            activities: true,
            staffCompetencies: true,
          },
        },
      },
      orderBy: [{ status: "asc" }, { targetCompletionDate: "asc" }],
    });

    // Add computed fields
    const plansWithMetrics = plans.map((plan) => {
      const completedActivities = plan.activities.filter((a) => a.completedAt).length;
      const totalActivities = plan.activities.length;
      const progress = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;
      const isOverdue = plan.targetCompletionDate < new Date() && plan.status !== RemediationStatus.VERIFIED_COMPLETE;

      return {
        ...plan,
        completedActivities,
        totalActivities,
        progress,
        isOverdue,
      };
    });

    return NextResponse.json(plansWithMetrics);
  } catch (error) {
    console.error("Error fetching remediation plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch remediation plans" },
      { status: 500 }
    );
  }
}

// POST - Create remediation plan
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role, id: creatorId } = session.user;

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

    // Verify user exists
    const user = await prisma.user.findFirst({
      where: { id: data.userId, companyId },
    });

    if (!user) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    // Verify competencies exist
    const competencies = await prisma.competency.findMany({
      where: { id: { in: data.competencyGaps }, companyId },
    });

    if (competencies.length !== data.competencyGaps.length) {
      return NextResponse.json(
        { error: "One or more competencies not found" },
        { status: 400 }
      );
    }

    // Create plan with activities
    const plan = await prisma.remediationPlan.create({
      data: {
        userId: data.userId,
        competencyGaps: data.competencyGaps,
        identifiedById: creatorId,
        planDescription: data.planDescription,
        targetCompletionDate: data.targetCompletionDate,
        status: RemediationStatus.PENDING,
        companyId,
        activities: {
          create: data.activities.map((activity) => ({
            activityType: activity.activityType,
            description: activity.description,
            dueDate: activity.dueDate,
          })),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        identifiedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        activities: {
          orderBy: { dueDate: "asc" },
        },
      },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error("Error creating remediation plan:", error);
    return NextResponse.json(
      { error: "Failed to create remediation plan" },
      { status: 500 }
    );
  }
}
