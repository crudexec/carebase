import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";

// Validation schema for updating service type
const updateServiceTypeSchema = z.object({
  code: z
    .string()
    .min(1, "HCPCS code is required")
    .max(10, "HCPCS code too long")
    .optional(),
  name: z.string().min(1, "Name is required").max(255).optional(),
  description: z.string().max(1000).optional().nullable(),
  unitType: z.enum(["HOURLY", "QUARTER_HOURLY", "DAILY"]).optional(),
  isActive: z.boolean().optional(),
});

// GET - Get single service type
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

    const serviceType = await prisma.serviceType.findFirst({
      where: { id, companyId },
      include: {
        billingRates: {
          where: { isActive: true },
          orderBy: { effectiveDate: "desc" },
        },
        _count: {
          select: {
            claimLines: true,
          },
        },
      },
    });

    if (!serviceType) {
      return NextResponse.json(
        { error: "Service type not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ serviceType });
  } catch (error) {
    console.error("Error fetching service type:", error);
    return NextResponse.json(
      { error: "Failed to fetch service type" },
      { status: 500 }
    );
  }
}

// PATCH - Update service type
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

    // Verify service type exists and belongs to company
    const existingType = await prisma.serviceType.findFirst({
      where: { id, companyId },
    });

    if (!existingType) {
      return NextResponse.json(
        { error: "Service type not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validationResult = updateServiceTypeSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // If changing code, check for duplicates
    if (data.code && data.code.toUpperCase() !== existingType.code) {
      const duplicateType = await prisma.serviceType.findUnique({
        where: {
          companyId_code: {
            companyId,
            code: data.code.toUpperCase(),
          },
        },
      });

      if (duplicateType) {
        return NextResponse.json(
          { error: "A service type with this HCPCS code already exists" },
          { status: 409 }
        );
      }
    }

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (data.code !== undefined) updateData.code = data.code.toUpperCase();
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.unitType !== undefined) updateData.unitType = data.unitType;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const serviceType = await prisma.serviceType.update({
      where: { id },
      data: updateData,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "UPDATE_SERVICE_TYPE",
        entityType: "ServiceType",
        entityId: id,
        changes: JSON.parse(JSON.stringify({ before: existingType, after: updateData })),
        userId,
        companyId,
      },
    });

    return NextResponse.json({ serviceType });
  } catch (error) {
    console.error("Error updating service type:", error);
    return NextResponse.json(
      { error: "Failed to update service type" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete (deactivate) service type
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

    // Verify service type exists and belongs to company
    const existingType = await prisma.serviceType.findFirst({
      where: { id, companyId },
      include: {
        _count: {
          select: {
            claimLines: true,
          },
        },
      },
    });

    if (!existingType) {
      return NextResponse.json(
        { error: "Service type not found" },
        { status: 404 }
      );
    }

    // If service type is used in claims, just deactivate it
    if (existingType._count.claimLines > 0) {
      await prisma.serviceType.update({
        where: { id },
        data: { isActive: false },
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          action: "DEACTIVATE_SERVICE_TYPE",
          entityType: "ServiceType",
          entityId: id,
          changes: { reason: "Used in existing claims" },
          userId,
          companyId,
        },
      });

      return NextResponse.json({
        message: "Service type deactivated (used in existing claims)",
      });
    }

    // Otherwise, hard delete
    await prisma.serviceType.delete({
      where: { id },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "DELETE_SERVICE_TYPE",
        entityType: "ServiceType",
        entityId: id,
        changes: existingType,
        userId,
        companyId,
      },
    });

    return NextResponse.json({ message: "Service type deleted" });
  } catch (error) {
    console.error("Error deleting service type:", error);
    return NextResponse.json(
      { error: "Failed to delete service type" },
      { status: 500 }
    );
  }
}
