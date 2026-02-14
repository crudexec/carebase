import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";
import { FormTemplateStatus, FormFieldType, Prisma } from "@prisma/client";

// Zod schemas for validation
const fieldConfigSchema = z.record(z.string(), z.unknown()).optional();

const fieldSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, "Field label is required"),
  type: z.nativeEnum(FormFieldType),
  required: z.boolean().default(false),
  order: z.number().int().min(0),
  config: fieldConfigSchema,
});

const sectionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Section title is required"),
  description: z.string().optional().nullable(),
  order: z.number().int().min(0),
  fields: z.array(fieldSchema),
});

const updateTemplateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  status: z.nativeEnum(FormTemplateStatus).optional(),
  isEnabled: z.boolean().optional(),
  includesDiagnoses: z.boolean().optional(),
  includesGoals: z.boolean().optional(),
  includesInterventions: z.boolean().optional(),
  includesMedications: z.boolean().optional(),
  includesOrders: z.boolean().optional(),
  sections: z.array(sectionSchema).optional(),
});

// GET /api/care-plans/templates/[id] - Get a single care plan template
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role } = session.user;
    const { id } = await params;

    // Check permissions
    const canView = hasAnyPermission(role, [
      PERMISSIONS.CARE_PLAN_VIEW,
      PERMISSIONS.CARE_PLAN_MANAGE,
    ]);

    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const template = await prisma.carePlanTemplate.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        sections: {
          include: {
            fields: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            carePlans: true,
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Care plan template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      template: {
        ...template,
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString(),
        carePlanCount: template._count.carePlans,
      },
    });
  } catch (error) {
    console.error("Error fetching care plan template:", error);
    return NextResponse.json(
      { error: "Failed to fetch care plan template" },
      { status: 500 }
    );
  }
}

// PATCH /api/care-plans/templates/[id] - Update a care plan template
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, id: userId, role } = session.user;
    const { id } = await params;

    // Check permissions
    const canManage = hasAnyPermission(role, [PERMISSIONS.CARE_PLAN_MANAGE]);

    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = updateTemplateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    // Check if template exists
    const existingTemplate = await prisma.carePlanTemplate.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        _count: {
          select: {
            carePlans: true,
          },
        },
      },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Care plan template not found" },
        { status: 404 }
      );
    }

    const {
      name,
      description,
      status,
      isEnabled,
      includesDiagnoses,
      includesGoals,
      includesInterventions,
      includesMedications,
      includesOrders,
      sections,
    } = validation.data;

    // If sections are being updated and template is ACTIVE, increment version
    const shouldIncrementVersion =
      sections !== undefined && existingTemplate.status === "ACTIVE";

    // Update template in a transaction
    const template = await prisma.$transaction(async (tx) => {
      // If sections are provided, delete existing and create new ones
      if (sections !== undefined) {
        // Delete existing sections (cascades to fields)
        await tx.carePlanTemplateSection.deleteMany({
          where: { templateId: id },
        });

        // Create new sections with fields
        for (const section of sections) {
          await tx.carePlanTemplateSection.create({
            data: {
              templateId: id,
              title: section.title,
              description: section.description,
              order: section.order,
              fields: {
                create: section.fields.map((field) => ({
                  label: field.label,
                  type: field.type,
                  required: field.required,
                  order: field.order,
                  config: (field.config || {}) as Prisma.InputJsonValue,
                })),
              },
            },
          });
        }
      }

      // Update template
      const updatedTemplate = await tx.carePlanTemplate.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(status !== undefined && { status }),
          ...(isEnabled !== undefined && { isEnabled }),
          ...(includesDiagnoses !== undefined && { includesDiagnoses }),
          ...(includesGoals !== undefined && { includesGoals }),
          ...(includesInterventions !== undefined && { includesInterventions }),
          ...(includesMedications !== undefined && { includesMedications }),
          ...(includesOrders !== undefined && { includesOrders }),
          ...(shouldIncrementVersion && { version: { increment: 1 } }),
        },
        include: {
          sections: {
            include: {
              fields: {
                orderBy: { order: "asc" },
              },
            },
            orderBy: { order: "asc" },
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          companyId,
          userId,
          action: "CARE_PLAN_TEMPLATE_UPDATED",
          entityType: "CarePlanTemplate",
          entityId: id,
          changes: {
            name,
            status,
            isEnabled,
            sectionCount: sections?.length,
          },
        },
      });

      return updatedTemplate;
    });

    return NextResponse.json({
      template: {
        ...template,
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating care plan template:", error);
    return NextResponse.json(
      { error: "Failed to update care plan template" },
      { status: 500 }
    );
  }
}

// DELETE /api/care-plans/templates/[id] - Delete a care plan template
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, id: userId, role } = session.user;
    const { id } = await params;

    // Check permissions
    const canManage = hasAnyPermission(role, [PERMISSIONS.CARE_PLAN_MANAGE]);

    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if template exists
    const template = await prisma.carePlanTemplate.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        _count: {
          select: {
            carePlans: true,
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Care plan template not found" },
        { status: 404 }
      );
    }

    // If template has care plans, archive instead of delete
    if (template._count.carePlans > 0) {
      await prisma.$transaction(async (tx) => {
        await tx.carePlanTemplate.update({
          where: { id },
          data: {
            status: "ARCHIVED",
            isEnabled: false,
          },
        });

        await tx.auditLog.create({
          data: {
            companyId,
            userId,
            action: "CARE_PLAN_TEMPLATE_ARCHIVED",
            entityType: "CarePlanTemplate",
            entityId: id,
            changes: {
              name: template.name,
              reason: "Has associated care plans",
            },
          },
        });
      });

      return NextResponse.json({
        success: true,
        archived: true,
        message: "Template archived because it has associated care plans",
      });
    }

    // Otherwise, hard delete
    await prisma.$transaction(async (tx) => {
      // Delete template (cascades to sections and fields)
      await tx.carePlanTemplate.delete({
        where: { id },
      });

      await tx.auditLog.create({
        data: {
          companyId,
          userId,
          action: "CARE_PLAN_TEMPLATE_DELETED",
          entityType: "CarePlanTemplate",
          entityId: id,
          changes: {
            name: template.name,
          },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting care plan template:", error);
    return NextResponse.json(
      { error: "Failed to delete care plan template" },
      { status: 500 }
    );
  }
}
