import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { Prisma } from "@prisma/client";
import { createAuthenticatedClientFormSubmissionSchema } from "@/lib/client-forms/validation";
import { buildClientFormSnapshot } from "@/lib/client-forms/snapshots";
import { validateClientFormSubmissionData } from "@/lib/client-forms/submission";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canView =
      hasPermission(session.user.role, PERMISSIONS.CLIENT_FORM_VIEW) ||
      hasPermission(session.user.role, PERMISSIONS.CLIENT_FORM_MANAGE);

    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const templateId = searchParams.get("templateId");
    const page = Number(searchParams.get("page") || "1");
    const limit = Math.min(Number(searchParams.get("limit") || "50"), 100);

    const where: Prisma.ClientFormSubmissionWhereInput = {
      companyId: session.user.companyId,
    };

    if (clientId) where.clientId = clientId;
    if (templateId) where.templateId = templateId;

    const [submissions, total] = await Promise.all([
      prisma.clientFormSubmission.findMany({
        where,
        include: {
          client: {
            select: { id: true, firstName: true, lastName: true },
          },
          template: {
            select: { id: true, name: true },
          },
          submittedBy: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
        orderBy: { submittedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.clientFormSubmission.count({ where }),
    ]);

    return NextResponse.json({
      submissions: submissions.map((submission) => ({
        ...submission,
        submittedAt: submission.submittedAt.toISOString(),
        updatedAt: submission.updatedAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching client forms:", error);
    return NextResponse.json({ error: "Failed to fetch client forms" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canCreate =
      hasPermission(session.user.role, PERMISSIONS.CLIENT_FORM_CREATE) ||
      hasPermission(session.user.role, PERMISSIONS.CLIENT_FORM_MANAGE);

    if (!canCreate) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = createAuthenticatedClientFormSubmissionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { clientId, templateId, data } = validation.data;

    const [client, template] = await Promise.all([
      prisma.client.findFirst({
        where: { id: clientId, companyId: session.user.companyId },
      }),
      prisma.formTemplate.findFirst({
        where: {
          id: templateId,
          companyId: session.user.companyId,
          type: "CLIENT_FORM",
          status: "ACTIVE",
          isEnabled: true,
        },
        include: {
          sections: {
            include: {
              fields: { orderBy: { order: "asc" } },
            },
            orderBy: { order: "asc" },
          },
        },
      }),
    ]);

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const snapshot = buildClientFormSnapshot(template);
    const submissionValidation = validateClientFormSubmissionData(snapshot, data);

    if (!submissionValidation.valid) {
      return NextResponse.json(
        { error: "Validation failed", fieldErrors: submissionValidation.errors },
        { status: 400 }
      );
    }

    const submission = await prisma.clientFormSubmission.create({
      data: {
        companyId: session.user.companyId,
        clientId,
        templateId,
        templateVersion: template.version,
        formSchemaSnapshot: snapshot as unknown as Prisma.InputJsonValue,
        data: data as Prisma.InputJsonValue,
        isPublicSubmission: false,
        submittedById: session.user.id,
      },
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true },
        },
        template: {
          select: { id: true, name: true },
        },
        submittedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "CLIENT_FORM_SUBMITTED",
        entityType: "ClientFormSubmission",
        entityId: submission.id,
        changes: {
          clientId: client.id,
          clientName: `${client.firstName} ${client.lastName}`,
          templateId: template.id,
          templateName: template.name,
        },
      },
    });

    return NextResponse.json(
      {
        submission: {
          ...submission,
          submittedAt: submission.submittedAt.toISOString(),
          updatedAt: submission.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating client form submission:", error);
    return NextResponse.json(
      { error: "Failed to create client form submission" },
      { status: 500 }
    );
  }
}
