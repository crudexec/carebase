import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";

// Query validation schema
const payrollQuerySchema = z.object({
  status: z.string().optional(),
  carerId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(50),
});

// GET - List payroll records
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role, id: userId } = session.user;

    // Check permission - carers can only view their own
    const canViewAll = hasAnyPermission(role, [
      PERMISSIONS.PAYROLL_VIEW,
      PERMISSIONS.PAYROLL_EDIT,
      PERMISSIONS.PAYROLL_PROCESS,
      PERMISSIONS.PAYROLL_FULL,
    ]);

    const canViewOwn = hasAnyPermission(role, [PERMISSIONS.PAYROLL_VIEW_OWN]);

    if (!canViewAll && !canViewOwn) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const queryResult = payrollQuerySchema.safeParse(
      Object.fromEntries(searchParams)
    );

    if (!queryResult.success) {
      return NextResponse.json(
        { error: "Invalid query parameters" },
        { status: 400 }
      );
    }

    const { status, carerId, startDate, endDate, page, limit } = queryResult.data;

    // Build where clause
    const whereClause: Record<string, unknown> = { companyId };

    // If user can only view own, restrict to their records
    if (!canViewAll && canViewOwn) {
      whereClause.carerId = userId;
    } else if (carerId) {
      whereClause.carerId = carerId;
    }

    if (status) {
      whereClause.status = status;
    }

    if (startDate || endDate) {
      whereClause.shift = {
        scheduledStart: {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(endDate) }),
        },
      };
    }

    const [records, total] = await Promise.all([
      prisma.payrollRecord.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          carer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          shift: {
            select: {
              id: true,
              scheduledStart: true,
              scheduledEnd: true,
              status: true,
              client: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          supervisorApprovedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          processedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.payrollRecord.count({ where: whereClause }),
    ]);

    // Calculate summary stats
    const stats = await prisma.payrollRecord.groupBy({
      by: ["status"],
      where: { companyId, ...((!canViewAll && canViewOwn) ? { carerId: userId } : {}) },
      _count: true,
      _sum: {
        totalAmount: true,
        hoursWorked: true,
      },
    });

    // Get totals for the period
    const totals = await prisma.payrollRecord.aggregate({
      where: { companyId, ...((!canViewAll && canViewOwn) ? { carerId: userId } : {}) },
      _sum: {
        totalAmount: true,
        hoursWorked: true,
      },
      _count: true,
    });

    return NextResponse.json({
      records: records.map((r) => ({
        ...r,
        hoursWorked: r.hoursWorked.toNumber(),
        hourlyRate: r.hourlyRate.toNumber(),
        totalAmount: r.totalAmount.toNumber(),
      })),
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
            hours: stat._sum.hoursWorked?.toNumber() || 0,
          },
        }),
        {}
      ),
      totals: {
        count: totals._count,
        amount: totals._sum.totalAmount?.toNumber() || 0,
        hours: totals._sum.hoursWorked?.toNumber() || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching payroll records:", error);
    return NextResponse.json(
      { error: "Failed to fetch payroll records" },
      { status: 500 }
    );
  }
}
