import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { createClientFormRequestSchema } from "@/lib/client-forms/validation";
import { generateClientFormToken, hashClientFormToken } from "@/lib/client-forms/tokens";
import { getClientFormTemplateSettings } from "@/lib/client-forms/snapshots";

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

    const requests = await prisma.clientFormRequest.findMany({
      where: {
        companyId: session.user.companyId,
        ...(clientId ? { clientId } : {}),
        ...(templateId ? { templateId } : {}),
      },
      include: {
        template: {
          select: { id: true, name: true },
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      requests: requests.map((requestItem) => ({
        ...requestItem,
        createdAt: requestItem.createdAt.toISOString(),
        updatedAt: requestItem.updatedAt.toISOString(),
        expiresAt: requestItem.expiresAt?.toISOString() ?? null,
      })),
    });
  } catch (error) {
    console.error("Error fetching client form requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch client form requests" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canManage =
      hasPermission(session.user.role, PERMISSIONS.CLIENT_FORM_CREATE) ||
      hasPermission(session.user.role, PERMISSIONS.CLIENT_FORM_MANAGE);

    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = createClientFormRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const {
      clientId,
      templateId,
      recipientName,
      recipientEmail,
      notes,
      expiresAt,
      maxSubmissions,
    } = validation.data;

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
      }),
    ]);

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const settings = getClientFormTemplateSettings(template.settings);
    if (!settings.access.isPublic) {
      return NextResponse.json(
        { error: "Template is not configured for public access" },
        { status: 400 }
      );
    }

    const token = generateClientFormToken();
    const tokenHash = hashClientFormToken(token);
    const effectiveExpiresAt = expiresAt
      ? new Date(expiresAt)
      : settings.access.defaultExpirationDays
        ? new Date(Date.now() + settings.access.defaultExpirationDays * 24 * 60 * 60 * 1000)
        : null;
    const effectiveMaxSubmissions = maxSubmissions ?? (settings.access.allowMultipleSubmissionsPerRequest ? null : 1);

    const clientFormRequest = await prisma.clientFormRequest.create({
      data: {
        companyId: session.user.companyId,
        clientId,
        templateId,
        createdById: session.user.id,
        tokenHash,
        recipientName: recipientName ?? null,
        recipientEmail: recipientEmail ?? null,
        notes: notes ?? null,
        expiresAt: effectiveExpiresAt,
        maxSubmissions: effectiveMaxSubmissions,
      },
      include: {
        template: {
          select: { id: true, name: true },
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "CLIENT_FORM_REQUEST_CREATED",
        entityType: "ClientFormRequest",
        entityId: clientFormRequest.id,
        changes: {
          clientId: client.id,
          clientName: `${client.firstName} ${client.lastName}`,
          templateId: template.id,
          templateName: template.name,
          recipientEmail: clientFormRequest.recipientEmail,
          maxSubmissions: clientFormRequest.maxSubmissions,
          expiresAt: clientFormRequest.expiresAt?.toISOString() ?? null,
        },
      },
    });

    const publicBaseUrl = new URL(`/f/${token}`, request.url).toString();

    return NextResponse.json(
      {
        request: {
          ...clientFormRequest,
          createdAt: clientFormRequest.createdAt.toISOString(),
          updatedAt: clientFormRequest.updatedAt.toISOString(),
          expiresAt: clientFormRequest.expiresAt?.toISOString() ?? null,
        },
        publicUrl: publicBaseUrl,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating client form request:", error);
    return NextResponse.json(
      { error: "Failed to create client form request" },
      { status: 500 }
    );
  }
}
