import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canManageSchedule, canViewAllSchedules } from "@/lib/scheduling";
import { Prisma, ShiftStatus } from "@prisma/client";
import { z } from "zod";

const createShiftSchema = z.object({
  carerId: z.string().min(1, "Caregiver is required"),
  clientId: z.string().min(1, "Client is required"),
  scheduledStart: z.string().min(1, "Start time is required"),
  scheduledEnd: z.string().min(1, "End time is required"),
});

// GET /api/scheduling - List shifts
export async function GET(request: Request) {
  console.log(`[Scheduling API] Request received`);
  console.log(`[Scheduling API] Cookies:`, request.headers.get("cookie")?.substring(0, 100));

  try {
    const session = await auth();
    console.log(`[Scheduling API] Session:`, session ? `user=${session.user?.id}` : "null");

    if (!session?.user) {
      console.log(`[Scheduling API] No session user, returning 401`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const carerId = searchParams.get("carerId");
    const clientId = searchParams.get("clientId");
    const status = searchParams.get("status");

    // Build query filters - scope to company
    const where: Prisma.ShiftWhereInput = {
      companyId: session.user.companyId,
    };

    // Date range filter
    if (startDate) {
      where.scheduledStart = { gte: new Date(startDate) };
    }
    if (endDate) {
      where.scheduledEnd = { lte: new Date(endDate) };
    }

    // If user is a carer, only show their shifts
    if (session.user.role === "CARER" && !canViewAllSchedules(session.user.role)) {
      where.carerId = session.user.id;
      console.log(`[Scheduling API] Filtering for carer: ${session.user.id}`);
    } else if (session.user.role === "SPONSOR") {
      // Sponsors can only see shifts for their associated clients
      const sponsorClients = await prisma.client.findMany({
        where: {
          companyId: session.user.companyId,
          sponsorId: session.user.id,
        },
        select: { id: true },
      });
      const clientIds = sponsorClients.map((c) => c.id);
      where.clientId = { in: clientIds };
      console.log(`[Scheduling API] Filtering for sponsor: ${session.user.id}, clients: ${clientIds.length}`);
    } else {
      // Other roles can filter by carer
      if (carerId) {
        where.carerId = carerId;
      }
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (status) {
      where.status = status as ShiftStatus;
    }

    const shifts = await prisma.shift.findMany({
      where,
      include: {
        carer: {
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
            address: true,
            diagnosisCodes: true,
            primaryDiagnosis: true,
          },
        },
      },
      orderBy: { scheduledStart: "asc" },
    });

    console.log(`[Scheduling API] Returning ${shifts.length} shifts for user ${session.user.id} (role: ${session.user.role})`);

    return NextResponse.json({ shifts });
  } catch (error) {
    console.error("Error fetching shifts:", error);
    return NextResponse.json({ error: "Failed to fetch shifts" }, { status: 500 });
  }
}

// POST /api/scheduling - Create a new shift
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions
    if (!canManageSchedule(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = createShiftSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { carerId, clientId, scheduledStart, scheduledEnd } = validation.data;

    // Validate dates
    const start = new Date(scheduledStart);
    const end = new Date(scheduledEnd);

    if (end <= start) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    // Check for conflicting shifts for the same carer
    const conflictingShift = await prisma.shift.findFirst({
      where: {
        companyId: session.user.companyId,
        carerId,
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
        OR: [
          {
            scheduledStart: { lte: start },
            scheduledEnd: { gt: start },
          },
          {
            scheduledStart: { lt: end },
            scheduledEnd: { gte: end },
          },
          {
            scheduledStart: { gte: start },
            scheduledEnd: { lte: end },
          },
        ],
      },
    });

    if (conflictingShift) {
      return NextResponse.json(
        { error: "Carer has a conflicting shift at this time" },
        { status: 400 }
      );
    }

    // Create the shift
    const shift = await prisma.shift.create({
      data: {
        companyId: session.user.companyId,
        carerId,
        clientId,
        scheduledStart: start,
        scheduledEnd: end,
        status: "SCHEDULED",
      },
      include: {
        carer: {
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
            address: true,
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "SHIFT_CREATED",
        entityType: "Shift",
        entityId: shift.id,
        changes: {
          carerId,
          clientId,
          scheduledStart: start.toISOString(),
          scheduledEnd: end.toISOString(),
        },
      },
    });

    return NextResponse.json({ shift }, { status: 201 });
  } catch (error) {
    console.error("Error creating shift:", error);
    return NextResponse.json({ error: "Failed to create shift" }, { status: 500 });
  }
}
