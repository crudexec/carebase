import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const responseValueSchema = z.object({
  text: z.string().optional(),
  number: z.number().optional(),
  boolean: z.boolean().optional(),
  date: z.string().transform((s) => new Date(s)).optional(),
  json: z.unknown().optional(),
});

const saveResponsesSchema = z.object({
  responses: z.record(z.string(), responseValueSchema),
  isDraft: z.boolean().default(true),
});

// POST /api/oasis/assessments/[id]/responses - Save assessment responses
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validation = saveResponsesSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { responses, isDraft } = validation.data;

    // Verify assessment exists and belongs to company
    const assessment = await prisma.oasisAssessment.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Check if user can modify this assessment
    const canModify =
      session.user.id === assessment.assessorId ||
      ["ADMIN", "CLINICAL_DIRECTOR", "OPS_MANAGER"].includes(session.user.role);

    if (!canModify) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Don't allow modification if exported
    if (assessment.status === "EXPORTED") {
      return NextResponse.json(
        { error: "Cannot modify exported assessment" },
        { status: 400 }
      );
    }

    // Upsert responses in a transaction
    await prisma.$transaction(async (tx) => {
      for (const [itemCode, value] of Object.entries(responses)) {
        await tx.oasisResponse.upsert({
          where: {
            assessmentId_itemCode: {
              assessmentId: id,
              itemCode,
            },
          },
          create: {
            assessmentId: id,
            itemCode,
            valueText: value.text,
            valueNumber: value.number,
            valueBoolean: value.boolean,
            valueDate: value.date,
            valueJson: value.json as object,
          },
          update: {
            valueText: value.text,
            valueNumber: value.number,
            valueBoolean: value.boolean,
            valueDate: value.date,
            valueJson: value.json as object,
          },
        });
      }

      // Update assessment status
      const newStatus = isDraft ? "IN_PROGRESS" : assessment.status;
      if (assessment.status === "DRAFT" || (isDraft && assessment.status !== "EXPORTED")) {
        await tx.oasisAssessment.update({
          where: { id },
          data: { status: newStatus },
        });
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: isDraft ? "OASIS_RESPONSES_SAVED" : "OASIS_RESPONSES_UPDATED",
        entityType: "OasisAssessment",
        entityId: id,
        changes: {
          responseCount: Object.keys(responses).length,
          isDraft,
        },
      },
    });

    return NextResponse.json({
      success: true,
      savedCount: Object.keys(responses).length,
    });
  } catch (error) {
    console.error("Error saving OASIS responses:", error);
    return NextResponse.json(
      { error: "Failed to save responses" },
      { status: 500 }
    );
  }
}

// GET /api/oasis/assessments/[id]/responses - Get assessment responses
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify assessment exists and belongs to company
    const assessment = await prisma.oasisAssessment.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    const responses = await prisma.oasisResponse.findMany({
      where: { assessmentId: id },
    });

    // Convert to map format
    const responsesMap: Record<string, unknown> = {};
    for (const response of responses) {
      responsesMap[response.itemCode] = {
        text: response.valueText,
        number: response.valueNumber,
        boolean: response.valueBoolean,
        date: response.valueDate,
        json: response.valueJson,
      };
    }

    return NextResponse.json({ responses: responsesMap });
  } catch (error) {
    console.error("Error fetching OASIS responses:", error);
    return NextResponse.json(
      { error: "Failed to fetch responses" },
      { status: 500 }
    );
  }
}
