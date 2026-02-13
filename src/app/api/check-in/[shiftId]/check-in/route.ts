import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/mobile-auth";
import { prisma } from "@/lib/db";
import { sendNotificationToRole, sendNotificationToSponsor } from "@/lib/notifications";
import {
  validateEVVLocation,
  createEVVLocationData,
  DEFAULT_GEOFENCE_RADIUS,
  type EVVValidationResult,
  type EVVLocationData,
} from "@/lib/evv";

// Request body schema with optional location
const checkInSchema = z.object({
  location: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      accuracy: z.number().min(0),
    })
    .optional(),
});

// Helper to get today's date at midnight (UTC)
function getTodayDate(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

// Detect source from user agent
function getLocationSource(request: NextRequest): "mobile" | "web" {
  const userAgent = request.headers.get("user-agent") || "";
  // Mobile apps typically have specific user agents
  if (
    userAgent.includes("Expo") ||
    userAgent.includes("okhttp") ||
    userAgent.includes("CFNetwork")
  ) {
    return "mobile";
  }
  return "web";
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shiftId: string }> }
) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "CARER") {
      return NextResponse.json(
        { error: "Only carers can check in" },
        { status: 403 }
      );
    }

    const { shiftId } = await params;
    const today = getTodayDate();
    const checkInTime = new Date();

    // Parse request body for location data
    const body = await request.json().catch(() => ({}));
    const validation = checkInSchema.safeParse(body);
    const locationData = validation.success ? validation.data.location : null;

    // Get the shift with client location data for EVV validation
    const shift = await prisma.shift.findFirst({
      where: { id: shiftId, companyId: user.companyId },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            latitude: true,
            longitude: true,
            geofenceRadius: true,
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
    if (shift.carerId !== user.id) {
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

    // Get company settings for EVV
    const company = await prisma.company.findUnique({
      where: { id: user.companyId },
      select: {
        evvEnabled: true,
        defaultGeofenceRadius: true,
      },
    });

    // Perform EVV validation if location provided and client has coordinates
    let evvResult: EVVValidationResult | null = null;
    let evvData: EVVLocationData | null = null;

    if (
      locationData &&
      shift.client.latitude &&
      shift.client.longitude
    ) {
      const geofenceRadius =
        shift.client.geofenceRadius ??
        company?.defaultGeofenceRadius ??
        DEFAULT_GEOFENCE_RADIUS;

      evvResult = validateEVVLocation(locationData, {
        latitude: Number(shift.client.latitude),
        longitude: Number(shift.client.longitude),
        geofenceRadius,
      });

      evvData = createEVVLocationData(
        locationData,
        evvResult,
        getLocationSource(request)
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
        companyId: user.companyId,
        shiftId: shiftId,
        date: today,
        checkInTime: checkInTime,
      },
      update: {
        checkInTime: checkInTime,
      },
    });

    // Update the shift status to IN_PROGRESS if not already
    // Also set actualStart on first check-in ever and store EVV location
    interface ShiftUpdateData {
      status: "IN_PROGRESS";
      actualStart?: Date;
      checkInLocation?: string;
    }

    const updateData: ShiftUpdateData = {
      status: "IN_PROGRESS",
    };

    if (!shift.actualStart) {
      updateData.actualStart = checkInTime;
    }

    // Store EVV location data
    if (evvData) {
      updateData.checkInLocation = JSON.stringify(evvData);
    }

    await prisma.shift.update({
      where: { id: shiftId },
      data: updateData,
    });

    // Create audit log for check-in with EVV data
    await prisma.auditLog.create({
      data: {
        companyId: user.companyId,
        userId: user.id,
        action: "SHIFT_CHECK_IN",
        entityType: "Shift",
        entityId: shiftId,
        changes: {
          shiftId: shiftId,
          clientName: `${shift.client.firstName} ${shift.client.lastName}`,
          checkInTime: checkInTime.toISOString(),
          ...(evvResult && {
            evvStatus: evvResult.status,
            evvIsWithinGeofence: evvResult.isWithinGeofence,
            evvDistanceFromClient: evvResult.distanceFromClient,
          }),
        },
      },
    });

    // Get carer info for notifications
    const carer = await prisma.user.findUnique({
      where: { id: user.id },
      select: { firstName: true, lastName: true },
    });

    const carerName = carer ? `${carer.firstName} ${carer.lastName}` : "Unknown Carer";
    const clientName = `${shift.client.firstName} ${shift.client.lastName}`;
    const shiftUrl = `/scheduling?shiftId=${shiftId}`;

    // Calculate if check-in is late (15+ minutes after scheduled start)
    const scheduledStartTime = new Date(shift.scheduledStart);
    const minutesLate = Math.floor(
      (checkInTime.getTime() - scheduledStartTime.getTime()) / (1000 * 60)
    );

    if (minutesLate >= 15) {
      // Send LATE_CHECK_IN notification to supervisors/admins
      sendNotificationToRole(
        "LATE_CHECK_IN",
        ["SUPERVISOR", "ADMIN"],
        user.companyId,
        {
          carerName,
          clientName,
          scheduledTime: scheduledStartTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }),
          actualCheckInTime: checkInTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }),
          minutesLate: String(minutesLate),
          shiftDate: scheduledStartTime.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          }),
          shiftUrl,
        },
        { relatedEntityType: "Shift", relatedEntityId: shiftId }
      ).catch(console.error);
    }

    // Send notification if check-in is outside geofence
    if (evvResult && !evvResult.isWithinGeofence) {
      sendNotificationToRole(
        "LATE_CHECK_IN", // TODO: Add EVV_OUT_OF_GEOFENCE event type
        ["SUPERVISOR", "ADMIN"],
        user.companyId,
        {
          carerName,
          clientName,
          scheduledTime: scheduledStartTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }),
          actualCheckInTime: checkInTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }),
          minutesLate: `EVV Alert: ${evvResult.distanceFromClient}m from client location`,
          shiftDate: scheduledStartTime.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          }),
          shiftUrl,
        },
        { relatedEntityType: "Shift", relatedEntityId: shiftId }
      ).catch(console.error);
    }

    // Send CHECK_IN_CONFIRMATION to sponsor
    sendNotificationToSponsor(
      "CHECK_IN_CONFIRMATION",
      shift.clientId,
      {
        carerName,
        clientName,
        checkInTime: checkInTime.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        shiftDate: scheduledStartTime.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        }),
      },
      { relatedEntityType: "Shift", relatedEntityId: shiftId }
    ).catch(console.error);

    // Send CHECK_IN_CONFIRMATION to supervisors
    sendNotificationToRole(
      "CHECK_IN_CONFIRMATION",
      ["SUPERVISOR"],
      user.companyId,
      {
        carerName,
        clientName,
        checkInTime: checkInTime.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        shiftDate: scheduledStartTime.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        }),
      },
      { relatedEntityType: "Shift", relatedEntityId: shiftId }
    ).catch(console.error);

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
        client: updatedShift!.client
          ? {
              id: updatedShift!.client.id,
              firstName: updatedShift!.client.firstName,
              lastName: updatedShift!.client.lastName,
              address: updatedShift!.client.address,
            }
          : null,
        carer: updatedShift!.carer
          ? {
              id: updatedShift!.carer.id,
              firstName: updatedShift!.carer.firstName,
              lastName: updatedShift!.carer.lastName,
            }
          : null,
      },
      attendance: {
        id: attendance.id,
        date: attendance.date.toISOString(),
        checkInTime: attendance.checkInTime?.toISOString(),
      },
      // EVV response data
      evvStatus: evvResult?.status ?? "LOCATION_UNAVAILABLE",
      evvIsWithinGeofence: evvResult?.isWithinGeofence ?? null,
      distanceFromClient: evvResult?.distanceFromClient ?? null,
      evvMessage: evvResult?.message ?? "Location not provided",
    });
  } catch (error) {
    console.error("Error checking in:", error);
    return NextResponse.json(
      { error: "Failed to check in" },
      { status: 500 }
    );
  }
}
