import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/intake/[id]/consents - List consent forms for this intake
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify intake exists
    const intake = await prisma.intake.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
    });

    if (!intake) {
      return NextResponse.json({ error: "Intake not found" }, { status: 404 });
    }

    const consents = await prisma.consentSignature.findMany({
      where: {
        intakeId: id,
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            description: true,
            formType: true,
            requiresWitness: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ consents });
  } catch (error) {
    console.error("Error fetching intake consents:", error);
    return NextResponse.json(
      { error: "Failed to fetch consents" },
      { status: 500 }
    );
  }
}

const createConsentSchema = z.object({
  templateId: z.string().min(1, "Template is required"),
});

// POST /api/intake/[id]/consents - Create a consent form for this intake
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify intake exists
    const intake = await prisma.intake.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
      include: {
        client: true,
      },
    });

    if (!intake) {
      return NextResponse.json({ error: "Intake not found" }, { status: 404 });
    }

    const body = await request.json();
    const validation = createConsentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { templateId } = validation.data;

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

    // Check if consent already exists (non-voided)
    const existingConsent = await prisma.consentSignature.findFirst({
      where: {
        templateId,
        intakeId: id,
        isVoided: false,
      },
    });

    if (existingConsent) {
      return NextResponse.json(
        { consent: existingConsent },
        { status: 200 }
      );
    }

    // Create consent
    const consent = await prisma.consentSignature.create({
      data: {
        companyId: session.user.companyId,
        templateId,
        clientId: intake.clientId,
        intakeId: id,
        collectedById: session.user.id,
        signatureType: "ELECTRONIC",
        signerName: `${intake.client.firstName} ${intake.client.lastName}`,
        formVersion: template.version,
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            description: true,
            formType: true,
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

// POST /api/intake/[id]/consents/batch - Create all required consent forms
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify intake exists
    const intake = await prisma.intake.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
      include: {
        client: true,
      },
    });

    if (!intake) {
      return NextResponse.json({ error: "Intake not found" }, { status: 404 });
    }

    // Get company's state config
    const companyState = await prisma.companyStateConfig.findFirst({
      where: {
        companyId: session.user.companyId,
        isPrimaryState: true,
      },
    });

    // Get required consent templates
    const requiredTemplates = await prisma.consentFormTemplate.findMany({
      where: {
        stateConfigId: companyState?.stateConfigId,
        isRequired: true,
        isActive: true,
      },
    });

    // Create consent forms for each required template
    const createdConsents = [];

    for (const template of requiredTemplates) {
      // Check if already exists
      const existing = await prisma.consentSignature.findFirst({
        where: {
          templateId: template.id,
          intakeId: id,
          isVoided: false,
        },
      });

      if (existing) {
        createdConsents.push(existing);
        continue;
      }

      const consent = await prisma.consentSignature.create({
        data: {
          companyId: session.user.companyId,
          templateId: template.id,
          clientId: intake.clientId,
          intakeId: id,
          collectedById: session.user.id,
          signatureType: "ELECTRONIC",
          signerName: `${intake.client.firstName} ${intake.client.lastName}`,
          formVersion: template.version,
        },
        include: {
          template: {
            select: {
              id: true,
              name: true,
              formType: true,
            },
          },
        },
      });

      createdConsents.push(consent);
    }

    return NextResponse.json({ consents: createdConsents });
  } catch (error) {
    console.error("Error creating batch consents:", error);
    return NextResponse.json(
      { error: "Failed to create consents" },
      { status: 500 }
    );
  }
}
