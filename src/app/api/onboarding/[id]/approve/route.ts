import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canApproveClinical } from "@/lib/onboarding";
import { OnboardingStage } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/onboarding/[id]/approve - Clinical Director approval
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!canApproveClinical(session.user.role)) {
      return NextResponse.json(
        { error: "Only Clinical Directors and Admins can approve" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { approved, notes } = body;

    if (typeof approved !== "boolean") {
      return NextResponse.json(
        { error: "approved field is required (true or false)" },
        { status: 400 }
      );
    }

    // Get current record
    const currentRecord = await prisma.onboardingRecord.findFirst({
      where: { id, companyId: session.user.companyId },
      include: { client: true },
    });

    if (!currentRecord) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    if (currentRecord.stage !== OnboardingStage.CLINICAL_AUTHORIZATION) {
      return NextResponse.json(
        { error: "Client must be in Clinical Authorization stage" },
        { status: 400 }
      );
    }

    // Update record in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update clinical approval status
      const updatedRecord = await tx.onboardingRecord.update({
        where: { id },
        data: {
          clinicalApproval: approved,
          notes: notes || currentRecord.notes,
        },
        include: { client: true },
      });

      // Create stage history entry for approval action
      await tx.onboardingStageHistory.create({
        data: {
          onboardingRecordId: id,
          fromStage: OnboardingStage.CLINICAL_AUTHORIZATION,
          toStage: OnboardingStage.CLINICAL_AUTHORIZATION,
          changedById: session.user.id,
          notes: approved
            ? `Clinical authorization APPROVED${notes ? `: ${notes}` : ""}`
            : `Clinical authorization REJECTED${notes ? `: ${notes}` : ""}`,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          companyId: session.user.companyId,
          userId: session.user.id,
          action: approved ? "CLINICAL_APPROVAL_GRANTED" : "CLINICAL_APPROVAL_DENIED",
          entityType: "OnboardingRecord",
          entityId: id,
          changes: {
            clientId: updatedRecord.clientId,
            clientName: `${updatedRecord.client.firstName} ${updatedRecord.client.lastName}`,
            approved,
            notes: notes || null,
          },
        },
      });

      return updatedRecord;
    });

    return NextResponse.json({
      message: approved ? "Clinical authorization approved" : "Clinical authorization denied",
      record: result,
    });
  } catch (error) {
    console.error("Error processing clinical approval:", error);
    return NextResponse.json(
      { error: "Failed to process approval" },
      { status: 500 }
    );
  }
}
