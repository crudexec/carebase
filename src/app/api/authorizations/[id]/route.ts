import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/authorizations/[id] - Get single authorization with alerts
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const authorization = await prisma.authorization.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            medicaidId: true,
            phone: true,
          },
        },
        alerts: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!authorization) {
      return NextResponse.json(
        { error: "Authorization not found" },
        { status: 404 }
      );
    }

    // Calculate stats
    const usedUnits = Number(authorization.usedUnits) || 0;
    const authorizedUnits = Number(authorization.authorizedUnits) || 1;
    const usagePercentage = (usedUnits / authorizedUnits) * 100;
    const remainingUnits = Number(authorization.remainingUnits) || (authorizedUnits - usedUnits);
    const daysRemaining = Math.ceil(
      (new Date(authorization.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return NextResponse.json({
      authorization: {
        ...authorization,
        usedUnits,
        authorizedUnits,
        usagePercentage: Math.min(usagePercentage, 100),
        remainingUnits: Math.max(remainingUnits, 0),
        daysRemaining: Math.max(daysRemaining, 0),
        isExpiringSoon: daysRemaining <= 30 && daysRemaining > 0,
        isExpired: daysRemaining <= 0,
        isNearingLimit: usagePercentage >= 80,
      },
    });
  } catch (error) {
    console.error("Error fetching authorization:", error);
    return NextResponse.json(
      { error: "Failed to fetch authorization" },
      { status: 500 }
    );
  }
}

const updateAuthorizationSchema = z.object({
  authorizationNumber: z.string().optional(),
  serviceCode: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  unitsAuthorized: z.number().optional(),
  unitsUsed: z.number().optional(),
  status: z.enum(["PENDING", "ACTIVE", "EXHAUSTED", "EXPIRED", "TERMINATED"]).optional(),
  notes: z.string().optional(),
});

// PATCH /api/authorizations/[id] - Update authorization
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const authorization = await prisma.authorization.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
    });

    if (!authorization) {
      return NextResponse.json(
        { error: "Authorization not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = updateAuthorizationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (validation.data.authorizationNumber) {
      updateData.authorizationNumber = validation.data.authorizationNumber;
    }
    if (validation.data.serviceCode) {
      updateData.serviceCode = validation.data.serviceCode;
    }
    if (validation.data.startDate) {
      updateData.startDate = new Date(validation.data.startDate);
    }
    if (validation.data.endDate) {
      updateData.endDate = new Date(validation.data.endDate);
    }
    if (validation.data.unitsAuthorized !== undefined) {
      updateData.unitsAuthorized = validation.data.unitsAuthorized;
    }
    if (validation.data.unitsUsed !== undefined) {
      updateData.unitsUsed = validation.data.unitsUsed;
    }
    if (validation.data.status) {
      updateData.status = validation.data.status;
    }
    if (validation.data.notes !== undefined) {
      updateData.notes = validation.data.notes;
    }

    const updatedAuthorization = await prisma.authorization.update({
      where: { id },
      data: updateData,
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
        action: "AUTHORIZATION_UPDATED",
        entityType: "Authorization",
        entityId: id,
        changes: validation.data,
      },
    });

    return NextResponse.json({ authorization: updatedAuthorization });
  } catch (error) {
    console.error("Error updating authorization:", error);
    return NextResponse.json(
      { error: "Failed to update authorization" },
      { status: 500 }
    );
  }
}

// DELETE /api/authorizations/[id] - Terminate authorization
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["ADMIN", "OPS_MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const authorization = await prisma.authorization.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
      include: {
        client: true,
      },
    });

    if (!authorization) {
      return NextResponse.json(
        { error: "Authorization not found" },
        { status: 404 }
      );
    }

    // Cancel instead of delete
    await prisma.authorization.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "AUTHORIZATION_CANCELLED",
        entityType: "Authorization",
        entityId: id,
        changes: {
          clientName: `${authorization.client.firstName} ${authorization.client.lastName}`,
          authNumber: authorization.authNumber,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error terminating authorization:", error);
    return NextResponse.json(
      { error: "Failed to terminate authorization" },
      { status: 500 }
    );
  }
}
