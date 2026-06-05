import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { OfferLetterStatus, Prisma, UserRole } from "@prisma/client";
import { buildOfferRenderContext } from "@/lib/offer-letters/context";
import {
  renderOfferTemplate,
  validateOfferTags,
} from "@/lib/offer-letters/rendering";
import { sendOfferLetterEmail } from "@/lib/offer-letters/email";
import { removeLegacyOfferDetailTags } from "@/lib/offer-letters/legacy";

const ALLOWED_ROLES = ["ADMIN", "OPS_MANAGER"] as const;

const sendOfferSchema = z.object({
  templateId: z.string().min(1),
  employeeId: z.string().optional(),
  recipientFirstName: z.string().optional(),
  recipientLastName: z.string().optional(),
  recipientEmail: z.string().email().optional(),
  recipientPhone: z.string().optional().nullable(),
  recipientRole: z.nativeEnum(UserRole).optional().nullable(),
  offerData: z.record(z.string(), z.unknown()).default({}),
  expiresInDays: z.number().int().min(1).max(90).default(14),
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
    const status = searchParams.get("status") as OfferLetterStatus | null;
    const search = searchParams.get("search");

    const where: Prisma.OfferLetterWhereInput = {
      companyId: session.user.companyId,
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { recipientFirstName: { contains: search, mode: "insensitive" } },
              { recipientLastName: { contains: search, mode: "insensitive" } },
              { recipientEmail: { contains: search, mode: "insensitive" } },
              { renderedSubject: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const offers = await prisma.offerLetter.findMany({
      where,
      include: {
        template: { select: { id: true, name: true } },
        employee: { select: { id: true, firstName: true, lastName: true, email: true } },
        sentBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({
      offers: offers.map((offer) => serializeOffer(offer)),
    });
  } catch (error) {
    console.error("Error fetching offer letters:", error);
    return NextResponse.json(
      { error: "Failed to fetch offer letters" },
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
    const validation = sendOfferSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;
    const template = await prisma.offerLetterTemplate.findFirst({
      where: {
        id: data.templateId,
        companyId: session.user.companyId,
        status: { not: "ARCHIVED" },
      },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const { context, employeeId, recipientSnapshot } = await buildOfferRenderContext({
      companyId: session.user.companyId,
      recipient: data,
      offerData: data.offerData,
    });

    const bodyHtml = removeLegacyOfferDetailTags(template.bodyHtml);
    const combinedTemplate = `${template.subject}\n${bodyHtml}`;
    const tagValidation = validateOfferTags(combinedTemplate, context);
    if (tagValidation.unknownTags.length > 0) {
      return NextResponse.json(
        {
          error: "Template contains unknown tags",
          unknownTags: tagValidation.unknownTags,
        },
        { status: 400 }
      );
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + data.expiresInDays);

    const offer = await prisma.offerLetter.create({
      data: {
        companyId: session.user.companyId,
        templateId: template.id,
        employeeId,
        sentById: session.user.id,
        status: "SENT",
        recipientEmail: context.employee.email,
        recipientFirstName: context.employee.firstName,
        recipientLastName: context.employee.lastName,
        recipientPhone: context.employee.phone || null,
        recipientRole: context.employee.role || null,
        recipientSnapshot,
        offerData: data.offerData as Prisma.InputJsonValue,
        renderedSubject: renderOfferTemplate(template.subject, context),
        renderedBodyHtml: renderOfferTemplate(bodyHtml, context),
        sentAt: new Date(),
        expiresAt,
      },
      include: {
        template: { select: { id: true, name: true } },
        employee: { select: { id: true, firstName: true, lastName: true, email: true } },
        sentBy: { select: { id: true, firstName: true, lastName: true } },
        company: { select: { name: true } },
      },
    });

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.APP_URL ||
      process.env.NEXTAUTH_URL ||
      "https://app.carebasehealth.com";
    const offerUrl = `${appUrl.replace(/\/$/, "")}/offers/${offer.token}`;

    await sendOfferLetterEmail({
      to: offer.recipientEmail,
      recipientName: `${offer.recipientFirstName} ${offer.recipientLastName}`,
      companyName: offer.company.name,
      subject: offer.renderedSubject,
      offerUrl,
      expiresAt,
    });

    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "OFFER_LETTER_SENT",
        entityType: "OfferLetter",
        entityId: offer.id,
        changes: {
          recipientEmail: offer.recipientEmail,
          templateId: template.id,
          employeeId,
          expiresAt: expiresAt.toISOString(),
        },
      },
    });

    return NextResponse.json(
      { offer: serializeOffer(offer), offerUrl },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error sending offer letter:", error);
    const message = error instanceof Error ? error.message : "Failed to send offer letter";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function serializeOffer(offer: {
  id: string;
  token: string;
  status: OfferLetterStatus;
  recipientEmail: string;
  recipientFirstName: string;
  recipientLastName: string;
  recipientPhone: string | null;
  recipientRole: UserRole | null;
  renderedSubject: string;
  sentAt: Date | null;
  viewedAt: Date | null;
  acceptedAt: Date | null;
  declinedAt: Date | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  template?: { id: string; name: string };
  employee?: { id: string; firstName: string; lastName: string; email: string } | null;
  sentBy?: { id: string; firstName: string; lastName: string };
}) {
  return {
    ...offer,
    sentAt: offer.sentAt?.toISOString() || null,
    viewedAt: offer.viewedAt?.toISOString() || null,
    acceptedAt: offer.acceptedAt?.toISOString() || null,
    declinedAt: offer.declinedAt?.toISOString() || null,
    expiresAt: offer.expiresAt.toISOString(),
    createdAt: offer.createdAt.toISOString(),
    updatedAt: offer.updatedAt.toISOString(),
  };
}
