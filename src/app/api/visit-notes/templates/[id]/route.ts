import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/mobile-auth";
import { prisma } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { Prisma } from "@prisma/client";
import type { FieldConfig } from "@/lib/visit-notes/types";
import {
  updateFormTemplateSchema,
  validateFieldConfig,
} from "@/lib/visit-notes/validation";
import { clientFormTemplateSettingsSchema } from "@/lib/client-forms/validation";
import { getClientFormTemplateSettings } from "@/lib/client-forms/snapshots";

// Helper to convert FieldConfig to Prisma JSON input
function configToPrisma(
  config: FieldConfig
): Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue {
  if (config === null) {
    return Prisma.DbNull;
  }
  return config as Prisma.InputJsonValue;
}

function settingsToPrisma(
  settings: Record<string, unknown> | null | undefined
): Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue | undefined {
  if (settings === undefined) {
    return undefined;
  }
  if (settings === null) {
    return Prisma.DbNull;
  }
  return settings as Prisma.InputJsonValue;
}

// GET /api/visit-notes/templates/[id] - Get template details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions - allow carers to view enabled templates
    const canView =
      hasPermission(user.role, PERMISSIONS.FORM_TEMPLATE_VIEW) ||
      hasPermission(user.role, PERMISSIONS.FORM_TEMPLATE_MANAGE) ||
      hasPermission(user.role, PERMISSIONS.CLIENT_FORM_TEMPLATE_VIEW) ||
      hasPermission(user.role, PERMISSIONS.CLIENT_FORM_TEMPLATE_MANAGE) ||
      user.role === "CARER";

    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const template = await prisma.formTemplate.findFirst({
      where: { id, companyId: user.companyId },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        sections: {
          include: {
            fields: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Error fetching form template:", error);
    return NextResponse.json(
      { error: "Failed to fetch form template" },
      { status: 500 }
    );
  }
}

// PATCH /api/visit-notes/templates/[id] - Update a template
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions
    const { id } = await params;
    const body = await request.json();
    const validation = updateFormTemplateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const existingTemplate = await prisma.formTemplate.findFirst({
      where: { id, companyId: user.companyId },
      include: {
        sections: {
          include: {
            fields: true,
          },
        },
      },
    });

    if (!existingTemplate) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const canManageGeneric = hasPermission(user.role, PERMISSIONS.FORM_TEMPLATE_MANAGE);
    const canManageClientForms = hasPermission(
      user.role,
      PERMISSIONS.CLIENT_FORM_TEMPLATE_MANAGE
    );

    if (
      (existingTemplate.type === "CLIENT_FORM" && !canManageClientForms && !canManageGeneric) ||
      (existingTemplate.type !== "CLIENT_FORM" && !canManageGeneric)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, description, status, isEnabled, settings, sections } = validation.data;

    const normalizedSettings =
      existingTemplate.type === "CLIENT_FORM" && settings !== undefined
        ? getClientFormTemplateSettings(settings as Prisma.JsonValue | null)
        : settings;

    if (existingTemplate.type === "CLIENT_FORM" && normalizedSettings !== undefined) {
      const settingsValidation = clientFormTemplateSettingsSchema.safeParse(normalizedSettings);
      if (!settingsValidation.success) {
        return NextResponse.json(
          { error: "Invalid client form settings", details: settingsValidation.error.issues },
          { status: 400 }
        );
      }
    }

    // If sections are provided, validate field configs
    if (sections) {
      for (const section of sections) {
        for (const field of section.fields) {
          const configValidation = validateFieldConfig(field.type, field.config);
          if (!configValidation.valid) {
            return NextResponse.json(
              {
                error: `Invalid config for field "${field.label}": ${configValidation.error}`,
              },
              { status: 400 }
            );
          }
        }
      }
    }

    // Increment version if sections are changing
    const shouldIncrementVersion =
      sections !== undefined && existingTemplate.status === "ACTIVE";

    // Use a transaction to update everything atomically
    const template = await prisma.$transaction(
      async (tx) => {
        // When enabling a template, disable all other templates for the same company
        if (isEnabled === true) {
          await tx.formTemplate.updateMany({
            where: {
              companyId: user.companyId,
              isEnabled: true,
              id: { not: id },
            },
            data: {
              isEnabled: false,
            },
          });
        }

        // If sections are provided, delete existing and recreate
        if (sections) {
          // Delete existing sections (cascades to fields)
          await tx.formSection.deleteMany({
            where: { templateId: id },
          });

          // Create new sections and fields
          for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
            const section = sections[sectionIndex];
            await tx.formSection.create({
              data: {
                id: section.id || undefined,
                templateId: id,
                title: section.title,
                description: section.description,
                order: section.order ?? sectionIndex,
                fields: {
                  create: section.fields.map((field, fieldIndex) => ({
                    id: field.id || undefined,
                    label: field.label,
                    description: field.description,
                    type: field.type,
                    required: field.required,
                    order: field.order ?? fieldIndex,
                    config: configToPrisma(field.config),
                  })),
                },
              },
            });
          }
        }

        // Update template metadata
        return tx.formTemplate.update({
          where: { id },
          data: {
            ...(name !== undefined && { name }),
            ...(description !== undefined && { description }),
            ...(status !== undefined && { status }),
            ...(isEnabled !== undefined && { isEnabled }),
            ...(normalizedSettings !== undefined && {
              settings: settingsToPrisma(normalizedSettings as Record<string, unknown> | null),
            }),
            ...(shouldIncrementVersion && { version: existingTemplate.version + 1 }),
          },
          include: {
            createdBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            sections: {
              include: {
                fields: {
                  orderBy: { order: "asc" },
                },
              },
              orderBy: { order: "asc" },
            },
          },
        });
      },
      {
        timeout: 20000,
      }
    );

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: user.companyId,
        userId: user.id,
        action: "FORM_TEMPLATE_UPDATED",
        entityType: "FormTemplate",
        entityId: template.id,
        changes: {
          previous: {
            name: existingTemplate.name,
            status: existingTemplate.status,
            version: existingTemplate.version,
            isEnabled: existingTemplate.isEnabled,
            settings: existingTemplate.settings,
          },
          updated: {
            name: template.name,
            status: template.status,
            version: template.version,
            isEnabled: template.isEnabled,
            settings: template.settings,
            sectionsUpdated: sections !== undefined,
          },
        },
      },
    });

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Error updating form template:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update form template";
    return NextResponse.json(
      { error: "Failed to update form template", detail: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE /api/visit-notes/templates/[id] - Archive a template
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions
    const { id } = await params;

    const existingTemplate = await prisma.formTemplate.findFirst({
      where: { id, companyId: user.companyId },
    });

    if (!existingTemplate) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const canManageGeneric = hasPermission(user.role, PERMISSIONS.FORM_TEMPLATE_MANAGE);
    const canManageClientForms = hasPermission(
      user.role,
      PERMISSIONS.CLIENT_FORM_TEMPLATE_MANAGE
    );

    if (
      (existingTemplate.type === "CLIENT_FORM" && !canManageClientForms && !canManageGeneric) ||
      (existingTemplate.type !== "CLIENT_FORM" && !canManageGeneric)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if template has visit notes
    const visitNotesCount = await prisma.visitNote.count({
      where: { templateId: id },
    });

    if (visitNotesCount > 0) {
      // Archive instead of delete
      await prisma.formTemplate.update({
        where: { id },
        data: { status: "ARCHIVED", isEnabled: false },
      });

      await prisma.auditLog.create({
        data: {
          companyId: user.companyId,
          userId: user.id,
          action: "FORM_TEMPLATE_ARCHIVED",
          entityType: "FormTemplate",
          entityId: id,
          changes: {
            reason: "Template has existing visit notes",
            visitNotesCount,
          },
        },
      });

      return NextResponse.json({
        success: true,
        archived: true,
        message: "Template archived because it has existing visit notes",
      });
    }

    // Delete template (cascades to sections and fields)
    await prisma.formTemplate.delete({
      where: { id },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: user.companyId,
        userId: user.id,
        action: "FORM_TEMPLATE_DELETED",
        entityType: "FormTemplate",
        entityId: id,
        changes: {
          name: existingTemplate.name,
          status: existingTemplate.status,
        },
      },
    });

    return NextResponse.json({ success: true, deleted: true });
  } catch (error) {
    console.error("Error deleting form template:", error);
    return NextResponse.json(
      { error: "Failed to delete form template" },
      { status: 500 }
    );
  }
}
