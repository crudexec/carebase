import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createRefillRequestSchema, refillsQuerySchema } from "@/lib/emar/validation";
import { z } from "zod";

// GET /api/refills - List refill requests
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rawParams = {
      clientId: searchParams.get("clientId"),
      medicationId: searchParams.get("medicationId"),
      status: searchParams.get("status"),
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    };
    console.log("[Refills API] Raw params:", rawParams);

    const query = refillsQuerySchema.safeParse(rawParams);

    if (!query.success) {
      console.error("[Refills API] Validation error:", query.error.issues);
      return NextResponse.json(
        { error: "Invalid query parameters", details: query.error.issues },
        { status: 400 }
      );
    }

    const { clientId, medicationId, status, page, limit } = query.data;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      companyId: session.user.companyId,
    };

    if (clientId) where.clientId = clientId;
    if (medicationId) where.medicationId = medicationId;
    if (status) where.status = status;

    const [refills, total] = await Promise.all([
      prisma.refillRequest.findMany({
        where,
        include: {
          medication: {
            select: {
              id: true,
              name: true,
              strength: true,
              form: true,
              controlledSchedule: true,
              refillsRemaining: true,
            },
          },
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          requestedBy: {
            select: { id: true, firstName: true, lastName: true },
          },
          respondedBy: {
            select: { id: true, firstName: true, lastName: true },
          },
          receivedBy: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
        orderBy: { requestedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.refillRequest.count({ where }),
    ]);

    console.log(`[Refills API] Found ${total} refills for company ${session.user.companyId}`);

    return NextResponse.json({
      refills,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching refills:", error);
    // Log more details
    if (error instanceof Error) {
      console.error("Error details:", error.message, error.stack);
    }
    return NextResponse.json(
      { error: "Failed to fetch refills", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// POST /api/refills - Create a new refill request
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = createRefillRequestSchema.parse(body);

    // Verify medication exists and belongs to company
    const medication = await prisma.medication.findFirst({
      where: {
        id: validated.medicationId,
        companyId: session.user.companyId,
      },
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    if (!medication) {
      return NextResponse.json(
        { error: "Medication not found" },
        { status: 404 }
      );
    }

    // Check if there's already a pending refill for this medication
    const existingPending = await prisma.refillRequest.findFirst({
      where: {
        medicationId: validated.medicationId,
        companyId: session.user.companyId,
        status: { in: ["PENDING", "APPROVED", "ORDERED"] },
      },
    });

    if (existingPending) {
      return NextResponse.json(
        { error: "There is already an active refill request for this medication" },
        { status: 400 }
      );
    }

    // Create the refill request
    const refill = await prisma.refillRequest.create({
      data: {
        medicationId: validated.medicationId,
        clientId: validated.clientId,
        companyId: session.user.companyId,
        requestedById: session.user.id,
        quantityRequested: validated.quantityRequested,
        requestNotes: validated.requestNotes,
        pharmacyName: validated.pharmacyName,
        pharmacyPhone: validated.pharmacyPhone,
        pharmacyFax: validated.pharmacyFax,
      },
      include: {
        medication: {
          select: {
            id: true,
            name: true,
            strength: true,
            form: true,
          },
        },
        client: {
          select: { id: true, firstName: true, lastName: true },
        },
        requestedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "REFILL_REQUESTED",
        entityType: "RefillRequest",
        entityId: refill.id,
        changes: {
          medicationName: medication.name,
          clientName: `${medication.client.firstName} ${medication.client.lastName}`,
        },
      },
    });

    return NextResponse.json({ refill }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating refill request:", error);
    return NextResponse.json(
      { error: "Failed to create refill request" },
      { status: 500 }
    );
  }
}
