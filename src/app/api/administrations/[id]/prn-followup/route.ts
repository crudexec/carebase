import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { prnFollowupSchema } from "@/lib/emar/validation";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/administrations/[id]/prn-followup
 * Record PRN effectiveness follow-up
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, id: userId } = session.user;

    if (!companyId) {
      return NextResponse.json(
        { error: "User not associated with a company" },
        { status: 400 }
      );
    }

    const params = await context.params;
    const { id } = params;

    // Get the administration record
    const existingAdmin = await prisma.medicationAdministration.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        medication: {
          select: {
            id: true,
            name: true,
            frequency: true,
          },
        },
      },
    });

    if (!existingAdmin) {
      return NextResponse.json(
        { error: "Administration not found" },
        { status: 404 }
      );
    }

    // Verify this was a PRN medication
    if (existingAdmin.medication.frequency !== "AS_NEEDED_PRN") {
      return NextResponse.json(
        { error: "PRN follow-up only applicable for PRN medications" },
        { status: 400 }
      );
    }

    // Verify the administration was given
    if (existingAdmin.result !== "GIVEN") {
      return NextResponse.json(
        { error: "PRN follow-up only applicable for administered medications" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = prnFollowupSchema.parse(body);

    // Update the administration with follow-up data
    const administration = await prisma.medicationAdministration.update({
      where: { id },
      data: {
        prnFollowupAssessment: validatedData.prnFollowupAssessment,
        prnEffective: validatedData.prnEffective,
      },
      include: {
        medication: {
          select: {
            id: true,
            name: true,
            strength: true,
            form: true,
          },
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        administeredBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId,
        companyId,
        action: "PRN_FOLLOWUP_RECORDED",
        entityType: "MedicationAdministration",
        entityId: administration.id,
        changes: {
          medicationName: existingAdmin.medication.name,
          prnEffective: validatedData.prnEffective,
          prnFollowupAssessment: validatedData.prnFollowupAssessment,
        },
      },
    });

    return NextResponse.json(administration);
  } catch (error) {
    console.error("Error recording PRN follow-up:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to record PRN follow-up" },
      { status: 500 }
    );
  }
}
