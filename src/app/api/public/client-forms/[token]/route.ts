import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { createPublicClientFormSubmissionSchema } from "@/lib/client-forms/validation";
import { hashClientFormToken } from "@/lib/client-forms/tokens";
import { assertTemplateSupportsPublicAccess, canUseRequest, resolveRequestStatus } from "@/lib/client-forms/access";
import { buildClientFormSnapshot, getClientFormTemplateSettings } from "@/lib/client-forms/snapshots";
import { validateClientFormSubmissionData } from "@/lib/client-forms/submission";

async function getRequestForToken(rawToken: string) {
  const tokenHash = hashClientFormToken(rawToken);

  return prisma.clientFormRequest.findFirst({
    where: {
      tokenHash,
    },
    include: {
      client: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
        },
      },
      template: {
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
      },
    },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const requestRecord = await getRequestForToken(token);

    if (!requestRecord) {
      return NextResponse.json({ error: "Form link not found" }, { status: 404 });
    }

    const settings = getClientFormTemplateSettings(requestRecord.template.settings as Prisma.JsonValue | null);
    const publicAccess = assertTemplateSupportsPublicAccess(settings);

    if (!publicAccess.allowed) {
      return NextResponse.json({ error: publicAccess.reason }, { status: 403 });
    }

    const availability = canUseRequest(
      requestRecord.status,
      requestRecord.expiresAt,
      requestRecord.maxSubmissions,
      requestRecord.submissionCount
    );

    if (!availability.allowed) {
      return NextResponse.json(
        {
          error: availability.reason,
          expired: resolveRequestStatus(requestRecord.status, requestRecord.expiresAt) === "EXPIRED",
        },
        { status: 410 }
      );
    }

    const snapshot = buildClientFormSnapshot(requestRecord.template);

    return NextResponse.json({
      request: {
        id: requestRecord.id,
        status: requestRecord.status,
        expiresAt: requestRecord.expiresAt?.toISOString() ?? null,
        recipientName: requestRecord.recipientName,
        recipientEmail: requestRecord.recipientEmail,
      },
      client: {
        id: requestRecord.client.id,
        ...(settings.display.showClientName
          ? {
              firstName: requestRecord.client.firstName,
              lastName: requestRecord.client.lastName,
            }
          : {}),
        ...(settings.display.showClientDob
          ? { dateOfBirth: requestRecord.client.dateOfBirth?.toISOString() ?? null }
          : {}),
      },
      template: snapshot,
      settings,
    });
  } catch (error) {
    console.error("Error resolving public client form:", error);
    return NextResponse.json({ error: "Failed to load client form" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const requestRecord = await getRequestForToken(token);

    if (!requestRecord) {
      return NextResponse.json({ error: "Form link not found" }, { status: 404 });
    }

    const settings = getClientFormTemplateSettings(requestRecord.template.settings as Prisma.JsonValue | null);
    const publicAccess = assertTemplateSupportsPublicAccess(settings);

    if (!publicAccess.allowed) {
      return NextResponse.json({ error: publicAccess.reason }, { status: 403 });
    }

    const availability = canUseRequest(
      requestRecord.status,
      requestRecord.expiresAt,
      requestRecord.maxSubmissions,
      requestRecord.submissionCount
    );

    if (!availability.allowed) {
      return NextResponse.json({ error: availability.reason }, { status: 410 });
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

    const snapshot = buildClientFormSnapshot(requestRecord.template);
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
    const nextStatus =
      requestRecord.maxSubmissions && requestRecord.maxSubmissions <= requestRecord.submissionCount + 1
        ? "USED"
        : settings.access.allowMultipleSubmissionsPerRequest
          ? requestRecord.status
          : "USED";

    const submission = await prisma.$transaction(async (tx) => {
      const created = await tx.clientFormSubmission.create({
        data: {
          companyId: requestRecord.companyId,
          clientId: requestRecord.clientId,
          templateId: requestRecord.templateId,
          requestId: requestRecord.id,
          templateVersion: requestRecord.template.version,
          formSchemaSnapshot: snapshot as unknown as Prisma.InputJsonValue,
          data: data as Prisma.InputJsonValue,
          isPublicSubmission: true,
          submittedByName: submitterName ?? null,
          submittedByEmail: submitterEmail ?? null,
          ipAddress,
          userAgent,
        },
      });

      await tx.clientFormRequest.update({
        where: { id: requestRecord.id },
        data: {
          submissionCount: { increment: 1 },
          status: nextStatus,
        },
      });

      return created;
    });

    await prisma.auditLog.create({
      data: {
        companyId: requestRecord.companyId,
        userId: requestRecord.createdById,
        action: "CLIENT_FORM_SUBMITTED_PUBLIC",
        entityType: "ClientFormSubmission",
        entityId: submission.id,
        changes: {
          requestId: requestRecord.id,
          templateId: requestRecord.templateId,
          templateName: requestRecord.template.name,
          clientId: requestRecord.clientId,
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
    console.error("Error submitting public client form:", error);
    return NextResponse.json({ error: "Failed to submit client form" }, { status: 500 });
  }
}
