import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";

// Validation schema for billing rate
const createBillingRateSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  rate: z.number().positive("Rate must be positive"),
  serviceTypeId: z.string().min(1, "Service type is required"),
  effectiveDate: z.string().transform((val) => new Date(val)),
  endDate: z
    .string()
    .transform((val) => new Date(val))
    .optional()
    .nullable(),
});

// GET - List billing rates
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
    const serviceTypeId = searchParams.get("serviceTypeId");

    const whereClause: Record<string, unknown> = { companyId };
    if (activeOnly) {
      whereClause.isActive = true;
    }
    if (serviceTypeId) {
      whereClause.serviceTypeId = serviceTypeId;
    }

    const rates = await prisma.billingRate.findMany({
      where: whereClause,
      orderBy: [{ serviceTypeId: "asc" }, { effectiveDate: "desc" }],
      include: {
        serviceType: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        _count: {
          select: {
            clients: true,
            claimLines: true,
          },
        },
      },
    });

    return NextResponse.json({ rates });
  } catch (error) {
    console.error("Error fetching billing rates:", error);
    return NextResponse.json(
      { error: "Failed to fetch billing rates" },
      { status: 500 }
    );
  }
}

// POST - Create billing rate
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
    const validationResult = createBillingRateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Verify service type exists and belongs to company
    const serviceType = await prisma.serviceType.findFirst({
      where: { id: data.serviceTypeId, companyId },
    });

    if (!serviceType) {
      return NextResponse.json(
        { error: "Service type not found" },
        { status: 404 }
      );
    }

    // Validate date range
    if (data.endDate && data.endDate <= data.effectiveDate) {
      return NextResponse.json(
        { error: "End date must be after effective date" },
        { status: 400 }
      );
    }

    const rate = await prisma.billingRate.create({
      data: {
        name: data.name,
        rate: data.rate,
        effectiveDate: data.effectiveDate,
        endDate: data.endDate,
        serviceTypeId: data.serviceTypeId,
        companyId,
      },
      include: {
        serviceType: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "CREATE_BILLING_RATE",
        entityType: "BillingRate",
        entityId: rate.id,
        changes: data,
        userId,
        companyId,
      },
    });

    return NextResponse.json({ rate }, { status: 201 });
  } catch (error) {
    console.error("Error creating billing rate:", error);
    return NextResponse.json(
      { error: "Failed to create billing rate" },
      { status: 500 }
    );
  }
}
