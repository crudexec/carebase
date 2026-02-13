import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { parseEVVLocationData } from "@/lib/evv";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission - need scheduling or user management access
    if (
      !hasPermission(session.user.role, PERMISSIONS.SCHEDULING_VIEW) &&
      !hasPermission(session.user.role, PERMISSIONS.USER_MANAGE)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const companyId = session.user.companyId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get active shifts (IN_PROGRESS) with EVV data
    const activeShifts = await prisma.shift.findMany({
      where: {
        companyId,
        status: "IN_PROGRESS",
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            address: true,
            latitude: true,
            longitude: true,
            geofenceRadius: true,
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
      orderBy: {
        actualStart: "desc",
      },
    });

    // Get today's completed shifts with EVV data for metrics
    const todayCompletedShifts = await prisma.shift.findMany({
      where: {
        companyId,
        status: "COMPLETED",
        actualEnd: {
          gte: today,
          lt: tomorrow,
        },
      },
      select: {
        id: true,
        checkInLocation: true,
        checkOutLocation: true,
      },
    });

    // Calculate EVV metrics
    let compliantCheckIns = 0;
    let outOfRangeCheckIns = 0;
    let missingLocationCheckIns = 0;

    // Process active shifts
    const activeShiftsWithEVV = activeShifts.map((shift) => {
      const checkInData = parseEVVLocationData(shift.checkInLocation);

      if (checkInData) {
        if (checkInData.isWithinGeofence) {
          compliantCheckIns++;
        } else {
          outOfRangeCheckIns++;
        }
      } else if (shift.actualStart) {
        missingLocationCheckIns++;
      }

      return {
        id: shift.id,
        client: {
          id: shift.client.id,
          name: `${shift.client.firstName} ${shift.client.lastName}`,
          address: shift.client.address,
          latitude: shift.client.latitude
            ? Number(shift.client.latitude)
            : null,
          longitude: shift.client.longitude
            ? Number(shift.client.longitude)
            : null,
          geofenceRadius: shift.client.geofenceRadius,
        },
        carer: {
          id: shift.carer?.id,
          name: shift.carer
            ? `${shift.carer.firstName} ${shift.carer.lastName}`
            : "Unassigned",
        },
        scheduledStart: shift.scheduledStart.toISOString(),
        scheduledEnd: shift.scheduledEnd.toISOString(),
        actualStart: shift.actualStart?.toISOString() || null,
        checkInLocation: checkInData,
        evvStatus: checkInData
          ? checkInData.isWithinGeofence
            ? "COMPLIANT"
            : "OUT_OF_RANGE"
          : "LOCATION_UNAVAILABLE",
      };
    });

    // Process completed shifts for metrics
    todayCompletedShifts.forEach((shift) => {
      const checkInData = parseEVVLocationData(shift.checkInLocation);
      const checkOutData = parseEVVLocationData(shift.checkOutLocation);

      if (checkInData) {
        if (checkInData.isWithinGeofence) {
          compliantCheckIns++;
        } else {
          outOfRangeCheckIns++;
        }
      } else {
        missingLocationCheckIns++;
      }

      if (checkOutData) {
        if (checkOutData.isWithinGeofence) {
          compliantCheckIns++;
        } else {
          outOfRangeCheckIns++;
        }
      }
    });

    const totalChecks =
      compliantCheckIns + outOfRangeCheckIns + missingLocationCheckIns;
    const complianceRate =
      totalChecks > 0
        ? Math.round((compliantCheckIns / totalChecks) * 100)
        : 100;

    // Get recent out-of-range alerts (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const recentShiftsWithAlerts = await prisma.shift.findMany({
      where: {
        companyId,
        OR: [
          { status: "IN_PROGRESS" },
          {
            status: "COMPLETED",
            actualEnd: { gte: yesterday },
          },
        ],
      },
      include: {
        client: {
          select: {
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
      orderBy: {
        actualStart: "desc",
      },
      take: 100,
    });

    // Filter to only those with location data and build alerts
    const alerts: Array<{
      id: string;
      shiftId: string;
      type: "CHECK_IN_OUT_OF_RANGE" | "CHECK_OUT_OUT_OF_RANGE";
      carerName: string;
      clientName: string;
      distance: number;
      timestamp: string;
    }> = [];

    for (const shift of recentShiftsWithAlerts) {
      const checkInData = parseEVVLocationData(shift.checkInLocation);
      const checkOutData = parseEVVLocationData(shift.checkOutLocation);

      if (checkInData && !checkInData.isWithinGeofence) {
        alerts.push({
          id: `${shift.id}-checkin`,
          shiftId: shift.id,
          type: "CHECK_IN_OUT_OF_RANGE",
          carerName: shift.carer
            ? `${shift.carer.firstName} ${shift.carer.lastName}`
            : "Unknown",
          clientName: `${shift.client.firstName} ${shift.client.lastName}`,
          distance: checkInData.distanceFromClient,
          timestamp: checkInData.timestamp,
        });
      }

      if (checkOutData && !checkOutData.isWithinGeofence) {
        alerts.push({
          id: `${shift.id}-checkout`,
          shiftId: shift.id,
          type: "CHECK_OUT_OUT_OF_RANGE",
          carerName: shift.carer
            ? `${shift.carer.firstName} ${shift.carer.lastName}`
            : "Unknown",
          clientName: `${shift.client.firstName} ${shift.client.lastName}`,
          distance: checkOutData.distanceFromClient,
          timestamp: checkOutData.timestamp,
        });
      }

      if (alerts.length >= 20) break;
    }

    return NextResponse.json({
      activeShifts: activeShiftsWithEVV,
      metrics: {
        totalActive: activeShifts.length,
        compliantCount: compliantCheckIns,
        outOfRangeCount: outOfRangeCheckIns,
        missingLocationCount: missingLocationCheckIns,
        complianceRate,
        todayCompletedCount: todayCompletedShifts.length,
      },
      alerts,
    });
  } catch (error) {
    console.error("Error fetching EVV dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch EVV dashboard data" },
      { status: 500 }
    );
  }
}
