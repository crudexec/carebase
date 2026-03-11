import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ token: string }>;
}

// GET /api/sign/[token] - Get care plan details for signing (public, no auth)
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { token } = await params;

    const signatureRequest = await prisma.carePlanSignatureRequest.findUnique({
      where: { token },
      include: {
        carePlan: {
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
                name: true,
                description: true,
              },
            },
            company: {
              select: {
                name: true,
                phone: true,
                address: true,
              },
            },
            createdBy: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        company: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!signatureRequest) {
      return NextResponse.json(
        { error: "Signature request not found" },
        { status: 404 }
      );
    }

    // Check if expired
    if (new Date() > signatureRequest.expiresAt) {
      return NextResponse.json(
        { error: "This signature request has expired", expired: true },
        { status: 410 }
      );
    }

    // Check if cancelled
    if (signatureRequest.status === "CANCELLED") {
      return NextResponse.json(
        { error: "This signature request has been cancelled" },
        { status: 410 }
      );
    }

    // Check if already signed
    if (signatureRequest.status === "SIGNED") {
      return NextResponse.json({
        alreadySigned: true,
        signedAt: signatureRequest.signedAt,
        signerName: signatureRequest.signerName,
        message: "This document has already been signed",
      });
    }

    // Mark as viewed if first time
    if (signatureRequest.status === "PENDING") {
      await prisma.carePlanSignatureRequest.update({
        where: { id: signatureRequest.id },
        data: {
          status: "VIEWED",
          viewedAt: new Date(),
        },
      });
    }

    // Build response with care plan details (read-only view)
    const carePlan = signatureRequest.carePlan;

    return NextResponse.json({
      signatureRequest: {
        id: signatureRequest.id,
        signerType: signatureRequest.signerType,
        signerName: signatureRequest.signerName,
        signerEmail: signatureRequest.signerEmail,
        expiresAt: signatureRequest.expiresAt,
        status: signatureRequest.status === "PENDING" ? "VIEWED" : signatureRequest.status,
        customMessage: signatureRequest.customMessage,
      },
      carePlan: {
        id: carePlan.id,
        planNumber: carePlan.planNumber,
        templateName: carePlan.template?.name || "Care Plan",
        templateDescription: carePlan.template?.description,
        effectiveDate: carePlan.effectiveDate,
        endDate: carePlan.endDate,
        summary: carePlan.summary,
        goals: carePlan.goals,
        interventions: carePlan.interventions,
        frequency: carePlan.frequency,
        formSchemaSnapshot: carePlan.formSchemaSnapshot,
        formData: carePlan.formData,
        client: {
          firstName: carePlan.client.firstName,
          lastName: carePlan.client.lastName,
          dateOfBirth: carePlan.client.dateOfBirth,
        },
        company: {
          name: carePlan.company.name,
          phone: carePlan.company.phone,
          address: carePlan.company.address,
        },
        createdBy: carePlan.createdBy
          ? `${carePlan.createdBy.firstName} ${carePlan.createdBy.lastName}`
          : null,
        createdAt: carePlan.createdAt,
      },
      alreadySigned: false,
    });
  } catch (error) {
    console.error("Error fetching signature request:", error);
    return NextResponse.json(
      { error: "Failed to fetch signature request" },
      { status: 500 }
    );
  }
}

const signatureSubmitSchema = z.object({
  signatureData: z.string().min(1, "Signature is required"),
  signerRelation: z.string().optional(),
  signerCredentials: z.string().optional(), // For physicians: NPI, license number, etc.
  consentConfirmed: z.boolean().refine((val) => val === true, {
    message: "You must confirm that you have reviewed and agree to the document",
  }),
});

// POST /api/sign/[token] - Submit signature (public, no auth)
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { token } = await params;

    const signatureRequest = await prisma.carePlanSignatureRequest.findUnique({
      where: { token },
      include: {
        carePlan: {
          include: {
            client: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            company: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!signatureRequest) {
      return NextResponse.json(
        { error: "Signature request not found" },
        { status: 404 }
      );
    }

    // Check if expired
    if (new Date() > signatureRequest.expiresAt) {
      return NextResponse.json(
        { error: "This signature request has expired" },
        { status: 410 }
      );
    }

    // Check if cancelled
    if (signatureRequest.status === "CANCELLED") {
      return NextResponse.json(
        { error: "This signature request has been cancelled" },
        { status: 410 }
      );
    }

    // Check if already signed
    if (signatureRequest.status === "SIGNED") {
      return NextResponse.json(
        { error: "This document has already been signed" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = signatureSubmitSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { signatureData, signerRelation, signerCredentials } = validation.data;

    // Get IP address for audit
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";

    // Update the signature request
    const updatedRequest = await prisma.carePlanSignatureRequest.update({
      where: { id: signatureRequest.id },
      data: {
        status: "SIGNED",
        signedAt: new Date(),
        signatureData,
        signerRelation,
        signerCredentials,
        signedIpAddress: ipAddress,
      },
    });

    // Also update the care plan's client signature fields if this is a parent/guardian
    if (["PARENT", "GUARDIAN"].includes(signatureRequest.signerType)) {
      await prisma.carePlan.update({
        where: { id: signatureRequest.carePlanId },
        data: {
          clientSignedAt: new Date(),
          clientSignature: signatureData,
          clientSignerName: signatureRequest.signerName,
          clientSignerRelation: signerRelation || signatureRequest.signerType,
          // Optionally update status if pending client signature
          ...(signatureRequest.carePlan.status === "PENDING_CLIENT_SIGNATURE"
            ? { status: "ACTIVE" }
            : {}),
        },
      });
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: signatureRequest.companyId,
        userId: signatureRequest.sentById, // Log under the sender's ID
        action: "EXTERNAL_SIGNATURE_RECEIVED",
        entityType: "CarePlan",
        entityId: signatureRequest.carePlanId,
        changes: {
          signerType: signatureRequest.signerType,
          signerName: signatureRequest.signerName,
          signerEmail: signatureRequest.signerEmail,
          signerRelation,
          ipAddress,
          signedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Signature submitted successfully",
      signedAt: updatedRequest.signedAt,
      carePlan: {
        clientName: `${signatureRequest.carePlan.client.firstName} ${signatureRequest.carePlan.client.lastName}`,
        companyName: signatureRequest.carePlan.company.name,
      },
    });
  } catch (error) {
    console.error("Error submitting signature:", error);
    return NextResponse.json(
      { error: "Failed to submit signature" },
      { status: 500 }
    );
  }
}
