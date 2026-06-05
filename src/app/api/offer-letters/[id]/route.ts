import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const ALLOWED_ROLES = ["ADMIN", "OPS_MANAGER"] as const;

const updateSchema = z.object({
  status: z.enum(["CANCELLED"]).optional(),
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
    const offer = await prisma.offerLetter.findFirst({
      where: { id, companyId: session.user.companyId },
      include: {
        template: { select: { id: true, name: true } },
        employee: { select: { id: true, firstName: true, lastName: true, email: true } },
        sentBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!offer) {
      return NextResponse.json({ error: "Offer letter not found" }, { status: 404 });
    }

    return NextResponse.json({
      offer: {
        ...offer,
        sentAt: offer.sentAt?.toISOString() || null,
        viewedAt: offer.viewedAt?.toISOString() || null,
        acceptedAt: offer.acceptedAt?.toISOString() || null,
        declinedAt: offer.declinedAt?.toISOString() || null,
        expiresAt: offer.expiresAt.toISOString(),
        createdAt: offer.createdAt.toISOString(),
        updatedAt: offer.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching offer letter:", error);
    return NextResponse.json(
      { error: "Failed to fetch offer letter" },
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
    const validation = updateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const existing = await prisma.offerLetter.findFirst({
      where: { id, companyId: session.user.companyId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Offer letter not found" }, { status: 404 });
    }
    if (["ACCEPTED", "DECLINED", "CANCELLED"].includes(existing.status)) {
      return NextResponse.json(
        { error: "This offer can no longer be cancelled" },
        { status: 400 }
      );
    }

    const offer = await prisma.offerLetter.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "OFFER_LETTER_CANCELLED",
        entityType: "OfferLetter",
        entityId: id,
        changes: { previousStatus: existing.status, status: offer.status },
      },
    });

    return NextResponse.json({
      offer: {
        ...offer,
        sentAt: offer.sentAt?.toISOString() || null,
        viewedAt: offer.viewedAt?.toISOString() || null,
        acceptedAt: offer.acceptedAt?.toISOString() || null,
        declinedAt: offer.declinedAt?.toISOString() || null,
        expiresAt: offer.expiresAt.toISOString(),
        createdAt: offer.createdAt.toISOString(),
        updatedAt: offer.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating offer letter:", error);
    return NextResponse.json(
      { error: "Failed to update offer letter" },
      { status: 500 }
    );
  }
}
