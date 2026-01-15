import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canManageSchedule, canViewAllSchedules } from "@/lib/scheduling";
import { ShiftStatus } from "@prisma/client";
import { z } from "zod";

const updateShiftSchema = z.object({
  carerId: z.string().optional(),
  clientId: z.string().optional(),
  scheduledStart: z.string().optional(),
  scheduledEnd: z.string().optional(),
  status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
});

// GET /api/scheduling/[id] - Get shift details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const shift = await prisma.shift.findFirst({
      where: { id, companyId: session.user.companyId },
      include: {
        carer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            address: true,
            phone: true,
          },
        },
        dailyReports: {
          orderBy: { reportDate: "desc" },
          take: 1,
        },
      },
    });

    if (!shift) {
      return NextResponse.json({ error: "Shift not found" }, { status: 404 });
    }

    // Check permissions
    if (session.user.role === "CARER" && shift.carerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ shift });
  } catch (error) {
    console.error("Error fetching shift:", error);
    return NextResponse.json({ error: "Failed to fetch shift" }, { status: 500 });
  }
}

// PATCH /api/scheduling/[id] - Update a shift
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!canManageSchedule(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const validation = updateShiftSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const existingShift = await prisma.shift.findFirst({
      where: { id, companyId: session.user.companyId },
    });

    if (!existingShift) {
      return NextResponse.json({ error: "Shift not found" }, { status: 404 });
    }

    // Can't modify completed or cancelled shifts (except status)
    if (
      ["COMPLETED", "CANCELLED"].includes(existingShift.status) &&
      Object.keys(validation.data).some((key) => key !== "status")
    ) {
      return NextResponse.json(
        { error: "Cannot modify completed or cancelled shifts" },
        { status: 400 }
      );
    }

    const updateData: {
      carerId?: string;
      clientId?: string;
      scheduledStart?: Date;
      scheduledEnd?: Date;
      status?: ShiftStatus;
    } = {};

    if (validation.data.carerId) {
      updateData.carerId = validation.data.carerId;
    }
    if (validation.data.clientId) {
      updateData.clientId = validation.data.clientId;
    }
    if (validation.data.scheduledStart) {
      updateData.scheduledStart = new Date(validation.data.scheduledStart);
    }
    if (validation.data.scheduledEnd) {
      updateData.scheduledEnd = new Date(validation.data.scheduledEnd);
    }
    if (validation.data.status) {
      updateData.status = validation.data.status;
    }

    // If changing times, check for conflicts
    if (updateData.scheduledStart || updateData.scheduledEnd || updateData.carerId) {
      const start = updateData.scheduledStart || existingShift.scheduledStart;
      const end = updateData.scheduledEnd || existingShift.scheduledEnd;
      const carerId = updateData.carerId || existingShift.carerId;

      const conflictingShift = await prisma.shift.findFirst({
        where: {
          companyId: session.user.companyId,
          id: { not: id },
          carerId,
          status: { in: ["SCHEDULED", "IN_PROGRESS"] },
          OR: [
            {
              scheduledStart: { lte: start },
              scheduledEnd: { gt: start },
            },
            {
              scheduledStart: { lt: end },
              scheduledEnd: { gte: end },
            },
            {
              scheduledStart: { gte: start },
              scheduledEnd: { lte: end },
            },
          ],
        },
      });

      if (conflictingShift) {
        return NextResponse.json(
          { error: "Carer has a conflicting shift at this time" },
          { status: 400 }
        );
      }
    }

    const shift = await prisma.shift.update({
      where: { id },
      data: updateData,
      include: {
        carer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            address: true,
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "SHIFT_UPDATED",
        entityType: "Shift",
        entityId: shift.id,
        changes: {
          previous: {
            carerId: existingShift.carerId,
            clientId: existingShift.clientId,
            scheduledStart: existingShift.scheduledStart.toISOString(),
            scheduledEnd: existingShift.scheduledEnd.toISOString(),
            status: existingShift.status,
          },
          updated: updateData,
        },
      },
    });

    return NextResponse.json({ shift });
  } catch (error) {
    console.error("Error updating shift:", error);
    return NextResponse.json({ error: "Failed to update shift" }, { status: 500 });
  }
}

// DELETE /api/scheduling/[id] - Cancel a shift
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!canManageSchedule(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const existingShift = await prisma.shift.findFirst({
      where: { id, companyId: session.user.companyId },
    });

    if (!existingShift) {
      return NextResponse.json({ error: "Shift not found" }, { status: 404 });
    }

    // Can only cancel scheduled shifts
    if (existingShift.status !== "SCHEDULED") {
      return NextResponse.json(
        { error: "Can only cancel scheduled shifts" },
        { status: 400 }
      );
    }

    // Update status to cancelled instead of deleting
    const shift = await prisma.shift.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "SHIFT_CANCELLED",
        entityType: "Shift",
        entityId: shift.id,
        changes: {
          previousStatus: existingShift.status,
          newStatus: "CANCELLED",
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error cancelling shift:", error);
    return NextResponse.json({ error: "Failed to cancel shift" }, { status: 500 });
  }
}
