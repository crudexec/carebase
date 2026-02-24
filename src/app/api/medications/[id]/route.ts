import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { updateMedicationSchema } from "@/lib/emar/validation";

// GET /api/medications/[id] - Get medication details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.user.role, PERMISSIONS.EMAR_VIEW)) {
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
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            phone: true,
          },
        },
        prescriber: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            npi: true,
            phone: true,
            fax: true,
          },
        },
        discontinuedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            scheduledDoses: true,
            administrations: true,
            refillRequests: true,
            inventoryRecords: true,
          },
        },
      },
    });

    if (!medication) {
      return NextResponse.json(
        { error: "Medication not found" },
        { status: 404 }
      );
    }

    // Get recent administrations
    const recentAdministrations = await prisma.medicationAdministration.findMany(
      {
        where: {
          medicationId: id,
          companyId: session.user.companyId,
        },
        include: {
          administeredBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }
    );

    // Get active refill requests
    const activeRefillRequests = await prisma.refillRequest.findMany({
      where: {
        medicationId: id,
        companyId: session.user.companyId,
        status: { in: ["PENDING", "APPROVED", "ORDERED"] },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      medication,
      recentAdministrations,
      activeRefillRequests,
    });
  } catch (error) {
    console.error("Error fetching medication:", error);
    return NextResponse.json(
      { error: "Failed to fetch medication" },
      { status: 500 }
    );
  }
}

// PATCH /api/medications/[id] - Update medication
export async function PATCH(
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
    const validation = updateMedicationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Verify medication exists and belongs to company
    const existingMedication = await prisma.medication.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
    });

    if (!existingMedication) {
      return NextResponse.json(
        { error: "Medication not found" },
        { status: 404 }
      );
    }

    // Verify prescriber if being updated
    if (data.prescriberId) {
      const prescriber = await prisma.physician.findFirst({
        where: {
          id: data.prescriberId,
          companyId: session.user.companyId,
        },
      });

      if (!prescriber) {
        return NextResponse.json(
          { error: "Prescriber not found" },
          { status: 404 }
        );
      }
    }

    // Update the medication
    const medication = await prisma.medication.update({
      where: { id },
      data: {
        ...data,
        // Auto-set requiresWitness for Schedule II
        requiresWitness:
          data.requiresWitness ??
          (data.controlledSchedule === "SCHEDULE_II" ||
            existingMedication.controlledSchedule === "SCHEDULE_II"),
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        prescriber: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            npi: true,
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "MEDICATION_UPDATED",
        entityType: "Medication",
        entityId: medication.id,
        changes: {
          medicationName: medication.name,
          updatedFields: Object.keys(data),
        },
      },
    });

    return NextResponse.json({ medication });
  } catch (error) {
    console.error("Error updating medication:", error);
    return NextResponse.json(
      { error: "Failed to update medication" },
      { status: 500 }
    );
  }
}

// DELETE /api/medications/[id] - Soft delete (discontinue) medication
export async function DELETE(
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
    const { searchParams } = new URL(request.url);
    const reason = searchParams.get("reason") || "Discontinued";

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

    // Soft delete by setting status to DISCONTINUED
    await prisma.medication.update({
      where: { id },
      data: {
        status: "DISCONTINUED",
        discontinuedAt: new Date(),
        discontinuedById: session.user.id,
        discontinuedReason: reason,
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error discontinuing medication:", error);
    return NextResponse.json(
      { error: "Failed to discontinue medication" },
      { status: 500 }
    );
  }
}
