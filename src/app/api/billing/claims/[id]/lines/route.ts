import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";
import { Decimal } from "@prisma/client/runtime/library";

// Validation schema for creating/updating claim line
const claimLineSchema = z.object({
  lineNumber: z.number().int().min(1).optional(),
  serviceDate: z.string().transform((val) => new Date(val)),
  hcpcsCode: z.string().min(1).max(10),
  modifiers: z.array(z.string().max(2)).max(4).optional().default([]),
  units: z.number().positive(),
  unitRate: z.number().positive(),
  diagnosisPointers: z.array(z.string()).min(1).max(4).default(["1"]),
  serviceTypeId: z.string().optional(),
  billingRateId: z.string().optional(),
  shiftId: z.string().optional(),
  shiftAttendanceId: z.string().optional(),
});

// GET - Get claim lines
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

    // Verify claim exists and belongs to company
    const claim = await prisma.claim.findFirst({
      where: { id, companyId },
      select: { id: true },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    const lines = await prisma.claimLine.findMany({
      where: { claimId: id },
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
    });

    return NextResponse.json({ lines });
  } catch (error) {
    console.error("Error fetching claim lines:", error);
    return NextResponse.json(
      { error: "Failed to fetch claim lines" },
      { status: 500 }
    );
  }
}

// POST - Add claim line
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
    const claim = await prisma.claim.findFirst({
      where: { id, companyId },
      include: {
        claimLines: {
          select: { lineNumber: true },
          orderBy: { lineNumber: "desc" },
          take: 1,
        },
      },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Can only modify DRAFT or REJECTED claims
    if (!["DRAFT", "REJECTED", "DENIED"].includes(claim.status)) {
      return NextResponse.json(
        { error: "Cannot modify claim in current status" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validationResult = claimLineSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Calculate line amount
    const lineAmount = Math.round(data.units * data.unitRate * 100) / 100;

    // Determine next line number
    const nextLineNumber =
      data.lineNumber || (claim.claimLines[0]?.lineNumber || 0) + 1;

    // Create claim line
    const line = await prisma.claimLine.create({
      data: {
        claimId: id,
        lineNumber: nextLineNumber,
        serviceDate: data.serviceDate,
        hcpcsCode: data.hcpcsCode,
        modifiers: data.modifiers,
        units: new Decimal(data.units),
        unitRate: new Decimal(data.unitRate),
        lineAmount: new Decimal(lineAmount),
        diagnosisPointer: data.diagnosisPointers,
        serviceTypeId: data.serviceTypeId,
        billingRateId: data.billingRateId,
        shiftId: data.shiftId,
        shiftAttendanceId: data.shiftAttendanceId,
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

    // Update claim totals
    const allLines = await prisma.claimLine.findMany({
      where: { claimId: id },
      select: { units: true, lineAmount: true },
    });

    const totalUnits = allLines.reduce(
      (sum, l) => sum + l.units.toNumber(),
      0
    );
    const totalAmount = allLines.reduce(
      (sum, l) => sum + l.lineAmount.toNumber(),
      0
    );

    await prisma.claim.update({
      where: { id },
      data: {
        totalUnits: new Decimal(totalUnits),
        totalAmount: new Decimal(totalAmount),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "ADD_CLAIM_LINE",
        entityType: "ClaimLine",
        entityId: line.id,
        changes: data,
        userId,
        companyId,
      },
    });

    return NextResponse.json({ line }, { status: 201 });
  } catch (error) {
    console.error("Error creating claim line:", error);
    return NextResponse.json(
      { error: "Failed to create claim line" },
      { status: 500 }
    );
  }
}
