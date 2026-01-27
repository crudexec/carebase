import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { z } from "zod";

// GET /api/intake - List intakes
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const clientId = searchParams.get("clientId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: Prisma.IntakeWhereInput = {
      companyId: session.user.companyId,
    };

    if (status) where.status = status as Prisma.IntakeWhereInput["status"];
    if (clientId) where.clientId = clientId;

    const [intakes, total] = await Promise.all([
      prisma.intake.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              dateOfBirth: true,
            },
          },
          referral: {
            select: {
              id: true,
              prospectFirstName: true,
              prospectLastName: true,
            },
          },
          intakeCoordinator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          assessments: {
            select: {
              id: true,
              status: true,
              template: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          consents: {
            select: {
              id: true,
              isVoided: true,
              signedAt: true,
              template: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          carePlans: {
            select: {
              id: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.intake.count({ where }),
    ]);

    return NextResponse.json({ intakes, total });
  } catch (error) {
    console.error("Error fetching intakes:", error);
    return NextResponse.json(
      { error: "Failed to fetch intakes" },
      { status: 500 }
    );
  }
}

const createIntakeSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  referralId: z.string().optional(),
  scheduledDate: z.string().optional(),
  notes: z.string().optional(),
});

// POST /api/intake - Create new intake
export async function POST(request: Request) {
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

    const body = await request.json();
    const validation = createIntakeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { clientId, referralId, scheduledDate, notes } = validation.data;

    // Verify client exists and belongs to company
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        companyId: session.user.companyId,
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Check if client already has an active intake
    const existingIntake = await prisma.intake.findFirst({
      where: {
        clientId,
        status: {
          in: ["REFERRAL", "ASSESSMENT_SCHEDULED", "ASSESSMENT_IN_PROGRESS", "CARE_PLAN_PENDING", "CONSENTS_PENDING"],
        },
      },
    });

    if (existingIntake) {
      return NextResponse.json(
        { error: "Client already has an active intake" },
        { status: 400 }
      );
    }

    // Generate intake number
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const intakeNumber = `INT-${dateStr}-${randomSuffix}`;

    // Create intake
    const intake = await prisma.intake.create({
      data: {
        companyId: session.user.companyId,
        intakeNumber,
        clientId,
        referralId,
        intakeCoordinatorId: session.user.id,
        status: scheduledDate ? "ASSESSMENT_SCHEDULED" : "REFERRAL",
        targetStartDate: scheduledDate ? new Date(scheduledDate) : null,
        notes,
        currentStep: "client_info",
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        intakeCoordinator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "INTAKE_CREATED",
        entityType: "Intake",
        entityId: intake.id,
        changes: {
          clientName: `${client.firstName} ${client.lastName}`,
          status: intake.status,
        },
      },
    });

    return NextResponse.json({ intake }, { status: 201 });
  } catch (error) {
    console.error("Error creating intake:", error);
    return NextResponse.json(
      { error: "Failed to create intake" },
      { status: 500 }
    );
  }
}
