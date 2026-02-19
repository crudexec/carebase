import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";
import { RemediationStatus, CompetencyStatus } from "@prisma/client";

// Verify completion schema
const verifySchema = z.object({
  verificationNotes: z.string().optional(),
  isEffective: z.boolean(),
});

// POST - Verify remediation plan completion
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role, id: verifierId } = session.user;
    const { id } = await params;

    const canVerify = hasAnyPermission(role, [
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]);

    if (!canVerify) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parseResult = verifySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { verificationNotes, isEffective } = parseResult.data;

    const plan = await prisma.remediationPlan.findFirst({
      where: { id, companyId },
      include: {
        activities: true,
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "Remediation plan not found" }, { status: 404 });
    }

    // Check all activities are completed
    const incompleteActivities = plan.activities.filter((a) => !a.completedAt);
    if (incompleteActivities.length > 0) {
      return NextResponse.json(
        { error: `${incompleteActivities.length} activities are not yet completed` },
        { status: 400 }
      );
    }

    // Update plan status based on effectiveness
    const newStatus = isEffective
      ? RemediationStatus.VERIFIED_COMPLETE
      : RemediationStatus.FAILED;

    const updatedPlan = await prisma.remediationPlan.update({
      where: { id },
      data: {
        status: newStatus,
        completedAt: isEffective ? new Date() : null,
        verifiedById: verifierId,
        verificationNotes,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
        verifiedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    // If effective, update staff competencies to mark as competent
    if (isEffective && plan.competencyGaps.length > 0) {
      const competencies = await prisma.competency.findMany({
        where: { id: { in: plan.competencyGaps } },
      });

      // Create new competency assessments showing remediation complete
      await Promise.all(
        competencies.map((competency) =>
          prisma.staffCompetency.create({
            data: {
              userId: plan.userId,
              competencyId: competency.id,
              assessedAt: new Date(),
              assessedById: verifierId,
              status: CompetencyStatus.COMPETENT,
              observations: `Remediation plan completed successfully. ${verificationNotes || ""}`,
              validUntil: new Date(
                Date.now() + competency.validityMonths * 30 * 24 * 60 * 60 * 1000
              ),
              isExpired: false,
              requiresRemediation: false,
              remediationPlanId: plan.id,
              companyId,
            },
          })
        )
      );
    }

    return NextResponse.json({
      ...updatedPlan,
      isEffective,
    });
  } catch (error) {
    console.error("Error verifying remediation plan:", error);
    return NextResponse.json(
      { error: "Failed to verify remediation plan" },
      { status: 500 }
    );
  }
}
