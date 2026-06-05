import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const responseSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("accept"),
    signatureData: z.string().min(1, "Signature is required"),
    consentConfirmed: z.boolean().refine((value) => value === true, {
      message: "You must confirm that you reviewed and accept the offer",
    }),
  }),
  z.object({
    action: z.literal("decline"),
    declineReason: z.string().max(2000).optional(),
  }),
]);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const offer = await prisma.offerLetter.findUnique({
      where: { token },
      include: {
        company: { select: { name: true, phone: true, address: true } },
        template: { select: { name: true } },
      },
    });

    if (!offer) {
      return NextResponse.json({ error: "Offer letter not found" }, { status: 404 });
    }

    const now = new Date();
    if (offer.expiresAt < now && ["SENT", "VIEWED"].includes(offer.status)) {
      await prisma.offerLetter.update({
        where: { id: offer.id },
        data: { status: "EXPIRED" },
      });
      return NextResponse.json(
        { error: "This offer letter has expired", expired: true },
        { status: 410 }
      );
    }

    if (offer.status === "CANCELLED") {
      return NextResponse.json(
        { error: "This offer letter has been cancelled" },
        { status: 410 }
      );
    }

    if (offer.status === "SENT") {
      await prisma.offerLetter.update({
        where: { id: offer.id },
        data: { status: "VIEWED", viewedAt: new Date() },
      });
      offer.status = "VIEWED";
      offer.viewedAt = new Date();
    }

    return NextResponse.json({
      offer: {
        id: offer.id,
        status: offer.status,
        renderedSubject: offer.renderedSubject,
        renderedBodyHtml: offer.renderedBodyHtml,
        recipientFirstName: offer.recipientFirstName,
        recipientLastName: offer.recipientLastName,
        recipientEmail: offer.recipientEmail,
        expiresAt: offer.expiresAt.toISOString(),
        viewedAt: offer.viewedAt?.toISOString() || null,
        acceptedAt: offer.acceptedAt?.toISOString() || null,
        declinedAt: offer.declinedAt?.toISOString() || null,
        company: offer.company,
        template: offer.template,
      },
    });
  } catch (error) {
    console.error("Error fetching public offer letter:", error);
    return NextResponse.json(
      { error: "Failed to fetch offer letter" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const offer = await prisma.offerLetter.findUnique({
      where: { token },
      include: {
        company: { select: { name: true } },
      },
    });

    if (!offer) {
      return NextResponse.json({ error: "Offer letter not found" }, { status: 404 });
    }
    if (offer.expiresAt < new Date()) {
      await prisma.offerLetter.update({
        where: { id: offer.id },
        data: { status: "EXPIRED" },
      });
      return NextResponse.json(
        { error: "This offer letter has expired" },
        { status: 410 }
      );
    }
    if (!["SENT", "VIEWED"].includes(offer.status)) {
      return NextResponse.json(
        { error: "This offer letter can no longer be updated" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = responseSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const forwardedFor = request.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";

    if (validation.data.action === "accept") {
      const updated = await prisma.offerLetter.update({
        where: { id: offer.id },
        data: {
          status: "ACCEPTED",
          acceptedAt: new Date(),
          signatureData: validation.data.signatureData,
          signedIpAddress: ipAddress,
        },
      });

      await prisma.auditLog.create({
        data: {
          companyId: offer.companyId,
          userId: offer.sentById,
          action: "OFFER_LETTER_ACCEPTED",
          entityType: "OfferLetter",
          entityId: offer.id,
          changes: {
            recipientEmail: offer.recipientEmail,
            signedIpAddress: ipAddress,
          },
        },
      });

      return NextResponse.json({
        offer: {
          id: updated.id,
          status: updated.status,
          acceptedAt: updated.acceptedAt?.toISOString() || null,
        },
      });
    }

    const updated = await prisma.offerLetter.update({
      where: { id: offer.id },
      data: {
        status: "DECLINED",
        declinedAt: new Date(),
        declineReason: validation.data.declineReason || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        companyId: offer.companyId,
        userId: offer.sentById,
        action: "OFFER_LETTER_DECLINED",
        entityType: "OfferLetter",
        entityId: offer.id,
        changes: {
          recipientEmail: offer.recipientEmail,
          declineReason: validation.data.declineReason || null,
        },
      },
    });

    return NextResponse.json({
      offer: {
        id: updated.id,
        status: updated.status,
        declinedAt: updated.declinedAt?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error("Error submitting public offer letter response:", error);
    return NextResponse.json(
      { error: "Failed to submit offer letter response" },
      { status: 500 }
    );
  }
}
