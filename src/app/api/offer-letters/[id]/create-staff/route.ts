import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma, UserRole } from "@prisma/client";
import { hashPassword } from "@/lib/password";
import { sendNotification } from "@/lib/notifications";
import { randomBytes } from "crypto";

const ALLOWED_ROLES = ["ADMIN", "OPS_MANAGER"] as const;
const STAFF_ROLES: UserRole[] = [
  "ADMIN",
  "OPS_MANAGER",
  "CLINICAL_DIRECTOR",
  "STAFF",
  "SUPERVISOR",
  "CARER",
];

function canManage(role: string) {
  return ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number]);
}

export async function POST(
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
    });

    if (!offer) {
      return NextResponse.json({ error: "Offer letter not found" }, { status: 404 });
    }
    if (offer.status !== "ACCEPTED") {
      return NextResponse.json(
        { error: "Only accepted offer letters can create staff accounts" },
        { status: 400 }
      );
    }
    if (offer.employeeId) {
      return NextResponse.json(
        { error: "This offer is already linked to a staff account" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: offer.recipientEmail.toLowerCase() },
      select: { id: true, companyId: true },
    });

    if (existingUser) {
      if (existingUser.companyId !== session.user.companyId) {
        return NextResponse.json(
          { error: "A user with this email already exists" },
          { status: 409 }
        );
      }

      const updatedOffer = await prisma.offerLetter.update({
        where: { id: offer.id },
        data: { employeeId: existingUser.id },
      });

      await prisma.auditLog.create({
        data: {
          companyId: session.user.companyId,
          userId: session.user.id,
          action: "OFFER_LETTER_LINKED_TO_EXISTING_STAFF",
          entityType: "OfferLetter",
          entityId: offer.id,
          changes: { employeeId: existingUser.id },
        },
      });

      return NextResponse.json({
        linkedExisting: true,
        offer: {
          ...updatedOffer,
          sentAt: updatedOffer.sentAt?.toISOString() || null,
          viewedAt: updatedOffer.viewedAt?.toISOString() || null,
          acceptedAt: updatedOffer.acceptedAt?.toISOString() || null,
          declinedAt: updatedOffer.declinedAt?.toISOString() || null,
          expiresAt: updatedOffer.expiresAt.toISOString(),
          createdAt: updatedOffer.createdAt.toISOString(),
          updatedAt: updatedOffer.updatedAt.toISOString(),
        },
      });
    }

    const role = offer.recipientRole && STAFF_ROLES.includes(offer.recipientRole)
      ? offer.recipientRole
      : "CARER";
    const tempPassword = generateTemporaryPassword();
    const passwordHash = await hashPassword(tempPassword);
    const recipientSnapshot = offer.recipientSnapshot as Record<string, unknown>;
    const profileData = recipientSnapshot.profile as Prisma.InputJsonValue | null | undefined;

    const user = await prisma.user.create({
      data: {
        companyId: session.user.companyId,
        email: offer.recipientEmail.toLowerCase(),
        passwordHash,
        firstName: offer.recipientFirstName,
        lastName: offer.recipientLastName,
        phone: offer.recipientPhone,
        role,
        profileData: profileData || Prisma.DbNull,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    await prisma.offerLetter.update({
      where: { id: offer.id },
      data: { employeeId: user.id },
    });

    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "STAFF_CREATED_FROM_OFFER_LETTER",
        entityType: "User",
        entityId: user.id,
        changes: {
          offerLetterId: offer.id,
          email: user.email,
          role: user.role,
        },
      },
    });

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.APP_URL ||
      process.env.NEXTAUTH_URL ||
      "https://app.carebasehealth.com";

    sendNotification({
      eventType: "USER_ACCOUNT_CREATED",
      recipientIds: [user.id],
      data: {
        firstName: user.firstName,
        email: user.email,
        tempPassword,
        loginUrl: `${appUrl.replace(/\/$/, "")}/login`,
      },
    }).catch((error) => {
      console.error("Failed to send staff account email:", error);
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Error creating staff from offer letter:", error);
    return NextResponse.json(
      { error: "Failed to create staff account from offer letter" },
      { status: 500 }
    );
  }
}

function generateTemporaryPassword() {
  return `Cb${randomBytes(8).toString("base64url")}!9a`;
}
