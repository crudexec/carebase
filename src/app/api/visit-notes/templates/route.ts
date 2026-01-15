import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { Prisma, FormFieldType } from "@prisma/client";
import type { FieldConfig } from "@/lib/visit-notes/types";
import {
  createFormTemplateSchema,
  templateListQuerySchema,
  validateFieldConfig,
} from "@/lib/visit-notes/validation";

// Helper to convert FieldConfig to Prisma JSON input
function configToPrisma(
  config: FieldConfig
): Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue {
  if (config === null) {
    return Prisma.DbNull;
  }
  return config as Prisma.InputJsonValue;
}

// GET /api/visit-notes/templates - List form templates
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions
    if (
      !hasPermission(session.user.role, PERMISSIONS.FORM_TEMPLATE_VIEW) &&
      !hasPermission(session.user.role, PERMISSIONS.FORM_TEMPLATE_MANAGE)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const queryValidation = templateListQuerySchema.safeParse(
      Object.fromEntries(searchParams)
    );

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: queryValidation.error.issues },
        { status: 400 }
      );
    }

    const { type, status, isEnabled, search, page, limit } = queryValidation.data;

    // Build query filters - scope to company
    const where: Prisma.FormTemplateWhereInput = {
      companyId: session.user.companyId,
    };

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (isEnabled !== undefined) {
      where.isEnabled = isEnabled;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [templates, total] = await Promise.all([
      prisma.formTemplate.findMany({
        where,
        include: {
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              sections: true,
            },
          },
          sections: {
            include: {
              _count: {
                select: {
                  fields: true,
                },
              },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.formTemplate.count({ where }),
    ]);

    // Transform to include counts
    const templatesWithCounts = templates.map((template) => ({
      id: template.id,
      name: template.name,
      description: template.description,
      type: template.type,
      status: template.status,
      version: template.version,
      isEnabled: template.isEnabled,
      sectionsCount: template._count.sections,
      fieldsCount: template.sections.reduce(
        (sum, section) => sum + section._count.fields,
        0
      ),
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
      createdBy: template.createdBy,
    }));

    return NextResponse.json({
      templates: templatesWithCounts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching form templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch form templates" },
      { status: 500 }
    );
  }
}

// POST /api/visit-notes/templates - Create a new form template
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions
    if (!hasPermission(session.user.role, PERMISSIONS.FORM_TEMPLATE_MANAGE)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    console.log("Creating template with body:", JSON.stringify(body, null, 2));

    const validation = createFormTemplateSchema.safeParse(body);

    if (!validation.success) {
      console.error("Validation failed:", JSON.stringify(validation.error.issues, null, 2));
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name, description, type, status, isEnabled, sections } = validation.data;

    // Validate field configs
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

    // Create template with sections and fields
    const template = await prisma.formTemplate.create({
      data: {
        companyId: session.user.companyId,
        createdById: session.user.id,
        name,
        description,
        type,
        status,
        isEnabled,
        sections: {
          create: sections.map((section, sectionIndex) => ({
            title: section.title,
            description: section.description,
            order: section.order ?? sectionIndex,
            fields: {
              create: section.fields.map((field, fieldIndex) => ({
                label: field.label,
                description: field.description,
                type: field.type,
                required: field.required,
                order: field.order ?? fieldIndex,
                config: configToPrisma(field.config),
              })),
            },
          })),
        },
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

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "FORM_TEMPLATE_CREATED",
        entityType: "FormTemplate",
        entityId: template.id,
        changes: {
          name,
          status,
          sectionsCount: sections.length,
        },
      },
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error("Error creating form template:", error);
    return NextResponse.json(
      { error: "Failed to create form template" },
      { status: 500 }
    );
  }
}
