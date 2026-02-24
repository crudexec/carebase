import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createAdministrationSchema } from "@/lib/emar/validation";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/administrations/[id]
 * Get a specific administration record
 */
export async function GET(request: NextRequest, context: RouteContext) {
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

    const params = await context.params;
    const { id } = params;

    const administration = await prisma.medicationAdministration.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        medication: {
          select: {
            id: true,
            name: true,
            genericName: true,
            strength: true,
            form: true,
            route: true,
            doseAmount: true,
            controlledSchedule: true,
            specialInstructions: true,
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
        scheduledDose: true,
      },
    });

    if (!administration) {
      return NextResponse.json(
        { error: "Administration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(administration);
  } catch (error) {
    console.error("Error fetching administration:", error);
    return NextResponse.json(
      { error: "Failed to fetch administration" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/administrations/[id]
 * Update an administration record
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
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

    const params = await context.params;
    const { id } = params;

    // Get existing administration
    const existingAdmin = await prisma.medicationAdministration.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        medication: {
          select: {
            id: true,
            name: true,
            controlledSchedule: true,
          },
        },
      },
    });

    if (!existingAdmin) {
      return NextResponse.json(
        { error: "Administration not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updateSchema = createAdministrationSchema.partial();
    const validatedData = updateSchema.parse(body);

    // Store old values for audit
    const oldValues = {
      result: existingAdmin.result,
      resultNotes: existingAdmin.resultNotes,
      administeredAt: existingAdmin.administeredAt,
    };

    const administration = await prisma.medicationAdministration.update({
      where: { id },
      data: {
        ...(validatedData.result && { result: validatedData.result }),
        ...(validatedData.resultNotes !== undefined && {
          resultNotes: validatedData.resultNotes,
        }),
        ...(validatedData.administeredAt && {
          administeredAt: validatedData.administeredAt,
        }),
        ...(validatedData.amountGiven !== undefined && {
          amountGiven: validatedData.amountGiven,
        }),
        ...(validatedData.administrationSite !== undefined && {
          administrationSite: validatedData.administrationSite,
        }),
        ...(validatedData.vitalsBeforeAdmin !== undefined && {
          vitalsBeforeAdmin: validatedData.vitalsBeforeAdmin,
        }),
        ...(validatedData.witnessId && { witnessId: validatedData.witnessId }),
        ...(validatedData.witnessSignature && {
          witnessSignature: validatedData.witnessSignature,
        }),
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

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId,
        companyId,
        action: "ADMINISTRATION_UPDATED",
        entityType: "MedicationAdministration",
        entityId: administration.id,
        changes: {
          old: oldValues,
          new: {
            result: administration.result,
            resultNotes: administration.resultNotes,
            administeredAt: administration.administeredAt,
          },
        },
      },
    });

    return NextResponse.json(administration);
  } catch (error) {
    console.error("Error updating administration:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update administration" },
      { status: 500 }
    );
  }
}
