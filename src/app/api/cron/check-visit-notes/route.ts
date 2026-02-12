import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ShiftStatus } from "@prisma/client";
import { sendNotification } from "@/lib/notifications";

// This endpoint should be called hourly by a cron job
// It checks for completed shifts without visit notes and sends reminders

// Verify cron secret for security
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from an authorized source
    const authHeader = request.headers.get("authorization");
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = {
      shiftsChecked: 0,
      remindersSent: 0,
      errors: [] as string[],
    };

    const now = new Date();
    // Check shifts completed in the last 48 hours
    const cutoffTime = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    // Only send reminders for shifts completed at least 2 hours ago
    const minCompletionTime = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    // Get all active companies
    const companies = await prisma.company.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
    });

    for (const company of companies) {
      try {
        // Find completed shifts without visit notes where reminder hasn't been sent
        const shiftsWithoutNotes = await prisma.shift.findMany({
          where: {
            companyId: company.id,
            status: ShiftStatus.COMPLETED,
            visitNoteReminderSent: false,
            // Completed within the last 48 hours
            actualEnd: {
              gte: cutoffTime,
              lte: minCompletionTime, // At least 2 hours ago
            },
            // No visit notes exist for this shift
            visitNotes: {
              none: {},
            },
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
        });

        results.shiftsChecked += shiftsWithoutNotes.length;

        for (const shift of shiftsWithoutNotes) {
          try {
            const shiftDate = shift.scheduledStart.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            });
            const shiftTime = shift.scheduledStart.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            });

            // Send reminder notification to carer
            await sendNotification({
              eventType: "VISIT_NOTE_MISSING",
              recipientIds: [shift.carer.id],
              data: {
                clientName: `${shift.client.firstName} ${shift.client.lastName}`,
                shiftDate,
                shiftTime,
                shiftUrl: `${process.env.NEXT_PUBLIC_APP_URL || ""}/shifts/${shift.id}`,
              },
              relatedEntityType: "Shift",
              relatedEntityId: shift.id,
            });

            // Mark reminder as sent
            await prisma.shift.update({
              where: { id: shift.id },
              data: { visitNoteReminderSent: true },
            });

            results.remindersSent++;

            // Create audit log entry
            await prisma.auditLog.create({
              data: {
                companyId: company.id,
                userId: shift.carer.id,
                action: "VISIT_NOTE_REMINDER_SENT",
                entityType: "Shift",
                entityId: shift.id,
                changes: {
                  clientName: `${shift.client.firstName} ${shift.client.lastName}`,
                  shiftDate: shift.scheduledStart.toISOString(),
                  hoursAfterCompletion: Math.floor(
                    (now.getTime() - (shift.actualEnd?.getTime() || now.getTime())) / (1000 * 60 * 60)
                  ),
                },
              },
            });
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            results.errors.push(`Shift ${shift.id}: ${errorMessage}`);
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
    console.error("Error in check-visit-notes cron:", error);
    return NextResponse.json(
      {
        error: "Failed to check visit notes",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
