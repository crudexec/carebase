import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const signConsentSchema = z.object({
  signatureType: z.enum(["ELECTRONIC", "HANDWRITTEN", "VERBAL_CONSENT"]),
  signatureData: z.string().optional(), // Base64 image for handwritten
  signerName: z.string().min(1, "Signer name is required"),
  signerRelation: z.string().optional(), // "SELF", "GUARDIAN", "POA", etc.
  witnessName: z.string().optional(),
  witnessSignature: z.string().optional(),
});

// POST /api/consents/[id]/sign - Sign a consent form
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify consent exists and is pending
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

    if (consent.isVoided) {
      return NextResponse.json(
        { error: "Consent form has been revoked" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = signConsentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const {
      signatureType,
      signatureData,
      signerName,
      signerRelation,
      witnessName,
      witnessSignature,
    } = validation.data;

    // Update consent with signature
    const signedConsent = await prisma.consentSignature.update({
      where: { id },
      data: {
        signatureType: signatureType as "ELECTRONIC" | "HANDWRITTEN" | "VERBAL_CONSENT",
        signatureData,
        signerName,
        signerRelation,
        signedAt: new Date(),
        witnessName,
        witnessSignature,
        witnessDate: witnessName ? new Date() : null,
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            formType: true,
          },
        },
        client: {
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
        action: "CONSENT_SIGNED",
        entityType: "ConsentSignature",
        entityId: id,
        changes: {
          clientName: `${consent.client.firstName} ${consent.client.lastName}`,
          templateName: consent.template.name,
          signerName,
          signatureType,
        },
      },
    });

    return NextResponse.json({ consent: signedConsent });
  } catch (error) {
    console.error("Error signing consent:", error);
    return NextResponse.json(
      { error: "Failed to sign consent" },
      { status: 500 }
    );
  }
}
