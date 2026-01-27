import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";

// Query validation schema
const submissionsQuerySchema = z.object({
  claimId: z.string().optional(),
  status: z.string().optional(),
  clearinghouse: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(50),
});

// GET - List claim submissions
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
    const queryResult = submissionsQuerySchema.safeParse(
      Object.fromEntries(searchParams)
    );

    if (!queryResult.success) {
      return NextResponse.json(
        { error: "Invalid query parameters" },
        { status: 400 }
      );
    }

    const { claimId, status, clearinghouse, startDate, endDate, page, limit } =
      queryResult.data;

    // Build where clause
    const whereClause: Record<string, unknown> = { companyId };

    if (claimId) {
      whereClause.claimId = claimId;
    }
    if (status) {
      whereClause.status = status;
    }
    if (clearinghouse) {
      whereClause.clearinghouse = clearinghouse;
    }
    if (startDate) {
      whereClause.submittedAt = { gte: new Date(startDate) };
    }
    if (endDate) {
      whereClause.submittedAt = {
        ...(whereClause.submittedAt as Record<string, unknown>),
        lte: new Date(endDate),
      };
    }

    const [submissions, total] = await Promise.all([
      prisma.claimSubmission.findMany({
        where: whereClause,
        orderBy: { submittedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          claim: {
            select: {
              id: true,
              claimNumber: true,
              status: true,
              totalAmount: true,
              patientFirstName: true,
              patientLastName: true,
            },
          },
        },
      }),
      prisma.claimSubmission.count({ where: whereClause }),
    ]);

    // Calculate summary stats
    const stats = await prisma.claimSubmission.groupBy({
      by: ["status"],
      where: { companyId },
      _count: true,
    });

    return NextResponse.json({
      submissions: submissions.map((s) => ({
        ...s,
        ediContent: undefined, // Don't include EDI content in list
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
          [stat.status]: stat._count,
        }),
        {}
      ),
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
