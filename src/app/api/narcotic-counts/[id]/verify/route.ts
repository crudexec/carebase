import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { verifyNarcoticCountSchema } from "@/lib/emar/validation";
import { z } from "zod";

// POST /api/narcotic-counts/[id]/verify - Verify a narcotic count
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
    const validated = verifyNarcoticCountSchema.parse(body);

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

    // Cannot verify your own count
    if (existingCount.countedById === session.user.id) {
      return NextResponse.json(
        { error: "You cannot verify your own count" },
        { status: 400 }
      );
    }

    // Check if already verified
    if (existingCount.status === "VERIFIED") {
      return NextResponse.json(
        { error: "This count has already been verified" },
        { status: 400 }
      );
    }

    // Determine new status - if there's a discrepancy, keep it as DISCREPANCY
    const newStatus = existingCount.discrepancy !== 0 ? "DISCREPANCY" : "VERIFIED";

    // Update the count record
    const count = await prisma.narcoticCountRecord.update({
      where: { id },
      data: {
        verifiedById: session.user.id,
        verifiedBySignature: validated.verifiedBySignature,
        verifiedAt: new Date(),
        status: newStatus,
        discrepancyNotes: validated.discrepancyNotes,
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
    console.error("Error verifying narcotic count:", error);
    return NextResponse.json(
      { error: "Failed to verify narcotic count" },
      { status: 500 }
    );
  }
}
