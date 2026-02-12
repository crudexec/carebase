import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ShiftStatus } from "@prisma/client";

// GET /api/shifts/missing-notes - Get completed shifts without visit notes
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    // Look back 7 days for missing visit notes
    const cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Build where clause based on role
    const isCarer = session.user.role === "CARER";

    const shifts = await prisma.shift.findMany({
      where: {
        companyId: session.user.companyId,
        status: ShiftStatus.COMPLETED,
        // Completed within the last 7 days
        actualEnd: {
          gte: cutoffTime,
        },
        // No visit notes exist for this shift
        visitNotes: {
          none: {},
        },
        // If carer, only show their own shifts
        ...(isCarer ? { carerId: session.user.id } : {}),
      },
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
          },
        },
      },
      orderBy: {
        actualEnd: "desc",
      },
      take: 20, // Limit to 20 most recent
    });

    // Calculate hours since completion
    const shiftsWithMeta = shifts.map((shift) => {
      const completedAt = shift.actualEnd || shift.scheduledEnd;
      const hoursSinceCompletion = Math.floor(
        (now.getTime() - completedAt.getTime()) / (1000 * 60 * 60)
      );

      return {
        id: shift.id,
        scheduledStart: shift.scheduledStart.toISOString(),
        scheduledEnd: shift.scheduledEnd.toISOString(),
        actualEnd: shift.actualEnd?.toISOString() || null,
        client: shift.client,
        carer: shift.carer,
        hoursSinceCompletion,
        visitNoteReminderSent: shift.visitNoteReminderSent,
      };
    });

    return NextResponse.json({
      shifts: shiftsWithMeta,
      count: shiftsWithMeta.length,
    });
  } catch (error) {
    console.error("Error fetching shifts with missing notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch shifts" },
      { status: 500 }
    );
  }
}
