import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateInventorySchema as _updateInventorySchema } from "@/lib/emar/validation";
import { z } from "zod";

// GET /api/narcotic-inventory - List controlled substance inventory
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const medicationId = searchParams.get("medicationId");
    const lowInventoryOnly = searchParams.get("lowInventoryOnly") === "true";

    // Build where clause
    const where: Record<string, unknown> = {
      companyId: session.user.companyId,
      medication: {
        controlledSchedule: {
          not: "NOT_CONTROLLED",
        },
        status: "ACTIVE",
      },
    };

    if (medicationId) {
      where.medicationId = medicationId;
    }

    const inventory = await prisma.medicationInventory.findMany({
      where,
      include: {
        medication: {
          select: {
            id: true,
            name: true,
            genericName: true,
            strength: true,
            form: true,
            controlledSchedule: true,
            client: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
        lastVerifiedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        countRecords: {
          orderBy: { countTime: "desc" },
          take: 1,
          select: {
            id: true,
            countTime: true,
            shiftType: true,
            status: true,
            currentCount: true,
            discrepancy: true,
          },
        },
      },
      orderBy: [
        { medication: { name: "asc" } },
      ],
    });

    // Filter for low inventory if requested
    let filteredInventory = inventory;
    if (lowInventoryOnly) {
      filteredInventory = inventory.filter(
        (item) =>
          item.lowInventoryThreshold !== null &&
          item.quantityOnHand <= item.lowInventoryThreshold
      );
    }

    // Transform for response
    const items = filteredInventory.map((item) => ({
      id: item.id,
      medicationId: item.medication.id,
      medicationName: item.medication.name,
      genericName: item.medication.genericName,
      strength: item.medication.strength,
      form: item.medication.form,
      controlledSchedule: item.medication.controlledSchedule,
      clientId: item.medication.client.id,
      clientName: `${item.medication.client.firstName} ${item.medication.client.lastName}`,
      quantityOnHand: item.quantityOnHand,
      lotNumber: item.lotNumber,
      expirationDate: item.expirationDate,
      lowInventoryThreshold: item.lowInventoryThreshold,
      isLowInventory:
        item.lowInventoryThreshold !== null &&
        item.quantityOnHand <= item.lowInventoryThreshold,
      lastVerifiedAt: item.lastVerifiedAt,
      lastVerifiedByName: item.lastVerifiedBy
        ? `${item.lastVerifiedBy.firstName} ${item.lastVerifiedBy.lastName}`
        : null,
      lastCount: item.countRecords[0] || null,
    }));

    return NextResponse.json({ inventory: items });
  } catch (error) {
    console.error("Error fetching narcotic inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch narcotic inventory" },
      { status: 500 }
    );
  }
}

// POST /api/narcotic-inventory - Create inventory for a controlled medication
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate
    const schema = z.object({
      medicationId: z.string().min(1),
      quantityOnHand: z.number().int().min(0),
      lotNumber: z.string().optional(),
      expirationDate: z.coerce.date().optional(),
      lowInventoryThreshold: z.number().int().min(0).optional(),
    });

    const validated = schema.parse(body);

    // Verify medication exists and is controlled
    const medication = await prisma.medication.findFirst({
      where: {
        id: validated.medicationId,
        companyId: session.user.companyId,
      },
    });

    if (!medication) {
      return NextResponse.json(
        { error: "Medication not found" },
        { status: 404 }
      );
    }

    if (medication.controlledSchedule === "NOT_CONTROLLED") {
      return NextResponse.json(
        { error: "This medication is not a controlled substance" },
        { status: 400 }
      );
    }

    // Check if inventory already exists
    const existingInventory = await prisma.medicationInventory.findFirst({
      where: {
        medicationId: validated.medicationId,
      },
    });

    if (existingInventory) {
      return NextResponse.json(
        { error: "Inventory already exists for this medication" },
        { status: 400 }
      );
    }

    // Create inventory
    const inventory = await prisma.medicationInventory.create({
      data: {
        medicationId: validated.medicationId,
        companyId: session.user.companyId,
        quantityOnHand: validated.quantityOnHand,
        lotNumber: validated.lotNumber,
        expirationDate: validated.expirationDate,
        lowInventoryThreshold: validated.lowInventoryThreshold,
        lastVerifiedById: session.user.id,
      },
      include: {
        medication: {
          select: {
            id: true,
            name: true,
            strength: true,
            controlledSchedule: true,
          },
        },
        lastVerifiedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json({ inventory }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating narcotic inventory:", error);
    return NextResponse.json(
      { error: "Failed to create narcotic inventory" },
      { status: 500 }
    );
  }
}
