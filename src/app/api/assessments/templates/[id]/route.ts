import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AssessmentSectionType, AssessmentResponseType, Prisma } from "@prisma/client";
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

async function createTemplateSections(
  tx: Prisma.TransactionClient,
  templateId: string,
  sections: z.infer<typeof sectionSchema>[]
) {
  for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
    const section = sections[sectionIndex];

    const newSection = await tx.assessmentTemplateSection.create({
      data: {
        templateId,
        sectionType: section.sectionType as AssessmentSectionType,
        title: section.title,
        description: section.description || null,
        instructions: section.instructions || null,
        displayOrder: section.order ?? sectionIndex,
      },
    });

    for (let itemIndex = 0; itemIndex < section.items.length; itemIndex++) {
      const item = section.items[itemIndex];

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
  }
}

function mapExistingSections(
  sections: Array<{
    sectionType: string;
    title: string;
    description: string | null;
    instructions: string | null;
    displayOrder: number;
    items: Array<{
      code: string;
      question: string;
      description: string | null;
      responseType: string;
      isRequired: boolean;
      displayOrder: number;
      responseOptions: Prisma.JsonValue | null;
      minValue: number | null;
      maxValue: number | null;
      scoreMapping: Prisma.JsonValue | null;
      showIf: Prisma.JsonValue | null;
    }>;
  }>
): z.infer<typeof sectionSchema>[] {
  return sections.map((section) => {
    return {
      sectionType: section.sectionType,
      title: section.title,
      description: section.description || null,
      instructions: section.instructions || null,
      order: section.displayOrder,
      scoringConfig: null,
      items: section.items.map((item) => {
        const responseOptions =
          item.responseOptions && typeof item.responseOptions === "object" && !Array.isArray(item.responseOptions)
            ? item.responseOptions
            : item.responseOptions ?? null;

        return {
          code: item.code,
          questionText: item.question,
          description: item.description || null,
          responseType: item.responseType,
          required: item.isRequired,
          order: item.displayOrder,
          responseOptions:
            responseOptions && typeof responseOptions === "object" && !Array.isArray(responseOptions) && "options" in responseOptions
              ? (responseOptions.options as z.infer<typeof itemSchema>["responseOptions"])
              : (responseOptions as z.infer<typeof itemSchema>["responseOptions"]),
          minValue: item.minValue ?? null,
          maxValue: item.maxValue ?? null,
          scoreMapping: item.scoreMapping || null,
          showIf: item.showIf || null,
          listConfig:
            responseOptions && typeof responseOptions === "object" && !Array.isArray(responseOptions) && "listConfig" in responseOptions
              ? responseOptions.listConfig
              : null,
          repeaterConfig:
            responseOptions && typeof responseOptions === "object" && !Array.isArray(responseOptions) && "repeaterConfig" in responseOptions
              ? responseOptions.repeaterConfig
              : null,
        };
      }),
    };
  });
}

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

    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    const hasVersionedChanges =
      name !== undefined ||
      description !== undefined ||
      isRequired !== undefined ||
      scoringConfig !== undefined ||
      sections !== undefined;

    if (existingTemplate._count.assessments > 0 && hasVersionedChanges) {
      const nextVersion = existingTemplate.version + 1;
      const clonedSections = sections ?? mapExistingSections(existingTemplate.sections);
      const shouldPublishNewVersion = isActive ?? existingTemplate.isActive;

      const newTemplate = await prisma.$transaction(async (tx) => {
        const created = await tx.assessmentTemplate.create({
          data: {
            name: name ?? existingTemplate.name,
            description: description !== undefined ? description : existingTemplate.description,
            version: nextVersion,
            isRequired: isRequired ?? existingTemplate.isRequired,
            isActive: shouldPublishNewVersion,
            scoringMethod: scoringConfig?.method || existingTemplate.scoringMethod,
            maxScore: scoringConfig?.maxScore ?? existingTemplate.maxScore,
            passingScore: scoringConfig?.passingScore ?? existingTemplate.passingScore,
            scoringThresholds: scoringConfig?.thresholds ?? existingTemplate.scoringThresholds,
            companyId: existingTemplate.companyId,
            stateConfigId: existingTemplate.stateConfigId,
            displayOrder: existingTemplate.displayOrder,
          },
        });

        if (shouldPublishNewVersion) {
          await tx.assessmentTemplate.update({
            where: { id: existingTemplate.id },
            data: { isActive: false },
          });
        }

        await createTemplateSections(tx, created.id, clonedSections);

        return tx.assessmentTemplate.findUnique({
          where: { id: created.id },
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

      return NextResponse.json({
        template: newTemplate,
        versioned: true,
        message: `Created version ${nextVersion}. Existing assessments remain attached to version ${existingTemplate.version}.`,
      });
    }

    // Update template with sections in a transaction
    // Increase timeout to 30 seconds for large templates with many items
    let deletedResponsesCount = 0;
    const updatedTemplate = await prisma.$transaction(
      async (tx) => {
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

      // If sections are provided, update them while preserving response data
      if (sections) {
        // Step 1: Get existing items with their codes and IDs (for response migration)
        const existingItems = await tx.assessmentTemplateItem.findMany({
          where: {
            section: {
              templateId: id,
            },
          },
          select: { id: true, code: true },
        });

        // Create a map of code -> oldItemId for response migration
        const oldCodeToItemId = new Map<string, string>();
        for (const item of existingItems) {
          oldCodeToItemId.set(item.code, item.id);
        }

        console.log(`Found ${existingItems.length} existing items to potentially migrate responses from`);

        // Step 2: Delete existing sections (items will cascade delete)
        // Note: We do NOT delete responses here - we'll migrate them after creating new items
        await tx.assessmentTemplateSection.deleteMany({
          where: { templateId: id },
        });

        console.log("Deleted existing sections, recreating...");

        // Step 3: Create new sections and items, tracking code -> newItemId mapping
        const newCodeToItemId = new Map<string, string>();

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

          // Prepare items data for batch creation
          if (section.items.length > 0) {
            // Deduplicate items by code within this section (keep first occurrence)
            const seenCodes = new Set<string>();
            const uniqueItems = section.items.filter((item) => {
              if (seenCodes.has(item.code)) {
                console.log(`WARNING: Duplicate code "${item.code}" in section "${section.title}", skipping duplicate`);
                return false;
              }
              seenCodes.add(item.code);
              return true;
            });

            // Create items one by one to get their IDs for response migration
            for (let itemIndex = 0; itemIndex < uniqueItems.length; itemIndex++) {
              const item = uniqueItems[itemIndex];

              // Combine all config into responseOptions for storage
              let responseOptions = item.responseOptions || null;
              if (item.listConfig || item.repeaterConfig) {
                responseOptions = {
                  ...(item.responseOptions ? { options: item.responseOptions } : {}),
                  ...(item.listConfig ? { listConfig: item.listConfig } : {}),
                  ...(item.repeaterConfig ? { repeaterConfig: item.repeaterConfig } : {}),
                };
              }

              const newItem = await tx.assessmentTemplateItem.create({
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

              // Track the new item ID for this code
              newCodeToItemId.set(item.code, newItem.id);
            }

            const skippedCount = section.items.length - uniqueItems.length;
            if (skippedCount > 0) {
              console.log(`Created section "${section.title}" with ${uniqueItems.length} items (${skippedCount} duplicates skipped)`);
            } else {
              console.log(`Created section "${section.title}" with ${uniqueItems.length} items`);
            }
          } else {
            console.log(`Created section "${section.title}" with 0 items`);
          }
        }

        // Step 4: Migrate responses from old item IDs to new item IDs based on matching codes
        let migratedCount = 0;
        let orphanedCount = 0;

        for (const [code, oldItemId] of oldCodeToItemId) {
          const newItemId = newCodeToItemId.get(code);

          if (newItemId) {
            // Migrate responses to the new item ID
            const result = await tx.assessmentResponse.updateMany({
              where: { itemId: oldItemId },
              data: { itemId: newItemId },
            });
            if (result.count > 0) {
              migratedCount += result.count;
              console.log(`Migrated ${result.count} responses for code "${code}" (${oldItemId} -> ${newItemId})`);
            }
          } else {
            // Item code was removed from template - delete orphaned responses
            const result = await tx.assessmentResponse.deleteMany({
              where: { itemId: oldItemId },
            });
            if (result.count > 0) {
              orphanedCount += result.count;
              console.log(`Deleted ${result.count} orphaned responses for removed code "${code}"`);
            }
          }
        }

        if (migratedCount > 0) {
          console.log(`Successfully migrated ${migratedCount} responses to new item IDs`);
        }
        if (orphanedCount > 0) {
          deletedResponsesCount = orphanedCount;
          console.log(`Deleted ${orphanedCount} responses for items that were removed from the template`);
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
    },
    {
      maxWait: 10000, // 10 seconds max wait to acquire connection
      timeout: 60000, // 60 seconds timeout for the transaction
    }
    );

    console.log("=== PATCH COMPLETE ===");
    console.log("Updated template sections:", updatedTemplate?.sections?.length);
    if (deletedResponsesCount > 0) {
      console.log(`Deleted ${deletedResponsesCount} orphaned responses for removed template items`);
    }
    console.log("=== END ASSESSMENT TEMPLATE PATCH ===\n");

    return NextResponse.json({
      template: updatedTemplate,
      ...(deletedResponsesCount > 0 && {
        warning: `${deletedResponsesCount} response(s) were deleted because their associated questions were removed from the template`
      })
    });
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
