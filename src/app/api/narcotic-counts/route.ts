import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createNarcoticCountSchema } from "@/lib/emar/validation";
import { z } from "zod";

// GET /api/narcotic-counts - List narcotic count records
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const inventoryId = searchParams.get("inventoryId");
    const status = searchParams.get("status");
    const shiftType = searchParams.get("shiftType");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

    const where: Record<string, unknown> = {
      inventory: {
        companyId: session.user.companyId,
      },
    };

    if (inventoryId) {
      where.inventoryId = inventoryId;
    }

    if (status) {
      where.status = status;
    }

    if (shiftType) {
      where.shiftType = shiftType;
    }

    if (startDate || endDate) {
      where.countTime = {};
      if (startDate) {
        (where.countTime as Record<string, Date>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.countTime as Record<string, Date>).lte = new Date(endDate);
      }
    }

    const [counts, total] = await Promise.all([
      prisma.narcoticCountRecord.findMany({
        where,
        include: {
          inventory: {
            include: {
              medication: {
                select: {
                  id: true,
                  name: true,
                  strength: true,
                  form: true,
                  controlledSchedule: true,
                  client: {
                    select: { id: true, firstName: true, lastName: true },
                  },
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
        orderBy: { countTime: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.narcoticCountRecord.count({ where }),
    ]);

    return NextResponse.json({
      counts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching narcotic counts:", error);
    return NextResponse.json(
      { error: "Failed to fetch narcotic counts" },
      { status: 500 }
    );
  }
}

// POST /api/narcotic-counts - Create a new narcotic count record
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = createNarcoticCountSchema.parse(body);

    // Verify inventory belongs to company
    const inventory = await prisma.medicationInventory.findFirst({
      where: {
        id: validated.inventoryId,
        companyId: session.user.companyId,
      },
      include: {
        medication: {
          select: {
            controlledSchedule: true,
          },
        },
      },
    });

    if (!inventory) {
      return NextResponse.json(
        { error: "Inventory item not found" },
        { status: 404 }
      );
    }

    // Check if medication is a controlled substance
    if (inventory.medication.controlledSchedule === "NOT_CONTROLLED") {
      return NextResponse.json(
        { error: "This medication is not a controlled substance" },
        { status: 400 }
      );
    }

    // Calculate discrepancy
    const discrepancy = validated.currentCount - validated.expectedCount;
    const status = discrepancy !== 0 ? "DISCREPANCY" : "PENDING";

    // Create the count record
    const countRecord = await prisma.narcoticCountRecord.create({
      data: {
        companyId: session.user.companyId,
        inventoryId: validated.inventoryId,
        shiftType: validated.shiftType,
        previousCount: validated.previousCount,
        currentCount: validated.currentCount,
        expectedCount: validated.expectedCount,
        discrepancy,
        status,
        countedById: session.user.id,
        countedBySignature: validated.countedBySignature,
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
      },
    });

    // Update inventory quantity
    await prisma.medicationInventory.update({
      where: { id: validated.inventoryId },
      data: {
        quantityOnHand: validated.currentCount,
        lastVerifiedAt: new Date(),
        lastVerifiedById: session.user.id,
      },
    });

    return NextResponse.json({ count: countRecord }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating narcotic count:", error);
    return NextResponse.json(
      { error: "Failed to create narcotic count" },
      { status: 500 }
    );
  }
}
