import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

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

    const submission = await prisma.clientFormSubmission.findFirst({
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
          },
        },
        template: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        request: {
          select: {
            id: true,
            status: true,
            recipientName: true,
            recipientEmail: true,
            expiresAt: true,
          },
        },
        submittedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: "Client form submission not found" }, { status: 404 });
    }

    return NextResponse.json({
      submission: {
        ...submission,
        submittedAt: submission.submittedAt.toISOString(),
        updatedAt: submission.updatedAt.toISOString(),
        request: submission.request
          ? {
              ...submission.request,
              expiresAt: submission.request.expiresAt?.toISOString() ?? null,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Error fetching client form submission:", error);
    return NextResponse.json(
      { error: "Failed to fetch client form submission" },
      { status: 500 }
    );
  }
}
