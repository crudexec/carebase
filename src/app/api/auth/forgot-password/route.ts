import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";
import { emailChannel } from "@/lib/notifications/channels/email";
import { getDefaultTemplate } from "@/lib/notifications/templates/defaults";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Token expires in 1 hour
const TOKEN_EXPIRY_HOURS = 1;

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    const validation = forgotPasswordSchema.safeParse(requestBody);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { company: true },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      console.log(`[Forgot Password] No user found for email: ${email}`);
      return NextResponse.json({
        message: "If an account exists with this email, you will receive a password reset link.",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      console.log(`[Forgot Password] Inactive user attempted reset: ${email}`);
      return NextResponse.json({
        message: "If an account exists with this email, you will receive a password reset link.",
      });
    }

    // Invalidate any existing tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: {
        usedAt: new Date(), // Mark as used to invalidate
      },
    });

    // Generate secure token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    // Create password reset token
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // Build reset URL
    const baseUrl = process.env.NEXTAUTH_URL || "https://app.carebasehealth.com";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    // Get email template
    const template = getDefaultTemplate("PASSWORD_RESET", "EMAIL");
    if (!template) {
      console.error("[Forgot Password] Email template not found");
      return NextResponse.json({
        message: "If an account exists with this email, you will receive a password reset link.",
      });
    }

    // Replace template variables
    const subject = template.subject;
    const emailBody = template.body
      .replace(/\{\{firstName\}\}/g, user.firstName)
      .replace(/\{\{resetUrl\}\}/g, resetUrl)
      .replace(/\{\{expiresIn\}\}/g, `${TOKEN_EXPIRY_HOURS} hour`)
      .replace(/\{\{companyName\}\}/g, user.company.name);

    // Send email
    const result = await emailChannel.send({
      to: user.email,
      subject,
      body: emailBody,
    });

    if (!result.success) {
      console.error(`[Forgot Password] Failed to send email to ${email}:`, result.error);
      // Still return success to prevent enumeration
    } else {
      console.log(`[Forgot Password] Reset email sent to ${email}`);
    }

    return NextResponse.json({
      message: "If an account exists with this email, you will receive a password reset link.",
    });
  } catch (error) {
    console.error("[Forgot Password] Error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
