import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { medPassQuerySchema } from "@/lib/emar/validation";
import {
  MedPassDose,
  MedPassResponse,
  MED_PASS_TIME_SLOTS,
} from "@/lib/emar/types";
import { MedPassStatus } from "@prisma/client";

// Helper to parse time string (HH:mm) to hour number
function parseTimeToHour(timeStr: string): number {
  const [hours] = timeStr.split(":").map(Number);
  return hours || 0;
}

// Helper to get time slot for a given hour
function getTimeSlotForHour(hour: number): (typeof MED_PASS_TIME_SLOTS)[number] {
  // Handle night slot wrapping (22-6)
  if (hour >= 22 || hour < 6) {
    return MED_PASS_TIME_SLOTS[3]; // Night
  }
  if (hour >= 6 && hour < 12) {
    return MED_PASS_TIME_SLOTS[0]; // Morning
  }
  if (hour >= 12 && hour < 18) {
    return MED_PASS_TIME_SLOTS[1]; // Afternoon
  }
  return MED_PASS_TIME_SLOTS[2]; // Evening
}

// Helper to check if a dose is overdue
function isDoseOverdue(scheduledTime: Date, windowEnd: Date): boolean {
  return new Date() > windowEnd;
}

// Helper to check if a dose is within its administration window
function isDoseInWindow(scheduledTime: Date, windowStart: Date, windowEnd: Date): boolean {
  const now = new Date();
  return now >= windowStart && now <= windowEnd;
}

/**
 * GET /api/med-pass
 * Get medication pass for the current shift/date
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId } = session.user;

    if (!companyId) {
      return NextResponse.json(
        { error: "User not associated with a company" },
        { status: 400 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = medPassQuerySchema.parse({
      clientId: searchParams.get("clientId") || undefined,
      shiftId: searchParams.get("shiftId") || undefined,
      date: searchParams.get("date") || new Date(),
    });

    // Get target date
    const targetDate = query.date ? new Date(query.date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Build medication filter
    const medicationWhere = {
      companyId,
      status: "ACTIVE" as const,
      startDate: { lte: endOfDay },
      OR: [{ endDate: null }, { endDate: { gte: startOfDay } }],
      ...(query.clientId && { clientId: query.clientId }),
    };

    // Get all active medications
    const medications = await prisma.medication.findMany({
      where: medicationWhere,
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true },
        },
        administrations: {
          where: {
            scheduledTime: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          select: {
            id: true,
            scheduledTime: true,
            administeredAt: true,
            result: true,
          },
        },
      },
    });

    // Generate med pass doses for each medication based on scheduled times
    const allDoses: MedPassDose[] = [];

    for (const medication of medications) {
      const scheduledTimes = medication.scheduledTimes as string[];

      // For PRN medications, don't generate scheduled doses
      if (medication.frequency === "AS_NEEDED_PRN") {
        continue;
      }

      // For each scheduled time, create a dose entry
      for (const timeStr of scheduledTimes) {
        const hour = parseTimeToHour(timeStr);
        const [hourPart, minutePart] = timeStr.split(":").map(Number);

        // Create scheduled time for this dose
        const scheduledTime = new Date(targetDate);
        scheduledTime.setHours(hourPart || 0, minutePart || 0, 0, 0);

        // Create administration window (30 min early to 60 min late)
        const windowStart = new Date(scheduledTime);
        windowStart.setMinutes(windowStart.getMinutes() - 30);
        const windowEnd = new Date(scheduledTime);
        windowEnd.setMinutes(windowEnd.getMinutes() + 60);

        // Check if there's an administration for this time
        const existingAdmin = medication.administrations.find((admin) => {
          const adminTime = new Date(admin.scheduledTime);
          return (
            adminTime.getHours() === hourPart &&
            adminTime.getMinutes() === (minutePart || 0)
          );
        });

        // Determine status
        let status: MedPassStatus = "PENDING";
        if (existingAdmin) {
          status = "COMPLETED";
        } else if (isDoseOverdue(scheduledTime, windowEnd)) {
          status = "MISSED";
        } else if (isDoseInWindow(scheduledTime, windowStart, windowEnd)) {
          status = "PENDING";
        }

        const dose: MedPassDose = {
          id: `${medication.id}-${timeStr}`,
          scheduledTime,
          windowStart,
          windowEnd,
          status,
          medication: {
            id: medication.id,
            name: medication.name,
            strength: medication.strength,
            form: medication.form,
            route: medication.route,
            doseAmount: medication.doseAmount,
            controlledSchedule: medication.controlledSchedule,
            requiresWitness: medication.requiresWitness,
            specialInstructions: medication.specialInstructions,
          },
          client: {
            id: medication.client.id,
            firstName: medication.client.firstName,
            lastName: medication.client.lastName,
          },
          administration: existingAdmin
            ? {
                id: existingAdmin.id,
                result: existingAdmin.result,
                administeredAt: existingAdmin.administeredAt,
              }
            : null,
        };

        allDoses.push(dose);
      }
    }

    // Group doses by time slot
    const timeSlotMap = new Map<
      string,
      { label: string; startHour: number; endHour: number; doses: MedPassDose[] }
    >();

    for (const slot of MED_PASS_TIME_SLOTS) {
      timeSlotMap.set(slot.label, {
        label: slot.label,
        startHour: slot.startHour,
        endHour: slot.endHour,
        doses: [],
      });
    }

    for (const dose of allDoses) {
      const hour = dose.scheduledTime.getHours();
      const slot = getTimeSlotForHour(hour);
      const timeSlotData = timeSlotMap.get(slot.label);
      if (timeSlotData) {
        timeSlotData.doses.push(dose);
      }
    }

    // Sort doses within each time slot
    for (const slotData of timeSlotMap.values()) {
      slotData.doses.sort((a, b) => {
        // Sort by scheduled time, then by client name
        const timeDiff = a.scheduledTime.getTime() - b.scheduledTime.getTime();
        if (timeDiff !== 0) return timeDiff;
        return `${a.client.lastName}${a.client.firstName}`.localeCompare(
          `${b.client.lastName}${b.client.firstName}`
        );
      });
    }

    // Calculate stats
    const stats = {
      total: allDoses.length,
      pending: allDoses.filter((d) => d.status === "PENDING").length,
      completed: allDoses.filter((d) => d.status === "COMPLETED").length,
      missed: allDoses.filter((d) => d.status === "MISSED").length,
    };

    const response: MedPassResponse = {
      date: targetDate.toISOString().split("T")[0],
      timeSlots: Array.from(timeSlotMap.values()),
      stats,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching med pass:", error);
    return NextResponse.json(
      { error: "Failed to fetch med pass" },
      { status: 500 }
    );
  }
}
