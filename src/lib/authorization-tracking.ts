import { prisma } from "@/lib/db";

interface DeductUnitsParams {
  companyId: string;
  clientId: string;
  hoursWorked: number;
  shiftId: string;
  userId: string;
}

interface DeductUnitsResult {
  success: boolean;
  authorizationId?: string;
  unitsDeducted?: number;
  remainingUnits?: number;
  error?: string;
  noAuthorizationFound?: boolean;
}

/**
 * Deduct units from a client's active authorization when a shift is completed.
 *
 * This function:
 * 1. Finds an active authorization for the client
 * 2. Converts hours worked to units based on unit type
 * 3. Updates the authorization's usedUnits and remainingUnits
 * 4. Creates an alert if units are running low or authorization is expiring
 * 5. Creates an audit log entry
 */
export async function deductAuthorizationUnits(
  params: DeductUnitsParams
): Promise<DeductUnitsResult> {
  const { companyId, clientId, hoursWorked, shiftId, userId } = params;

  try {
    // Find active authorization for this client
    const authorization = await prisma.authorization.findFirst({
      where: {
        companyId,
        clientId,
        status: "ACTIVE",
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
      orderBy: { endDate: "asc" }, // Use the one expiring soonest
    });

    if (!authorization) {
      // No active authorization found - this is not an error, just log it
      console.log(`No active authorization found for client ${clientId}`);
      return {
        success: true,
        noAuthorizationFound: true,
      };
    }

    // Convert hours to units based on unit type
    let unitsToDeduct: number;
    switch (authorization.unitType) {
      case "QUARTER_HOURLY":
        // 15-minute units = hours * 4
        unitsToDeduct = Math.ceil(hoursWorked * 4);
        break;
      case "DAILY":
        // Daily units = 1 unit per day (any work counts as 1 day)
        unitsToDeduct = hoursWorked > 0 ? 1 : 0;
        break;
      case "HOURLY":
      default:
        // Hourly units = round to nearest 0.25 hour
        unitsToDeduct = Math.ceil(hoursWorked * 4) / 4;
        break;
    }

    // Calculate new values
    const currentUsed = Number(authorization.usedUnits) || 0;
    const authorizedUnits = Number(authorization.authorizedUnits) || 0;
    const newUsedUnits = currentUsed + unitsToDeduct;
    const newRemainingUnits = Math.max(authorizedUnits - newUsedUnits, 0);
    const usagePercentage = (newUsedUnits / authorizedUnits) * 100;

    // Update authorization
    await prisma.authorization.update({
      where: { id: authorization.id },
      data: {
        usedUnits: newUsedUnits,
        remainingUnits: newRemainingUnits,
        // If all units are used, mark as exhausted
        status: newRemainingUnits <= 0 ? "EXHAUSTED" : authorization.status,
      },
    });

    // Check if we need to create alerts
    const daysRemaining = Math.ceil(
      (new Date(authorization.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    // Create alert if units are running low (80% or more used)
    if (usagePercentage >= 80 && usagePercentage < 100) {
      const existingAlert = await prisma.authorizationAlert.findFirst({
        where: {
          authorizationId: authorization.id,
          alertType: "LOW_UNITS",
          isDismissed: false,
        },
      });

      if (!existingAlert) {
        await prisma.authorizationAlert.create({
          data: {
            companyId,
            authorizationId: authorization.id,
            alertType: "LOW_UNITS",
            severity: usagePercentage >= 90 ? "CRITICAL" : "WARNING",
            message: `Authorization has ${newRemainingUnits.toFixed(1)} ${authorization.unitType.toLowerCase()} units remaining (${usagePercentage.toFixed(0)}% used)`,
          },
        });
      }
    }

    // Create alert if authorization is exhausted
    if (newRemainingUnits <= 0) {
      const existingAlert = await prisma.authorizationAlert.findFirst({
        where: {
          authorizationId: authorization.id,
          alertType: "UNITS_EXHAUSTED",
          isDismissed: false,
        },
      });

      if (!existingAlert) {
        await prisma.authorizationAlert.create({
          data: {
            companyId,
            authorizationId: authorization.id,
            alertType: "UNITS_EXHAUSTED",
            severity: "CRITICAL",
            message: `Authorization units exhausted. All ${authorizedUnits} ${authorization.unitType.toLowerCase()} units have been used.`,
          },
        });
      }
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId,
        userId,
        action: "AUTHORIZATION_UNITS_DEDUCTED",
        entityType: "Authorization",
        entityId: authorization.id,
        changes: {
          shiftId,
          hoursWorked: Math.round(hoursWorked * 100) / 100,
          unitsDeducted: unitsToDeduct,
          previousUsedUnits: currentUsed,
          newUsedUnits,
          remainingUnits: newRemainingUnits,
          unitType: authorization.unitType,
        },
      },
    });

    console.log(
      `Deducted ${unitsToDeduct} ${authorization.unitType.toLowerCase()} units from authorization ${authorization.id}. ` +
      `Remaining: ${newRemainingUnits}/${authorizedUnits}`
    );

    return {
      success: true,
      authorizationId: authorization.id,
      unitsDeducted: unitsToDeduct,
      remainingUnits: newRemainingUnits,
    };
  } catch (error) {
    console.error("Error deducting authorization units:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Calculate total hours worked for a shift based on actual times or scheduled times
 */
export function calculateShiftHours(shift: {
  actualStart?: Date | null;
  actualEnd?: Date | null;
  scheduledStart: Date;
  scheduledEnd: Date;
}): number {
  const start = shift.actualStart || shift.scheduledStart;
  const end = shift.actualEnd || shift.scheduledEnd;

  const hoursWorked = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  return Math.max(hoursWorked, 0);
}
