import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/care-plans/[id] - Get single care plan
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const carePlan = await prisma.carePlan.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            phone: true,
            address: true,
            city: true,
            state: true,
            zipCode: true,
          },
        },
        intake: {
          include: {
            assessments: {
              include: {
                template: {
                  select: {
                    id: true,
                    name: true,
                    maxScore: true,
                  },
                },
              },
            },
          },
        },
        taskTemplates: {
          orderBy: { displayOrder: "asc" },
        },
        diagnoses: {
          where: { isActive: true },
          orderBy: [{ diagnosisType: "asc" }, { displayOrder: "asc" }],
        },
        orders: {
          where: { isActive: true },
          orderBy: [{ disciplineType: "asc" }, { displayOrder: "asc" }],
        },
        physician: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            npi: true,
            specialty: true,
            phone: true,
            fax: true,
          },
        },
        caseManager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        nurseSignedBy: {
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
      },
    });

    if (!carePlan) {
      return NextResponse.json(
        { error: "Care plan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ carePlan });
  } catch (error) {
    console.error("Error fetching care plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch care plan" },
      { status: 500 }
    );
  }
}

const updateCarePlanSchema = z.object({
  // Status
  status: z.enum([
    "DRAFT",
    "PENDING_CLINICAL_REVIEW",
    "CLINICAL_APPROVED",
    "PENDING_CLIENT_SIGNATURE",
    "ACTIVE",
    "REVISED",
    "COMPLETED",
    "CANCELLED",
  ]).optional(),

  // Plan dates
  effectiveDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),

  // Certification Period
  certStartDate: z.string().nullable().optional(),
  certEndDate: z.string().nullable().optional(),

  // Physician Signature Tracking
  signatureSentDate: z.string().nullable().optional(),
  signatureReceivedDate: z.string().nullable().optional(),
  verbalSOCDate: z.string().nullable().optional(),

  // Plan content
  summary: z.string().nullable().optional(),
  goals: z.any().optional(), // JSON
  interventions: z.any().optional(), // JSON
  frequency: z.any().optional(), // JSON
  internalNotes: z.string().nullable().optional(),

  // Clinical Information
  medications: z.string().nullable().optional(),
  dmeSupplies: z.string().nullable().optional(),
  safetyMeasures: z.string().nullable().optional(),
  nutritionalRequirements: z.string().nullable().optional(),
  allergies: z.string().nullable().optional(),

  // Functional Status
  functionalLimitations: z.array(z.string()).optional(),
  otherFunctionalLimit: z.string().nullable().optional(),
  activitiesPermitted: z.array(z.string()).optional(),
  otherActivitiesPermit: z.string().nullable().optional(),
  mentalStatus: z.array(z.string()).optional(),
  otherMentalStatus: z.string().nullable().optional(),
  prognosis: z.string().nullable().optional(),

  // Clinical Narratives
  cognitiveStatus: z.string().nullable().optional(),
  rehabPotential: z.string().nullable().optional(),
  dischargePlan: z.string().nullable().optional(),
  riskIntervention: z.string().nullable().optional(),
  advancedDirectives: z.string().nullable().optional(),
  caregiverNeeds: z.string().nullable().optional(),
  homeboundStatus: z.string().nullable().optional(),
  carePreferences: z.string().nullable().optional(),

  // Care Level
  careLevel: z.string().nullable().optional(),
  recommendedHours: z.number().nullable().optional(),

  // Physician / Case Manager
  physicianId: z.string().nullable().optional(),
  caseManagerId: z.string().nullable().optional(),
  physicianCertStatement: z.string().nullable().optional(),

  // 485 Certification
  isCert485: z.boolean().optional(),
  cert485Orders: z.string().nullable().optional(),
  cert485Goals: z.string().nullable().optional(),

  // QA Workflow
  qaStatus: z.enum(["IN_USE", "COMPLETED"]).nullable().optional(),
  qaNotes: z.string().nullable().optional(),

  // Nurse Signature
  nurseSignature: z.string().nullable().optional(),
  nurseSignedAt: z.string().nullable().optional(),

  // Clinical Review
  clinicalNotes: z.string().nullable().optional(),

  // Client Signature
  clientSignature: z.string().nullable().optional(),
  clientSignedAt: z.string().nullable().optional(),
  clientSignerName: z.string().nullable().optional(),
  clientSignerRelation: z.string().nullable().optional(),
});

// PATCH /api/care-plans/[id] - Update care plan
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

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
    console.log("PATCH care plan body:", JSON.stringify(body, null, 2));

    const validation = updateCarePlanSchema.safeParse(body);

    if (!validation.success) {
      console.log("Validation errors:", JSON.stringify(validation.error.issues, null, 2));
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {};
    const data = validation.data;

    // Helper to process date fields
    const processDate = (value: string | null | undefined) => {
      if (value === null) return null;
      if (value === undefined) return undefined;
      return new Date(value);
    };

    // Status
    if (data.status !== undefined) updateData.status = data.status;

    // Plan dates
    if (data.effectiveDate !== undefined) updateData.effectiveDate = processDate(data.effectiveDate);
    if (data.endDate !== undefined) updateData.endDate = processDate(data.endDate);

    // Certification Period
    if (data.certStartDate !== undefined) updateData.certStartDate = processDate(data.certStartDate);
    if (data.certEndDate !== undefined) updateData.certEndDate = processDate(data.certEndDate);

    // Physician Signature Tracking
    if (data.signatureSentDate !== undefined) updateData.signatureSentDate = processDate(data.signatureSentDate);
    if (data.signatureReceivedDate !== undefined) updateData.signatureReceivedDate = processDate(data.signatureReceivedDate);
    if (data.verbalSOCDate !== undefined) updateData.verbalSOCDate = processDate(data.verbalSOCDate);

    // Plan content
    if (data.summary !== undefined) updateData.summary = data.summary;
    if (data.goals !== undefined) updateData.goals = data.goals;
    if (data.interventions !== undefined) updateData.interventions = data.interventions;
    if (data.frequency !== undefined) updateData.frequency = data.frequency;
    if (data.internalNotes !== undefined) updateData.internalNotes = data.internalNotes;

    // Clinical Information
    if (data.medications !== undefined) updateData.medications = data.medications;
    if (data.dmeSupplies !== undefined) updateData.dmeSupplies = data.dmeSupplies;
    if (data.safetyMeasures !== undefined) updateData.safetyMeasures = data.safetyMeasures;
    if (data.nutritionalRequirements !== undefined) updateData.nutritionalRequirements = data.nutritionalRequirements;
    if (data.allergies !== undefined) updateData.allergies = data.allergies;

    // Functional Status
    if (data.functionalLimitations !== undefined) updateData.functionalLimitations = data.functionalLimitations;
    if (data.otherFunctionalLimit !== undefined) updateData.otherFunctionalLimit = data.otherFunctionalLimit;
    if (data.activitiesPermitted !== undefined) updateData.activitiesPermitted = data.activitiesPermitted;
    if (data.otherActivitiesPermit !== undefined) updateData.otherActivitiesPermit = data.otherActivitiesPermit;
    if (data.mentalStatus !== undefined) updateData.mentalStatus = data.mentalStatus;
    if (data.otherMentalStatus !== undefined) updateData.otherMentalStatus = data.otherMentalStatus;
    if (data.prognosis !== undefined) updateData.prognosis = data.prognosis;

    // Clinical Narratives
    if (data.cognitiveStatus !== undefined) updateData.cognitiveStatus = data.cognitiveStatus;
    if (data.rehabPotential !== undefined) updateData.rehabPotential = data.rehabPotential;
    if (data.dischargePlan !== undefined) updateData.dischargePlan = data.dischargePlan;
    if (data.riskIntervention !== undefined) updateData.riskIntervention = data.riskIntervention;
    if (data.advancedDirectives !== undefined) updateData.advancedDirectives = data.advancedDirectives;
    if (data.caregiverNeeds !== undefined) updateData.caregiverNeeds = data.caregiverNeeds;
    if (data.homeboundStatus !== undefined) updateData.homeboundStatus = data.homeboundStatus;
    if (data.carePreferences !== undefined) updateData.carePreferences = data.carePreferences;

    // Care Level
    if (data.careLevel !== undefined) updateData.careLevel = data.careLevel;
    if (data.recommendedHours !== undefined) updateData.recommendedHours = data.recommendedHours;

    // Physician / Case Manager
    if (data.physicianId !== undefined) updateData.physicianId = data.physicianId;
    if (data.caseManagerId !== undefined) updateData.caseManagerId = data.caseManagerId;
    if (data.physicianCertStatement !== undefined) updateData.physicianCertStatement = data.physicianCertStatement;

    // 485 Certification
    if (data.isCert485 !== undefined) updateData.isCert485 = data.isCert485;
    if (data.cert485Orders !== undefined) updateData.cert485Orders = data.cert485Orders;
    if (data.cert485Goals !== undefined) updateData.cert485Goals = data.cert485Goals;

    // QA Workflow
    if (data.qaStatus !== undefined) updateData.qaStatus = data.qaStatus;
    if (data.qaNotes !== undefined) updateData.qaNotes = data.qaNotes;

    // Nurse Signature
    if (data.nurseSignature !== undefined) updateData.nurseSignature = data.nurseSignature;
    if (data.nurseSignedAt !== undefined) {
      updateData.nurseSignedAt = processDate(data.nurseSignedAt);
      // Also set the nurse who signed
      if (data.nurseSignedAt) {
        updateData.nurseSignedById = session.user.id;
      }
    }

    // Clinical Review
    if (data.clinicalNotes !== undefined) updateData.clinicalNotes = data.clinicalNotes;

    // Client Signature
    if (data.clientSignature !== undefined) updateData.clientSignature = data.clientSignature;
    if (data.clientSignedAt !== undefined) updateData.clientSignedAt = processDate(data.clientSignedAt);
    if (data.clientSignerName !== undefined) updateData.clientSignerName = data.clientSignerName;
    if (data.clientSignerRelation !== undefined) updateData.clientSignerRelation = data.clientSignerRelation;

    const updatedCarePlan = await prisma.carePlan.update({
      where: { id },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        taskTemplates: {
          orderBy: { displayOrder: "asc" },
        },
        diagnoses: {
          where: { isActive: true },
          orderBy: [{ diagnosisType: "asc" }, { displayOrder: "asc" }],
        },
        orders: {
          where: { isActive: true },
          orderBy: [{ disciplineType: "asc" }, { displayOrder: "asc" }],
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
      },
    });

    // Create audit log for status changes
    if (validation.data.status && validation.data.status !== carePlan.status) {
      await prisma.auditLog.create({
        data: {
          companyId: session.user.companyId,
          userId: session.user.id,
          action: "CARE_PLAN_STATUS_CHANGED",
          entityType: "CarePlan",
          entityId: id,
          changes: {
            previousStatus: carePlan.status,
            newStatus: validation.data.status,
          },
        },
      });
    }

    return NextResponse.json({ carePlan: updatedCarePlan });
  } catch (error) {
    console.error("Error updating care plan:", error);
    return NextResponse.json(
      { error: "Failed to update care plan" },
      { status: 500 }
    );
  }
}

// DELETE /api/care-plans/[id] - Delete care plan
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["ADMIN", "CLINICAL_DIRECTOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const carePlan = await prisma.carePlan.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
      include: {
        client: true,
      },
    });

    if (!carePlan) {
      return NextResponse.json(
        { error: "Care plan not found" },
        { status: 404 }
      );
    }

    // Only allow deleting draft care plans
    if (carePlan.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Can only delete draft care plans" },
        { status: 400 }
      );
    }

    await prisma.carePlan.delete({
      where: { id },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "CARE_PLAN_DELETED",
        entityType: "CarePlan",
        entityId: id,
        changes: {
          clientName: `${carePlan.client.firstName} ${carePlan.client.lastName}`,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting care plan:", error);
    return NextResponse.json(
      { error: "Failed to delete care plan" },
      { status: 500 }
    );
  }
}
