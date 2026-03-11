import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { FormTemplateStatus } from "@prisma/client";
import { z } from "zod";

// GET /api/oasis/templates/[id] - Get single OASIS template with full structure
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const template = await prisma.oasisTemplate.findFirst({
      where: {
        id,
        OR: [
          { companyId: session.user.companyId },
          { companyId: null }, // Global templates
        ],
      },
      include: {
        sections: {
          orderBy: { order: "asc" },
          include: {
            items: {
              orderBy: { order: "asc" },
            },
          },
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

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Error fetching OASIS template:", error);
    return NextResponse.json(
      { error: "Failed to fetch OASIS template" },
      { status: 500 }
    );
  }
}

const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.nativeEnum(FormTemplateStatus).optional(),
  isDefault: z.boolean().optional(),
});

// PATCH /api/oasis/templates/[id] - Update OASIS template
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions
    if (!["ADMIN", "CLINICAL_DIRECTOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const validation = updateTemplateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    // Verify template exists and belongs to company
    const existing = await prisma.oasisTemplate.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    const { isDefault, ...updateData } = validation.data;

    // If setting as default, un-default others in this company
    if (isDefault === true && !existing.isDefault) {
      await prisma.oasisTemplate.updateMany({
        where: {
          companyId: session.user.companyId,
          isDefault: true,
          NOT: { id },
        },
        data: { isDefault: false },
      });
    }

    const template = await prisma.oasisTemplate.update({
      where: { id },
      data: {
        ...updateData,
        isDefault,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "OASIS_TEMPLATE_UPDATED",
        entityType: "OasisTemplate",
        entityId: template.id,
        changes: validation.data,
      },
    });

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Error updating OASIS template:", error);
    return NextResponse.json(
      { error: "Failed to update OASIS template" },
      { status: 500 }
    );
  }
}

// DELETE /api/oasis/templates/[id] - Delete OASIS template
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions
    if (!["ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Verify template exists and belongs to company
    const existing = await prisma.oasisTemplate.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
      include: {
        _count: {
          select: { assessments: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Don't allow deletion if assessments exist
    if (existing._count.assessments > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete template with existing assessments",
          assessmentCount: existing._count.assessments,
        },
        { status: 400 }
      );
    }

    // Delete template (cascades to sections and items)
    await prisma.oasisTemplate.delete({
      where: { id },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "OASIS_TEMPLATE_DELETED",
        entityType: "OasisTemplate",
        entityId: id,
        changes: {
          name: existing.name,
          version: existing.version,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting OASIS template:", error);
    return NextResponse.json(
      { error: "Failed to delete OASIS template" },
      { status: 500 }
    );
  }
}
