import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { z } from "zod";

// GET /api/consents - List consent forms
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const intakeId = searchParams.get("intakeId");
    const isVoided = searchParams.get("isVoided");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: Prisma.ConsentSignatureWhereInput = {
      companyId: session.user.companyId,
    };

    if (clientId) where.clientId = clientId;
    if (intakeId) where.intakeId = intakeId;
    if (isVoided !== null) where.isVoided = isVoided === "true";

    const [consents, total] = await Promise.all([
      prisma.consentSignature.findMany({
        where,
        include: {
          template: {
            select: {
              id: true,
              name: true,
              description: true,
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
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.consentSignature.count({ where }),
    ]);

    return NextResponse.json({ consents, total });
  } catch (error) {
    console.error("Error fetching consents:", error);
    return NextResponse.json(
      { error: "Failed to fetch consents" },
      { status: 500 }
    );
  }
}

const createConsentSchema = z.object({
  templateId: z.string().min(1, "Template is required"),
  clientId: z.string().min(1, "Client is required"),
  intakeId: z.string().optional(),
});

// POST /api/consents - Create new consent form for signing
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = createConsentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { templateId, clientId, intakeId } = validation.data;

    // Verify template exists
    const template = await prisma.consentFormTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Verify client exists and belongs to company
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        companyId: session.user.companyId,
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Check if consent already exists for this client and template (non-voided)
    const existingConsent = await prisma.consentSignature.findFirst({
      where: {
        templateId,
        clientId,
        isVoided: false,
      },
    });

    if (existingConsent) {
      return NextResponse.json(
        { error: "Consent form already exists for this client" },
        { status: 400 }
      );
    }

    // Create consent - requires initial signature data as per schema
    const consent = await prisma.consentSignature.create({
      data: {
        companyId: session.user.companyId,
        templateId,
        clientId,
        intakeId,
        collectedById: session.user.id,
        signatureType: "ELECTRONIC",
        signerName: `${client.firstName} ${client.lastName}`,
        formVersion: template.version,
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            description: true,
            formType: true,
            content: true,
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

    return NextResponse.json({ consent }, { status: 201 });
  } catch (error) {
    console.error("Error creating consent:", error);
    return NextResponse.json(
      { error: "Failed to create consent" },
      { status: 500 }
    );
  }
}
