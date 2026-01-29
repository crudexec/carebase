import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const carePlanId = searchParams.get("carePlanId");

    const where = {
      companyId: session.user.companyId,
      ...(status && { status: status as "QUEUED" | "IN_PROGRESS" | "COMPLETED" | "FAILED" }),
      ...(carePlanId && { carePlanId }),
    };

    const [faxRecords, total] = await Promise.all([
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
    ]);

    return NextResponse.json({
      faxRecords,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching fax records:", error);
    return NextResponse.json(
      { error: "Failed to fetch fax records" },
      { status: 500 }
    );
  }
}
