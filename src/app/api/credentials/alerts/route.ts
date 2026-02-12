import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";

// Query validation schema
const querySchema = z.object({
  severity: z.enum(["INFO", "WARNING", "HIGH", "CRITICAL"]).optional(),
  isRead: z.enum(["true", "false"]).optional(),
  isDismissed: z.enum(["true", "false"]).optional(),
  caregiverId: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

// GET - List credential alerts
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role } = session.user;

    const canView = hasAnyPermission(role, [
      PERMISSIONS.USER_VIEW,
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]);

    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const queryResult = querySchema.safeParse(Object.fromEntries(searchParams));

    if (!queryResult.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: queryResult.error.flatten() },
        { status: 400 }
      );
    }

    const { severity, isRead, isDismissed, caregiverId, limit } = queryResult.data;

    const alerts = await prisma.credentialAlert.findMany({
      where: {
        companyId,
        ...(severity && { severity }),
        ...(isRead !== undefined && { isRead: isRead === "true" }),
        ...(isDismissed !== undefined && { isDismissed: isDismissed === "true" }),
        ...(caregiverId && {
          credential: {
            caregiverProfileId: caregiverId,
          },
        }),
      },
      include: {
        credential: {
          select: {
            id: true,
            licenseNumber: true,
            expirationDate: true,
            status: true,
            credentialType: {
              select: {
                id: true,
                name: true,
                category: true,
              },
            },
            caregiverProfile: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        dismissedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        actionTakenBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [
        { isDismissed: "asc" },
        { severity: "desc" },
        { createdAt: "desc" },
      ],
      take: limit,
    });

    // Calculate summary
    const allAlerts = await prisma.credentialAlert.groupBy({
      by: ["severity", "isDismissed"],
      where: { companyId },
      _count: true,
    });

    const summary = {
      critical: 0,
      high: 0,
      warning: 0,
      info: 0,
      total: 0,
      unread: 0,
    };

    for (const group of allAlerts) {
      if (!group.isDismissed) {
        const count = group._count;
        summary.total += count;
        switch (group.severity) {
          case "CRITICAL":
            summary.critical += count;
            break;
          case "HIGH":
            summary.high += count;
            break;
          case "WARNING":
            summary.warning += count;
            break;
          case "INFO":
            summary.info += count;
            break;
        }
      }
    }

    const unreadCount = await prisma.credentialAlert.count({
      where: { companyId, isRead: false, isDismissed: false },
    });
    summary.unread = unreadCount;

    return NextResponse.json({ alerts, summary });
  } catch (error) {
    console.error("Error fetching credential alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch credential alerts" },
      { status: 500 }
    );
  }
}
