import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/mobile-auth";
import { prisma } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { Prisma, ClientStatus } from "@prisma/client";
import { z } from "zod";

const createClientSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  dateOfBirth: z.string().nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  medicalNotes: z.string().nullable().optional(),
  status: z.nativeEnum(ClientStatus).default("PROSPECT"),
  assignedCarerId: z.string().nullable().optional(),
});

const querySchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(ClientStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

// GET /api/clients - List clients
export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions - most roles can view clients
    // Sponsors can also view their associated clients
    const canView =
      hasPermission(user.role, PERMISSIONS.USER_VIEW) ||
      hasPermission(user.role, PERMISSIONS.SCHEDULING_VIEW) ||
      hasPermission(user.role, PERMISSIONS.ONBOARDING_VIEW) ||
      (user.role as string) === "SPONSOR";

    if (!canView) {
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

    const { search, status, page, limit } = queryValidation.data;

    console.log(`[Clients API] User: id=${user.id}, role=${user.role}, companyId=${user.companyId}`);
    console.log(`[Clients API] Role check: "${user.role}" === "CARER" is ${user.role === "CARER"}`);

    // Build query - scope to company
    const where: Prisma.ClientWhereInput = {
      companyId: user.companyId,
    };

    // For sponsors, only show their associated clients
    if ((user.role as string) === "SPONSOR") {
      console.log(`[Clients API] Entering SPONSOR branch`);
      where.sponsorId = user.id;
    }

    // For carers, only show clients they have been scheduled with
    if (user.role === "CARER") {
      console.log(`[Clients API] Entering CARER branch`);
      // Get all unique client IDs from the carer's shifts
      const carerShifts = await prisma.shift.findMany({
        where: {
          carerId: user.id,
          companyId: user.companyId,
        },
        select: {
          clientId: true,
          companyId: true,
        },
        distinct: ["clientId"],
      });

      // Also check all shifts for this carer regardless of company (for debugging)
      const allCarerShifts = await prisma.shift.findMany({
        where: {
          carerId: user.id,
        },
        select: {
          clientId: true,
          companyId: true,
        },
      });

      console.log(`[Clients API] Carer ${user.id} - shifts with company filter: ${carerShifts.length}`);
      console.log(`[Clients API] Carer ${user.id} - ALL shifts (no company filter): ${allCarerShifts.length}`);
      console.log(`[Clients API] User companyId: ${user.companyId}`);
      console.log(`[Clients API] Shifts companyIds:`, allCarerShifts.map(s => s.companyId));
      console.log(`[Clients API] Client IDs from shifts:`, carerShifts.map(s => s.clientId));

      const clientIds = carerShifts.map((s) => s.clientId);

      // If carer has no shifts, return empty list
      if (clientIds.length === 0) {
        console.log(`[Clients API] No shifts found for carer, returning empty list`);
        return NextResponse.json({
          clients: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        });
      }

      where.id = { in: clientIds };
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ];
    }

    console.log(`[Clients API] Final where clause:`, JSON.stringify(where, null, 2));

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
          address: true,
          phone: true,
          medicalNotes: true,
          status: true,
          createdAt: true,
          sponsor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          assignedCarer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: [{ status: "asc" }, { lastName: "asc" }, { firstName: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.client.count({ where }),
    ]);

    console.log(`[Clients API] Found ${clients.length} clients (total: ${total})`);

    return NextResponse.json({
      clients: clients.map((c) => ({
        ...c,
        dateOfBirth: c.dateOfBirth?.toISOString() || null,
        createdAt: c.createdAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

// POST /api/clients - Create a new client
export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions
    if (!hasPermission(user.role, PERMISSIONS.USER_MANAGE)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = createClientSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const {
      firstName,
      lastName,
      dateOfBirth,
      address,
      phone,
      medicalNotes,
      status,
      assignedCarerId,
    } = validation.data;

    // Validate assigned carer belongs to company
    if (assignedCarerId) {
      const carer = await prisma.user.findFirst({
        where: {
          id: assignedCarerId,
          companyId: user.companyId,
          role: "CARER",
          isActive: true,
        },
      });

      if (!carer) {
        return NextResponse.json(
          { error: "Invalid carer assignment" },
          { status: 400 }
        );
      }
    }

    // Create client
    const client = await prisma.client.create({
      data: {
        companyId: user.companyId,
        firstName,
        lastName,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        address: address || null,
        phone: phone || null,
        medicalNotes: medicalNotes || null,
        status,
        assignedCarerId: assignedCarerId || null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        address: true,
        phone: true,
        medicalNotes: true,
        status: true,
        createdAt: true,
        sponsor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        assignedCarer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: user.companyId,
        userId: user.id,
        action: "CLIENT_CREATED",
        entityType: "Client",
        entityId: client.id,
        changes: {
          firstName,
          lastName,
          status,
        },
      },
    });

    return NextResponse.json(
      {
        client: {
          ...client,
          dateOfBirth: client.dateOfBirth?.toISOString() || null,
          createdAt: client.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}
