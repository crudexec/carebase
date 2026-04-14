import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import {
  buildAssessmentTemplateSnapshot,
  parseAssessmentTemplateSnapshot,
} from "@/lib/assessments/snapshots";

// GET /api/assessments - List assessments
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const intakeId = searchParams.get("intakeId");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: Prisma.AssessmentWhereInput = {
      companyId: session.user.companyId,
    };

    if (clientId) where.clientId = clientId;
    if (intakeId) where.intakeId = intakeId;
    if (status) where.status = status;

    const [assessments, total] = await Promise.all([
      prisma.assessment.findMany({
        where,
        include: {
          template: {
            select: {
              id: true,
              name: true,
              description: true,
              maxScore: true,
            },
          },
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          assessor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { startedAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.assessment.count({ where }),
    ]);

    return NextResponse.json({
      assessments: assessments.map((assessment) => {
        const snapshot = parseAssessmentTemplateSnapshot(
          assessment.formSchemaSnapshot as Prisma.JsonValue | null
        );

        return {
          ...assessment,
          template: snapshot
            ? {
                id: snapshot.templateId,
                name: snapshot.templateName,
                description: snapshot.description || null,
                maxScore: snapshot.scoringConfig.maxScore ?? null,
                version: snapshot.version,
              }
            : {
                ...assessment.template,
                version: assessment.templateVersion ?? null,
              },
        };
      }),
      total,
    });
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessments" },
      { status: 500 }
    );
  }
}

const createAssessmentSchema = z.object({
  templateId: z.string().min(1, "Template is required"),
  clientId: z.string().min(1, "Client is required"),
  intakeId: z.string().optional(),
  assessmentType: z.enum(["INITIAL", "REASSESSMENT", "DISCHARGE"]).default("INITIAL"),
});

// POST /api/assessments - Create new assessment
export async function POST(request: Request) {
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

    const body = await request.json();
    const validation = createAssessmentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { templateId, clientId, intakeId, assessmentType } = validation.data;

    // Verify template exists
    const template = await prisma.assessmentTemplate.findUnique({
      where: { id: templateId },
      include: {
        sections: {
          orderBy: { displayOrder: "asc" },
          include: {
            items: {
              orderBy: { displayOrder: "asc" },
            },
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Verify client exists and belongs to company
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        companyId: session.user.companyId,
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const snapshot = buildAssessmentTemplateSnapshot(template);

    // Create assessment
    const assessment = await prisma.assessment.create({
      data: {
        companyId: session.user.companyId,
        templateId,
        templateVersion: template.version,
        formSchemaSnapshot: snapshot as unknown as Prisma.InputJsonValue,
        clientId,
        intakeId,
        assessorId: session.user.id,
        assessmentType,
        status: "IN_PROGRESS",
      },
      include: {
        template: {
          include: {
            sections: {
              orderBy: { displayOrder: "asc" },
              include: {
                items: {
                  orderBy: { displayOrder: "asc" },
                },
              },
            },
          },
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        assessor: {
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
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "ASSESSMENT_STARTED",
        entityType: "Assessment",
        entityId: assessment.id,
        changes: {
          templateName: template.name,
          clientName: `${client.firstName} ${client.lastName}`,
          assessmentType,
        },
      },
    });

    return NextResponse.json({
      assessment: {
        ...assessment,
        templateVersion: assessment.templateVersion,
        formSchemaSnapshot: snapshot,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating assessment:", error);
    return NextResponse.json(
      { error: "Failed to create assessment" },
      { status: 500 }
    );
  }
}
