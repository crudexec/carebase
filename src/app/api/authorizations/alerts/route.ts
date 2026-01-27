import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/authorizations/alerts - Get all active authorization alerts
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const acknowledged = searchParams.get("acknowledged");

    // Get alerts from the alerts table
    const alertsFromTable = await prisma.authorizationAlert.findMany({
      where: {
        companyId: session.user.companyId,
        ...(acknowledged === "false" ? { acknowledgedAt: null } : {}),
      },
      include: {
        authorization: {
          include: {
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Also generate real-time alerts for authorizations
    const authorizations = await prisma.authorization.findMany({
      where: {
        companyId: session.user.companyId,
        status: "ACTIVE",
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const realTimeAlerts: {
      id: string;
      type: string;
      severity: string;
      message: string;
      authorization: typeof authorizations[0];
      createdAt: Date;
    }[] = [];

    for (const auth of authorizations) {
      const usedUnits = Number(auth.usedUnits) || 0;
      const authorizedUnits = Number(auth.authorizedUnits) || 1;
      const usagePercentage = (usedUnits / authorizedUnits) * 100;
      const daysRemaining = Math.ceil(
        (new Date(auth.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      // Expiring soon alerts
      if (daysRemaining <= 30 && daysRemaining > 14) {
        realTimeAlerts.push({
          id: `expiring-30-${auth.id}`,
          type: "EXPIRING_SOON",
          severity: "WARNING",
          message: `Authorization expires in ${daysRemaining} days`,
          authorization: auth,
          createdAt: new Date(),
        });
      } else if (daysRemaining <= 14 && daysRemaining > 7) {
        realTimeAlerts.push({
          id: `expiring-14-${auth.id}`,
          type: "EXPIRING_SOON",
          severity: "HIGH",
          message: `Authorization expires in ${daysRemaining} days - reauthorization needed`,
          authorization: auth,
          createdAt: new Date(),
        });
      } else if (daysRemaining <= 7 && daysRemaining > 0) {
        realTimeAlerts.push({
          id: `expiring-7-${auth.id}`,
          type: "EXPIRING_CRITICAL",
          severity: "CRITICAL",
          message: `URGENT: Authorization expires in ${daysRemaining} days`,
          authorization: auth,
          createdAt: new Date(),
        });
      } else if (daysRemaining <= 0) {
        realTimeAlerts.push({
          id: `expired-${auth.id}`,
          type: "EXPIRED",
          severity: "CRITICAL",
          message: `Authorization has expired`,
          authorization: auth,
          createdAt: new Date(),
        });
      }

      // Usage alerts
      if (usagePercentage >= 100) {
        realTimeAlerts.push({
          id: `exhausted-${auth.id}`,
          type: "UNITS_EXHAUSTED",
          severity: "CRITICAL",
          message: `All authorized units have been used`,
          authorization: auth,
          createdAt: new Date(),
        });
      } else if (usagePercentage >= 90) {
        realTimeAlerts.push({
          id: `usage-90-${auth.id}`,
          type: "UNITS_LOW",
          severity: "HIGH",
          message: `${(100 - usagePercentage).toFixed(1)}% of units remaining`,
          authorization: auth,
          createdAt: new Date(),
        });
      } else if (usagePercentage >= 80) {
        realTimeAlerts.push({
          id: `usage-80-${auth.id}`,
          type: "UNITS_LOW",
          severity: "WARNING",
          message: `${(100 - usagePercentage).toFixed(1)}% of units remaining`,
          authorization: auth,
          createdAt: new Date(),
        });
      }
    }

    // Summary statistics
    const summary = {
      total: realTimeAlerts.length,
      critical: realTimeAlerts.filter((a) => a.severity === "CRITICAL").length,
      high: realTimeAlerts.filter((a) => a.severity === "HIGH").length,
      warning: realTimeAlerts.filter((a) => a.severity === "WARNING").length,
      expiring: realTimeAlerts.filter((a) => a.type.includes("EXPIR")).length,
      lowUnits: realTimeAlerts.filter((a) => a.type.includes("UNITS")).length,
    };

    return NextResponse.json({
      alerts: realTimeAlerts,
      savedAlerts: alertsFromTable,
      summary,
    });
  } catch (error) {
    console.error("Error fetching authorization alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch authorization alerts" },
      { status: 500 }
    );
  }
}

// POST /api/authorizations/alerts - Acknowledge an alert
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { alertId } = body;

    if (!alertId) {
      return NextResponse.json(
        { error: "Alert ID is required" },
        { status: 400 }
      );
    }

    // Check if this is a real-time alert (they have a specific format)
    if (alertId.includes("-")) {
      // For real-time alerts, create a record in the database marking it as acknowledged
      const [type, authorizationId] = alertId.split("-").slice(-2);

      const authorization = await prisma.authorization.findFirst({
        where: {
          id: authorizationId,
          companyId: session.user.companyId,
        },
      });

      if (!authorization) {
        return NextResponse.json(
          { error: "Authorization not found" },
          { status: 404 }
        );
      }

      // Create a read alert record
      await prisma.authorizationAlert.create({
        data: {
          companyId: session.user.companyId,
          authorizationId: authorization.id,
          alertType: type.toUpperCase(),
          severity: "INFO",
          message: `Alert acknowledged`,
          isRead: true,
          readAt: new Date(),
          actionTaken: "ACKNOWLEDGED",
          actionTakenAt: new Date(),
          actionTakenById: session.user.id,
        },
      });

      return NextResponse.json({ success: true });
    }

    // For saved alerts, update the read status
    await prisma.authorizationAlert.update({
      where: { id: alertId },
      data: {
        isRead: true,
        readAt: new Date(),
        actionTaken: "ACKNOWLEDGED",
        actionTakenAt: new Date(),
        actionTakenById: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error acknowledging alert:", error);
    return NextResponse.json(
      { error: "Failed to acknowledge alert" },
      { status: 500 }
    );
  }
}
