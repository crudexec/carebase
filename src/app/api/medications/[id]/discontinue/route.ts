import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { discontinueMedicationSchema } from "@/lib/emar/validation";

// POST /api/medications/[id]/discontinue - Discontinue a medication
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
    const validation = discontinueMedicationSchema.safeParse(body);

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

    if (medication.status === "DISCONTINUED") {
      return NextResponse.json(
        { error: "Medication is already discontinued" },
        { status: 400 }
      );
    }

    // Update to discontinued
    const updatedMedication = await prisma.medication.update({
      where: { id },
      data: {
        status: "DISCONTINUED",
        discontinuedAt: new Date(),
        discontinuedById: session.user.id,
        discontinuedReason: reason,
        endDate: new Date(),
      },
    });

    // Cancel any pending scheduled doses
    await prisma.scheduledDose.updateMany({
      where: {
        medicationId: id,
        status: "PENDING",
      },
      data: {
        status: "MISSED",
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "MEDICATION_DISCONTINUED",
        entityType: "Medication",
        entityId: medication.id,
        changes: {
          medicationName: medication.name,
          clientName: `${medication.client.firstName} ${medication.client.lastName}`,
          reason,
        },
      },
    });

    return NextResponse.json({ medication: updatedMedication });
  } catch (error) {
    console.error("Error discontinuing medication:", error);
    return NextResponse.json(
      { error: "Failed to discontinue medication" },
      { status: 500 }
    );
  }
}
