import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canManageSchedule } from "@/lib/scheduling";
import { z } from "zod";
import {
  generateBulkDates,
  combineDateTime,
  calculateHoursBetween,
  calculateBulkUnits,
  type UnitType,
} from "@/lib/bulk-scheduling";

const bulkCreateSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  carerId: z.string().min(1, "Caregiver is required"),
  startDate: z.string().min(1, "Start date is required"),
  numberOfWeeks: z.number().min(1).max(12),
  selectedDays: z.array(z.number().min(0).max(6)).min(1, "Select at least one day"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  skipConflicts: z.boolean().optional().default(false),
  timezoneOffset: z.number().optional(), // Client's timezone offset in minutes (from getTimezoneOffset())
});

// POST /api/scheduling/bulk - Create multiple shifts at once
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions
    if (!canManageSchedule(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = bulkCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const {
      clientId,
      carerId,
      startDate,
      numberOfWeeks,
      selectedDays,
      startTime,
      endTime,
      skipConflicts,
      timezoneOffset,
    } = validation.data;

    // Validate times
    const hoursPerShift = calculateHoursBetween(startTime, endTime);
    if (hoursPerShift <= 0) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    // Validate start date is not in the past (using UTC to be timezone-agnostic)
    const [year, month, day] = startDate.split("-").map(Number);
    const startDateObj = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    if (startDateObj < todayUTC) {
      return NextResponse.json(
        { error: "Start date cannot be in the past" },
        { status: 400 }
      );
    }

    // Generate all dates for the bulk schedule (pass timezone offset for correct day-of-week calculation)
    const dates = generateBulkDates(startDate, numberOfWeeks, selectedDays, timezoneOffset);

    if (dates.length === 0) {
      return NextResponse.json(
        { error: "No dates match the selected criteria" },
        { status: 400 }
      );
    }

    // Get client's active authorization for unit calculation
    const authorization = await prisma.authorization.findFirst({
      where: {
        companyId: session.user.companyId,
        clientId,
        status: "ACTIVE",
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
      orderBy: { endDate: "asc" },
    });

    // Calculate units that will be consumed
    let totalUnitsToConsume = 0;
    if (authorization) {
      totalUnitsToConsume = calculateBulkUnits(
        hoursPerShift,
        dates.length,
        authorization.unitType as UnitType
      );
    }

    // Create shifts in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const createdShifts: {
        id: string;
        scheduledStart: Date;
        scheduledEnd: Date;
      }[] = [];
      const skippedDates: { date: string; reason: string }[] = [];
      const conflicts: { date: string; existingShiftId: string }[] = [];

      for (const date of dates) {
        const shiftStart = combineDateTime(date, startTime, timezoneOffset);
        const shiftEnd = combineDateTime(date, endTime, timezoneOffset);

        // Check for conflicting shifts
        const conflictingShift = await tx.shift.findFirst({
          where: {
            companyId: session.user.companyId,
            carerId,
            status: { in: ["SCHEDULED", "IN_PROGRESS"] },
            OR: [
              {
                scheduledStart: { lte: shiftStart },
                scheduledEnd: { gt: shiftStart },
              },
              {
                scheduledStart: { lt: shiftEnd },
                scheduledEnd: { gte: shiftEnd },
              },
              {
                scheduledStart: { gte: shiftStart },
                scheduledEnd: { lte: shiftEnd },
              },
            ],
          },
          select: { id: true },
        });

        if (conflictingShift) {
          conflicts.push({
            date: date.toISOString(),
            existingShiftId: conflictingShift.id,
          });

          if (skipConflicts) {
            skippedDates.push({
              date: date.toISOString(),
              reason: "Carer has a conflicting shift",
            });
            continue;
          } else {
            throw new Error(
              `Carer has a conflicting shift on ${date.toLocaleDateString()}`
            );
          }
        }

        // Create the shift
        const shift = await tx.shift.create({
          data: {
            companyId: session.user.companyId,
            carerId,
            clientId,
            scheduledStart: shiftStart,
            scheduledEnd: shiftEnd,
            status: "SCHEDULED",
          },
          select: {
            id: true,
            scheduledStart: true,
            scheduledEnd: true,
          },
        });

        createdShifts.push(shift);
      }

      // Create single audit log for bulk operation
      if (createdShifts.length > 0) {
        await tx.auditLog.create({
          data: {
            companyId: session.user.companyId,
            userId: session.user.id,
            action: "BULK_SHIFTS_CREATED",
            entityType: "Shift",
            entityId: createdShifts[0].id,
            changes: {
              count: createdShifts.length,
              skipped: skippedDates.length,
              clientId,
              carerId,
              startDate,
              numberOfWeeks,
              selectedDays,
              startTime,
              endTime,
              hoursPerShift,
              totalUnitsToConsume,
              shiftIds: createdShifts.map((s) => s.id),
            },
          },
        });
      }

      return {
        createdShifts,
        skippedDates,
        conflicts,
      };
    });

    return NextResponse.json(
      {
        success: true,
        created: result.createdShifts.length,
        skipped: result.skippedDates.length,
        shifts: result.createdShifts.map((s) => ({
          id: s.id,
          scheduledStart: s.scheduledStart.toISOString(),
          scheduledEnd: s.scheduledEnd.toISOString(),
        })),
        skippedDates: result.skippedDates,
        conflicts: result.conflicts,
        totalHours: hoursPerShift * result.createdShifts.length,
        totalUnitsConsumed: authorization
          ? calculateBulkUnits(
              hoursPerShift,
              result.createdShifts.length,
              authorization.unitType as UnitType
            )
          : null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating bulk shifts:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create bulk shifts",
      },
      { status: 500 }
    );
  }
}

// GET /api/scheduling/bulk/preview - Preview bulk shift creation
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!canManageSchedule(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const carerId = searchParams.get("carerId");
    const startDate = searchParams.get("startDate");
    const numberOfWeeks = parseInt(searchParams.get("numberOfWeeks") || "1", 10);
    const selectedDays = searchParams
      .get("selectedDays")
      ?.split(",")
      .map(Number) || [];
    const startTime = searchParams.get("startTime") || "09:00";
    const endTime = searchParams.get("endTime") || "17:00";
    const timezoneOffset = searchParams.get("timezoneOffset")
      ? parseInt(searchParams.get("timezoneOffset")!, 10)
      : undefined;

    if (!clientId || !carerId || !startDate || selectedDays.length === 0) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Calculate hours
    const hoursPerShift = calculateHoursBetween(startTime, endTime);
    if (hoursPerShift <= 0) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    // Generate dates (pass timezone offset for correct day-of-week calculation)
    const dates = generateBulkDates(startDate, numberOfWeeks, selectedDays, timezoneOffset);

    // Check for conflicts
    const conflicts: {
      date: string;
      existingShiftId: string;
      existingStart: string;
      existingEnd: string;
    }[] = [];

    for (const date of dates) {
      const shiftStart = combineDateTime(date, startTime, timezoneOffset);
      const shiftEnd = combineDateTime(date, endTime, timezoneOffset);

      const conflictingShift = await prisma.shift.findFirst({
        where: {
          companyId: session.user.companyId,
          carerId,
          status: { in: ["SCHEDULED", "IN_PROGRESS"] },
          OR: [
            {
              scheduledStart: { lte: shiftStart },
              scheduledEnd: { gt: shiftStart },
            },
            {
              scheduledStart: { lt: shiftEnd },
              scheduledEnd: { gte: shiftEnd },
            },
            {
              scheduledStart: { gte: shiftStart },
              scheduledEnd: { lte: shiftEnd },
            },
          ],
        },
        select: {
          id: true,
          scheduledStart: true,
          scheduledEnd: true,
        },
      });

      if (conflictingShift) {
        conflicts.push({
          date: date.toISOString(),
          existingShiftId: conflictingShift.id,
          existingStart: conflictingShift.scheduledStart.toISOString(),
          existingEnd: conflictingShift.scheduledEnd.toISOString(),
        });
      }
    }

    // Get client's authorization
    const authorization = await prisma.authorization.findFirst({
      where: {
        companyId: session.user.companyId,
        clientId,
        status: "ACTIVE",
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
      orderBy: { endDate: "asc" },
      select: {
        id: true,
        authorizedUnits: true,
        usedUnits: true,
        remainingUnits: true,
        unitType: true,
        endDate: true,
      },
    });

    // Calculate units
    const shiftsToCreate = dates.length - conflicts.length;
    let unitsToConsume = 0;
    let hasInsufficientUnits = false;
    let unitsAfterCreation = 0;

    if (authorization) {
      unitsToConsume = calculateBulkUnits(
        hoursPerShift,
        shiftsToCreate,
        authorization.unitType as UnitType
      );
      const remainingUnits = Number(authorization.remainingUnits) || 0;
      unitsAfterCreation = remainingUnits - unitsToConsume;
      hasInsufficientUnits = unitsAfterCreation < 0;
    }

    return NextResponse.json({
      valid: conflicts.length === 0,
      shifts: dates.map((date) => ({
        date: date.toISOString(),
        scheduledStart: combineDateTime(date, startTime, timezoneOffset).toISOString(),
        scheduledEnd: combineDateTime(date, endTime, timezoneOffset).toISOString(),
        hasConflict: conflicts.some(
          (c) => new Date(c.date).toDateString() === date.toDateString()
        ),
      })),
      totalShifts: dates.length,
      shiftsToCreate,
      totalHours: hoursPerShift * shiftsToCreate,
      hoursPerShift,
      unitsToConsume,
      authorization: authorization
        ? {
            id: authorization.id,
            authorizedUnits: Number(authorization.authorizedUnits),
            usedUnits: Number(authorization.usedUnits),
            remainingUnits: Number(authorization.remainingUnits),
            unitType: authorization.unitType,
            endDate: authorization.endDate.toISOString(),
            hasInsufficientUnits,
            unitsAfterCreation,
          }
        : null,
      conflicts,
    });
  } catch (error) {
    console.error("Error previewing bulk shifts:", error);
    return NextResponse.json(
      { error: "Failed to preview bulk shifts" },
      { status: 500 }
    );
  }
}

// DELETE /api/scheduling/bulk - Delete all shifts (with optional filters)
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!canManageSchedule(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // Optional: only delete shifts with this status
    const carerId = searchParams.get("carerId"); // Optional: only delete shifts for this carer
    const clientId = searchParams.get("clientId"); // Optional: only delete shifts for this client

    // Build the where clause
    const where: Record<string, unknown> = {
      companyId: session.user.companyId,
    };

    if (status) {
      where.status = status;
    } else {
      // By default, only delete SCHEDULED shifts (not completed/in-progress)
      where.status = "SCHEDULED";
    }

    if (carerId) {
      where.carerId = carerId;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    // Count shifts to be deleted
    const countToDelete = await prisma.shift.count({ where });

    if (countToDelete === 0) {
      return NextResponse.json({
        success: true,
        deleted: 0,
        message: "No shifts found matching the criteria",
      });
    }

    // Delete the shifts
    const result = await prisma.shift.deleteMany({ where });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "BULK_SHIFTS_DELETED",
        entityType: "Shift",
        entityId: "bulk",
        changes: {
          deletedCount: result.count,
          filters: {
            status: status || "SCHEDULED",
            carerId: carerId || "all",
            clientId: clientId || "all",
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      deleted: result.count,
      message: `Successfully deleted ${result.count} shift${result.count !== 1 ? "s" : ""}`,
    });
  } catch (error) {
    console.error("Error deleting bulk shifts:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to delete shifts",
      },
      { status: 500 }
    );
  }
}
