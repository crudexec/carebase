import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import {
  createMedicationSchema,
  medicationsQuerySchema,
} from "@/lib/emar/validation";

// GET /api/medications - List medications
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission
    if (!hasPermission(session.user.role, PERMISSIONS.EMAR_VIEW)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = medicationsQuerySchema.safeParse({
      clientId: searchParams.get("clientId"),
      status: searchParams.get("status"),
      controlledOnly: searchParams.get("controlledOnly"),
      withoutInventory: searchParams.get("withoutInventory"),
      search: searchParams.get("search"),
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    });

    if (!query.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: query.error.format() },
        { status: 400 }
      );
    }

    const { clientId, status, controlledOnly, withoutInventory, search, page, limit } =
      query.data;
    const skip = (page - 1) * limit;

    const where: Prisma.MedicationWhereInput = {
      companyId: session.user.companyId,
    };

    if (clientId) where.clientId = clientId;
    if (status) where.status = status;
    if (controlledOnly) {
      where.controlledSchedule = { not: "NOT_CONTROLLED" };
    }
    if (withoutInventory) {
      where.inventoryRecords = { none: {} };
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { genericName: { contains: search, mode: "insensitive" } },
        { ndc: { contains: search, mode: "insensitive" } },
      ];
    }

    const [medications, total] = await Promise.all([
      prisma.medication.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          prescriber: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              npi: true,
            },
          },
          _count: {
            select: {
              scheduledDoses: true,
              administrations: true,
              refillRequests: true,
            },
          },
        },
        orderBy: [{ status: "asc" }, { name: "asc" }],
        take: limit,
        skip,
      }),
      prisma.medication.count({ where }),
    ]);

    // Transform to list items
    const medicationList = medications.map((med) => ({
      id: med.id,
      name: med.name,
      genericName: med.genericName,
      strength: med.strength,
      form: med.form,
      route: med.route,
      status: med.status,
      frequency: med.frequency,
      scheduledTimes: med.scheduledTimes,
      controlledSchedule: med.controlledSchedule,
      startDate: med.startDate,
      endDate: med.endDate,
      clientId: med.clientId,
      clientName: `${med.client.firstName} ${med.client.lastName}`,
      prescriberName: med.prescriber
        ? `${med.prescriber.firstName} ${med.prescriber.lastName}`
        : null,
      refillsRemaining: med.refillsRemaining,
      _count: med._count,
    }));

    return NextResponse.json({
      medications: medicationList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching medications:", error);
    return NextResponse.json(
      { error: "Failed to fetch medications" },
      { status: 500 }
    );
  }
}

// POST /api/medications - Create a new medication
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission
    if (!hasPermission(session.user.role, PERMISSIONS.EMAR_MANAGE_MEDICATIONS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = createMedicationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Verify client belongs to company
    const client = await prisma.client.findFirst({
      where: {
        id: data.clientId,
        companyId: session.user.companyId,
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Verify prescriber if provided
    if (data.prescriberId) {
      const prescriber = await prisma.physician.findFirst({
        where: {
          id: data.prescriberId,
          companyId: session.user.companyId,
        },
      });

      if (!prescriber) {
        return NextResponse.json(
          { error: "Prescriber not found" },
          { status: 404 }
        );
      }
    }

    // Auto-set requiresWitness for Schedule II controlled substances
    const requiresWitness =
      data.requiresWitness || data.controlledSchedule === "SCHEDULE_II";

    // Create the medication
    const medication = await prisma.medication.create({
      data: {
        name: data.name,
        genericName: data.genericName,
        ndc: data.ndc,
        strength: data.strength,
        form: data.form,
        route: data.route,
        doseAmount: data.doseAmount,
        frequency: data.frequency,
        frequencyOther: data.frequencyOther,
        scheduledTimes: data.scheduledTimes,
        prnReason: data.prnReason,
        maxDailyDoses: data.maxDailyDoses,
        startDate: data.startDate,
        endDate: data.endDate,
        controlledSchedule: data.controlledSchedule,
        requiresWitness,
        prescriberId: data.prescriberId,
        prescriptionNumber: data.prescriptionNumber,
        lastFillDate: data.lastFillDate,
        refillsRemaining: data.refillsRemaining,
        indication: data.indication,
        specialInstructions: data.specialInstructions,
        interactions: data.interactions || [],
        sideEffects: data.sideEffects || [],
        clientId: data.clientId,
        companyId: session.user.companyId,
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        prescriber: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            npi: true,
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "MEDICATION_CREATED",
        entityType: "Medication",
        entityId: medication.id,
        changes: {
          medicationName: medication.name,
          clientName: `${client.firstName} ${client.lastName}`,
          controlledSchedule: medication.controlledSchedule,
        },
      },
    });

    return NextResponse.json({ medication }, { status: 201 });
  } catch (error) {
    console.error("Error creating medication:", error);
    return NextResponse.json(
      { error: "Failed to create medication" },
      { status: 500 }
    );
  }
}
