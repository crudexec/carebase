import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  MedPassDose,
  MED_PASS_TIME_SLOTS,
} from "@/lib/emar/types";
import { MedPassStatus } from "@prisma/client";

// Helper to parse time string (HH:mm) to hour number
function _parseTimeToHour(timeStr: string): number {
  const [hours] = timeStr.split(":").map(Number);
  return hours || 0;
}

// Helper to get time slot for a given hour
function getTimeSlotForHour(hour: number): (typeof MED_PASS_TIME_SLOTS)[number] {
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

interface RouteContext {
  params: Promise<{ clientId: string }>;
}

/**
 * GET /api/med-pass/client/[clientId]
 * Get medication pass for a specific client
 */
export async function GET(request: NextRequest, context: RouteContext) {
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

    const params = await context.params;
    const { clientId } = params;

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get("date");
    const targetDate = dateParam ? new Date(dateParam) : new Date();

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Verify client belongs to company
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        companyId: companyId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Get all active medications for this client
    const medications = await prisma.medication.findMany({
      where: {
        clientId,
        companyId: companyId,
        status: "ACTIVE",
        startDate: { lte: endOfDay },
        OR: [{ endDate: null }, { endDate: { gte: startOfDay } }],
      },
      include: {
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

    // Generate med pass doses
    const allDoses: MedPassDose[] = [];

    for (const medication of medications) {
      const scheduledTimes = medication.scheduledTimes as string[];

      // Skip PRN medications
      if (medication.frequency === "AS_NEEDED_PRN") {
        continue;
      }

      for (const timeStr of scheduledTimes) {
        const [hourPart, minutePart] = timeStr.split(":").map(Number);

        const scheduledTime = new Date(targetDate);
        scheduledTime.setHours(hourPart || 0, minutePart || 0, 0, 0);

        const windowStart = new Date(scheduledTime);
        windowStart.setMinutes(windowStart.getMinutes() - 30);
        const windowEnd = new Date(scheduledTime);
        windowEnd.setMinutes(windowEnd.getMinutes() + 60);

        // Check for existing administration
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
        } else if (new Date() > windowEnd) {
          status = "MISSED";
        }

        allDoses.push({
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
            id: client.id,
            firstName: client.firstName,
            lastName: client.lastName,
          },
          administration: existingAdmin
            ? {
                id: existingAdmin.id,
                result: existingAdmin.result,
                administeredAt: existingAdmin.administeredAt,
              }
            : null,
        });
      }
    }

    // Group by time slot
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

    // Sort doses within each slot by time
    for (const slotData of timeSlotMap.values()) {
      slotData.doses.sort(
        (a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime()
      );
    }

    // Get PRN medications for this client
    const prnMedications = await prisma.medication.findMany({
      where: {
        clientId,
        companyId: companyId,
        status: "ACTIVE",
        frequency: "AS_NEEDED_PRN",
        startDate: { lte: endOfDay },
        OR: [{ endDate: null }, { endDate: { gte: startOfDay } }],
      },
      select: {
        id: true,
        name: true,
        strength: true,
        form: true,
        route: true,
        doseAmount: true,
        prnReason: true,
        maxDailyDoses: true,
        controlledSchedule: true,
        requiresWitness: true,
        specialInstructions: true,
        _count: {
          select: {
            administrations: {
              where: {
                scheduledTime: {
                  gte: startOfDay,
                  lte: endOfDay,
                },
              },
            },
          },
        },
      },
    });

    // Stats
    const stats = {
      total: allDoses.length,
      pending: allDoses.filter((d) => d.status === "PENDING").length,
      completed: allDoses.filter((d) => d.status === "COMPLETED").length,
      missed: allDoses.filter((d) => d.status === "MISSED").length,
    };

    return NextResponse.json({
      client: {
        id: client.id,
        name: `${client.firstName} ${client.lastName}`,
      },
      date: targetDate.toISOString().split("T")[0],
      timeSlots: Array.from(timeSlotMap.values()),
      prnMedications: prnMedications.map((med) => ({
        ...med,
        dosesToday: med._count.administrations,
      })),
      stats,
    });
  } catch (error) {
    console.error("Error fetching client med pass:", error);
    return NextResponse.json(
      { error: "Failed to fetch client med pass" },
      { status: 500 }
    );
  }
}
