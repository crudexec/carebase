import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, validatePassword } from "@/lib/auth";
import { sendNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      token,
      firstName,
      lastName,
      email,
      phone,
      password,
    } = body;

    // Validate required fields
    if (!token || !firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { errors: passwordValidation.errors },
        { status: 400 }
      );
    }

    // Validate the invite token
    const invite = await prisma.invite.findUnique({
      where: { token },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Invalid invite token" },
        { status: 400 }
      );
    }

    if (invite.status !== "PENDING") {
      const statusMessages: Record<string, string> = {
        ACCEPTED: "This invite has already been used",
        EXPIRED: "This invite has expired",
        REVOKED: "This invite has been revoked",
      };
      return NextResponse.json(
        { error: statusMessages[invite.status] || "Invalid invite" },
        { status: 400 }
      );
    }

    if (invite.expiresAt < new Date()) {
      await prisma.invite.update({
        where: { id: invite.id },
        data: { status: "EXPIRED" },
      });
      return NextResponse.json(
        { error: "This invite has expired" },
        { status: 400 }
      );
    }

    // If invite has a specific email, verify it matches
    if (invite.email && invite.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: "This invite is for a different email address" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user and mark invite as used in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the user
      const user = await tx.user.create({
        data: {
          firstName,
          lastName,
          email: email.toLowerCase(),
          phone: phone || null,
          passwordHash,
          role: invite.role,
          isActive: true,
          companyId: invite.companyId,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          companyId: true,
        },
      });

      // Mark invite as accepted
      await tx.invite.update({
        where: { id: invite.id },
        data: {
          status: "ACCEPTED",
          usedAt: new Date(),
          usedById: user.id,
        },
      });

      // Log the registration
      await tx.auditLog.create({
        data: {
          userId: user.id,
          companyId: invite.companyId,
          action: "USER_REGISTERED_VIA_INVITE",
          entityType: "User",
          entityId: user.id,
          changes: {
            email: user.email,
            role: user.role,
            inviteId: invite.id,
          },
        },
      });

      return { user };
    });

    // Send welcome email
    const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || "https://app.carebasehealth.com";
    sendNotification({
      eventType: "USER_ACCOUNT_CREATED",
      recipientIds: [result.user.id],
      data: {
        firstName,
        email: email.toLowerCase(),
        tempPassword: "",
        loginUrl: `${appUrl}/login`,
      },
    }).catch((err) => {
      console.error("Failed to send welcome email:", err);
    });

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: result.user,
        company: invite.company,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
