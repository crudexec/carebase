import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";
import { RemediationActivityType, RemediationStatus } from "@prisma/client";

// Add activity schema
const addActivitySchema = z.object({
  activityType: z.nativeEnum(RemediationActivityType),
  description: z.string().min(1),
  dueDate: z.string().transform((s) => new Date(s)),
  trainingSessionId: z.string().optional(),
});

// POST - Add activity to remediation plan
export async function POST(
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
    const parseResult = addActivitySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const plan = await prisma.remediationPlan.findFirst({
      where: { id, companyId },
    });

    if (!plan) {
      return NextResponse.json({ error: "Remediation plan not found" }, { status: 404 });
    }

    // Don't allow adding activities to completed plans
    if (plan.status === RemediationStatus.VERIFIED_COMPLETE) {
      return NextResponse.json(
        { error: "Cannot add activities to a verified plan" },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Verify training session if provided
    if (data.trainingSessionId) {
      const session = await prisma.trainingSession.findFirst({
        where: { id: data.trainingSessionId, companyId },
      });

      if (!session) {
        return NextResponse.json(
          { error: "Training session not found" },
          { status: 404 }
        );
      }
    }

    const activity = await prisma.remediationActivity.create({
      data: {
        remediationPlanId: id,
        activityType: data.activityType,
        description: data.description,
        dueDate: data.dueDate,
        trainingSessionId: data.trainingSessionId,
      },
      include: {
        trainingSession: {
          include: {
            course: {
              select: { id: true, title: true },
            },
          },
        },
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("Error adding remediation activity:", error);
    return NextResponse.json(
      { error: "Failed to add remediation activity" },
      { status: 500 }
    );
  }
}
