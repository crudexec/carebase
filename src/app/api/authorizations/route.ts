import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { z } from "zod";

// GET /api/authorizations - List authorizations
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const status = searchParams.get("status");
    const expiringSoon = searchParams.get("expiringSoon") === "true";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: Prisma.AuthorizationWhereInput = {
      companyId: session.user.companyId,
    };

    if (clientId) where.clientId = clientId;
    if (status) where.status = status as Prisma.AuthorizationWhereInput["status"];

    // Filter for authorizations expiring in the next 30 days
    if (expiringSoon) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      where.endDate = {
        lte: thirtyDaysFromNow,
        gte: new Date(),
      };
      where.status = "ACTIVE";
    }

    const [authorizations, total] = await Promise.all([
      prisma.authorization.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              medicaidId: true,
            },
          },
        },
        orderBy: { endDate: "asc" },
        take: limit,
        skip: offset,
      }),
      prisma.authorization.count({ where }),
    ]);

    // Calculate usage percentages and days remaining
    const authorizationsWithStats = authorizations.map((auth) => {
      const usedUnits = Number(auth.usedUnits) || 0;
      const authorizedUnits = Number(auth.authorizedUnits) || 1;
      const usagePercentage = (usedUnits / authorizedUnits) * 100;
      const remainingUnits = Number(auth.remainingUnits) || (authorizedUnits - usedUnits);
      const daysRemaining = Math.ceil(
        (new Date(auth.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      return {
        ...auth,
        usedUnits,
        authorizedUnits,
        usagePercentage: Math.min(usagePercentage, 100),
        remainingUnits: Math.max(remainingUnits, 0),
        daysRemaining: Math.max(daysRemaining, 0),
        isExpiringSoon: daysRemaining <= 30 && daysRemaining > 0,
        isExpired: daysRemaining <= 0,
        isNearingLimit: usagePercentage >= 80,
      };
    });

    return NextResponse.json({
      authorizations: authorizationsWithStats,
      total,
    });
  } catch (error) {
    console.error("Error fetching authorizations:", error);
    return NextResponse.json(
      { error: "Failed to fetch authorizations" },
      { status: 500 }
    );
  }
}

const createAuthorizationSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  authNumber: z.string().min(1, "Authorization number is required"),
  serviceType: z.string().min(1, "Service type is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  authorizedUnits: z.number().min(1, "Authorized units is required"),
  unitType: z.enum(["HOURLY", "QUARTER_HOURLY", "DAILY"]).default("HOURLY"),
  diagnosisCodes: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

// POST /api/authorizations - Create new authorization
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (
      !["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF"].includes(
        session.user.role
      )
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = createAuthorizationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const {
      clientId,
      authNumber,
      serviceType,
      startDate,
      endDate,
      authorizedUnits,
      unitType,
      diagnosisCodes,
      notes,
    } = validation.data;

    // Verify client exists
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        companyId: session.user.companyId,
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Check for overlapping authorizations with same service type
    const overlapping = await prisma.authorization.findFirst({
      where: {
        clientId,
        serviceType,
        status: "ACTIVE",
        OR: [
          {
            startDate: { lte: new Date(endDate) },
            endDate: { gte: new Date(startDate) },
          },
        ],
      },
    });

    if (overlapping) {
      return NextResponse.json(
        { error: "Overlapping authorization exists for this service type" },
        { status: 400 }
      );
    }

    const authorization = await prisma.authorization.create({
      data: {
        companyId: session.user.companyId,
        clientId,
        authNumber,
        serviceType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        authorizedUnits,
        usedUnits: 0,
        remainingUnits: authorizedUnits,
        unitType,
        status: "ACTIVE",
        notes,
      },
      include: {
        client: {
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
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "AUTHORIZATION_CREATED",
        entityType: "Authorization",
        entityId: authorization.id,
        changes: {
          clientName: `${client.firstName} ${client.lastName}`,
          authNumber,
          authorizedUnits,
        },
      },
    });

    return NextResponse.json({ authorization }, { status: 201 });
  } catch (error) {
    console.error("Error creating authorization:", error);
    return NextResponse.json(
      { error: "Failed to create authorization" },
      { status: 500 }
    );
  }
}
