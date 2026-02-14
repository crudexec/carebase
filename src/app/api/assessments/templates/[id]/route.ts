import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
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

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Error fetching assessment template:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessment template" },
      { status: 500 }
    );
  }
}

// PATCH /api/assessments/templates/[id] - Update template (activate/deactivate)
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can update templates
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verify template belongs to company or is a global template
    const existingTemplate = await prisma.assessmentTemplate.findFirst({
      where: {
        id,
        OR: [
          { companyId: session.user.companyId },
          { companyId: null }, // Global templates
        ],
      },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Update the template
    const updatedTemplate = await prisma.assessmentTemplate.update({
      where: { id },
      data: {
        isActive: body.isActive !== undefined ? body.isActive : existingTemplate.isActive,
        name: body.name || existingTemplate.name,
        description: body.description !== undefined ? body.description : existingTemplate.description,
      },
    });

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
