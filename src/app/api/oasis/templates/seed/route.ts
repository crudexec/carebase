import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createOasisE2Template, OASIS_E2_STATS } from "@/lib/oasis/templates";
import { OasisSectionCode, OasisTimePoint } from "@prisma/client";

/**
 * POST /api/oasis/templates/seed
 * Seeds the OASIS-E2 template into the database
 */
export async function POST() {
  try {
    // Check if template already exists
    const existingTemplate = await prisma.oasisTemplate.findFirst({
      where: {
        name: "OASIS-E2",
        version: "E2"
      }
    });

    if (existingTemplate) {
      return NextResponse.json({
        success: false,
        message: "OASIS-E2 template already exists",
        templateId: existingTemplate.id
      }, { status: 409 });
    }

    // Create the template data
    const templateData = createOasisE2Template();

    // Create the template with all sections and items
    const template = await prisma.oasisTemplate.create({
      data: {
        name: templateData.name,
        version: templateData.version,
        description: templateData.description,
        effectiveDate: templateData.effectiveDate,
        status: templateData.status,
        isDefault: templateData.isDefault,
        sections: {
          create: templateData.sections.map(section => ({
            code: section.code as OasisSectionCode,
            name: section.name,
            description: section.description,
            order: section.order,
            items: {
              create: section.items.map(item => ({
                code: item.code,
                label: item.label,
                description: item.description,
                helpText: item.helpText,
                fieldType: item.fieldType,
                required: item.required,
                order: item.order,
                visibleAt: item.visibleAt as OasisTimePoint[],
                config: item.config as object,
                skipLogic: item.skipLogic as object[],
                validationRules: item.validation ?? undefined
              }))
            }
          }))
        }
      },
      include: {
        sections: {
          include: {
            items: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "OASIS-E2 template seeded successfully",
      templateId: template.id,
      stats: {
        ...OASIS_E2_STATS,
        sectionsCreated: template.sections.length,
        itemsCreated: template.sections.reduce((total, section) => total + section.items.length, 0)
      }
    });
  } catch (error) {
    console.error("Error seeding OASIS-E2 template:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to seed OASIS-E2 template",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/oasis/templates/seed
 * Returns template statistics without seeding
 */
export async function GET() {
  try {
    const existingTemplate = await prisma.oasisTemplate.findFirst({
      where: {
        name: "OASIS-E2",
        version: "E2"
      },
      include: {
        sections: {
          include: {
            _count: {
              select: { items: true }
            }
          }
        }
      }
    });

    return NextResponse.json({
      templateExists: !!existingTemplate,
      templateId: existingTemplate?.id || null,
      stats: OASIS_E2_STATS,
      existingStats: existingTemplate ? {
        sectionsCount: existingTemplate.sections.length,
        itemsCount: existingTemplate.sections.reduce((total, section) => total + section._count.items, 0)
      } : null
    });
  } catch (error) {
    console.error("Error checking OASIS-E2 template:", error);
    return NextResponse.json(
      {
        error: "Failed to check template status",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/oasis/templates/seed
 * Removes the OASIS-E2 template (for re-seeding)
 */
export async function DELETE() {
  try {
    const existingTemplate = await prisma.oasisTemplate.findFirst({
      where: {
        name: "OASIS-E2",
        version: "E2"
      }
    });

    if (!existingTemplate) {
      return NextResponse.json({
        success: false,
        message: "OASIS-E2 template does not exist"
      }, { status: 404 });
    }

    // Delete the template (cascading to sections and items)
    await prisma.oasisTemplate.delete({
      where: { id: existingTemplate.id }
    });

    return NextResponse.json({
      success: true,
      message: "OASIS-E2 template deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting OASIS-E2 template:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete OASIS-E2 template",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
