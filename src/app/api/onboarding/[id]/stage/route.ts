import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canMoveCards, canApproveClinical, stageRequiresApproval } from "@/lib/onboarding";
import { OnboardingStage } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/onboarding/[id]/stage - Change onboarding stage
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!canMoveCards(session.user.role)) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    const body = await request.json();
    const { fromStage, toStage, notes } = body;

    if (!fromStage || !toStage) {
      return NextResponse.json(
        { error: "fromStage and toStage are required" },
        { status: 400 }
      );
    }

    // Validate stages
    const validStages = Object.values(OnboardingStage);
    if (!validStages.includes(fromStage) || !validStages.includes(toStage)) {
      return NextResponse.json(
        { error: "Invalid stage" },
        { status: 400 }
      );
    }

    // Check clinical authorization requirement
    if (toStage === OnboardingStage.ASSIGN_CAREGIVER) {
      // Moving past clinical authorization requires approval
      const record = await prisma.onboardingRecord.findFirst({
        where: { id, companyId: session.user.companyId },
      });

      if (!record?.clinicalApproval) {
        return NextResponse.json(
          { error: "Clinical Director approval required before assigning caregiver" },
          { status: 403 }
        );
      }
    }

    // If moving into clinical authorization stage, check permissions
    if (toStage === OnboardingStage.CLINICAL_AUTHORIZATION && stageRequiresApproval(toStage)) {
      // Anyone with move permissions can move INTO clinical authorization
      // But only Clinical Director/Admin can approve (separate endpoint)
    }

    // Update record in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the onboarding record
      const updatedRecord = await tx.onboardingRecord.update({
        where: { id },
        data: {
          stage: toStage,
          stageEnteredAt: new Date(),
          // Reset clinical approval when moving to clinical authorization stage
          clinicalApproval:
            toStage === OnboardingStage.CLINICAL_AUTHORIZATION ? null : undefined,
        },
        include: {
          client: true,
        },
      });

      // Create stage history entry
      await tx.onboardingStageHistory.create({
        data: {
          onboardingRecordId: id,
          fromStage,
          toStage,
          changedById: session.user.id,
          notes: notes || null,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          companyId: session.user.companyId,
          userId: session.user.id,
          action: "ONBOARDING_STAGE_CHANGED",
          entityType: "OnboardingRecord",
          entityId: id,
          changes: {
            clientName: `${updatedRecord.client.firstName} ${updatedRecord.client.lastName}`,
            fromStage,
            toStage,
          },
        },
      });

      // Update client status if moving to CONTRACT_START
      if (toStage === OnboardingStage.CONTRACT_START) {
        await tx.client.update({
          where: { id: updatedRecord.clientId },
          data: { status: "ACTIVE" },
        });
      }

      return updatedRecord;
    });

    return NextResponse.json({
      message: "Stage updated successfully",
      record: result,
    });
  } catch (error) {
    console.error("Error updating onboarding stage:", error);
    return NextResponse.json(
      { error: "Failed to update stage" },
      { status: 500 }
    );
  }
}
