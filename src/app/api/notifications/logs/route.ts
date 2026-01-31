import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const querySchema = z.object({
  channel: z.string().optional(),
  status: z.string().optional(),
  eventType: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

// GET /api/notifications/logs - Get user's notification history
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryValidation = querySchema.safeParse(Object.fromEntries(searchParams));

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: queryValidation.error.issues },
        { status: 400 }
      );
    }

    const { channel, status, eventType, page, limit } = queryValidation.data;

    // Build query filters
    const where: Prisma.NotificationLogWhereInput = {
      userId: session.user.id,
      companyId: session.user.companyId,
    };

    if (channel) {
      where.channel = channel as Prisma.EnumNotificationChannelFilter;
    }

    if (status) {
      where.status = status as Prisma.EnumNotificationStatusFilter;
    }

    if (eventType) {
      where.eventType = eventType as Prisma.EnumNotificationEventTypeFilter;
    }

    const [logs, total] = await Promise.all([
      prisma.notificationLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          eventType: true,
          channel: true,
          status: true,
          subject: true,
          sentAt: true,
          deliveredAt: true,
          failedAt: true,
          lastError: true,
          createdAt: true,
          relatedEntityType: true,
          relatedEntityId: true,
        },
      }),
      prisma.notificationLog.count({ where }),
    ]);

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching notification logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification logs" },
      { status: 500 }
    );
  }
}
