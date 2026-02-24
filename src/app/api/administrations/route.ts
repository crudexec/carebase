import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  createAdministrationSchema,
  administrationsQuerySchema,
} from "@/lib/emar/validation";

/**
 * GET /api/administrations
 * List medication administrations with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId } = session.user;

    if (!companyId) {
      return NextResponse.json(
        { error: "User not associated with a company" },
        { status: 400 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = administrationsQuerySchema.parse({
      clientId: searchParams.get("clientId") || undefined,
      medicationId: searchParams.get("medicationId") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      result: searchParams.get("result") || undefined,
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 20,
    });

    const skip = (query.page - 1) * query.limit;

    // Build where clause
    const where = {
      companyId,
      ...(query.clientId && { clientId: query.clientId }),
      ...(query.medicationId && { medicationId: query.medicationId }),
      ...(query.result && { result: query.result }),
      ...(query.startDate || query.endDate
        ? {
            scheduledTime: {
              ...(query.startDate && { gte: query.startDate }),
              ...(query.endDate && { lte: query.endDate }),
            },
          }
        : {}),
    };

    // Get total count and administrations
    const [total, administrations] = await Promise.all([
      prisma.medicationAdministration.count({ where }),
      prisma.medicationAdministration.findMany({
        where,
        include: {
          medication: {
            select: {
              id: true,
              name: true,
              strength: true,
              form: true,
              route: true,
            },
          },
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          administeredBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          witness: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { scheduledTime: "desc" },
        skip,
        take: query.limit,
      }),
    ]);

    return NextResponse.json({
      administrations,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    console.error("Error fetching administrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch administrations" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/administrations
 * Record a new medication administration
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, id: userId } = session.user;

    if (!companyId) {
      return NextResponse.json(
        { error: "User not associated with a company" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = createAdministrationSchema.parse(body);

    // Verify medication belongs to company and client
    const medication = await prisma.medication.findFirst({
      where: {
        id: validatedData.medicationId,
        clientId: validatedData.clientId,
        companyId,
      },
      select: {
        id: true,
        name: true,
        controlledSchedule: true,
        requiresWitness: true,
      },
    });

    if (!medication) {
      return NextResponse.json(
        { error: "Medication not found" },
        { status: 404 }
      );
    }

    // Check if witness is required for controlled substances
    if (
      medication.controlledSchedule !== "NOT_CONTROLLED" &&
      medication.requiresWitness &&
      validatedData.result === "GIVEN" &&
      !validatedData.witnessId
    ) {
      return NextResponse.json(
        { error: "Witness signature required for controlled substances" },
        { status: 400 }
      );
    }

    // Create the administration record
    const administration = await prisma.medicationAdministration.create({
      data: {
        medicationId: validatedData.medicationId,
        clientId: validatedData.clientId,
        companyId,
        scheduledDoseId: validatedData.scheduledDoseId || null,
        shiftId: validatedData.shiftId || null,
        scheduledTime: validatedData.scheduledTime,
        administeredAt:
          validatedData.result === "GIVEN"
            ? validatedData.administeredAt || new Date()
            : null,
        administeredById:
          validatedData.result === "GIVEN" ? userId : null,
        result: validatedData.result,
        resultNotes: validatedData.resultNotes || null,
        amountGiven: validatedData.amountGiven || null,
        witnessId: validatedData.witnessId || null,
        witnessSignature: validatedData.witnessSignature || null,
        administrationSite: validatedData.administrationSite || null,
        ...(validatedData.vitalsBeforeAdmin && {
          vitalsBeforeAdmin: validatedData.vitalsBeforeAdmin,
        }),
        prnAssessment: validatedData.prnAssessment || null,
        prnFollowupTime: validatedData.prnFollowupTime || null,
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
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        administeredBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Update scheduled dose status if applicable
    if (validatedData.scheduledDoseId) {
      await prisma.scheduledDose.update({
        where: { id: validatedData.scheduledDoseId },
        data: {
          status:
            validatedData.result === "GIVEN"
              ? "COMPLETED"
              : validatedData.result === "REFUSED" ||
                validatedData.result === "NOT_AVAILABLE"
              ? "MISSED"
              : "PENDING",
        },
      });
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId,
        companyId,
        action: "MEDICATION_ADMINISTERED",
        entityType: "MedicationAdministration",
        entityId: administration.id,
        changes: {
          medicationName: medication.name,
          result: validatedData.result,
          scheduledTime: validatedData.scheduledTime,
          administeredAt: administration.administeredAt,
        },
      },
    });

    // If controlled substance was administered, update inventory
    if (
      medication.controlledSchedule !== "NOT_CONTROLLED" &&
      validatedData.result === "GIVEN"
    ) {
      const inventory = await prisma.medicationInventory.findFirst({
        where: {
          medicationId: medication.id,
          companyId,
        },
      });

      if (inventory) {
        await prisma.medicationInventory.update({
          where: { id: inventory.id },
          data: {
            quantityOnHand: { decrement: 1 },
          },
        });
      }
    }

    return NextResponse.json(administration, { status: 201 });
  } catch (error) {
    console.error("Error creating administration:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create administration" },
      { status: 500 }
    );
  }
}
