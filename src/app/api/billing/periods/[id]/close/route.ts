import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";

// POST - Close billing period
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId, companyId, role } = session.user;
    const { id: periodId } = await params;

    // Check permission
    if (
      !hasAnyPermission(role, [
        PERMISSIONS.BILLING_MANAGE,
        PERMISSIONS.BILLING_FULL,
      ])
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify period exists and is OPEN
    const period = await prisma.billingPeriod.findFirst({
      where: { id: periodId, companyId },
      include: {
        claims: {
          select: {
            id: true,
            status: true,
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

    if (period.status !== "OPEN") {
      return NextResponse.json(
        { error: "Billing period is already closed" },
        { status: 400 }
      );
    }

    // Check if there are any DRAFT claims
    const draftClaims = period.claims.filter((c) => c.status === "DRAFT");
    if (draftClaims.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot close period with draft claims",
          draftClaimsCount: draftClaims.length,
        },
        { status: 400 }
      );
    }

    // Close the period
    const updatedPeriod = await prisma.billingPeriod.update({
      where: { id: periodId },
      data: {
        status: "CLOSED",
        closedAt: new Date(),
        closedById: userId,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "CLOSE_BILLING_PERIOD",
        entityType: "BillingPeriod",
        entityId: periodId,
        changes: { status: "CLOSED", closedAt: new Date() },
        userId,
        companyId,
      },
    });

    return NextResponse.json({
      message: "Billing period closed successfully",
      period: updatedPeriod,
    });
  } catch (error) {
    console.error("Error closing billing period:", error);
    return NextResponse.json(
      { error: "Failed to close billing period" },
      { status: 500 }
    );
  }
}
