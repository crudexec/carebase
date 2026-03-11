import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { sendEmail } from "@/lib/email";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const sendSignatureSchema = z.object({
  signerType: z.enum([
    "PARENT",
    "GUARDIAN",
    "PHYSICIAN",
    "SERVICE_COORDINATOR",
    "THERAPIST",
    "CASE_MANAGER",
    "OTHER",
  ]),
  signerName: z.string().min(1, "Signer name is required"),
  signerEmail: z.string().email("Valid email is required"),
  signerPhone: z.string().optional(),
  customMessage: z.string().optional(),
  expiresInDays: z.number().min(1).max(30).default(7),
});

// POST /api/care-plans/[id]/send-signature - Send a signature request
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get the care plan
    const carePlan = await prisma.carePlan.findFirst({
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
          },
        },
        template: {
          select: {
            name: true,
          },
        },
        company: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!carePlan) {
      return NextResponse.json(
        { error: "Care plan not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = sendSignatureSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { signerType, signerName, signerEmail, signerPhone, customMessage, expiresInDays } =
      validation.data;

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Create the signature request
    const signatureRequest = await prisma.carePlanSignatureRequest.create({
      data: {
        carePlanId: id,
        companyId: session.user.companyId,
        sentById: session.user.id,
        signerType,
        signerName,
        signerEmail,
        signerPhone,
        customMessage,
        expiresAt,
        status: "PENDING",
      },
    });

    // Build the signing URL
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const signingUrl = `${baseUrl}/sign/${signatureRequest.token}`;

    // Get signer type label for email
    const signerTypeLabels: Record<string, string> = {
      PARENT: "Parent/Guardian",
      GUARDIAN: "Legal Guardian",
      PHYSICIAN: "Physician",
      SERVICE_COORDINATOR: "Service Coordinator",
      THERAPIST: "Therapist",
      CASE_MANAGER: "Case Manager",
      OTHER: "Authorized Signer",
    };
    const signerTypeLabel = signerTypeLabels[signerType] || "Authorized Signer";

    // Send the email
    try {
      await sendEmail({
        to: signerEmail,
        subject: `Signature Required: Care Plan for ${carePlan.client.firstName} ${carePlan.client.lastName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Signature Required</h2>
            <p>Dear ${signerName},</p>
            <p>You have been requested to review and sign a care plan document.</p>

            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Client:</strong> ${carePlan.client.firstName} ${carePlan.client.lastName}</p>
              <p style="margin: 5px 0;"><strong>Plan Type:</strong> ${carePlan.template?.name || "Care Plan"}</p>
              <p style="margin: 5px 0;"><strong>Provider:</strong> ${carePlan.company.name}</p>
              <p style="margin: 5px 0;"><strong>Your Role:</strong> ${signerTypeLabel}</p>
            </div>

            ${customMessage ? `<p style="font-style: italic; color: #666;">Message from provider: "${customMessage}"</p>` : ""}

            <p>Please click the button below to review and sign the document:</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${signingUrl}"
                 style="background-color: #2563eb; color: white; padding: 12px 30px;
                        text-decoration: none; border-radius: 6px; font-weight: bold;
                        display: inline-block;">
                Review & Sign Document
              </a>
            </div>

            <p style="color: #666; font-size: 14px;">
              This link will expire on ${expiresAt.toLocaleDateString()}.
              If you have any questions, please contact ${carePlan.company.name}.
            </p>

            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              If you did not expect this email or believe it was sent in error, please disregard it.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send signature request email:", emailError);
      // Don't fail the request if email fails - the link is still valid
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "SIGNATURE_REQUEST_SENT",
        entityType: "CarePlan",
        entityId: id,
        changes: {
          signerType,
          signerName,
          signerEmail,
          expiresAt: expiresAt.toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      signatureRequest: {
        id: signatureRequest.id,
        token: signatureRequest.token,
        signerName: signatureRequest.signerName,
        signerEmail: signatureRequest.signerEmail,
        signerType: signatureRequest.signerType,
        status: signatureRequest.status,
        expiresAt: signatureRequest.expiresAt,
        signingUrl,
      },
    });
  } catch (error) {
    console.error("Error sending signature request:", error);
    return NextResponse.json(
      { error: "Failed to send signature request" },
      { status: 500 }
    );
  }
}

// GET /api/care-plans/[id]/send-signature - List signature requests for a care plan
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify the care plan belongs to the user's company
    const carePlan = await prisma.carePlan.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
    });

    if (!carePlan) {
      return NextResponse.json(
        { error: "Care plan not found" },
        { status: 404 }
      );
    }

    const signatureRequests = await prisma.carePlanSignatureRequest.findMany({
      where: {
        carePlanId: id,
      },
      include: {
        sentBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        sentAt: "desc",
      },
    });

    return NextResponse.json({ signatureRequests });
  } catch (error) {
    console.error("Error fetching signature requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch signature requests" },
      { status: 500 }
    );
  }
}
