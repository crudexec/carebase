import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";

// Query validation schema
const invoicesQuerySchema = z.object({
  status: z.string().optional(),
  clientId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(50),
});

// GET - List invoices
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role, id: userId } = session.user;

    // Check permission
    const canViewAll = hasAnyPermission(role, [
      PERMISSIONS.INVOICE_VIEW,
      PERMISSIONS.INVOICE_MANAGE,
      PERMISSIONS.INVOICE_FULL,
    ]);

    // Sponsors can only view their own invoices
    const isSponsor = role === "SPONSOR";

    if (!canViewAll && !isSponsor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const queryResult = invoicesQuerySchema.safeParse(
      Object.fromEntries(searchParams)
    );

    if (!queryResult.success) {
      return NextResponse.json(
        { error: "Invalid query parameters" },
        { status: 400 }
      );
    }

    const { status, clientId, startDate, endDate, page, limit } = queryResult.data;

    // Build where clause
    const whereClause: Record<string, unknown> = { companyId };

    // Sponsors can only see their own invoices
    if (isSponsor) {
      whereClause.sponsorId = userId;
    }

    if (status) {
      whereClause.status = status;
    }

    if (clientId) {
      whereClause.clientId = clientId;
    }

    if (startDate) {
      whereClause.periodStart = { gte: new Date(startDate) };
    }

    if (endDate) {
      whereClause.periodEnd = { lte: new Date(endDate) };
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
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
        },
      }),
      prisma.invoice.count({ where: whereClause }),
    ]);

    // Calculate summary stats
    const stats = await prisma.invoice.groupBy({
      by: ["status"],
      where: { companyId, ...(isSponsor ? { sponsorId: userId } : {}) },
      _count: true,
      _sum: {
        amount: true,
      },
    });

    // Get totals
    const totals = await prisma.invoice.aggregate({
      where: { companyId, ...(isSponsor ? { sponsorId: userId } : {}) },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    return NextResponse.json({
      invoices: invoices.map((inv) => ({
        ...inv,
        amount: inv.amount.toNumber(),
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
            amount: stat._sum.amount?.toNumber() || 0,
          },
        }),
        {}
      ),
      totals: {
        count: totals._count,
        amount: totals._sum.amount?.toNumber() || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}
