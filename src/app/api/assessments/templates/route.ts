import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { AssessmentSectionType, AssessmentResponseType } from "@prisma/client";

// GET /api/assessments/templates - List available assessment templates
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const _stateCode = searchParams.get("stateCode");
    const requiredOnly = searchParams.get("requiredOnly") === "true";
    const includeInactive = searchParams.get("includeInactive") === "true";

    // Get company's primary state config
    const companyState = await prisma.companyStateConfig.findFirst({
      where: {
        companyId: session.user.companyId,
        isPrimaryState: true,
      },
      include: {
        stateConfig: true,
      },
    });

    const stateConfigId = companyState?.stateConfigId;

    // Build where clause to get templates for the state, company, or global (no state/company)
    const orConditions = [];

    // State-specific templates
    if (stateConfigId) {
      orConditions.push({ stateConfigId: stateConfigId });
    }

    // Company-specific templates
    orConditions.push({ companyId: session.user.companyId });

    // Global templates (no state or company restrictions)
    orConditions.push({ stateConfigId: null, companyId: null });

    const where: Record<string, unknown> = {
      OR: orConditions,
    };

    // Only show active templates unless admin requests inactive ones
    if (!includeInactive || session.user.role !== "ADMIN") {
      where.isActive = true;
    }

    if (requiredOnly) {
      where.isRequired = true;
    }

    const templates = await prisma.assessmentTemplate.findMany({
      where,
      include: {
        sections: {
          orderBy: { displayOrder: "asc" },
          include: {
            items: {
              orderBy: { displayOrder: "asc" },
            },
          },
        },
        stateConfig: {
          select: {
            stateCode: true,
            stateName: true,
          },
        },
      },
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json({
      templates,
      stateConfig: companyState?.stateConfig || null,
    });
  } catch (error) {
    console.error("Error fetching assessment templates:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch assessment templates", details: errorMessage },
      { status: 500 }
    );
  }
}

// Schema for creating a template
const itemSchema = z.object({
  id: z.string().optional(),
  code: z.string(),
  questionText: z.string(),
  description: z.string().nullable().optional(),
  responseType: z.string(),
  required: z.boolean().default(true),
  order: z.number(),
  responseOptions: z.any().nullable().optional(),
  minValue: z.number().nullable().optional(),
  maxValue: z.number().nullable().optional(),
  scoreMapping: z.any().nullable().optional(),
  showIf: z.any().nullable().optional(),
});

const sectionSchema = z.object({
  id: z.string().optional(),
  sectionType: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  instructions: z.string().nullable().optional(),
  order: z.number(),
  scoringConfig: z.any().nullable().optional(),
  items: z.array(itemSchema).default([]),
});

const createTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  description: z.string().nullable().optional(),
  isRequired: z.boolean().default(false),
  scoringConfig: z.any().optional(),
  sections: z.array(sectionSchema).default([]),
});

// POST /api/assessments/templates - Create a new assessment template
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions - only ADMIN can create templates
    if (!["ADMIN", "CLINICAL_DIRECTOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = createTemplateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name, description, isRequired, scoringConfig, sections } = validation.data;

    // Create template with sections and items in a transaction
    const template = await prisma.$transaction(async (tx) => {
      // Create the template
      const newTemplate = await tx.assessmentTemplate.create({
        data: {
          name,
          description: description || null,
          isRequired,
          isActive: false, // Start as draft
          scoringMethod: scoringConfig?.method || "SUM",
          maxScore: scoringConfig?.maxScore || null,
          passingScore: scoringConfig?.passingScore || null,
          scoringThresholds: scoringConfig?.thresholds || null,
          companyId: session.user.companyId,
        },
      });

      // Create sections with items
      for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
        const section = sections[sectionIndex];

        const newSection = await tx.assessmentTemplateSection.create({
          data: {
            templateId: newTemplate.id,
            sectionType: section.sectionType as AssessmentSectionType,
            title: section.title,
            description: section.description || null,
            instructions: section.instructions || null,
            displayOrder: section.order ?? sectionIndex,
          },
        });

        // Create items for this section
        for (let itemIndex = 0; itemIndex < section.items.length; itemIndex++) {
          const item = section.items[itemIndex];

          await tx.assessmentTemplateItem.create({
            data: {
              sectionId: newSection.id,
              code: item.code,
              question: item.questionText,
              description: item.description || null,
              responseType: item.responseType as AssessmentResponseType,
              isRequired: item.required ?? true,
              displayOrder: item.order ?? itemIndex,
              responseOptions: item.responseOptions || null,
              minValue: item.minValue ?? null,
              maxValue: item.maxValue ?? null,
              scoreMapping: item.scoreMapping || null,
              showIf: item.showIf || null,
            },
          });
        }
      }

      // Fetch the complete template with relations
      return tx.assessmentTemplate.findUnique({
        where: { id: newTemplate.id },
        include: {
          sections: {
            orderBy: { displayOrder: "asc" },
            include: {
              items: {
                orderBy: { displayOrder: "asc" },
              },
            },
          },
        },
      });
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error("Error creating assessment template:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create assessment template", details: errorMessage },
      { status: 500 }
    );
  }
}
