import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canManageSchedule } from "@/lib/scheduling";
import { sendNotification, sendNotificationToRole } from "@/lib/notifications";
import { ShiftStatus } from "@prisma/client";
import { z } from "zod";
import { format } from "date-fns";
import { deductAuthorizationUnits, calculateShiftHours } from "@/lib/authorization-tracking";

const updateShiftSchema = z.object({
  carerId: z.string().optional(),
  clientId: z.string().optional(),
  scheduledStart: z.string().optional(),
  scheduledEnd: z.string().optional(),
  status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "MISSED"]).optional(),
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
        visitNotes: {
          select: {
            id: true,
            formSchemaSnapshot: true,
            submittedAt: true,
            qaStatus: true,
            carer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { submittedAt: "desc" },
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

    // If status changed to COMPLETED, deduct authorization units
    if (
      validation.data.status === "COMPLETED" &&
      existingShift.status !== "COMPLETED"
    ) {
      const totalHoursWorked = calculateShiftHours({
        actualStart: shift.actualStart,
        actualEnd: shift.actualEnd,
        scheduledStart: shift.scheduledStart,
        scheduledEnd: shift.scheduledEnd,
      });

      const authResult = await deductAuthorizationUnits({
        companyId: session.user.companyId,
        clientId: shift.clientId,
        hoursWorked: totalHoursWorked,
        shiftId: id,
        userId: session.user.id,
      });

      if (authResult.success && authResult.authorizationId) {
        console.log(
          `Authorization units deducted via status change: ${authResult.unitsDeducted} units, ` +
          `${authResult.remainingUnits} remaining`
        );
      }
    }

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

    // Send notification if shift was rescheduled (time changed)
    const wasRescheduled = updateData.scheduledStart || updateData.scheduledEnd;
    if (wasRescheduled) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.carebasehealth.com";
      sendNotification({
        eventType: "SHIFT_RESCHEDULED",
        recipientIds: [shift.carerId],
        data: {
          clientName: `${shift.client.firstName} ${shift.client.lastName}`,
          originalDate: format(existingShift.scheduledStart, "EEEE, MMMM d, yyyy"),
          originalTime: format(existingShift.scheduledStart, "h:mm a"),
          newDate: format(shift.scheduledStart, "EEEE, MMMM d, yyyy"),
          newTime: format(shift.scheduledStart, "h:mm a"),
          shiftUrl: `${appUrl}/scheduling?shift=${shift.id}`,
        },
        relatedEntityType: "Shift",
        relatedEntityId: shift.id,
      }).catch((err) => {
        console.error("Failed to send shift reschedule notification:", err);
      });
    }

    // If carer was changed, notify both old and new carer
    if (updateData.carerId && updateData.carerId !== existingShift.carerId) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.carebasehealth.com";
      // Notify new carer of assignment
      sendNotification({
        eventType: "SHIFT_ASSIGNED",
        recipientIds: [updateData.carerId],
        data: {
          clientName: `${shift.client.firstName} ${shift.client.lastName}`,
          shiftDate: format(shift.scheduledStart, "EEEE, MMMM d, yyyy"),
          shiftTime: format(shift.scheduledStart, "h:mm a"),
          shiftEndTime: format(shift.scheduledEnd, "h:mm a"),
          address: shift.client.address || "Address not provided",
          shiftUrl: `${appUrl}/scheduling?shift=${shift.id}`,
        },
        relatedEntityType: "Shift",
        relatedEntityId: shift.id,
      }).catch((err) => {
        console.error("Failed to send shift assignment notification:", err);
      });

      // Notify old carer of cancellation
      sendNotification({
        eventType: "SHIFT_CANCELLED",
        recipientIds: [existingShift.carerId],
        data: {
          clientName: `${shift.client.firstName} ${shift.client.lastName}`,
          shiftDate: format(shift.scheduledStart, "EEEE, MMMM d, yyyy"),
          shiftTime: format(shift.scheduledStart, "h:mm a"),
          cancellationReason: "Shift reassigned to another caregiver",
        },
        relatedEntityType: "Shift",
        relatedEntityId: shift.id,
      }).catch((err) => {
        console.error("Failed to send shift removal notification:", err);
      });
    }

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

    // Fetch shift with relations before updating
    const shiftWithRelations = await prisma.shift.findFirst({
      where: { id },
      include: {
        carer: { select: { id: true, firstName: true, lastName: true } },
        client: { select: { firstName: true, lastName: true } },
      },
    });

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

    // Send notification to the carer
    if (shiftWithRelations) {
      sendNotification({
        eventType: "SHIFT_CANCELLED",
        recipientIds: [shiftWithRelations.carerId],
        data: {
          clientName: `${shiftWithRelations.client.firstName} ${shiftWithRelations.client.lastName}`,
          shiftDate: format(existingShift.scheduledStart, "EEEE, MMMM d, yyyy"),
          shiftTime: format(existingShift.scheduledStart, "h:mm a"),
          cancellationReason: "Cancelled by administrator",
        },
        relatedEntityType: "Shift",
        relatedEntityId: shift.id,
      }).catch((err) => {
        console.error("Failed to send shift cancellation notification:", err);
      });

      // Send COVERAGE_NEEDED notification to all carers
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.carebasehealth.com";
      sendNotificationToRole(
        "COVERAGE_NEEDED",
        ["CARER"],
        session.user.companyId,
        {
          clientName: `${shiftWithRelations.client.firstName} ${shiftWithRelations.client.lastName}`,
          shiftDate: format(existingShift.scheduledStart, "EEEE, MMMM d, yyyy"),
          shiftTime: format(existingShift.scheduledStart, "h:mm a"),
          shiftEndTime: format(existingShift.scheduledEnd, "h:mm a"),
          address: "", // Would need client address
          shiftUrl: `${appUrl}/scheduling?shift=${shift.id}`,
        },
        { relatedEntityType: "Shift", relatedEntityId: shift.id }
      ).catch((err) => {
        console.error("Failed to send coverage needed notification:", err);
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error cancelling shift:", error);
    return NextResponse.json({ error: "Failed to cancel shift" }, { status: 500 });
  }
}
