import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Helper to get today's date at midnight (UTC)
function getTodayDate(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shiftId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "CARER") {
      return NextResponse.json(
        { error: "Only carers can check in" },
        { status: 403 }
      );
    }

    const { shiftId } = await params;
    const today = getTodayDate();
    const checkInTime = new Date();

    // Get the shift with today's attendance record
    const shift = await prisma.shift.findFirst({
      where: { id: shiftId, companyId: session.user.companyId },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        attendanceRecords: {
          where: {
            date: today,
          },
        },
      },
    });

    if (!shift) {
      return NextResponse.json({ error: "Shift not found" }, { status: 404 });
    }

    // Verify this shift belongs to the carer
    if (shift.carerId !== session.user.id) {
      return NextResponse.json(
        { error: "This shift is not assigned to you" },
        { status: 403 }
      );
    }

    // Check if shift is in correct status (SCHEDULED or IN_PROGRESS for multi-day shifts)
    if (shift.status === "COMPLETED" || shift.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Cannot check in - shift is already completed or cancelled" },
        { status: 400 }
      );
    }

    // Check if already checked in today
    const todayAttendance = shift.attendanceRecords[0];
    if (todayAttendance?.checkInTime) {
      return NextResponse.json(
        { error: "Already checked in for today" },
        { status: 400 }
      );
    }

    // Create or update attendance record for today
    const attendance = await prisma.shiftAttendance.upsert({
      where: {
        shiftId_date: {
          shiftId: shiftId,
          date: today,
        },
      },
      create: {
        companyId: session.user.companyId,
        shiftId: shiftId,
        date: today,
        checkInTime: checkInTime,
      },
      update: {
        checkInTime: checkInTime,
      },
    });

    // Update the shift status to IN_PROGRESS if not already
    // Also set actualStart on first check-in ever
    const updateData: { status: "IN_PROGRESS"; actualStart?: Date } = {
      status: "IN_PROGRESS",
    };

    if (!shift.actualStart) {
      updateData.actualStart = checkInTime;
    }

    await prisma.shift.update({
      where: { id: shiftId },
      data: updateData,
    });

    // Create audit log for check-in
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "SHIFT_CHECK_IN",
        entityType: "Shift",
        entityId: shiftId,
        changes: {
          shiftId: shiftId,
          clientName: `${shift.client.firstName} ${shift.client.lastName}`,
          checkInTime: checkInTime.toISOString(),
        },
      },
    });

    // Fetch the full updated shift for the response
    const updatedShift = await prisma.shift.findUnique({
      where: { id: shiftId },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            address: true,
          },
        },
        carer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        attendanceRecords: {
          orderBy: { date: "desc" },
          take: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Checked in successfully",
      shift: {
        id: updatedShift!.id,
        clientId: updatedShift!.clientId,
        carerId: updatedShift!.carerId,
        scheduledStart: updatedShift!.scheduledStart.toISOString(),
        scheduledEnd: updatedShift!.scheduledEnd.toISOString(),
        actualStart: updatedShift!.actualStart?.toISOString() || null,
        actualEnd: updatedShift!.actualEnd?.toISOString() || null,
        status: updatedShift!.status,
        client: updatedShift!.client ? {
          id: updatedShift!.client.id,
          firstName: updatedShift!.client.firstName,
          lastName: updatedShift!.client.lastName,
          address: updatedShift!.client.address,
        } : null,
        carer: updatedShift!.carer ? {
          id: updatedShift!.carer.id,
          firstName: updatedShift!.carer.firstName,
          lastName: updatedShift!.carer.lastName,
        } : null,
      },
      attendance: {
        id: attendance.id,
        date: attendance.date.toISOString(),
        checkInTime: attendance.checkInTime?.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error checking in:", error);
    return NextResponse.json(
      { error: "Failed to check in" },
      { status: 500 }
    );
  }
}
