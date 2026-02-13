import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/mobile-auth";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MISSED_VISIT_REASONS, getMissedVisitReasonLabel } from "@/lib/missed-visit-reasons";
import { sendNotificationToRole, sendNotificationToSponsor } from "@/lib/notifications";

const markMissedSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
  notes: z.string().optional(),
});

// Helper to get user from either mobile or web auth
async function getUser(request: Request) {
  // Try mobile auth first (for mobile app)
  const mobileUser = await getAuthUser(request);
  if (mobileUser) {
    return mobileUser;
  }

  // Fall back to web session auth
  const session = await auth();
  if (session?.user) {
    return session.user;
  }

  return null;
}

// POST /api/shifts/[id]/mark-missed - Mark shift as missed
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: shiftId } = await params;

    // Fetch the shift with related data
    const shift = await prisma.shift.findUnique({
      where: {
        id: shiftId,
        companyId: user.companyId,
      },
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
      },
    });

    if (!shift) {
      return NextResponse.json({ error: "Shift not found" }, { status: 404 });
    }

    // Only assigned carer or managers/admins can mark as missed
    const isAssignedCarer = shift.carerId === user.id;
    const isManager = ["ADMIN", "OPS_MANAGER", "SUPERVISOR", "CLINICAL_DIRECTOR"].includes(user.role);

    if (!isAssignedCarer && !isManager) {
      return NextResponse.json(
        { error: "Only the assigned carer or managers can mark a shift as missed" },
        { status: 403 }
      );
    }

    // Can only mark as missed if SCHEDULED or IN_PROGRESS
    if (!["SCHEDULED", "IN_PROGRESS"].includes(shift.status)) {
      return NextResponse.json(
        { error: "Only scheduled or in-progress shifts can be marked as missed" },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = markMissedSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { reason, notes } = validation.data;

    // Validate reason code
    const validReason = MISSED_VISIT_REASONS.find(r => r.code === reason);
    if (!validReason) {
      return NextResponse.json(
        { error: "Invalid reason code" },
        { status: 400 }
      );
    }

    // Update the shift
    const updatedShift = await prisma.shift.update({
      where: { id: shiftId },
      data: {
        status: "MISSED",
        missedReason: reason,
        missedReasonNotes: notes || null,
        missedAt: new Date(),
        missedById: user.id,
      },
      select: {
        id: true,
        status: true,
        missedReason: true,
        missedReasonNotes: true,
        missedAt: true,
        scheduledStart: true,
        scheduledEnd: true,
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        carer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Send notifications
    const clientName = `${updatedShift.client.firstName} ${updatedShift.client.lastName}`;
    const carerName = `${updatedShift.carer.firstName} ${updatedShift.carer.lastName}`;
    const reasonLabel = getMissedVisitReasonLabel(reason);
    const shiftDate = updatedShift.scheduledStart.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const shiftTime = updatedShift.scheduledStart.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    const notificationData = {
      clientName,
      carerName,
      shiftDate,
      shiftTime,
      reason: reasonLabel,
      notes: notes || "No additional notes",
      shiftUrl: `/scheduling?shiftId=${shiftId}`,
    };

    // Send to supervisors and admins
    await sendNotificationToRole(
      "NO_SHOW_ALERT",
      ["SUPERVISOR", "ADMIN", "OPS_MANAGER"],
      user.companyId,
      notificationData,
      {
        relatedEntityType: "Shift",
        relatedEntityId: shiftId,
      }
    );

    // Send to client's sponsor if they have one
    await sendNotificationToSponsor(
      "NO_SHOW_ALERT",
      updatedShift.client.id,
      notificationData,
      {
        relatedEntityType: "Shift",
        relatedEntityId: shiftId,
      }
    );

    return NextResponse.json({
      success: true,
      shift: {
        id: updatedShift.id,
        status: updatedShift.status,
        missedReason: updatedShift.missedReason,
        missedReasonNotes: updatedShift.missedReasonNotes,
        missedAt: updatedShift.missedAt?.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error marking shift as missed:", error);
    return NextResponse.json(
      { error: "Failed to mark shift as missed" },
      { status: 500 }
    );
  }
}
