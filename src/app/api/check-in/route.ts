import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { startOfDay, endOfDay } from "date-fns";

// Helper to get today's date at midnight (UTC)
function getTodayDate(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

// GET - Get upcoming shifts for the logged-in carer with today's attendance
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only carers can use check-in
    if (session.user.role !== "CARER") {
      return NextResponse.json(
        { error: "Only carers can access check-in" },
        { status: 403 }
      );
    }

    const now = new Date();
    const today = getTodayDate();

    // Get all shifts for today and upcoming shifts for the carer
    const shifts = await prisma.shift.findMany({
      where: {
        companyId: session.user.companyId,
        carerId: session.user.id,
        status: {
          in: ["SCHEDULED", "IN_PROGRESS"],
        },
        // Include shifts scheduled for today OR future shifts
        OR: [
          {
            // Shifts that start today (regardless of whether they've ended)
            scheduledStart: {
              gte: startOfDay(now),
              lte: endOfDay(now),
            },
          },
          {
            // Future shifts that haven't started yet
            scheduledStart: {
              gt: endOfDay(now),
            },
          },
          {
            // Any in-progress shifts (in case they started before today)
            status: "IN_PROGRESS",
          },
        ],
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            address: true,
            phone: true,
          },
        },
        carer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        // Include today's attendance record
        attendanceRecords: {
          where: {
            date: today,
          },
        },
      },
      orderBy: {
        scheduledStart: "asc",
      },
    });

    // Transform the data
    const transformedShifts = shifts.map((shift) => {
      const todayAttendance = shift.attendanceRecords[0];

      return {
        id: shift.id,
        scheduledStart: shift.scheduledStart.toISOString(),
        scheduledEnd: shift.scheduledEnd.toISOString(),
        actualStart: shift.actualStart?.toISOString() || null,
        actualEnd: shift.actualEnd?.toISOString() || null,
        status: shift.status,
        client: {
          id: shift.client.id,
          firstName: shift.client.firstName,
          lastName: shift.client.lastName,
          address: shift.client.address,
          phone: shift.client.phone,
        },
        carer: {
          id: shift.carer.id,
          firstName: shift.carer.firstName,
          lastName: shift.carer.lastName,
        },
        // Today's attendance info
        todayAttendance: todayAttendance ? {
          id: todayAttendance.id,
          date: todayAttendance.date.toISOString(),
          checkInTime: todayAttendance.checkInTime?.toISOString() || null,
          checkOutTime: todayAttendance.checkOutTime?.toISOString() || null,
        } : null,
      };
    });

    return NextResponse.json({ shifts: transformedShifts });
  } catch (error) {
    console.error("Error fetching check-in shifts:", error);
    return NextResponse.json(
      { error: "Failed to fetch shifts" },
      { status: 500 }
    );
  }
}
