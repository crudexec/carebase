import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AssessmentSectionType, AssessmentResponseType } from "@prisma/client";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Schema for updating template sections/items
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
  listConfig: z.any().nullable().optional(),
  repeaterConfig: z.any().nullable().optional(),
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

const updateTemplateSchema = z.object({
  name: z.string().optional(),
  description: z.string().nullable().optional(),
  isRequired: z.boolean().optional(),
  isActive: z.boolean().optional(),
  scoringConfig: z.any().optional(),
  sections: z.array(sectionSchema).optional(),
});

// GET /api/assessments/templates/[id] - Get single template with full details
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const template = await prisma.assessmentTemplate.findFirst({
      where: {
        id,
        OR: [
          { companyId: session.user.companyId },
          { companyId: null }, // Global templates
        ],
      },
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
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // DEBUG: Log what's being returned
    console.log("=== ASSESSMENT TEMPLATE GET ===");
    console.log("Template ID:", template.id);
    console.log("Sections count:", template.sections.length);
    template.sections.forEach((section: any, sIdx: number) => {
      console.log(`Section ${sIdx}: "${section.title}" - ${section.items.length} items`);
      section.items.forEach((item: any, iIdx: number) => {
        console.log(`  Item ${iIdx}: id="${item.id}", code="${item.code}", type="${item.responseType}"`);
      });
    });
    console.log("=== END ASSESSMENT TEMPLATE GET ===\n");

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Error fetching assessment template:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessment template" },
      { status: 500 }
    );
  }
}

// PATCH /api/assessments/templates/[id] - Update template
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can update templates
    if (!["ADMIN", "CLINICAL_DIRECTOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validation = updateTemplateSchema.safeParse(body);
    if (!validation.success) {
      console.log("=== PATCH VALIDATION FAILED ===");
      console.log("Validation errors:", JSON.stringify(validation.error.issues, null, 2));
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name, description, isRequired, isActive, scoringConfig, sections } = validation.data;

    // DEBUG: Log what we received
    console.log("=== ASSESSMENT TEMPLATE PATCH ===");
    console.log("Template ID:", id);
    console.log("Updating sections:", sections ? "YES" : "NO");
    if (sections) {
      console.log("Sections count:", sections.length);
      sections.forEach((section, sIdx) => {
        console.log(`Section ${sIdx}: "${section.title}" - ${section.items.length} items`);
      });
    }

    // Verify template belongs to company
    const existingTemplate = await prisma.assessmentTemplate.findFirst({
      where: {
        id,
        OR: [
          { companyId: session.user.companyId },
          { companyId: null },
        ],
      },
      include: {
        _count: {
          select: { assessments: true },
        },
      },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // If sections are being updated and template has assessments, warn user
    if (sections && existingTemplate._count.assessments > 0) {
      console.log("WARNING: Template has existing assessments, but allowing edit");
      // For now, allow editing but log a warning
      // In production, you might want to create a new version instead
    }

    // Update template with sections in a transaction
    const updatedTemplate = await prisma.$transaction(async (tx) => {
      // Update template metadata
      const _template = await tx.assessmentTemplate.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(isRequired !== undefined && { isRequired }),
          ...(isActive !== undefined && { isActive }),
          ...(scoringConfig && {
            scoringMethod: scoringConfig.method || existingTemplate.scoringMethod,
            maxScore: scoringConfig.maxScore ?? existingTemplate.maxScore,
            passingScore: scoringConfig.passingScore ?? existingTemplate.passingScore,
            scoringThresholds: scoringConfig.thresholds ?? existingTemplate.scoringThresholds,
          }),
        },
      });

      // If sections are provided, delete and recreate them
      if (sections) {
        // Delete existing sections (items will cascade delete)
        await tx.assessmentTemplateSection.deleteMany({
          where: { templateId: id },
        });

        console.log("Deleted existing sections, recreating...");

        // Create new sections with items
        for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
          const section = sections[sectionIndex];

          const newSection = await tx.assessmentTemplateSection.create({
            data: {
              templateId: id,
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

            // Combine all config into responseOptions for storage
            let responseOptions = item.responseOptions || null;
            if (item.listConfig || item.repeaterConfig) {
              responseOptions = {
                ...(item.responseOptions ? { options: item.responseOptions } : {}),
                ...(item.listConfig ? { listConfig: item.listConfig } : {}),
                ...(item.repeaterConfig ? { repeaterConfig: item.repeaterConfig } : {}),
              };
            }

            await tx.assessmentTemplateItem.create({
              data: {
                sectionId: newSection.id,
                code: item.code,
                question: item.questionText,
                description: item.description || null,
                responseType: item.responseType as AssessmentResponseType,
                isRequired: item.required ?? true,
                displayOrder: item.order ?? itemIndex,
                responseOptions,
                minValue: item.minValue ?? null,
                maxValue: item.maxValue ?? null,
                scoreMapping: item.scoreMapping || null,
                showIf: item.showIf || null,
              },
            });
          }

          console.log(`Created section "${section.title}" with ${section.items.length} items`);
        }
      }

      // Fetch and return the complete updated template
      return tx.assessmentTemplate.findUnique({
        where: { id },
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

    console.log("=== PATCH COMPLETE ===");
    console.log("Updated template sections:", updatedTemplate?.sections?.length);
    console.log("=== END ASSESSMENT TEMPLATE PATCH ===\n");

    return NextResponse.json({ template: updatedTemplate });
  } catch (error) {
    console.error("Error updating assessment template:", error);
    return NextResponse.json(
      { error: "Failed to update assessment template" },
      { status: 500 }
    );
  }
}

// DELETE /api/assessments/templates/[id] - Delete template
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can delete templates
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Verify template belongs to company or is a global template
    const existingTemplate = await prisma.assessmentTemplate.findFirst({
      where: {
        id,
        OR: [
          { companyId: session.user.companyId },
          { companyId: null }, // Global templates
        ],
      },
      include: {
        _count: {
          select: { assessments: true },
        },
      },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Check if there are assessments using this template
    if (existingTemplate._count.assessments > 0) {
      return NextResponse.json(
        { error: "Cannot delete template with existing assessments. Deactivate it instead." },
        { status: 400 }
      );
    }

    // Delete the template and its sections/items (cascade)
    await prisma.assessmentTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting assessment template:", error);
    return NextResponse.json(
      { error: "Failed to delete assessment template" },
      { status: 500 }
    );
  }
}
