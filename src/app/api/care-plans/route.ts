import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

// GET /api/care-plans - List care plans
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: Prisma.CarePlanWhereInput = {
      companyId: session.user.companyId,
    };

    if (clientId) where.clientId = clientId;
    if (status) where.status = status as Prisma.CarePlanWhereInput["status"];

    const [carePlans, total] = await Promise.all([
      prisma.carePlan.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          clinicalReviewedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          physician: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              npi: true,
            },
          },
          caseManager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          taskTemplates: {
            orderBy: { displayOrder: "asc" },
          },
          _count: {
            select: {
              diagnoses: true,
              orders: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.carePlan.count({ where }),
    ]);

    return NextResponse.json({ carePlans, total });
  } catch (error) {
    console.error("Error fetching care plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch care plans" },
      { status: 500 }
    );
  }
}

const createCarePlanSchema = z.object({
  // Required fields
  clientId: z.string().min(1, "Client is required"),

  // Template (optional)
  templateId: z.string().optional().nullable(),

  // Optional identifiers
  intakeId: z.string().optional().nullable(),

  // Status
  status: z.enum([
    "DRAFT",
    "PENDING_CLINICAL_REVIEW",
    "CLINICAL_APPROVED",
    "PENDING_CLIENT_SIGNATURE",
    "ACTIVE",
    "REVISED",
    "COMPLETED",
    "CANCELLED"
  ]).optional(),

  // Dates
  effectiveDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  certStartDate: z.string().optional().nullable(),
  certEndDate: z.string().optional().nullable(),
  signatureSentDate: z.string().optional().nullable(),
  signatureReceivedDate: z.string().optional().nullable(),
  verbalSOCDate: z.string().optional().nullable(),

  // Plan content
  summary: z.string().optional().nullable(),
  goals: z.any().optional().nullable(), // JSON
  interventions: z.any().optional().nullable(), // JSON
  frequency: z.any().optional().nullable(), // JSON
  internalNotes: z.string().optional().nullable(),

  // Clinical Information
  medications: z.string().optional().nullable(),
  dmeSupplies: z.string().optional().nullable(),
  safetyMeasures: z.string().optional().nullable(),
  nutritionalRequirements: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),

  // Functional Status
  functionalLimitations: z.array(z.string()).optional(),
  otherFunctionalLimit: z.string().optional().nullable(),
  activitiesPermitted: z.array(z.string()).optional(),
  otherActivitiesPermit: z.string().optional().nullable(),
  mentalStatus: z.array(z.string()).optional(),
  otherMentalStatus: z.string().optional().nullable(),
  prognosis: z.string().optional().nullable(),

  // Clinical Narratives
  cognitiveStatus: z.string().optional().nullable(),
  rehabPotential: z.string().optional().nullable(),
  dischargePlan: z.string().optional().nullable(),
  riskIntervention: z.string().optional().nullable(),
  advancedDirectives: z.string().optional().nullable(),
  caregiverNeeds: z.string().optional().nullable(),
  homeboundStatus: z.string().optional().nullable(),
  carePreferences: z.string().optional().nullable(),

  // Care level
  careLevel: z.string().optional().nullable(),
  recommendedHours: z.number().optional().nullable(),

  // Physician / Case Manager
  physicianId: z.string().optional().nullable(),
  caseManagerId: z.string().optional().nullable(),
  physicianCertStatement: z.string().optional().nullable(),

  // Manual physician entry fields
  physicianName: z.string().optional().nullable(),
  physicianNpi: z.string().optional().nullable(),
  physicianPhone: z.string().optional().nullable(),
  physicianFax: z.string().optional().nullable(),

  // 485 Certification
  isCert485: z.boolean().optional(),
  cert485Orders: z.string().optional().nullable(),
  cert485Goals: z.string().optional().nullable(),

  // QA
  qaStatus: z.enum(["IN_USE", "COMPLETED"]).optional().nullable(),
  qaNotes: z.string().optional().nullable(),

  // Signatures
  nurseSignature: z.string().optional().nullable(),
  nurseSignedAt: z.string().optional().nullable(),
  clinicalNotes: z.string().optional().nullable(),
  clientSignature: z.string().optional().nullable(),
  clientSignedAt: z.string().optional().nullable(),
  clientSignerName: z.string().optional().nullable(),
  clientSignerRelation: z.string().optional().nullable(),

  // Template form data
  formData: z.any().optional().nullable(),
});

// POST /api/care-plans - Create new care plan
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
    const validation = createCarePlanSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Verify client exists and belongs to company
    const client = await prisma.client.findFirst({
      where: {
        id: data.clientId,
        companyId: session.user.companyId,
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // If templateId is provided, fetch the template and create a snapshot
    let templateData: {
      templateId?: string;
      templateVersion?: number;
      formSchemaSnapshot?: Prisma.InputJsonValue;
    } = {};

    if (data.templateId) {
      const template = await prisma.carePlanTemplate.findFirst({
        where: {
          id: data.templateId,
          companyId: session.user.companyId,
        },
        include: {
          sections: {
            orderBy: { order: "asc" },
            include: {
              fields: {
                orderBy: { order: "asc" },
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

      // Create schema snapshot
      const schemaSnapshot = {
        templateId: template.id,
        templateName: template.name,
        version: template.version,
        includesDiagnoses: template.includesDiagnoses,
        includesGoals: template.includesGoals,
        includesInterventions: template.includesInterventions,
        includesMedications: template.includesMedications,
        includesOrders: template.includesOrders,
        sections: template.sections.map((section) => ({
          id: section.id,
          title: section.title,
          description: section.description,
          order: section.order,
          fields: section.fields.map((field) => ({
            id: field.id,
            label: field.label,
            type: field.type,
            required: field.required,
            order: field.order,
            config: field.config,
          })),
        })),
      };

      templateData = {
        templateId: template.id,
        templateVersion: template.version,
        formSchemaSnapshot: schemaSnapshot as Prisma.InputJsonValue,
      };
    }

    // Generate plan number
    const planNumber = `CP-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Create care plan with POC fields
    const carePlan = await prisma.carePlan.create({
      data: {
        companyId: session.user.companyId,
        clientId: data.clientId,
        intakeId: data.intakeId || undefined,
        createdById: session.user.id,
        planNumber,
        status: data.status || "DRAFT",

        // Template data
        templateId: templateData.templateId,
        templateVersion: templateData.templateVersion,
        formSchemaSnapshot: templateData.formSchemaSnapshot,
        formData: data.formData,

        // Dates
        effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        certStartDate: data.certStartDate ? new Date(data.certStartDate) : null,
        certEndDate: data.certEndDate ? new Date(data.certEndDate) : null,
        signatureSentDate: data.signatureSentDate ? new Date(data.signatureSentDate) : null,
        signatureReceivedDate: data.signatureReceivedDate ? new Date(data.signatureReceivedDate) : null,
        verbalSOCDate: data.verbalSOCDate ? new Date(data.verbalSOCDate) : null,

        // Plan content
        summary: data.summary || undefined,
        goals: data.goals || undefined,
        interventions: data.interventions || undefined,
        frequency: data.frequency || undefined,
        internalNotes: data.internalNotes || undefined,

        // Clinical Information
        medications: data.medications || undefined,
        dmeSupplies: data.dmeSupplies || undefined,
        safetyMeasures: data.safetyMeasures || undefined,
        nutritionalRequirements: data.nutritionalRequirements || undefined,
        allergies: data.allergies || undefined,

        // Functional Status
        functionalLimitations: data.functionalLimitations || [],
        otherFunctionalLimit: data.otherFunctionalLimit || undefined,
        activitiesPermitted: data.activitiesPermitted || [],
        otherActivitiesPermit: data.otherActivitiesPermit || undefined,
        mentalStatus: data.mentalStatus || [],
        otherMentalStatus: data.otherMentalStatus || undefined,
        prognosis: data.prognosis || undefined,

        // Clinical Narratives
        cognitiveStatus: data.cognitiveStatus || undefined,
        rehabPotential: data.rehabPotential || undefined,
        dischargePlan: data.dischargePlan || undefined,
        riskIntervention: data.riskIntervention || undefined,
        advancedDirectives: data.advancedDirectives || undefined,
        caregiverNeeds: data.caregiverNeeds || undefined,
        homeboundStatus: data.homeboundStatus || undefined,
        carePreferences: data.carePreferences || undefined,

        // Care level
        careLevel: data.careLevel || undefined,
        recommendedHours: data.recommendedHours || undefined,

        // Physician / Case Manager
        physicianId: data.physicianId || undefined,
        caseManagerId: data.caseManagerId || undefined,
        physicianCertStatement: data.physicianCertStatement || undefined,

        // 485 Certification
        isCert485: data.isCert485 || false,
        cert485Orders: data.cert485Orders || undefined,
        cert485Goals: data.cert485Goals || undefined,

        // QA
        qaStatus: data.qaStatus || undefined,
        qaNotes: data.qaNotes || undefined,

        // Signatures
        nurseSignature: data.nurseSignature || undefined,
        nurseSignedAt: data.nurseSignedAt ? new Date(data.nurseSignedAt) : null,
        clinicalNotes: data.clinicalNotes || undefined,
        clientSignature: data.clientSignature || undefined,
        clientSignedAt: data.clientSignedAt ? new Date(data.clientSignedAt) : null,
        clientSignerName: data.clientSignerName || undefined,
        clientSignerRelation: data.clientSignerRelation || undefined,
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        physician: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            npi: true,
          },
        },
        caseManager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        createdBy: {
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
        action: "CARE_PLAN_CREATED",
        entityType: "CarePlan",
        entityId: carePlan.id,
        changes: {
          clientName: `${client.firstName} ${client.lastName}`,
          planNumber,
          status: data.status || "DRAFT",
        },
      },
    });

    return NextResponse.json({ carePlan }, { status: 201 });
  } catch (error) {
    console.error("Error creating care plan:", error);
    return NextResponse.json(
      { error: "Failed to create care plan" },
      { status: 500 }
    );
  }
}
