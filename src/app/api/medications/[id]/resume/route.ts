import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

// POST /api/medications/[id]/resume - Resume a medication from hold
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

    if (medication.status !== "ON_HOLD") {
      return NextResponse.json(
        { error: "Only medications on hold can be resumed" },
        { status: 400 }
      );
    }

    // Remove hold note from special instructions
    let specialInstructions = medication.specialInstructions || "";
    specialInstructions = specialInstructions
      .replace(/\n?\[ON HOLD:.*?\]/g, "")
      .trim();

    // Update to active
    const updatedMedication = await prisma.medication.update({
      where: { id },
      data: {
        status: "ACTIVE",
        specialInstructions: specialInstructions || null,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "MEDICATION_RESUMED",
        entityType: "Medication",
        entityId: medication.id,
        changes: {
          medicationName: medication.name,
          clientName: `${medication.client.firstName} ${medication.client.lastName}`,
        },
      },
    });

    return NextResponse.json({ medication: updatedMedication });
  } catch (error) {
    console.error("Error resuming medication:", error);
    return NextResponse.json(
      { error: "Failed to resume medication" },
      { status: 500 }
    );
  }
}
