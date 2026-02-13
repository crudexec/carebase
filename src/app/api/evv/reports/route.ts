import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { parseEVVLocationData, formatDistance } from "@/lib/evv";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission - need scheduling view access
    if (!hasPermission(session.user.role, PERMISSIONS.SCHEDULING_VIEW)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const companyId = session.user.companyId;
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const carerId = searchParams.get("carerId");
    const clientId = searchParams.get("clientId");
    const complianceStatus = searchParams.get("complianceStatus"); // all, compliant, out_of_range, missing
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build date filter
    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    } else {
      // Default to last 7 days
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter.gte = weekAgo;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.lte = end;
    }

    // Build where clause
    interface ShiftWhere {
      companyId: string;
      status: "COMPLETED";
      actualEnd: { gte?: Date; lte?: Date };
      carerId?: string;
      clientId?: string;
    }

    const where: ShiftWhere = {
      companyId,
      status: "COMPLETED",
      actualEnd: dateFilter,
    };

    if (carerId) {
      where.carerId = carerId;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    // Get total count
    const totalCount = await prisma.shift.count({ where });

    // Get shifts with EVV data
    const shifts = await prisma.shift.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            address: true,
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
        actualEnd: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Process shifts and filter by compliance status if needed
    let processedShifts = shifts.map((shift) => {
      const checkInData = parseEVVLocationData(shift.checkInLocation);
      const checkOutData = parseEVVLocationData(shift.checkOutLocation);

      // Determine check-in status
      let checkInStatus: "COMPLIANT" | "OUT_OF_RANGE" | "MISSING" = "MISSING";
      if (checkInData) {
        checkInStatus = checkInData.isWithinGeofence
          ? "COMPLIANT"
          : "OUT_OF_RANGE";
      }

      // Determine check-out status
      let checkOutStatus: "COMPLIANT" | "OUT_OF_RANGE" | "MISSING" = "MISSING";
      if (checkOutData) {
        checkOutStatus = checkOutData.isWithinGeofence
          ? "COMPLIANT"
          : "OUT_OF_RANGE";
      }

      // Calculate hours worked
      const hoursWorked =
        shift.actualStart && shift.actualEnd
          ? (shift.actualEnd.getTime() - shift.actualStart.getTime()) /
            (1000 * 60 * 60)
          : 0;

      return {
        id: shift.id,
        date: shift.actualStart?.toISOString().split("T")[0] || "",
        client: {
          id: shift.client.id,
          name: `${shift.client.firstName} ${shift.client.lastName}`,
          address: shift.client.address,
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
        actualEnd: shift.actualEnd?.toISOString() || null,
        hoursWorked: Math.round(hoursWorked * 100) / 100,
        checkIn: {
          status: checkInStatus,
          time: checkInData?.timestamp || shift.actualStart?.toISOString(),
          distance: checkInData?.distanceFromClient || null,
          distanceFormatted: checkInData
            ? formatDistance(checkInData.distanceFromClient)
            : null,
          accuracy: checkInData?.accuracy || null,
          source: checkInData?.source || null,
        },
        checkOut: {
          status: checkOutStatus,
          time: checkOutData?.timestamp || shift.actualEnd?.toISOString(),
          distance: checkOutData?.distanceFromClient || null,
          distanceFormatted: checkOutData
            ? formatDistance(checkOutData.distanceFromClient)
            : null,
          accuracy: checkOutData?.accuracy || null,
          source: checkOutData?.source || null,
        },
        overallStatus:
          checkInStatus === "COMPLIANT" && checkOutStatus === "COMPLIANT"
            ? "FULLY_COMPLIANT"
            : checkInStatus === "COMPLIANT" || checkOutStatus === "COMPLIANT"
            ? "PARTIALLY_COMPLIANT"
            : checkInStatus === "MISSING" && checkOutStatus === "MISSING"
            ? "NO_DATA"
            : "NON_COMPLIANT",
      };
    });

    // Filter by compliance status if specified
    if (complianceStatus && complianceStatus !== "all") {
      processedShifts = processedShifts.filter((shift) => {
        switch (complianceStatus) {
          case "compliant":
            return shift.overallStatus === "FULLY_COMPLIANT";
          case "out_of_range":
            return (
              shift.checkIn.status === "OUT_OF_RANGE" ||
              shift.checkOut.status === "OUT_OF_RANGE"
            );
          case "missing":
            return shift.overallStatus === "NO_DATA";
          default:
            return true;
        }
      });
    }

    // Calculate summary metrics
    const summary = {
      totalShifts: totalCount,
      fullyCompliant: processedShifts.filter(
        (s) => s.overallStatus === "FULLY_COMPLIANT"
      ).length,
      partiallyCompliant: processedShifts.filter(
        (s) => s.overallStatus === "PARTIALLY_COMPLIANT"
      ).length,
      nonCompliant: processedShifts.filter(
        (s) => s.overallStatus === "NON_COMPLIANT"
      ).length,
      noData: processedShifts.filter((s) => s.overallStatus === "NO_DATA")
        .length,
      complianceRate:
        processedShifts.length > 0
          ? Math.round(
              ((processedShifts.filter(
                (s) =>
                  s.overallStatus === "FULLY_COMPLIANT" ||
                  s.overallStatus === "PARTIALLY_COMPLIANT"
              ).length /
                processedShifts.length) *
                100)
            )
          : 0,
    };

    return NextResponse.json({
      shifts: processedShifts,
      summary,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching EVV reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch EVV reports" },
      { status: 500 }
    );
  }
}
