import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";

// Validation schema for service type
const createServiceTypeSchema = z.object({
  code: z
    .string()
    .min(1, "HCPCS code is required")
    .max(10, "HCPCS code too long"),
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(1000).optional().nullable(),
  unitType: z.enum(["HOURLY", "QUARTER_HOURLY", "DAILY"]).default("HOURLY"),
});

// GET - List service types
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
    const activeOnly = searchParams.get("activeOnly") === "true";

    const whereClause: Record<string, unknown> = { companyId };
    if (activeOnly) {
      whereClause.isActive = true;
    }

    const serviceTypes = await prisma.serviceType.findMany({
      where: whereClause,
      orderBy: { code: "asc" },
      include: {
        _count: {
          select: {
            billingRates: true,
            claimLines: true,
          },
        },
      },
    });

    return NextResponse.json({ serviceTypes });
  } catch (error) {
    console.error("Error fetching service types:", error);
    return NextResponse.json(
      { error: "Failed to fetch service types" },
      { status: 500 }
    );
  }
}

// POST - Create service type
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId, companyId, role } = session.user;

    // Check permission
    if (
      !hasAnyPermission(role, [
        PERMISSIONS.BILLING_MANAGE,
        PERMISSIONS.BILLING_FULL,
      ])
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validationResult = createServiceTypeSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check if code already exists for this company
    const existingType = await prisma.serviceType.findUnique({
      where: {
        companyId_code: {
          companyId,
          code: data.code.toUpperCase(),
        },
      },
    });

    if (existingType) {
      return NextResponse.json(
        { error: "A service type with this HCPCS code already exists" },
        { status: 409 }
      );
    }

    const serviceType = await prisma.serviceType.create({
      data: {
        code: data.code.toUpperCase(),
        name: data.name,
        description: data.description,
        unitType: data.unitType,
        companyId,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "CREATE_SERVICE_TYPE",
        entityType: "ServiceType",
        entityId: serviceType.id,
        changes: data,
        userId,
        companyId,
      },
    });

    return NextResponse.json({ serviceType }, { status: 201 });
  } catch (error) {
    console.error("Error creating service type:", error);
    return NextResponse.json(
      { error: "Failed to create service type" },
      { status: 500 }
    );
  }
}
