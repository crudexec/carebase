import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canMoveCards } from "@/lib/onboarding";
import { OnboardingStage } from "@prisma/client";

// GET /api/onboarding - Get all onboarding records
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const onboardingRecords = await prisma.onboardingRecord.findMany({
      where: {
        companyId: session.user.companyId,
      },
      include: {
        client: {
          include: {
            sponsor: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        assignedTo: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        stageEnteredAt: "asc",
      },
    });

    // Transform to client-friendly format
    const clients = onboardingRecords.map((record) => ({
      id: record.id,
      clientId: record.clientId,
      clientName: `${record.client.firstName} ${record.client.lastName}`,
      sponsorName: record.client.sponsor
        ? `${record.client.sponsor.firstName} ${record.client.sponsor.lastName}`
        : null,
      stage: record.stage,
      stageEnteredAt: record.stageEnteredAt.toISOString(),
      notes: record.notes,
      documentsCount: record.documents.length,
      clinicalApproval: record.clinicalApproval,
      assignedTo: record.assignedTo
        ? `${record.assignedTo.firstName} ${record.assignedTo.lastName}`
        : null,
    }));

    return NextResponse.json({ clients });
  } catch (error) {
    console.error("Error fetching onboarding records:", error);
    return NextResponse.json(
      { error: "Failed to fetch onboarding records" },
      { status: 500 }
    );
  }
}

// POST /api/onboarding - Create new onboarding record (start new client)
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!canMoveCards(session.user.role)) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    const body = await request.json();
    const { firstName, lastName, dateOfBirth, address, phone, medicalNotes, sponsorId } = body;

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "First name and last name are required" },
        { status: 400 }
      );
    }

    // Create client and onboarding record in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the client
      const client = await tx.client.create({
        data: {
          companyId: session.user.companyId,
          firstName,
          lastName,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          address: address || null,
          phone: phone || null,
          medicalNotes: medicalNotes || null,
          sponsorId: sponsorId || null,
          status: "ONBOARDING",
        },
      });

      // Create onboarding record
      const onboardingRecord = await tx.onboardingRecord.create({
        data: {
          companyId: session.user.companyId,
          clientId: client.id,
          stage: OnboardingStage.REACH_OUT,
          assignedToId: session.user.id,
        },
        include: {
          client: true,
        },
      });

      // Create initial stage history entry
      await tx.onboardingStageHistory.create({
        data: {
          onboardingRecordId: onboardingRecord.id,
          fromStage: OnboardingStage.REACH_OUT,
          toStage: OnboardingStage.REACH_OUT,
          changedById: session.user.id,
          notes: "Client onboarding started",
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          companyId: session.user.companyId,
          userId: session.user.id,
          action: "ONBOARDING_STARTED",
          entityType: "Client",
          entityId: client.id,
          changes: {
            clientName: `${client.firstName} ${client.lastName}`,
          },
        },
      });

      return onboardingRecord;
    });

    return NextResponse.json(
      { message: "Client added to onboarding", record: result },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating onboarding record:", error);
    return NextResponse.json(
      { error: "Failed to create onboarding record" },
      { status: 500 }
    );
  }
}
