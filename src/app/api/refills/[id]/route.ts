import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateRefillRequestSchema } from "@/lib/emar/validation";
import { z } from "zod";

// GET /api/refills/[id] - Get a single refill request
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const refill = await prisma.refillRequest.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
      include: {
        medication: {
          select: {
            id: true,
            name: true,
            genericName: true,
            strength: true,
            form: true,
            controlledSchedule: true,
            refillsRemaining: true,
            prescriptionNumber: true,
            prescriber: {
              select: { id: true, firstName: true, lastName: true, npi: true },
            },
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
        faxRecord: {
          select: {
            id: true,
            status: true,
            completedAt: true,
            toNumber: true,
          },
        },
      },
    });

    if (!refill) {
      return NextResponse.json(
        { error: "Refill request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ refill });
  } catch (error) {
    console.error("Error fetching refill:", error);
    return NextResponse.json(
      { error: "Failed to fetch refill request" },
      { status: 500 }
    );
  }
}

// PUT /api/refills/[id] - Update a refill request
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = updateRefillRequestSchema.parse(body);

    // Get existing refill
    const existingRefill = await prisma.refillRequest.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
      include: {
        medication: {
          select: { name: true },
        },
      },
    });

    if (!existingRefill) {
      return NextResponse.json(
        { error: "Refill request not found" },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (validated.status) {
      updateData.status = validated.status;

      // Track who responded/received based on status change
      if (validated.status === "APPROVED" || validated.status === "DENIED") {
        updateData.respondedAt = new Date();
        updateData.respondedById = session.user.id;
      }

      if (validated.status === "RECEIVED") {
        updateData.receivedAt = new Date();
        updateData.receivedById = session.user.id;
      }

      if (validated.status === "ORDERED") {
        updateData.orderedAt = validated.orderedAt || new Date();
      }
    }

    if (validated.responseNotes !== undefined) {
      updateData.responseNotes = validated.responseNotes;
    }

    if (validated.expectedDelivery !== undefined) {
      updateData.expectedDelivery = validated.expectedDelivery;
    }

    if (validated.quantityReceived !== undefined) {
      updateData.quantityReceived = validated.quantityReceived;
    }

    // Update the refill
    const refill = await prisma.refillRequest.update({
      where: { id },
      data: updateData,
      include: {
        medication: {
          select: {
            id: true,
            name: true,
            strength: true,
            form: true,
            controlledSchedule: true,
          },
        },
        client: {
          select: { id: true, firstName: true, lastName: true },
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
    });

    // If received, update medication's refillsRemaining
    if (validated.status === "RECEIVED" && existingRefill.medication) {
      await prisma.medication.update({
        where: { id: refill.medicationId },
        data: {
          lastFillDate: new Date(),
        },
      });
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "REFILL_UPDATED",
        entityType: "RefillRequest",
        entityId: id,
        changes: {
          previousStatus: existingRefill.status,
          newStatus: validated.status || existingRefill.status,
          medicationName: existingRefill.medication.name,
        },
      },
    });

    return NextResponse.json({ refill });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating refill:", error);
    return NextResponse.json(
      { error: "Failed to update refill request" },
      { status: 500 }
    );
  }
}
