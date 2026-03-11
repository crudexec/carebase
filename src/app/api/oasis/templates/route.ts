import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma, FormTemplateStatus } from "@prisma/client";
import { z } from "zod";

// GET /api/oasis/templates - List OASIS templates
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const version = searchParams.get("version");
    const status = searchParams.get("status") as FormTemplateStatus | null;
    const isDefault = searchParams.get("isDefault");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: Prisma.OasisTemplateWhereInput = {
      OR: [
        { companyId: session.user.companyId },
        { companyId: null }, // Include global templates
      ],
    };

    if (version) where.version = version;
    if (status) where.status = status;
    if (isDefault !== null) where.isDefault = isDefault === "true";

    const [templates, total] = await Promise.all([
      prisma.oasisTemplate.findMany({
        where,
        include: {
          sections: {
            select: {
              id: true,
              code: true,
              name: true,
              order: true,
              _count: {
                select: { items: true },
              },
            },
            orderBy: { order: "asc" },
          },
          _count: {
            select: { assessments: true },
          },
        },
        orderBy: [{ isDefault: "desc" }, { version: "desc" }],
        take: limit,
        skip: offset,
      }),
      prisma.oasisTemplate.count({ where }),
    ]);

    return NextResponse.json({ templates, total });
  } catch (error) {
    console.error("Error fetching OASIS templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch OASIS templates" },
      { status: 500 }
    );
  }
}

const createTemplateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  version: z.string().min(1, "Version is required"),
  effectiveDate: z.string().transform((s) => new Date(s)),
  status: z.nativeEnum(FormTemplateStatus).default("DRAFT"),
  isDefault: z.boolean().default(false),
});

// POST /api/oasis/templates - Create new OASIS template
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions - only admins and clinical directors can create templates
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

    const { name, description, version, effectiveDate, status, isDefault } = validation.data;

    // If this is the default, un-default other templates in this company
    if (isDefault) {
      await prisma.oasisTemplate.updateMany({
        where: {
          companyId: session.user.companyId,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    // Create template
    const template = await prisma.oasisTemplate.create({
      data: {
        companyId: session.user.companyId,
        name,
        description,
        version,
        effectiveDate,
        status,
        isDefault,
        createdById: session.user.id,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "OASIS_TEMPLATE_CREATED",
        entityType: "OasisTemplate",
        entityId: template.id,
        changes: {
          name,
          version,
          status,
          isDefault,
        },
      },
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error("Error creating OASIS template:", error);
    return NextResponse.json(
      { error: "Failed to create OASIS template" },
      { status: 500 }
    );
  }
}
