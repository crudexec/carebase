import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";

// Validation schema for updating billing period
const updateBillingPeriodSchema = z.object({
  name: z.string().max(255).optional(),
  notes: z.string().max(1000).optional().nullable(),
});

// GET - Get single billing period with claims
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role } = session.user;
    const { id } = await params;

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

    const period = await prisma.billingPeriod.findFirst({
      where: { id, companyId },
      include: {
        claims: {
          orderBy: { createdAt: "desc" },
          include: {
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            _count: {
              select: {
                claimLines: true,
                submissions: true,
              },
            },
          },
        },
      },
    });

    if (!period) {
      return NextResponse.json(
        { error: "Billing period not found" },
        { status: 404 }
      );
    }

    // Calculate stats
    const stats = {
      totalClaims: period.claims.length,
      totalAmount: period.claims.reduce(
        (sum, claim) => sum + claim.totalAmount.toNumber(),
        0
      ),
      byStatus: period.claims.reduce(
        (acc, claim) => ({
          ...acc,
          [claim.status]: (acc[claim.status] || 0) + 1,
        }),
        {} as Record<string, number>
      ),
    };

    return NextResponse.json({
      period: {
        ...period,
        stats,
      },
    });
  } catch (error) {
    console.error("Error fetching billing period:", error);
    return NextResponse.json(
      { error: "Failed to fetch billing period" },
      { status: 500 }
    );
  }
}

// PATCH - Update billing period
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId, companyId, role } = session.user;
    const { id } = await params;

    // Check permission
    if (
      !hasAnyPermission(role, [
        PERMISSIONS.BILLING_MANAGE,
        PERMISSIONS.BILLING_FULL,
      ])
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify period exists and belongs to company
    const existingPeriod = await prisma.billingPeriod.findFirst({
      where: { id, companyId },
    });

    if (!existingPeriod) {
      return NextResponse.json(
        { error: "Billing period not found" },
        { status: 404 }
      );
    }

    // Can only update OPEN periods
    if (existingPeriod.status !== "OPEN") {
      return NextResponse.json(
        { error: "Can only update open billing periods" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validationResult = updateBillingPeriodSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const period = await prisma.billingPeriod.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "UPDATE_BILLING_PERIOD",
        entityType: "BillingPeriod",
        entityId: id,
        changes: data,
        userId,
        companyId,
      },
    });

    return NextResponse.json({ period });
  } catch (error) {
    console.error("Error updating billing period:", error);
    return NextResponse.json(
      { error: "Failed to update billing period" },
      { status: 500 }
    );
  }
}
