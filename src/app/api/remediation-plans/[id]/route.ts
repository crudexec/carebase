import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";
import { RemediationStatus, RemediationActivityType } from "@prisma/client";

// Update remediation plan schema
const updateSchema = z.object({
  planDescription: z.string().optional(),
  targetCompletionDate: z.string().transform((s) => new Date(s)).optional(),
  status: z.nativeEnum(RemediationStatus).optional(),
});

// Verify completion schema
const verifySchema = z.object({
  verificationNotes: z.string().optional(),
  isEffective: z.boolean(),
});

// Add activity schema
const addActivitySchema = z.object({
  activityType: z.nativeEnum(RemediationActivityType),
  description: z.string().min(1),
  dueDate: z.string().transform((s) => new Date(s)),
  trainingSessionId: z.string().optional(),
});

// GET - Get single remediation plan
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role, id: currentUserId } = session.user;
    const { id } = await params;

    const plan = await prisma.remediationPlan.findFirst({
      where: { id, companyId },
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
              include: {
                course: {
                  select: { id: true, title: true, category: true },
                },
              },
            },
          },
        },
        staffCompetencies: {
          include: {
            competency: true,
          },
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "Remediation plan not found" }, { status: 404 });
    }

    // Check permissions
    const isOwnPlan = plan.userId === currentUserId;
    const canViewOthers = hasAnyPermission(role, [
      PERMISSIONS.USER_VIEW,
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]);

    if (!isOwnPlan && !canViewOthers) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get competency details
    const competencies = await prisma.competency.findMany({
      where: { id: { in: plan.competencyGaps } },
    });

    // Calculate metrics
    const completedActivities = plan.activities.filter((a) => a.completedAt).length;
    const totalActivities = plan.activities.length;
    const progress = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;
    const isOverdue = plan.targetCompletionDate < new Date() &&
      plan.status !== RemediationStatus.VERIFIED_COMPLETE;

    return NextResponse.json({
      ...plan,
      competencies,
      completedActivities,
      totalActivities,
      progress,
      isOverdue,
    });
  } catch (error) {
    console.error("Error fetching remediation plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch remediation plan" },
      { status: 500 }
    );
  }
}

// PATCH - Update remediation plan
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

    const existing = await prisma.remediationPlan.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Remediation plan not found" }, { status: 404 });
    }

    // Don't allow updates to verified plans
    if (existing.status === RemediationStatus.VERIFIED_COMPLETE) {
      return NextResponse.json(
        { error: "Cannot update a verified plan" },
        { status: 400 }
      );
    }

    const plan = await prisma.remediationPlan.update({
      where: { id },
      data: parseResult.data,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        activities: {
          orderBy: { dueDate: "asc" },
        },
      },
    });

    return NextResponse.json(plan);
  } catch (error) {
    console.error("Error updating remediation plan:", error);
    return NextResponse.json(
      { error: "Failed to update remediation plan" },
      { status: 500 }
    );
  }
}

// DELETE - Delete remediation plan
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

    const existing = await prisma.remediationPlan.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Remediation plan not found" }, { status: 404 });
    }

    // Only allow deletion of pending plans
    if (existing.status !== RemediationStatus.PENDING) {
      return NextResponse.json(
        { error: "Can only delete pending plans" },
        { status: 400 }
      );
    }

    await prisma.remediationPlan.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting remediation plan:", error);
    return NextResponse.json(
      { error: "Failed to delete remediation plan" },
      { status: 500 }
    );
  }
}
