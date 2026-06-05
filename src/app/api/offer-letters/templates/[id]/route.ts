import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { OfferLetterTemplateStatus } from "@prisma/client";
import { removeLegacyOfferDetailTags } from "@/lib/offer-letters/legacy";

const ALLOWED_ROLES = ["ADMIN", "OPS_MANAGER"] as const;

const updateTemplateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  subject: z.string().min(1).max(300).optional(),
  bodyHtml: z.string().min(1).optional(),
  status: z.nativeEnum(OfferLetterTemplateStatus).optional(),
});

function canManage(role: string) {
  return ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number]);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!canManage(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const template = await prisma.offerLetterTemplate.findFirst({
      where: { id, companyId: session.user.companyId },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({
      template: {
        ...template,
        bodyHtml: removeLegacyOfferDetailTags(template.bodyHtml),
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching offer letter template:", error);
    return NextResponse.json(
      { error: "Failed to fetch offer letter template" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!canManage(session.user.role)) {
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

    const existing = await prisma.offerLetterTemplate.findFirst({
      where: { id, companyId: session.user.companyId },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const template = await prisma.offerLetterTemplate.update({
      where: { id },
      data: {
        ...validation.data,
        ...(validation.data.description !== undefined
          ? { description: validation.data.description || null }
          : {}),
      },
    });

    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "OFFER_LETTER_TEMPLATE_UPDATED",
        entityType: "OfferLetterTemplate",
        entityId: id,
        changes: validation.data,
      },
    });

    return NextResponse.json({
      template: {
        ...template,
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating offer letter template:", error);
    return NextResponse.json(
      { error: "Failed to update offer letter template" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!canManage(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const existing = await prisma.offerLetterTemplate.findFirst({
      where: { id, companyId: session.user.companyId },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    await prisma.offerLetterTemplate.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });

    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "OFFER_LETTER_TEMPLATE_ARCHIVED",
        entityType: "OfferLetterTemplate",
        entityId: id,
        changes: { status: "ARCHIVED" },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error archiving offer letter template:", error);
    return NextResponse.json(
      { error: "Failed to archive offer letter template" },
      { status: 500 }
    );
  }
}
