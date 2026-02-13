import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/mobile-auth";
import { prisma } from "@/lib/db";
import { deductAuthorizationUnits, calculateShiftHours } from "@/lib/authorization-tracking";
import { sendNotificationToRole, sendNotificationToSponsor } from "@/lib/notifications";
import {
  validateEVVLocation,
  createEVVLocationData,
  DEFAULT_GEOFENCE_RADIUS,
  type EVVValidationResult,
  type EVVLocationData,
} from "@/lib/evv";

// Request body schema with optional location
const checkOutSchema = z.object({
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

// Detect source from user agent
function getLocationSource(request: NextRequest): "mobile" | "web" {
  const userAgent = request.headers.get("user-agent") || "";
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
        { error: "Only carers can check out" },
        { status: 403 }
      );
    }

    const { shiftId } = await params;
    const today = getTodayDate();
    const checkOutTime = new Date();

    // Parse request body for location data
    const body = await request.json().catch(() => ({}));
    const validation = checkOutSchema.safeParse(body);
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

    // Check if shift is in correct status
    if (shift.status !== "IN_PROGRESS") {
      console.log(`Check-out failed: Shift status is ${shift.status}, expected IN_PROGRESS`);
      return NextResponse.json(
        { error: `Cannot check out - shift status is ${shift.status}, not in progress` },
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

    // Get today's attendance record
    const todayAttendance = shift.attendanceRecords[0];
    console.log(`Check-out: Today's date (UTC): ${today.toISOString()}, Attendance records found: ${shift.attendanceRecords.length}`);

    let updatedAttendance = todayAttendance;
    let hoursWorkedToday = 0;

    if (todayAttendance && todayAttendance.checkInTime && !todayAttendance.checkOutTime) {
      // Normal case: checked in today, now checking out
      updatedAttendance = await prisma.shiftAttendance.update({
        where: { id: todayAttendance.id },
        data: {
          checkOutTime: checkOutTime,
        },
      });
      hoursWorkedToday = (checkOutTime.getTime() - todayAttendance.checkInTime.getTime()) / (1000 * 60 * 60);
    } else if (todayAttendance && todayAttendance.checkOutTime) {
      // Already checked out today - just complete the shift
      console.log(`Check-out: Already checked out today, just completing shift`);
    } else {
      // No attendance for today - create one or just complete the shift
      // This handles the case where shift spans multiple days
      console.log(`Check-out: No attendance for today, completing shift directly`);

      // Get the most recent attendance record to calculate total hours
      const lastAttendance = await prisma.shiftAttendance.findFirst({
        where: { shiftId: shiftId },
        orderBy: { date: "desc" },
      });

      if (lastAttendance) {
        updatedAttendance = lastAttendance;
      }
    }

    // Check if this is the last day of the shift (or past the scheduled end)
    const _isLastDay = isLastDayOfShift(shift.scheduledEnd);

    // Mark shift as COMPLETED and store EVV location data
    interface ShiftUpdateData {
      actualEnd: Date;
      status: "COMPLETED";
      checkOutLocation?: string;
    }

    const updateData: ShiftUpdateData = {
      actualEnd: checkOutTime,
      status: "COMPLETED",
    };

    // Store EVV location data
    if (evvData) {
      updateData.checkOutLocation = JSON.stringify(evvData);
    }

    await prisma.shift.update({
      where: { id: shiftId },
      data: updateData,
    });

    // Calculate total hours worked for the shift and deduct from authorization
    const totalHoursWorked = calculateShiftHours({
      actualStart: shift.actualStart,
      actualEnd: checkOutTime,
      scheduledStart: shift.scheduledStart,
      scheduledEnd: shift.scheduledEnd,
    });

    // Deduct units from the client's active authorization
    const authResult = await deductAuthorizationUnits({
      companyId: user.companyId,
      clientId: shift.clientId,
      hoursWorked: totalHoursWorked,
      shiftId: shiftId,
      userId: user.id,
    });

    if (authResult.success && authResult.authorizationId) {
      console.log(
        `Authorization units deducted: ${authResult.unitsDeducted} units, ` +
        `${authResult.remainingUnits} remaining`
      );
    }

    // Create audit log for check-out with EVV data
    await prisma.auditLog.create({
      data: {
        companyId: user.companyId,
        userId: user.id,
        action: "SHIFT_CHECK_OUT",
        entityType: "Shift",
        entityId: shiftId,
        changes: {
          shiftId: shiftId,
          clientName: `${shift.client.firstName} ${shift.client.lastName}`,
          checkOutTime: checkOutTime.toISOString(),
          hoursWorked: Math.round(hoursWorkedToday * 100) / 100,
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
    const shiftDate = shift.scheduledStart.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

    // Calculate scheduled hours vs actual hours
    const scheduledHours = (shift.scheduledEnd.getTime() - shift.scheduledStart.getTime()) / (1000 * 60 * 60);
    const actualHours = totalHoursWorked;

    // Check for EARLY_CHECK_OUT (30+ minutes before scheduled end)
    const minutesEarly = Math.floor((shift.scheduledEnd.getTime() - checkOutTime.getTime()) / (1000 * 60));
    if (minutesEarly >= 30) {
      sendNotificationToRole(
        "EARLY_CHECK_OUT",
        ["SUPERVISOR", "ADMIN"],
        user.companyId,
        {
          carerName,
          clientName,
          scheduledEndTime: shift.scheduledEnd.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
          actualCheckOutTime: checkOutTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
          minutesEarly: String(minutesEarly),
          shiftDate,
          shiftUrl,
        },
        { relatedEntityType: "Shift", relatedEntityId: shiftId }
      ).catch(console.error);
    }

    // Check for OVERTIME_ALERT (15+ minutes over scheduled hours)
    const overtimeMinutes = Math.floor((actualHours - scheduledHours) * 60);
    if (overtimeMinutes >= 15) {
      sendNotificationToRole(
        "OVERTIME_ALERT",
        ["SUPERVISOR", "ADMIN"],
        user.companyId,
        {
          carerName,
          clientName,
          scheduledHours: scheduledHours.toFixed(1),
          actualHours: actualHours.toFixed(1),
          overtimeMinutes: String(overtimeMinutes),
          shiftDate,
          shiftUrl,
        },
        { relatedEntityType: "Shift", relatedEntityId: shiftId }
      ).catch(console.error);
    }

    // Send notification if check-out is outside geofence
    if (evvResult && !evvResult.isWithinGeofence) {
      sendNotificationToRole(
        "EARLY_CHECK_OUT", // TODO: Add EVV_OUT_OF_GEOFENCE event type
        ["SUPERVISOR", "ADMIN"],
        user.companyId,
        {
          carerName,
          clientName,
          scheduledEndTime: shift.scheduledEnd.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
          actualCheckOutTime: checkOutTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
          minutesEarly: `EVV Alert: ${evvResult.distanceFromClient}m from client location`,
          shiftDate,
          shiftUrl,
        },
        { relatedEntityType: "Shift", relatedEntityId: shiftId }
      ).catch(console.error);
    }

    // Send SHIFT_COMPLETED notification to sponsor
    sendNotificationToSponsor(
      "SHIFT_COMPLETED",
      shift.clientId,
      {
        carerName,
        clientName,
        shiftDate,
        totalHours: actualHours.toFixed(1),
        checkInTime: shift.actualStart?.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) || "N/A",
        checkOutTime: checkOutTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      },
      { relatedEntityType: "Shift", relatedEntityId: shiftId }
    ).catch(console.error);

    // Send CHECK_OUT_CONFIRMATION to sponsor
    sendNotificationToSponsor(
      "CHECK_OUT_CONFIRMATION",
      shift.clientId,
      {
        carerName,
        clientName,
        checkOutTime: checkOutTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        shiftDate,
        totalHours: actualHours.toFixed(1),
      },
      { relatedEntityType: "Shift", relatedEntityId: shiftId }
    ).catch(console.error);

    // Send CHECK_OUT_CONFIRMATION to supervisors
    sendNotificationToRole(
      "CHECK_OUT_CONFIRMATION",
      ["SUPERVISOR"],
      user.companyId,
      {
        carerName,
        clientName,
        checkOutTime: checkOutTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        shiftDate,
        totalHours: actualHours.toFixed(1),
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
      message: "Checked out successfully - shift completed",
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
        id: updatedAttendance.id,
        date: updatedAttendance.date.toISOString(),
        checkInTime: updatedAttendance.checkInTime?.toISOString(),
        checkOutTime: updatedAttendance.checkOutTime?.toISOString(),
        hoursWorkedToday: Math.round(hoursWorkedToday * 100) / 100,
      },
      // EVV response data
      evvStatus: evvResult?.status ?? "LOCATION_UNAVAILABLE",
      evvIsWithinGeofence: evvResult?.isWithinGeofence ?? null,
      distanceFromClient: evvResult?.distanceFromClient ?? null,
      evvMessage: evvResult?.message ?? "Location not provided",
    });
  } catch (error) {
    console.error("Error checking out:", error);
    return NextResponse.json(
      { error: "Failed to check out" },
      { status: 500 }
    );
  }
}
