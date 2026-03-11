import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma, OasisStatus, OasisTimePoint, OasisAssessorDiscipline } from "@prisma/client";
import { z } from "zod";

// GET /api/oasis/assessments - List OASIS assessments
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const status = searchParams.get("status") as OasisStatus | null;
    const timePoint = searchParams.get("timePoint") as OasisTimePoint | null;
    const assessorId = searchParams.get("assessorId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: Prisma.OasisAssessmentWhereInput = {
      companyId: session.user.companyId,
    };

    if (clientId) where.clientId = clientId;
    if (status) where.status = status;
    if (timePoint) where.timePoint = timePoint;
    if (assessorId) where.assessorId = assessorId;

    const [assessments, total] = await Promise.all([
      prisma.oasisAssessment.findMany({
        where,
        include: {
          template: {
            select: {
              id: true,
              name: true,
              version: true,
            },
          },
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              medicaidId: true,
            },
          },
          assessor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: { responses: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.oasisAssessment.count({ where }),
    ]);

    return NextResponse.json({ assessments, total });
  } catch (error) {
    console.error("Error fetching OASIS assessments:", error);
    return NextResponse.json(
      { error: "Failed to fetch OASIS assessments" },
      { status: 500 }
    );
  }
}

const createAssessmentSchema = z.object({
  templateId: z.string().min(1, "Template is required"),
  clientId: z.string().min(1, "Client is required"),
  timePoint: z.nativeEnum(OasisTimePoint),
  assessorDiscipline: z.nativeEnum(OasisAssessorDiscipline),
  m0090AssessmentDate: z.string().transform((s) => new Date(s)).optional(),
  m0030SocDate: z.string().transform((s) => new Date(s)).optional(),
});

// POST /api/oasis/assessments - Create new OASIS assessment
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

    const {
      templateId,
      clientId,
      timePoint,
      assessorDiscipline,
      m0090AssessmentDate,
      m0030SocDate,
    } = validation.data;

    // Verify template exists and is active
    const template = await prisma.oasisTemplate.findFirst({
      where: {
        id: templateId,
        OR: [
          { companyId: session.user.companyId },
          { companyId: null }, // Global templates
        ],
        status: "ACTIVE",
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Active template not found" },
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

    // Generate assessment number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
    const assessmentNumber = `OAS-${dateStr}-${randomPart}`;

    // Create assessment
    const assessment = await prisma.oasisAssessment.create({
      data: {
        companyId: session.user.companyId,
        assessmentNumber,
        templateId,
        clientId,
        assessorId: session.user.id,
        timePoint,
        assessorDiscipline,
        m0090AssessmentDate: m0090AssessmentDate || new Date(),
        m0030SocDate,
        status: "DRAFT",
      },
      include: {
        template: {
          include: {
            sections: {
              orderBy: { order: "asc" },
              include: {
                items: {
                  orderBy: { order: "asc" },
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
            medicaidId: true,
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
        action: "OASIS_ASSESSMENT_STARTED",
        entityType: "OasisAssessment",
        entityId: assessment.id,
        changes: {
          templateName: template.name,
          clientName: `${client.firstName} ${client.lastName}`,
          timePoint,
        },
      },
    });

    return NextResponse.json({ assessment }, { status: 201 });
  } catch (error) {
    console.error("Error creating OASIS assessment:", error);
    return NextResponse.json(
      { error: "Failed to create OASIS assessment" },
      { status: 500 }
    );
  }
}
