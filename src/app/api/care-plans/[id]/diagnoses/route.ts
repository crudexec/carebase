import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/care-plans/[id]/diagnoses - List diagnoses for a care plan
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify care plan exists and belongs to company
    const carePlan = await prisma.carePlan.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
    });

    if (!carePlan) {
      return NextResponse.json(
        { error: "Care plan not found" },
        { status: 404 }
      );
    }

    const diagnoses = await prisma.carePlanDiagnosis.findMany({
      where: {
        carePlanId: id,
        isActive: true,
      },
      orderBy: [{ diagnosisType: "asc" }, { displayOrder: "asc" }],
    });

    return NextResponse.json({ diagnoses });
  } catch (error) {
    console.error("Error fetching diagnoses:", error);
    return NextResponse.json(
      { error: "Failed to fetch diagnoses" },
      { status: 500 }
    );
  }
}

const createDiagnosisSchema = z.object({
  icdCode: z.string().min(1, "ICD code is required"),
  icdDescription: z.string().min(1, "ICD description is required"),
  diagnosisType: z.enum(["PRIMARY", "SECONDARY", "ADMITTING", "PRINCIPAL"]).default("SECONDARY"),
  onsetDate: z.string().optional(),
  notes: z.string().optional(),
  displayOrder: z.number().optional(),
});

// POST /api/care-plans/[id]/diagnoses - Add diagnosis to care plan
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions
    if (
      !["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF"].includes(
        session.user.role
      )
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Verify care plan exists and belongs to company
    const carePlan = await prisma.carePlan.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
    });

    if (!carePlan) {
      return NextResponse.json(
        { error: "Care plan not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = createDiagnosisSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    // If setting as PRIMARY, unset any existing PRIMARY
    if (validation.data.diagnosisType === "PRIMARY") {
      await prisma.carePlanDiagnosis.updateMany({
        where: {
          carePlanId: id,
          diagnosisType: "PRIMARY",
        },
        data: {
          diagnosisType: "SECONDARY",
        },
      });
    }

    // Get max display order
    const maxOrder = await prisma.carePlanDiagnosis.aggregate({
      where: { carePlanId: id },
      _max: { displayOrder: true },
    });

    const diagnosis = await prisma.carePlanDiagnosis.create({
      data: {
        carePlanId: id,
        icdCode: validation.data.icdCode,
        icdDescription: validation.data.icdDescription,
        diagnosisType: validation.data.diagnosisType,
        onsetDate: validation.data.onsetDate
          ? new Date(validation.data.onsetDate)
          : null,
        notes: validation.data.notes,
        displayOrder: validation.data.displayOrder ?? (maxOrder._max.displayOrder || 0) + 1,
      },
    });

    return NextResponse.json({ diagnosis }, { status: 201 });
  } catch (error) {
    console.error("Error creating diagnosis:", error);
    return NextResponse.json(
      { error: "Failed to create diagnosis" },
      { status: 500 }
    );
  }
}

const updateDiagnosisSchema = z.object({
  diagnosisId: z.string().min(1),
  diagnosisType: z.enum(["PRIMARY", "SECONDARY", "ADMITTING", "PRINCIPAL"]).optional(),
  onsetDate: z.string().nullable().optional(),
  notes: z.string().optional(),
  displayOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

// PATCH /api/care-plans/[id]/diagnoses - Update diagnosis
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify care plan exists and belongs to company
    const carePlan = await prisma.carePlan.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
    });

    if (!carePlan) {
      return NextResponse.json(
        { error: "Care plan not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = updateDiagnosisSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { diagnosisId, ...updateData } = validation.data;

    // If setting as PRIMARY, unset any existing PRIMARY
    if (updateData.diagnosisType === "PRIMARY") {
      await prisma.carePlanDiagnosis.updateMany({
        where: {
          carePlanId: id,
          diagnosisType: "PRIMARY",
          NOT: { id: diagnosisId },
        },
        data: {
          diagnosisType: "SECONDARY",
        },
      });
    }

    const diagnosis = await prisma.carePlanDiagnosis.update({
      where: { id: diagnosisId },
      data: {
        ...updateData,
        onsetDate: updateData.onsetDate
          ? new Date(updateData.onsetDate)
          : updateData.onsetDate === null
          ? null
          : undefined,
      },
    });

    return NextResponse.json({ diagnosis });
  } catch (error) {
    console.error("Error updating diagnosis:", error);
    return NextResponse.json(
      { error: "Failed to update diagnosis" },
      { status: 500 }
    );
  }
}

// DELETE /api/care-plans/[id]/diagnoses - Delete diagnosis (soft delete)
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const diagnosisId = searchParams.get("diagnosisId");

    if (!diagnosisId) {
      return NextResponse.json(
        { error: "Diagnosis ID is required" },
        { status: 400 }
      );
    }

    // Verify care plan exists and belongs to company
    const carePlan = await prisma.carePlan.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
    });

    if (!carePlan) {
      return NextResponse.json(
        { error: "Care plan not found" },
        { status: 404 }
      );
    }

    // Soft delete
    await prisma.carePlanDiagnosis.update({
      where: { id: diagnosisId },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting diagnosis:", error);
    return NextResponse.json(
      { error: "Failed to delete diagnosis" },
      { status: 500 }
    );
  }
}
