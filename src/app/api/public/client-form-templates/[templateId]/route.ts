import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { createPublicClientFormSubmissionSchema } from "@/lib/client-forms/validation";
import { buildClientFormSnapshot, getClientFormTemplateSettings } from "@/lib/client-forms/snapshots";
import { validateClientFormSubmissionData } from "@/lib/client-forms/submission";

async function getPublicTemplate(templateId: string) {
  return prisma.formTemplate.findFirst({
    where: {
      id: templateId,
      type: "CLIENT_FORM",
      status: "ACTIVE",
      isEnabled: true,
    },
    include: {
      sections: {
        include: {
          fields: {
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const { templateId } = await params;
    const template = await getPublicTemplate(templateId);

    if (!template) {
      return NextResponse.json({ error: "Form template not found" }, { status: 404 });
    }

    const settings = getClientFormTemplateSettings(template.settings as Prisma.JsonValue | null);
    if (!settings.access.isPublic) {
      return NextResponse.json(
        { error: "This form is not configured for public access." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      template: buildClientFormSnapshot(template),
      settings,
    });
  } catch (error) {
    console.error("Error resolving public client form template:", error);
    return NextResponse.json({ error: "Failed to load client form" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const { templateId } = await params;
    const template = await getPublicTemplate(templateId);

    if (!template) {
      return NextResponse.json({ error: "Form template not found" }, { status: 404 });
    }

    const settings = getClientFormTemplateSettings(template.settings as Prisma.JsonValue | null);
    if (!settings.access.isPublic) {
      return NextResponse.json(
        { error: "This form is not configured for public access." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = createPublicClientFormSubmissionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { submitterName, submitterEmail, data } = validation.data;

    if (settings.collection.collectSubmitterName && !submitterName) {
      return NextResponse.json({ error: "Submitter name is required" }, { status: 400 });
    }

    if (settings.collection.collectSubmitterEmail && !submitterEmail) {
      return NextResponse.json({ error: "Submitter email is required" }, { status: 400 });
    }

    const snapshot = buildClientFormSnapshot(template);
    const submissionValidation = validateClientFormSubmissionData(snapshot, data);

    if (!submissionValidation.valid) {
      return NextResponse.json(
        { error: "Validation failed", fieldErrors: submissionValidation.errors },
        { status: 400 }
      );
    }

    const forwardedFor = request.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor?.split(",")[0]?.trim() || null;
    const userAgent = request.headers.get("user-agent");

    const submission = await prisma.clientFormSubmission.create({
      data: {
        companyId: template.companyId,
        templateId: template.id,
        templateVersion: template.version,
        formSchemaSnapshot: snapshot as unknown as Prisma.InputJsonValue,
        data: data as Prisma.InputJsonValue,
        isPublicSubmission: true,
        submittedByName: submitterName ?? null,
        submittedByEmail: submitterEmail ?? null,
        ipAddress,
        userAgent,
      },
    });

    await prisma.auditLog.create({
      data: {
        companyId: template.companyId,
        userId: template.createdById,
        action: "CLIENT_FORM_SUBMITTED_PUBLIC_TEMPLATE",
        entityType: "ClientFormSubmission",
        entityId: submission.id,
        changes: {
          templateId: template.id,
          templateName: template.name,
          submitterName: submitterName ?? null,
          submitterEmail: submitterEmail ?? null,
        },
      },
    });

    return NextResponse.json(
      {
        submission: {
          id: submission.id,
          submittedAt: submission.submittedAt.toISOString(),
        },
        successMessage: settings.display.successMessage,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting public client form template:", error);
    return NextResponse.json({ error: "Failed to submit client form" }, { status: 500 });
  }
}
