import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { OfferLetterTemplateStatus, Prisma } from "@prisma/client";
import { removeLegacyOfferDetailTags } from "@/lib/offer-letters/legacy";

const ALLOWED_ROLES = ["ADMIN", "OPS_MANAGER"] as const;

const templateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional().nullable(),
  subject: z.string().min(1).max(300),
  bodyHtml: z.string().min(1),
  status: z.nativeEnum(OfferLetterTemplateStatus).default("DRAFT"),
});

function canManage(role: string) {
  return ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number]);
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!canManage(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as OfferLetterTemplateStatus | null;

    const where: Prisma.OfferLetterTemplateWhereInput = {
      companyId: session.user.companyId,
      ...(status ? { status } : { status: { not: "ARCHIVED" } }),
    };

    const templates = await prisma.offerLetterTemplate.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        _count: {
          select: { offerLetters: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      templates: templates.map((template) => ({
        ...template,
        bodyHtml: removeLegacyOfferDetailTags(template.bodyHtml),
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching offer letter templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch offer letter templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!canManage(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = templateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const template = await prisma.offerLetterTemplate.create({
      data: {
        ...validation.data,
        description: validation.data.description || null,
        companyId: session.user.companyId,
        createdById: session.user.id,
      },
    });

    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "OFFER_LETTER_TEMPLATE_CREATED",
        entityType: "OfferLetterTemplate",
        entityId: template.id,
        changes: { name: template.name, status: template.status },
      },
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
    console.error("Error creating offer letter template:", error);
    return NextResponse.json(
      { error: "Failed to create offer letter template" },
      { status: 500 }
    );
  }
}
