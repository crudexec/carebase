import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ShiftStatus } from "@prisma/client";
import { sendNotification } from "@/lib/notifications";

// This endpoint should be called every 15 minutes by a cron job
// It checks for upcoming shifts and sends reminders to carers

// Verify cron secret for security
const CRON_SECRET = process.env.CRON_SECRET;

// Reminder intervals in minutes
const REMINDER_24H_MINUTES = 1440; // 24 hours
const REMINDER_1H_MINUTES = 60; // 1 hour

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from an authorized source
    const authHeader = request.headers.get("authorization");
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = {
      shiftsChecked: 0,
      reminders24hSent: 0,
      reminders1hSent: 0,
      errors: [] as string[],
    };

    const now = new Date();

    // Get all active companies
    const companies = await prisma.company.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
    });

    for (const company of companies) {
      try {
        // Find shifts that need reminders
        // For 24h reminder: shifts starting between 23h45m and 24h15m from now
        // For 1h reminder: shifts starting between 45min and 1h15m from now
        const shifts = await prisma.shift.findMany({
          where: {
            companyId: company.id,
            status: ShiftStatus.SCHEDULED,
            scheduledStart: {
              // Look for shifts starting in the next 25 hours (covers both reminder windows)
              gte: now,
              lte: new Date(now.getTime() + 25 * 60 * 60 * 1000),
            },
          },
          include: {
            carer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                address: true,
              },
            },
          },
        });

        results.shiftsChecked += shifts.length;

        for (const shift of shifts) {
          const minutesUntilShift = Math.floor(
            (shift.scheduledStart.getTime() - now.getTime()) / (1000 * 60)
          );
          const sentReminders = shift.remindersSentMinutes || [];

          // Check for 24h reminder (between 23h45m and 24h15m before shift)
          if (
            minutesUntilShift >= 1425 && // 23h45m
            minutesUntilShift <= 1455 && // 24h15m
            !sentReminders.includes(REMINDER_24H_MINUTES)
          ) {
            try {
              await send24hReminder(shift, company.id);
              await markReminderSent(shift.id, sentReminders, REMINDER_24H_MINUTES);
              results.reminders24hSent++;
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : "Unknown error";
              results.errors.push(`24h reminder for shift ${shift.id}: ${errorMessage}`);
            }
          }

          // Check for 1h reminder (between 45min and 1h15m before shift)
          if (
            minutesUntilShift >= 45 &&
            minutesUntilShift <= 75 &&
            !sentReminders.includes(REMINDER_1H_MINUTES)
          ) {
            try {
              await send1hReminder(shift, company.id);
              await markReminderSent(shift.id, sentReminders, REMINDER_1H_MINUTES);
              results.reminders1hSent++;
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : "Unknown error";
              results.errors.push(`1h reminder for shift ${shift.id}: ${errorMessage}`);
            }
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        results.errors.push(`Company ${company.name}: ${errorMessage}`);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error("Error in shift reminders cron:", error);
    return NextResponse.json(
      {
        error: "Failed to process shift reminders",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Helper types
interface ShiftWithRelations {
  id: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  carer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  client: {
    id: string;
    firstName: string;
    lastName: string;
    address: string | null;
  };
}

async function send24hReminder(shift: ShiftWithRelations, companyId: string) {
  const shiftDate = shift.scheduledStart.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const shiftTime = shift.scheduledStart.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  await sendNotification({
    eventType: "SHIFT_REMINDER_24H",
    recipientIds: [shift.carer.id],
    data: {
      clientName: `${shift.client.firstName} ${shift.client.lastName}`,
      shiftDate,
      shiftTime,
      address: shift.client.address || "Address not specified",
      shiftUrl: `${process.env.NEXT_PUBLIC_APP_URL || ""}/shifts/${shift.id}`,
    },
    relatedEntityType: "Shift",
    relatedEntityId: shift.id,
  });

  // Create audit log entry
  await prisma.auditLog.create({
    data: {
      companyId,
      userId: shift.carer.id,
      action: "SHIFT_REMINDER_24H_SENT",
      entityType: "Shift",
      entityId: shift.id,
      changes: {
        scheduledStart: shift.scheduledStart.toISOString(),
        clientName: `${shift.client.firstName} ${shift.client.lastName}`,
      },
    },
  });
}

async function send1hReminder(shift: ShiftWithRelations, companyId: string) {
  const shiftTime = shift.scheduledStart.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  await sendNotification({
    eventType: "SHIFT_REMINDER_1H",
    recipientIds: [shift.carer.id],
    data: {
      clientName: `${shift.client.firstName} ${shift.client.lastName}`,
      shiftTime,
      address: shift.client.address || "Address not specified",
    },
    relatedEntityType: "Shift",
    relatedEntityId: shift.id,
  });

  // Create audit log entry
  await prisma.auditLog.create({
    data: {
      companyId,
      userId: shift.carer.id,
      action: "SHIFT_REMINDER_1H_SENT",
      entityType: "Shift",
      entityId: shift.id,
      changes: {
        scheduledStart: shift.scheduledStart.toISOString(),
        clientName: `${shift.client.firstName} ${shift.client.lastName}`,
      },
    },
  });
}

async function markReminderSent(
  shiftId: string,
  existingReminders: number[],
  reminderMinutes: number
) {
  await prisma.shift.update({
    where: { id: shiftId },
    data: {
      remindersSentMinutes: [...existingReminders, reminderMinutes],
    },
  });
}
