import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { FaxDirection, FaxStatus } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") as FaxStatus | null;
    const direction = searchParams.get("direction") as FaxDirection | null;
    const carePlanId = searchParams.get("carePlanId");
    const clientId = searchParams.get("clientId");
    const unprocessedOnly = searchParams.get("unprocessed") === "true";

    const where = {
      companyId: session.user.companyId,
      ...(status && { status }),
      ...(direction && { direction }),
      ...(carePlanId && { carePlanId }),
      ...(clientId && { clientId }),
      // For inbound faxes, filter by unprocessed
      ...(unprocessedOnly && {
        direction: "INBOUND" as FaxDirection,
        processedAt: null,
      }),
    };

    const [faxRecords, total, stats] = await Promise.all([
      prisma.faxRecord.findMany({
        where,
        include: {
          sentBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          carePlan: {
            select: {
              id: true,
              planNumber: true,
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
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.faxRecord.count({ where }),
      // Get stats for dashboard
      prisma.faxRecord.groupBy({
        by: ["direction", "status"],
        where: { companyId: session.user.companyId },
        _count: true,
      }),
    ]);

    // Process stats into a more useful format
    const statsSummary = {
      inbound: {
        total: 0,
        unprocessed: 0,
        completed: 0,
        failed: 0,
      },
      outbound: {
        total: 0,
        queued: 0,
        inProgress: 0,
        completed: 0,
        failed: 0,
      },
    };

    for (const stat of stats) {
      const count = stat._count;
      if (stat.direction === "INBOUND") {
        statsSummary.inbound.total += count;
        if (stat.status === "COMPLETED") statsSummary.inbound.completed += count;
        if (stat.status === "FAILED") statsSummary.inbound.failed += count;
      } else {
        statsSummary.outbound.total += count;
        if (stat.status === "QUEUED") statsSummary.outbound.queued += count;
        if (stat.status === "IN_PROGRESS") statsSummary.outbound.inProgress += count;
        if (stat.status === "COMPLETED") statsSummary.outbound.completed += count;
        if (stat.status === "FAILED") statsSummary.outbound.failed += count;
      }
    }

    // Count unprocessed inbound faxes
    const unprocessedCount = await prisma.faxRecord.count({
      where: {
        companyId: session.user.companyId,
        direction: "INBOUND",
        processedAt: null,
        status: "COMPLETED",
      },
    });
    statsSummary.inbound.unprocessed = unprocessedCount;

    return NextResponse.json({
      faxRecords,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: statsSummary,
    });
  } catch (error) {
    console.error("Error fetching fax records:", error);
    return NextResponse.json(
      { error: "Failed to fetch fax records" },
      { status: 500 }
    );
  }
}
