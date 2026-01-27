import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";

// Query validation schema
const claimsQuerySchema = z.object({
  billingPeriodId: z.string().optional(),
  clientId: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(50),
});

// GET - List claims
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role } = session.user;

    // Check permission
    if (
      !hasAnyPermission(role, [
        PERMISSIONS.BILLING_VIEW,
        PERMISSIONS.BILLING_MANAGE,
        PERMISSIONS.BILLING_FULL,
      ])
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const queryResult = claimsQuerySchema.safeParse(
      Object.fromEntries(searchParams)
    );

    if (!queryResult.success) {
      return NextResponse.json(
        { error: "Invalid query parameters" },
        { status: 400 }
      );
    }

    const { billingPeriodId, clientId, status, startDate, endDate, page, limit } =
      queryResult.data;

    // Build where clause
    const whereClause: Record<string, unknown> = { companyId };

    if (billingPeriodId) {
      whereClause.billingPeriodId = billingPeriodId;
    }
    if (clientId) {
      whereClause.clientId = clientId;
    }
    if (status) {
      whereClause.status = status;
    }
    if (startDate) {
      whereClause.serviceStartDate = { gte: new Date(startDate) };
    }
    if (endDate) {
      whereClause.serviceEndDate = { lte: new Date(endDate) };
    }

    const [claims, total] = await Promise.all([
      prisma.claim.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          billingPeriod: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              claimLines: true,
              submissions: true,
            },
          },
        },
      }),
      prisma.claim.count({ where: whereClause }),
    ]);

    // Calculate summary stats
    const stats = await prisma.claim.groupBy({
      by: ["status"],
      where: { companyId },
      _count: true,
      _sum: {
        totalAmount: true,
      },
    });

    return NextResponse.json({
      claims,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: stats.reduce(
        (acc, stat) => ({
          ...acc,
          [stat.status]: {
            count: stat._count,
            amount: stat._sum.totalAmount?.toNumber() || 0,
          },
        }),
        {}
      ),
    });
  } catch (error) {
    console.error("Error fetching claims:", error);
    return NextResponse.json(
      { error: "Failed to fetch claims" },
      { status: 500 }
    );
  }
}
