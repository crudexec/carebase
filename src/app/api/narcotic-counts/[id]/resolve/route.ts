import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { resolveDiscrepancySchema } from "@/lib/emar/validation";
import { z } from "zod";

// POST /api/narcotic-counts/[id]/resolve - Resolve a discrepancy
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = resolveDiscrepancySchema.parse(body);

    // Get the count record
    const existingCount = await prisma.narcoticCountRecord.findFirst({
      where: {
        id,
        inventory: {
          companyId: session.user.companyId,
        },
      },
    });

    if (!existingCount) {
      return NextResponse.json(
        { error: "Narcotic count not found" },
        { status: 404 }
      );
    }

    // Check if there's actually a discrepancy
    if (existingCount.status !== "DISCREPANCY") {
      return NextResponse.json(
        { error: "This count does not have a discrepancy to resolve" },
        { status: 400 }
      );
    }

    // Update the count record
    const count = await prisma.narcoticCountRecord.update({
      where: { id },
      data: {
        discrepancyResolution: validated.discrepancyResolution,
        resolvedAt: new Date(),
        resolvedById: session.user.id,
        status: "VERIFIED", // Mark as verified after resolution
      },
      include: {
        inventory: {
          include: {
            medication: {
              select: {
                id: true,
                name: true,
                strength: true,
                controlledSchedule: true,
              },
            },
          },
        },
        countedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        verifiedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        resolvedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    // Create audit log for discrepancy resolution
    await prisma.auditLog.create({
      data: {
        entityType: "NarcoticCountRecord",
        entityId: id,
        action: "DISCREPANCY_RESOLVED",
        changes: {
          discrepancy: existingCount.discrepancy,
          resolution: validated.discrepancyResolution,
        },
        userId: session.user.id,
        companyId: session.user.companyId,
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error resolving discrepancy:", error);
    return NextResponse.json(
      { error: "Failed to resolve discrepancy" },
      { status: 500 }
    );
  }
}
