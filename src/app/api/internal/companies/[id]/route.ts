import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { requireInternalAdmin } from "@/lib/internal-admin";

const updateCompanySchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  faxNumber: z.string().nullable().optional(),
  currency: z.enum(["USD", "GBP", "CAD", "NGN"]).optional(),
  isActive: z.boolean().optional(),
});

const COMPANY_SCOPED_MODELS = [
  "MedicationAdministration",
  "NarcoticCountRecord",
  "RefillRequest",
  "MedicationInventory",
  "Medication",
  "CourseLessonProgress",
  "QuizAttempt",
  "CourseProgress",
  "TrainingAttendance",
  "TrainingAssignment",
  "TrainingSession",
  "CourseLesson",
  "CourseQuiz",
  "TrainingCourse",
  "StaffDevelopmentPlan",
  "SupervisionVisit",
  "SupervisoryRelationship",
  "RemediationPlan",
  "TaskCompetencyRequirement",
  "StaffCompetency",
  "Competency",
  "OasisAssessment",
  "OasisTemplate",
  "NotificationLog",
  "NotificationPreference",
  "NotificationTemplate",
  "FaxRecord",
  "AuthorizationAlert",
  "Authorization",
  "Physician",
  "CarePlanSignatureRequest",
  "CarePlan",
  "ConsentSignature",
  "ConsentFormTemplate",
  "Intake",
  "Referral",
  "ReferralSourceRecord",
  "Assessment",
  "AssessmentTemplate",
  "CompanyStateConfig",
  "ClaimSubmission",
  "Claim",
  "BillingPeriod",
  "BillingRate",
  "ServiceType",
  "ThresholdBreach",
  "VisitNoteComment",
  "VisitNote",
  "FormTemplate",
  "SavedReport",
  "AuditLog",
  "Invite",
  "Notification",
  "Escalation",
  "Conversation",
  "ChatMessage",
  "Invoice",
  "PayrollRecord",
  "IncidentReport",
  "DailyReport",
  "ShiftAttendance",
  "Shift",
  "OnboardingRecord",
  "Client",
  "CredentialAlert",
  "CredentialType",
  "SponsorInviteToken",
  "User",
  "GoalHierarchy",
] as const;

function toDelegateName(modelName: string) {
  return modelName.charAt(0).toLowerCase() + modelName.slice(1);
}

function isForeignKeyConstraintError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2003"
  );
}

async function purgeCompanyData(
  tx: Prisma.TransactionClient,
  companyId: string
) {
  const delegates = COMPANY_SCOPED_MODELS.map(toDelegateName);
  const prismaTx = tx as unknown as Record<
    string,
    {
      deleteMany?: (args: { where: { companyId: string } }) => Promise<{ count: number }>;
      count?: (args: { where: { companyId: string } }) => Promise<number>;
    }
  >;

  for (let pass = 0; pass < delegates.length; pass += 1) {
    let deletedInPass = 0;

    for (const delegateName of delegates) {
      const delegate = prismaTx[delegateName];

      if (!delegate?.deleteMany) {
        continue;
      }

      try {
        const result = await delegate.deleteMany({
          where: { companyId },
        });
        deletedInPass += result.count;
      } catch (error) {
        if (isForeignKeyConstraintError(error)) {
          continue;
        }
        throw error;
      }
    }

    if (deletedInPass === 0) {
      break;
    }
  }

  const leftovers: string[] = [];

  for (const delegateName of delegates) {
    const delegate = prismaTx[delegateName];

    if (!delegate?.count) {
      continue;
    }

    const remaining = await delegate.count({
      where: { companyId },
    });

    if (remaining > 0) {
      leftovers.push(`${delegateName}:${remaining}`);
    }
  }

  if (leftovers.length > 0) {
    throw new Error(
      `Unable to fully purge company data. Remaining records: ${leftovers.join(", ")}`
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!requireInternalAdmin(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const validation = updateCompanySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    if (data.faxNumber && !/^\+?[1-9]\d{1,14}$/.test(data.faxNumber.trim())) {
      return NextResponse.json(
        { error: "Fax number must be in E.164 format (e.g., +12025551234)" },
        { status: 400 }
      );
    }

    const existingCompany = await prisma.company.findUnique({
      where: { id },
    });

    if (!existingCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const company = await prisma.company.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(data.address !== undefined ? { address: data.address?.trim() || null } : {}),
        ...(data.phone !== undefined ? { phone: data.phone?.trim() || null } : {}),
        ...(data.faxNumber !== undefined ? { faxNumber: data.faxNumber?.trim() || null } : {}),
        ...(data.currency !== undefined ? { currency: data.currency } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        companyId: company.id,
        action: "COMPANY_MANAGED",
        entityType: "Company",
        entityId: company.id,
        changes: data,
      },
    });

    return NextResponse.json({ company });
  } catch (error) {
    console.error("Error updating company:", error);
    return NextResponse.json({ error: "Failed to update company" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!requireInternalAdmin(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    if (session.user.companyId === id) {
      return NextResponse.json(
        { error: "You cannot delete the company associated with your current account" },
        { status: 400 }
      );
    }

    const existingCompany = await prisma.company.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    });

    if (!existingCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const confirmation = searchParams.get("confirm");

    if (confirmation !== existingCompany.name) {
      return NextResponse.json(
        { error: "Confirmation text did not match the company name" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await purgeCompanyData(tx, id);
      await tx.company.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      success: true,
      deletedCompanyId: existingCompany.id,
      deletedCompanyName: existingCompany.name,
    });
  } catch (error) {
    console.error("Error deleting company:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete company",
      },
      { status: 500 }
    );
  }
}
