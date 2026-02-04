import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/mobile-auth";
import { prisma } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { Prisma } from "@prisma/client";
import { z } from "zod";

// Query schema for threshold breaches
const querySchema = z.object({
  clientId: z.string().optional(),
  carerId: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  breachType: z.enum(["BELOW_MIN", "ABOVE_MAX"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// GET /api/threshold-breaches - List threshold breaches for reporting
export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only users with visit note view all permissions can access this
    const canViewAll = hasPermission(user.role, PERMISSIONS.VISIT_NOTE_VIEW_ALL);
    if (!canViewAll) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const queryValidation = querySchema.safeParse(Object.fromEntries(searchParams));

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: queryValidation.error.issues },
        { status: 400 }
      );
    }

    const { clientId, carerId, startDate, endDate, breachType, page, limit } =
      queryValidation.data;

    // Build query filters
    const where: Prisma.ThresholdBreachWhereInput = {
      companyId: user.companyId,
    };

    if (clientId) {
      where.clientId = clientId;
    }

    if (carerId) {
      where.carerId = carerId;
    }

    if (breachType) {
      where.breachType = breachType;
    }

    if (startDate) {
      where.createdAt = { ...(where.createdAt as object), gte: startDate };
    }

    if (endDate) {
      where.createdAt = { ...(where.createdAt as object), lte: endDate };
    }

    const [breaches, total] = await Promise.all([
      prisma.thresholdBreach.findMany({
        where,
        include: {
          visitNote: {
            select: {
              id: true,
              submittedAt: true,
            },
          },
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
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
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.thresholdBreach.count({ where }),
    ]);

    // Transform response
    const response = breaches.map((breach) => ({
      id: breach.id,
      fieldId: breach.fieldId,
      fieldLabel: breach.fieldLabel,
      value: breach.value,
      minThreshold: breach.minThreshold,
      maxThreshold: breach.maxThreshold,
      breachType: breach.breachType,
      customMessage: breach.customMessage,
      createdAt: breach.createdAt.toISOString(),
      visitNote: {
        id: breach.visitNote.id,
        submittedAt: breach.visitNote.submittedAt.toISOString(),
      },
      client: breach.client,
      carer: breach.carer,
    }));

    return NextResponse.json({
      breaches: response,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching threshold breaches:", error);
    return NextResponse.json(
      { error: "Failed to fetch threshold breaches" },
      { status: 500 }
    );
  }
}
