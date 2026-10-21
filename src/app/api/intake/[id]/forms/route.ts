import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateIntakeFormsSchema = z.object({
  templateIds: z.array(z.string().min(1)).max(100),
});

// PUT /api/intake/[id]/forms - Set the client form templates selected for the consent step
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const intake = await prisma.intake.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
      select: { id: true },
    });

    if (!intake) {
      return NextResponse.json({ error: "Intake not found" }, { status: 404 });
    }

    const body = await request.json();
    const validation = updateIntakeFormsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const templateIds = [...new Set(validation.data.templateIds)];

    // Only enabled client forms from this company can be selected
    const validTemplates = await prisma.formTemplate.findMany({
      where: {
        id: { in: templateIds },
        companyId: session.user.companyId,
        type: "CLIENT_FORM",
        status: "ACTIVE",
        isEnabled: true,
      },
      select: { id: true },
    });

    if (validTemplates.length !== templateIds.length) {
      return NextResponse.json(
        { error: "One or more templates are not enabled client forms" },
        { status: 400 }
      );
    }

    const existing = await prisma.intakeForm.findMany({
      where: { intakeId: id },
      select: { templateId: true },
    });

    const toRemove = existing
      .map((form) => form.templateId)
      .filter((templateId) => !templateIds.includes(templateId));

    // Forms that were already submitted for this intake stay selected
    if (toRemove.length > 0) {
      const submitted = await prisma.clientFormSubmission.findMany({
        where: { intakeId: id, templateId: { in: toRemove } },
        select: { template: { select: { name: true } } },
        distinct: ["templateId"],
      });

      if (submitted.length > 0) {
        return NextResponse.json(
          {
            error: `Submitted forms can't be removed: ${submitted
              .map((sub) => sub.template.name)
              .join(", ")}`,
          },
          { status: 400 }
        );
      }
    }

    const toAdd = templateIds.filter(
      (templateId) => !existing.some((form) => form.templateId === templateId)
    );

    await prisma.$transaction([
      prisma.intakeForm.deleteMany({
        where: { intakeId: id, templateId: { in: toRemove } },
      }),
      prisma.intakeForm.createMany({
        data: toAdd.map((templateId) => ({
          intakeId: id,
          templateId,
          addedById: session.user.id,
        })),
        skipDuplicates: true,
      }),
    ]);

    if (toAdd.length > 0 || toRemove.length > 0) {
      await prisma.auditLog.create({
        data: {
          companyId: session.user.companyId,
          userId: session.user.id,
          action: "INTAKE_FORMS_UPDATED",
          entityType: "Intake",
          entityId: id,
          changes: { added: toAdd, removed: toRemove },
        },
      });
    }

    return NextResponse.json({ templateIds });
  } catch (error) {
    console.error("Error updating intake forms:", error);
    return NextResponse.json(
      { error: "Failed to update intake forms" },
      { status: 500 }
    );
  }
}
