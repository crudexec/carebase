import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import {
  createAdministrationSchema,
  administrationsQuerySchema,
} from "@/lib/emar/validation";

function parseControlledInventoryUnits(rawAmount: string | null | undefined) {
  if (!rawAmount) {
    return null;
  }

  const match = rawAmount.match(/(\d+(?:\.\d+)?)/);
  if (!match) {
    return null;
  }

  const parsed = Number(match[1]);
  if (!Number.isFinite(parsed) || parsed <= 0 || !Number.isInteger(parsed)) {
    return null;
  }

  return parsed;
}

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

    if (!hasPermission(session.user.role, PERMISSIONS.EMAR_VIEW)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

    if (!hasPermission(session.user.role, PERMISSIONS.EMAR_ADMINISTER)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
        doseAmount: true,
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

    const existingAdministration = await prisma.medicationAdministration.findFirst({
      where: {
        companyId,
        medicationId: validatedData.medicationId,
        clientId: validatedData.clientId,
        scheduledTime: validatedData.scheduledTime,
      },
      select: { id: true },
    });

    if (existingAdministration) {
      return NextResponse.json(
        { error: "This dose has already been documented" },
        { status: 409 }
      );
    }

    let witnessSignature = validatedData.witnessSignature || null;
    const witnessId = validatedData.witnessId || null;

    // Check if witness is required for controlled substances
    if (
      medication.controlledSchedule !== "NOT_CONTROLLED" &&
      medication.requiresWitness &&
      validatedData.result === "GIVEN" &&
      !witnessId
    ) {
      return NextResponse.json(
        { error: "A witness is required for controlled substances" },
        { status: 400 }
      );
    }

    if (witnessId) {
      if (witnessId === userId) {
        return NextResponse.json(
          { error: "You cannot witness your own administration" },
          { status: 400 }
        );
      }

      const witness = await prisma.user.findFirst({
        where: {
          id: witnessId,
          companyId,
          isActive: true,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });

      if (!witness) {
        return NextResponse.json(
          { error: "Witness not found" },
          { status: 404 }
        );
      }

      if (!hasPermission(witness.role, PERMISSIONS.EMAR_NARCOTIC_WITNESS)) {
        return NextResponse.json(
          { error: "Selected witness is not authorized for narcotic witnessing" },
          { status: 400 }
        );
      }

      if (!witnessSignature) {
        witnessSignature = `${witness.firstName} ${witness.lastName}`;
      }
    }

    const isControlledAdministration =
      medication.controlledSchedule !== "NOT_CONTROLLED" &&
      validatedData.result === "GIVEN";

    let controlledInventoryUnits: number | null = null;

    if (isControlledAdministration) {
      controlledInventoryUnits = parseControlledInventoryUnits(
        validatedData.amountGiven || medication.doseAmount
      );

      if (!controlledInventoryUnits) {
        return NextResponse.json(
          {
            error:
              "Controlled substance administrations require a whole-number amount that can be deducted from inventory",
          },
          { status: 400 }
        );
      }
    }

    const administration = await prisma.$transaction(async (tx) => {
      if (isControlledAdministration) {
        const inventory = await tx.medicationInventory.findFirst({
          where: {
            medicationId: medication.id,
            companyId,
          },
          select: {
            id: true,
            quantityOnHand: true,
          },
        });

        if (!inventory) {
          throw new Error(
            "Controlled substance inventory record not found for this medication"
          );
        }

        if (inventory.quantityOnHand < (controlledInventoryUnits || 0)) {
          throw new Error("Insufficient controlled substance inventory on hand");
        }
      }

      const createdAdministration = await tx.medicationAdministration.create({
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
          witnessId,
          witnessSignature,
          witnessedAt: witnessId ? new Date() : null,
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

      if (validatedData.scheduledDoseId) {
        await tx.scheduledDose.update({
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

      await tx.auditLog.create({
        data: {
          userId,
          companyId,
          action: "MEDICATION_ADMINISTERED",
          entityType: "MedicationAdministration",
          entityId: createdAdministration.id,
          changes: {
            medicationName: medication.name,
            result: validatedData.result,
            scheduledTime: validatedData.scheduledTime,
            administeredAt: createdAdministration.administeredAt,
            controlledInventoryUnits,
          },
        },
      });

      if (isControlledAdministration) {
        const inventory = await tx.medicationInventory.findFirst({
          where: {
            medicationId: medication.id,
            companyId,
          },
          select: {
            id: true,
          },
        });

        if (!inventory) {
          throw new Error(
            "Controlled substance inventory record not found for this medication"
          );
        }

        await tx.medicationInventory.update({
          where: { id: inventory.id },
          data: {
            quantityOnHand: { decrement: controlledInventoryUnits || 0 },
          },
        });
      }

      return createdAdministration;
    });

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
