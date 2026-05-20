import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { updateClientFormRequestSchema } from "@/lib/client-forms/validation";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const requestRecord = await prisma.clientFormRequest.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
      include: {
        template: {
          select: { id: true, name: true },
        },
        client: {
          select: { id: true, firstName: true, lastName: true },
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        submissions: {
          select: {
            id: true,
            submittedAt: true,
            isPublicSubmission: true,
            submittedByName: true,
            submittedByEmail: true,
          },
          orderBy: { submittedAt: "desc" },
        },
      },
    });

    if (!requestRecord) {
      return NextResponse.json({ error: "Client form request not found" }, { status: 404 });
    }

    return NextResponse.json({
      request: {
        ...requestRecord,
        createdAt: requestRecord.createdAt.toISOString(),
        updatedAt: requestRecord.updatedAt.toISOString(),
        expiresAt: requestRecord.expiresAt?.toISOString() ?? null,
        submissions: requestRecord.submissions.map((submission) => ({
          ...submission,
          submittedAt: submission.submittedAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching client form request:", error);
    return NextResponse.json({ error: "Failed to fetch client form request" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canManage = hasPermission(session.user.role, PERMISSIONS.CLIENT_FORM_MANAGE);
    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const validation = updateClientFormRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const existing = await prisma.clientFormRequest.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Client form request not found" }, { status: 404 });
    }

    const updated = await prisma.clientFormRequest.update({
      where: { id },
      data: {
        ...(validation.data.status !== undefined && { status: validation.data.status }),
        ...(validation.data.expiresAt !== undefined && {
          expiresAt: validation.data.expiresAt ? new Date(validation.data.expiresAt) : null,
        }),
        ...(validation.data.maxSubmissions !== undefined && { maxSubmissions: validation.data.maxSubmissions }),
        ...(validation.data.recipientName !== undefined && { recipientName: validation.data.recipientName }),
        ...(validation.data.recipientEmail !== undefined && { recipientEmail: validation.data.recipientEmail }),
        ...(validation.data.notes !== undefined && { notes: validation.data.notes }),
      },
    });

    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: updated.status === "REVOKED" ? "CLIENT_FORM_REQUEST_REVOKED" : "CLIENT_FORM_REQUEST_UPDATED",
        entityType: "ClientFormRequest",
        entityId: updated.id,
        changes: {
          previousStatus: existing.status,
          updatedStatus: updated.status,
          expiresAt: updated.expiresAt?.toISOString() ?? null,
          maxSubmissions: updated.maxSubmissions,
        },
      },
    });

    return NextResponse.json({
      request: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
        expiresAt: updated.expiresAt?.toISOString() ?? null,
      },
    });
  } catch (error) {
    console.error("Error updating client form request:", error);
    return NextResponse.json({ error: "Failed to update client form request" }, { status: 500 });
  }
}
