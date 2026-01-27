import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";

// Validation schema for updating billing rate
const updateBillingRateSchema = z.object({
  name: z.string().min(1, "Name is required").max(255).optional(),
  rate: z.number().positive("Rate must be positive").optional(),
  effectiveDate: z
    .string()
    .transform((val) => new Date(val))
    .optional(),
  endDate: z
    .string()
    .transform((val) => new Date(val))
    .optional()
    .nullable(),
  isActive: z.boolean().optional(),
});

// GET - Get single billing rate
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

    const rate = await prisma.billingRate.findFirst({
      where: { id, companyId },
      include: {
        serviceType: true,
        _count: {
          select: {
            clients: true,
            claimLines: true,
          },
        },
      },
    });

    if (!rate) {
      return NextResponse.json(
        { error: "Billing rate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ rate });
  } catch (error) {
    console.error("Error fetching billing rate:", error);
    return NextResponse.json(
      { error: "Failed to fetch billing rate" },
      { status: 500 }
    );
  }
}

// PATCH - Update billing rate
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

    // Verify rate exists and belongs to company
    const existingRate = await prisma.billingRate.findFirst({
      where: { id, companyId },
    });

    if (!existingRate) {
      return NextResponse.json(
        { error: "Billing rate not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validationResult = updateBillingRateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Validate date range if both are provided
    const effectiveDate = data.effectiveDate || existingRate.effectiveDate;
    const endDate = data.endDate !== undefined ? data.endDate : existingRate.endDate;
    if (endDate && endDate <= effectiveDate) {
      return NextResponse.json(
        { error: "End date must be after effective date" },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.rate !== undefined) updateData.rate = data.rate;
    if (data.effectiveDate !== undefined) updateData.effectiveDate = data.effectiveDate;
    if (data.endDate !== undefined) updateData.endDate = data.endDate;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const rate = await prisma.billingRate.update({
      where: { id },
      data: updateData,
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
        action: "UPDATE_BILLING_RATE",
        entityType: "BillingRate",
        entityId: id,
        changes: JSON.parse(JSON.stringify({ before: existingRate, after: updateData })),
        userId,
        companyId,
      },
    });

    return NextResponse.json({ rate });
  } catch (error) {
    console.error("Error updating billing rate:", error);
    return NextResponse.json(
      { error: "Failed to update billing rate" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete (deactivate) billing rate
export async function DELETE(
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

    // Verify rate exists and belongs to company
    const existingRate = await prisma.billingRate.findFirst({
      where: { id, companyId },
      include: {
        _count: {
          select: {
            claimLines: true,
          },
        },
      },
    });

    if (!existingRate) {
      return NextResponse.json(
        { error: "Billing rate not found" },
        { status: 404 }
      );
    }

    // If rate is used in claims, just deactivate it
    if (existingRate._count.claimLines > 0) {
      await prisma.billingRate.update({
        where: { id },
        data: { isActive: false },
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          action: "DEACTIVATE_BILLING_RATE",
          entityType: "BillingRate",
          entityId: id,
          changes: { reason: "Used in existing claims" },
          userId,
          companyId,
        },
      });

      return NextResponse.json({
        message: "Billing rate deactivated (used in existing claims)",
      });
    }

    // Otherwise, hard delete
    await prisma.billingRate.delete({
      where: { id },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "DELETE_BILLING_RATE",
        entityType: "BillingRate",
        entityId: id,
        changes: existingRate,
        userId,
        companyId,
      },
    });

    return NextResponse.json({ message: "Billing rate deleted" });
  } catch (error) {
    console.error("Error deleting billing rate:", error);
    return NextResponse.json(
      { error: "Failed to delete billing rate" },
      { status: 500 }
    );
  }
}
