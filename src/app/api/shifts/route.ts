import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/mobile-auth";
import { prisma } from "@/lib/db";
import { Prisma, ShiftStatus } from "@prisma/client";
import { startOfDay, endOfDay } from "date-fns";

// GET /api/shifts - List shifts (mobile-friendly endpoint)
export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter"); // 'today', 'upcoming', 'past'
    const status = searchParams.get("status");
    const clientId = searchParams.get("clientId");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const now = new Date();

    // Build query filters - scope to company
    let where: Prisma.ShiftWhereInput = {
      companyId: user.companyId,
    };

    // Carers only see their own shifts
    if (user.role === "CARER") {
      where.carerId = user.id;
    }

    // Sponsors see shifts for their clients
    if (user.role === "SPONSOR") {
      const sponsorClients = await prisma.client.findMany({
        where: {
          companyId: user.companyId,
          sponsorId: user.id,
        },
        select: { id: true },
      });
      where.clientId = { in: sponsorClients.map((c) => c.id) };
    }

    // Filter by date range
    if (filter === "today") {
      // Include shifts scheduled today OR any IN_PROGRESS shifts
      // Use AND to combine with existing filters (companyId, carerId)
      const existingFilters = { ...where };
      where = {
        AND: [
          existingFilters,
          {
            OR: [
              {
                scheduledStart: {
                  gte: startOfDay(now),
                  lte: endOfDay(now),
                },
              },
              {
                status: "IN_PROGRESS",
              },
            ],
          },
        ],
      };
    } else if (filter === "upcoming") {
      where.scheduledStart = { gte: now };
      where.status = { in: ["SCHEDULED", "IN_PROGRESS"] };
    } else if (filter === "past") {
      where.scheduledEnd = { lt: now };
    } else if (filter === "active") {
      // Only IN_PROGRESS shifts
      where.status = "IN_PROGRESS";
    }

    // Filter by status
    if (status) {
      where.status = status as ShiftStatus;
    }

    // Filter by client
    if (clientId) {
      where.clientId = clientId;
    }

    console.log("[Shifts API] Fetching shifts for user:", user.id, "company:", user.companyId, "filter:", filter);

    const shifts = await prisma.shift.findMany({
      where,
      include: {
        carer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            address: true,
            phone: true,
            diagnosisCodes: true,
            primaryDiagnosis: true,
          },
        },
        visitNotes: {
          select: {
            id: true,
            qaStatus: true,
            submittedAt: true,
          },
          orderBy: { submittedAt: "desc" },
          take: 1,
        },
      },
      orderBy: { scheduledStart: filter === "past" ? "desc" : "asc" },
      take: limit,
    });

    console.log("[Shifts API] Found", shifts.length, "shifts");

    return NextResponse.json({ shifts });
  } catch (error) {
    console.error("Error fetching shifts:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to fetch shifts", details: errorMessage }, { status: 500 });
  }
}
