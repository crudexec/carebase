import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";

// Validation schema for updating claim
const updateClaimSchema = z.object({
  status: z
    .enum([
      "DRAFT",
      "READY",
      "SUBMITTED",
      "ACCEPTED",
      "REJECTED",
      "DENIED",
      "PAID",
      "PARTIALLY_PAID",
    ])
    .optional(),
  diagnosisCodes: z.array(z.string()).optional(),
  notes: z.string().max(2000).optional().nullable(),
  paidAmount: z.number().optional().nullable(),
  denialReason: z.string().max(500).optional().nullable(),
});

// GET - Get single claim with lines
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

    const claim = await prisma.claim.findFirst({
      where: { id, companyId },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            medicaidId: true,
            diagnosisCodes: true,
          },
        },
        billingPeriod: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        claimLines: {
          orderBy: { lineNumber: "asc" },
          include: {
            serviceType: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
            billingRate: {
              select: {
                id: true,
                name: true,
                rate: true,
              },
            },
          },
        },
        submissions: {
          orderBy: { submittedAt: "desc" },
          take: 10,
        },
      },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    return NextResponse.json({ claim });
  } catch (error) {
    console.error("Error fetching claim:", error);
    return NextResponse.json(
      { error: "Failed to fetch claim" },
      { status: 500 }
    );
  }
}

// PATCH - Update claim
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

    // Verify claim exists and belongs to company
    const existingClaim = await prisma.claim.findFirst({
      where: { id, companyId },
    });

    if (!existingClaim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Cannot modify submitted or paid claims
    if (["SUBMITTED", "ACCEPTED", "PAID"].includes(existingClaim.status)) {
      return NextResponse.json(
        { error: "Cannot modify a submitted or paid claim" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validationResult = updateClaimSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.diagnosisCodes !== undefined)
      updateData.diagnosisCodes = data.diagnosisCodes;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.paidAmount !== undefined) updateData.paidAmount = data.paidAmount;
    if (data.denialReason !== undefined)
      updateData.denialReason = data.denialReason;

    // Set paidAt if marking as PAID
    if (data.status === "PAID" || data.status === "PARTIALLY_PAID") {
      updateData.paidAt = new Date();
    }

    const claim = await prisma.claim.update({
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

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "UPDATE_CLAIM",
        entityType: "Claim",
        entityId: id,
        changes: JSON.parse(JSON.stringify({ before: existingClaim, after: updateData })),
        userId,
        companyId,
      },
    });

    return NextResponse.json({ claim });
  } catch (error) {
    console.error("Error updating claim:", error);
    return NextResponse.json(
      { error: "Failed to update claim" },
      { status: 500 }
    );
  }
}

// DELETE - Delete claim
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

    // Verify claim exists and belongs to company
    const existingClaim = await prisma.claim.findFirst({
      where: { id, companyId },
    });

    if (!existingClaim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Can only delete DRAFT claims
    if (existingClaim.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Can only delete draft claims" },
        { status: 400 }
      );
    }

    await prisma.claim.delete({
      where: { id },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "DELETE_CLAIM",
        entityType: "Claim",
        entityId: id,
        changes: existingClaim,
        userId,
        companyId,
      },
    });

    return NextResponse.json({ message: "Claim deleted" });
  } catch (error) {
    console.error("Error deleting claim:", error);
    return NextResponse.json(
      { error: "Failed to delete claim" },
      { status: 500 }
    );
  }
}
