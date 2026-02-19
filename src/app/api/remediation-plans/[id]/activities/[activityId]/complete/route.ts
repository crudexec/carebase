import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";
import { RemediationStatus } from "@prisma/client";

// Complete activity schema
const completeSchema = z.object({
  completionNotes: z.string().optional(),
  documentUrls: z.array(z.string()).default([]),
});

// POST - Complete a remediation activity
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; activityId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role, id: userId } = session.user;
    const { id: planId, activityId } = await params;

    const canManage = hasAnyPermission(role, [
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]);

    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parseResult = completeSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    // Verify plan exists
    const plan = await prisma.remediationPlan.findFirst({
      where: { id: planId, companyId },
    });

    if (!plan) {
      return NextResponse.json({ error: "Remediation plan not found" }, { status: 404 });
    }

    // Verify activity exists and belongs to plan
    const activity = await prisma.remediationActivity.findFirst({
      where: { id: activityId, remediationPlanId: planId },
    });

    if (!activity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    if (activity.completedAt) {
      return NextResponse.json({ error: "Activity already completed" }, { status: 400 });
    }

    const { completionNotes, documentUrls } = parseResult.data;

    // Update activity
    const updatedActivity = await prisma.remediationActivity.update({
      where: { id: activityId },
      data: {
        completedAt: new Date(),
        completedById: userId,
        completionNotes,
        documentUrls,
      },
      include: {
        completedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        trainingSession: {
          include: {
            course: {
              select: { id: true, title: true },
            },
          },
        },
      },
    });

    // Check if all activities are now complete
    const remainingActivities = await prisma.remediationActivity.count({
      where: {
        remediationPlanId: planId,
        completedAt: null,
      },
    });

    // If all activities complete, update plan status to pending verification
    if (remainingActivities === 0 && plan.status === RemediationStatus.IN_PROGRESS) {
      await prisma.remediationPlan.update({
        where: { id: planId },
        data: { status: RemediationStatus.COMPLETED_PENDING_VERIFICATION },
      });
    }

    return NextResponse.json({
      activity: updatedActivity,
      remainingActivities,
      planStatusUpdated: remainingActivities === 0,
    });
  } catch (error) {
    console.error("Error completing remediation activity:", error);
    return NextResponse.json(
      { error: "Failed to complete remediation activity" },
      { status: 500 }
    );
  }
}
