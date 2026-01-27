import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Generate intake number
function generateIntakeNumber(): string {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `INT-${datePart}-${randomPart}`;
}

// POST /api/referrals/[id]/convert - Convert referral to client and start intake
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions
    if (
      !["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF"].includes(
        session.user.role
      )
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Get referral
    const referral = await prisma.referral.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
    });

    if (!referral) {
      return NextResponse.json({ error: "Referral not found" }, { status: 404 });
    }

    // Check if already converted
    if (referral.clientId) {
      return NextResponse.json(
        { error: "Referral already converted" },
        { status: 400 }
      );
    }

    // Check if referral is in valid state
    if (!["PENDING", "CONTACTED", "QUALIFIED"].includes(referral.status)) {
      return NextResponse.json(
        {
          error: `Cannot convert referral with status ${referral.status}`,
        },
        { status: 400 }
      );
    }

    // Create client, intake, and update referral in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create client from referral data
      const client = await tx.client.create({
        data: {
          companyId: session.user.companyId,
          firstName: referral.prospectFirstName,
          lastName: referral.prospectLastName,
          dateOfBirth: referral.prospectDob,
          phone: referral.prospectPhone,
          address: referral.prospectAddress,
          city: referral.prospectCity,
          state: referral.prospectState,
          zipCode: referral.prospectZip,
          medicaidId: referral.medicaidId,
          diagnosisCodes: referral.diagnosisCodes,
          primaryDiagnosis: referral.primaryDiagnosis,
          status: "ONBOARDING",
        },
      });

      // Create intake
      const intake = await tx.intake.create({
        data: {
          intakeNumber: generateIntakeNumber(),
          companyId: session.user.companyId,
          clientId: client.id,
          referralId: referral.id,
          intakeCoordinatorId: session.user.id,
          status: "REFERRAL",
          completedSteps: [],
        },
      });

      // Update referral
      const updatedReferral = await tx.referral.update({
        where: { id },
        data: {
          status: "CONVERTED",
          clientId: client.id,
          convertedAt: new Date(),
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          companyId: session.user.companyId,
          userId: session.user.id,
          action: "REFERRAL_CONVERTED",
          entityType: "Referral",
          entityId: referral.id,
          changes: {
            referralNumber: referral.referralNumber,
            clientId: client.id,
            intakeId: intake.id,
          },
        },
      });

      return { client, intake, referral: updatedReferral };
    });

    return NextResponse.json({
      message: "Referral converted successfully",
      client: result.client,
      intake: result.intake,
      referral: result.referral,
    });
  } catch (error) {
    console.error("Error converting referral:", error);
    return NextResponse.json(
      { error: "Failed to convert referral" },
      { status: 500 }
    );
  }
}
