import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/consents/[id] - Get single consent with template content
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const consent = await prisma.consentSignature.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
      include: {
        template: true,
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            address: true,
            city: true,
            state: true,
            zipCode: true,
          },
        },
        intake: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!consent) {
      return NextResponse.json({ error: "Consent not found" }, { status: 404 });
    }

    return NextResponse.json({ consent });
  } catch (error) {
    console.error("Error fetching consent:", error);
    return NextResponse.json(
      { error: "Failed to fetch consent" },
      { status: 500 }
    );
  }
}

// DELETE /api/consents/[id] - Void/revoke consent
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const consent = await prisma.consentSignature.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
      include: {
        client: true,
        template: true,
      },
    });

    if (!consent) {
      return NextResponse.json({ error: "Consent not found" }, { status: 404 });
    }

    // Void instead of hard delete
    await prisma.consentSignature.update({
      where: { id },
      data: {
        isVoided: true,
        voidedAt: new Date(),
        voidedReason: "Voided by administrator",
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "CONSENT_REVOKED",
        entityType: "ConsentSignature",
        entityId: id,
        changes: {
          clientName: `${consent.client.firstName} ${consent.client.lastName}`,
          templateName: consent.template.name,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error voiding consent:", error);
    return NextResponse.json(
      { error: "Failed to void consent" },
      { status: 500 }
    );
  }
}
