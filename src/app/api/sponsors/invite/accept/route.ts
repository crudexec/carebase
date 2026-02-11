import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { sendNotification } from "@/lib/notifications";

const acceptInviteSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

// POST /api/sponsors/invite/accept - Complete sponsor registration
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = acceptInviteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { token, password } = validation.data;

    // Find the invite token
    const inviteToken = await prisma.sponsorInviteToken.findUnique({
      where: { token },
      include: { company: true, client: true },
    });

    // Check if token exists
    if (!inviteToken) {
      return NextResponse.json(
        { error: "Invalid or expired invitation link." },
        { status: 400 }
      );
    }

    // Check if token has been used
    if (inviteToken.usedAt) {
      return NextResponse.json(
        { error: "This invitation has already been used." },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (new Date() > inviteToken.expiresAt) {
      return NextResponse.json(
        { error: "This invitation has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Check if email is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: inviteToken.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 400 }
      );
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user and update client in a transaction
    const sponsor = await prisma.$transaction(async (tx) => {
      // Create the sponsor user
      const user = await tx.user.create({
        data: {
          email: inviteToken.email,
          passwordHash,
          firstName: inviteToken.firstName,
          lastName: inviteToken.lastName,
          phone: inviteToken.phone,
          role: "SPONSOR",
          companyId: inviteToken.companyId,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      });

      // Link to client if specified
      if (inviteToken.clientId) {
        await tx.client.update({
          where: { id: inviteToken.clientId },
          data: { sponsorId: user.id },
        });
      }

      // Mark token as used
      await tx.sponsorInviteToken.update({
        where: { id: inviteToken.id },
        data: { usedAt: new Date() },
      });

      return user;
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: inviteToken.companyId,
        userId: sponsor.id,
        action: "SPONSOR_REGISTERED",
        entityType: "User",
        entityId: sponsor.id,
        changes: {
          email: inviteToken.email,
          firstName: inviteToken.firstName,
          lastName: inviteToken.lastName,
          clientId: inviteToken.clientId || null,
        },
      },
    });

    // Send welcome notification
    const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || "https://app.carebasehealth.com";
    sendNotification({
      eventType: "USER_ACCOUNT_CREATED",
      recipientIds: [sponsor.id],
      data: {
        firstName: sponsor.firstName,
        email: sponsor.email,
        tempPassword: "", // They set their own password
        loginUrl: `${appUrl}/login`,
      },
    }).catch((err) => {
      console.error("[Sponsor Accept] Failed to send welcome email:", err);
    });

    console.log(`[Sponsor Accept] Sponsor registered: ${sponsor.email}`);

    return NextResponse.json({
      success: true,
      message: "Your account has been created. You can now sign in.",
    });
  } catch (error) {
    console.error("[Sponsor Accept] Error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}

// GET /api/sponsors/invite/accept?token=xxx - Validate token
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "No token provided" },
        { status: 400 }
      );
    }

    const inviteToken = await prisma.sponsorInviteToken.findUnique({
      where: { token },
      include: { company: true },
    });

    if (!inviteToken) {
      return NextResponse.json({
        valid: false,
        error: "Invalid invitation link",
      });
    }

    if (inviteToken.usedAt) {
      return NextResponse.json({
        valid: false,
        error: "This invitation has already been used",
      });
    }

    if (new Date() > inviteToken.expiresAt) {
      return NextResponse.json({
        valid: false,
        error: "This invitation has expired",
      });
    }

    // Check if email is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: inviteToken.email },
    });

    if (existingUser) {
      return NextResponse.json({
        valid: false,
        error: "An account with this email already exists",
      });
    }

    return NextResponse.json({
      valid: true,
      firstName: inviteToken.firstName,
      lastName: inviteToken.lastName,
      email: inviteToken.email,
      companyName: inviteToken.company.name,
    });
  } catch (error) {
    console.error("[Sponsor Accept] Token validation error:", error);
    return NextResponse.json(
      { valid: false, error: "An error occurred" },
      { status: 500 }
    );
  }
}
