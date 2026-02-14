import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";
import { FormTemplateStatus, FormFieldType, Prisma } from "@prisma/client";

// Zod schemas for validation
const fieldConfigSchema = z.record(z.unknown()).optional();

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

const createTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required").max(200),
  description: z.string().max(1000).optional().nullable(),
  status: z.nativeEnum(FormTemplateStatus).default("DRAFT"),
  isEnabled: z.boolean().default(false),
  includesDiagnoses: z.boolean().default(true),
  includesGoals: z.boolean().default(true),
  includesInterventions: z.boolean().default(true),
  includesMedications: z.boolean().default(true),
  includesOrders: z.boolean().default(true),
  sections: z.array(sectionSchema),
});

const querySchema = z.object({
  status: z.nativeEnum(FormTemplateStatus).optional(),
  isEnabled: z
    .string()
    .transform((v) => v === "true")
    .optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

// GET /api/care-plans/templates - List care plan templates
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role } = session.user;

    // Check permissions
    const canView = hasAnyPermission(role, [
      PERMISSIONS.CARE_PLAN_VIEW,
      PERMISSIONS.CARE_PLAN_MANAGE,
    ]);

    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const queryValidation = querySchema.safeParse(
      Object.fromEntries(searchParams)
    );

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: queryValidation.error.issues },
        { status: 400 }
      );
    }

    const { status, isEnabled, search, page, limit } = queryValidation.data;

    // Build where clause
    const where: {
      companyId: string;
      status?: FormTemplateStatus;
      isEnabled?: boolean;
      OR?: Array<{ name: { contains: string; mode: "insensitive" } } | { description: { contains: string; mode: "insensitive" } }>;
    } = {
      companyId,
    };

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
      prisma.carePlanTemplate.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          version: true,
          isEnabled: true,
          includesDiagnoses: true,
          includesGoals: true,
          includesInterventions: true,
          includesMedications: true,
          includesOrders: true,
          createdAt: true,
          updatedAt: true,
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              sections: true,
              carePlans: true,
            },
          },
        },
        orderBy: [{ updatedAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.carePlanTemplate.count({ where }),
    ]);

    return NextResponse.json({
      templates: templates.map((t) => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
        sectionCount: t._count.sections,
        carePlanCount: t._count.carePlans,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching care plan templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch care plan templates" },
      { status: 500 }
    );
  }
}

// POST /api/care-plans/templates - Create a new care plan template
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, id: userId, role } = session.user;

    // Check permissions
    const canManage = hasAnyPermission(role, [PERMISSIONS.CARE_PLAN_MANAGE]);

    if (!canManage) {
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

    // Create template with sections and fields in a transaction
    const template = await prisma.$transaction(async (tx) => {
      // Create the template
      const newTemplate = await tx.carePlanTemplate.create({
        data: {
          name,
          description,
          status,
          isEnabled,
          includesDiagnoses,
          includesGoals,
          includesInterventions,
          includesMedications,
          includesOrders,
          companyId,
          createdById: userId,
          sections: {
            create: sections.map((section) => ({
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
            })),
          },
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
          action: "CARE_PLAN_TEMPLATE_CREATED",
          entityType: "CarePlanTemplate",
          entityId: newTemplate.id,
          changes: {
            name,
            status,
            sectionCount: sections.length,
          },
        },
      });

      return newTemplate;
    });

    return NextResponse.json(
      {
        template: {
          ...template,
          createdAt: template.createdAt.toISOString(),
          updatedAt: template.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating care plan template:", error);
    return NextResponse.json(
      { error: "Failed to create care plan template" },
      { status: 500 }
    );
  }
}
