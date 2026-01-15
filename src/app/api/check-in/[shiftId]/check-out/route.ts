import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Helper to get today's date at midnight (UTC)
function getTodayDate(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

// Check if today is the last day of the shift
function isLastDayOfShift(scheduledEnd: Date): boolean {
  const today = getTodayDate();
  const endDate = new Date(Date.UTC(
    scheduledEnd.getFullYear(),
    scheduledEnd.getMonth(),
    scheduledEnd.getDate()
  ));
  return today.getTime() >= endDate.getTime();
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
        { error: "Only carers can check out" },
        { status: 403 }
      );
    }

    const { shiftId } = await params;
    const today = getTodayDate();
    const checkOutTime = new Date();

    // Get the shift with today's attendance
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

    // Check if shift is in correct status
    if (shift.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Cannot check out - shift is not in progress" },
        { status: 400 }
      );
    }

    // Get today's attendance record
    const todayAttendance = shift.attendanceRecords[0];
    if (!todayAttendance || !todayAttendance.checkInTime) {
      return NextResponse.json(
        { error: "Cannot check out - not checked in for today" },
        { status: 400 }
      );
    }

    if (todayAttendance.checkOutTime) {
      return NextResponse.json(
        { error: "Already checked out for today" },
        { status: 400 }
      );
    }

    // Update today's attendance with check-out time
    const updatedAttendance = await prisma.shiftAttendance.update({
      where: { id: todayAttendance.id },
      data: {
        checkOutTime: checkOutTime,
      },
    });

    // Calculate hours worked today
    const hoursWorkedToday = (checkOutTime.getTime() - todayAttendance.checkInTime.getTime()) / (1000 * 60 * 60);

    // Check if this is the last day of the shift
    const isLastDay = isLastDayOfShift(shift.scheduledEnd);

    // Only mark shift as COMPLETED if it's the last day
    let updatedShift = shift;
    if (isLastDay) {
      updatedShift = await prisma.shift.update({
        where: { id: shiftId },
        data: {
          actualEnd: checkOutTime,
          status: "COMPLETED",
        },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          attendanceRecords: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: isLastDay
        ? "Checked out successfully - shift completed"
        : "Checked out for today - shift continues tomorrow",
      shift: {
        id: updatedShift.id,
        status: updatedShift.status,
        isCompleted: isLastDay,
      },
      attendance: {
        id: updatedAttendance.id,
        date: updatedAttendance.date.toISOString(),
        checkInTime: updatedAttendance.checkInTime?.toISOString(),
        checkOutTime: updatedAttendance.checkOutTime?.toISOString(),
        hoursWorkedToday: Math.round(hoursWorkedToday * 100) / 100,
      },
    });
  } catch (error) {
    console.error("Error checking out:", error);
    return NextResponse.json(
      { error: "Failed to check out" },
      { status: 500 }
    );
  }
}
