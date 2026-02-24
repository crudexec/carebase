import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { holdMedicationSchema } from "@/lib/emar/validation";

// POST /api/medications/[id]/hold - Put a medication on hold
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.user.role, PERMISSIONS.EMAR_MANAGE_MEDICATIONS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const validation = holdMedicationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { reason } = validation.data;

    const medication = await prisma.medication.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
      include: {
        client: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    if (!medication) {
      return NextResponse.json(
        { error: "Medication not found" },
        { status: 404 }
      );
    }

    if (medication.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Only active medications can be put on hold" },
        { status: 400 }
      );
    }

    // Update to on hold
    const updatedMedication = await prisma.medication.update({
      where: { id },
      data: {
        status: "ON_HOLD",
        specialInstructions: reason
          ? `${medication.specialInstructions || ""}\n[ON HOLD: ${reason}]`.trim()
          : medication.specialInstructions,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "MEDICATION_HELD",
        entityType: "Medication",
        entityId: medication.id,
        changes: {
          medicationName: medication.name,
          clientName: `${medication.client.firstName} ${medication.client.lastName}`,
          reason: reason || "No reason provided",
        },
      },
    });

    return NextResponse.json({ medication: updatedMedication });
  } catch (error) {
    console.error("Error putting medication on hold:", error);
    return NextResponse.json(
      { error: "Failed to put medication on hold" },
      { status: 500 }
    );
  }
}
