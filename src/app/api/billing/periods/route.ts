import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";
import { format } from "date-fns";

// Validation schema for billing period
const createBillingPeriodSchema = z.object({
  startDate: z.string().transform((val) => new Date(val)),
  endDate: z.string().transform((val) => new Date(val)),
  name: z.string().max(255).optional(),
});

// Helper to generate period name
function generatePeriodName(startDate: Date, endDate: Date): string {
  const startStr = format(startDate, "MMM d");
  const endStr = format(endDate, "MMM d, yyyy");
  return `${startStr} - ${endStr}`;
}

// GET - List billing periods
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
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const whereClause: Record<string, unknown> = { companyId };
    if (status) {
      whereClause.status = status;
    }

    const [periods, total] = await Promise.all([
      prisma.billingPeriod.findMany({
        where: whereClause,
        orderBy: { startDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: {
              claims: true,
            },
          },
        },
      }),
      prisma.billingPeriod.count({ where: whereClause }),
    ]);

    // Get summary stats for each period
    const periodsWithStats = await Promise.all(
      periods.map(async (period) => {
        const claimStats = await prisma.claim.groupBy({
          by: ["status"],
          where: { billingPeriodId: period.id },
          _count: true,
          _sum: {
            totalAmount: true,
          },
        });

        const totalAmount = claimStats.reduce(
          (sum, stat) => sum + (stat._sum.totalAmount?.toNumber() || 0),
          0
        );

        return {
          ...period,
          stats: {
            totalClaims: period._count.claims,
            totalAmount,
            byStatus: claimStats.reduce(
              (acc, stat) => ({
                ...acc,
                [stat.status]: stat._count,
              }),
              {}
            ),
          },
        };
      })
    );

    return NextResponse.json({
      periods: periodsWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching billing periods:", error);
    return NextResponse.json(
      { error: "Failed to fetch billing periods" },
      { status: 500 }
    );
  }
}

// POST - Create billing period
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId, companyId, role } = session.user;

    // Check permission
    if (
      !hasAnyPermission(role, [
        PERMISSIONS.BILLING_MANAGE,
        PERMISSIONS.BILLING_FULL,
      ])
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validationResult = createBillingPeriodSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Validate date range
    if (data.endDate <= data.startDate) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    // Check for overlapping periods
    const overlappingPeriod = await prisma.billingPeriod.findFirst({
      where: {
        companyId,
        OR: [
          {
            startDate: { lte: data.endDate },
            endDate: { gte: data.startDate },
          },
        ],
      },
    });

    if (overlappingPeriod) {
      return NextResponse.json(
        {
          error: "This period overlaps with an existing billing period",
          existingPeriod: overlappingPeriod.name,
        },
        { status: 409 }
      );
    }

    const name = data.name || generatePeriodName(data.startDate, data.endDate);

    const period = await prisma.billingPeriod.create({
      data: {
        name,
        startDate: data.startDate,
        endDate: data.endDate,
        companyId,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "CREATE_BILLING_PERIOD",
        entityType: "BillingPeriod",
        entityId: period.id,
        changes: { name, startDate: data.startDate, endDate: data.endDate },
        userId,
        companyId,
      },
    });

    return NextResponse.json({ period }, { status: 201 });
  } catch (error) {
    console.error("Error creating billing period:", error);
    return NextResponse.json(
      { error: "Failed to create billing period" },
      { status: 500 }
    );
  }
}
