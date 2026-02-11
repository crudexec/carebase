import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { randomBytes } from "crypto";
import { z } from "zod";
import { emailChannel } from "@/lib/notifications/channels/email";
import { getDefaultTemplate } from "@/lib/notifications/templates/defaults";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  phone: z.string().max(20).optional().nullable(),
  clientId: z.string().optional().nullable(),
});

// Token expires in 7 days
const TOKEN_EXPIRY_DAYS = 7;

// POST /api/sponsors/invite - Send sponsor invite email
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions
    if (!hasPermission(session.user.role, PERMISSIONS.USER_MANAGE)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = inviteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, firstName, lastName, phone, clientId } = validation.data;
    const lowerEmail = email.toLowerCase();

    // Check if email already exists as a user
    const existingUser = await prisma.user.findUnique({
      where: { email: lowerEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "This email is already registered. The sponsor may already have an account." },
        { status: 400 }
      );
    }

    // Validate client if provided
    let clientName = "";
    if (clientId) {
      const client = await prisma.client.findFirst({
        where: {
          id: clientId,
          companyId: session.user.companyId,
        },
      });

      if (!client) {
        return NextResponse.json(
          { error: "Client not found" },
          { status: 400 }
        );
      }
      clientName = `${client.firstName} ${client.lastName}`;
    }

    // Get company info
    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 500 }
      );
    }

    // Invalidate any existing invite tokens for this email
    await prisma.sponsorInviteToken.updateMany({
      where: {
        email: lowerEmail,
        companyId: session.user.companyId,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    // Generate secure token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    // Create invite token
    await prisma.sponsorInviteToken.create({
      data: {
        token,
        email: lowerEmail,
        firstName,
        lastName,
        phone: phone || null,
        companyId: session.user.companyId,
        clientId: clientId || null,
        expiresAt,
        createdById: session.user.id,
      },
    });

    // Build invite URL
    const baseUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || "https://app.carebasehealth.com";
    const inviteUrl = `${baseUrl}/sponsor-invite?token=${token}`;

    // Get inviter name
    const inviterName = `${session.user.firstName} ${session.user.lastName}`;

    // Get email template
    const template = getDefaultTemplate("SPONSOR_INVITED", "EMAIL");
    if (!template) {
      console.error("[Sponsor Invite] Email template not found");
      return NextResponse.json(
        { error: "Failed to send invitation" },
        { status: 500 }
      );
    }

    // Replace template variables
    const subject = template.subject
      ?.replace(/\{\{companyName\}\}/g, company.name) || "You've been invited to CareBase";

    const emailBody = template.body
      .replace(/\{\{firstName\}\}/g, firstName)
      .replace(/\{\{inviterName\}\}/g, inviterName)
      .replace(/\{\{companyName\}\}/g, company.name)
      .replace(/\{\{inviteUrl\}\}/g, inviteUrl)
      .replace(/\{\{clientName\}\}/g, clientName);

    // Send email
    const result = await emailChannel.send({
      to: lowerEmail,
      subject,
      body: emailBody,
    });

    if (!result.success) {
      console.error(`[Sponsor Invite] Failed to send email to ${lowerEmail}:`, result.error);
      return NextResponse.json(
        { error: "Failed to send invitation email" },
        { status: 500 }
      );
    }

    console.log(`[Sponsor Invite] Invite email sent to ${lowerEmail}`);

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "SPONSOR_INVITED",
        entityType: "SponsorInviteToken",
        entityId: token,
        changes: {
          email: lowerEmail,
          firstName,
          lastName,
          clientId: clientId || null,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Invitation sent to ${lowerEmail}`,
    });
  } catch (error) {
    console.error("[Sponsor Invite] Error:", error);
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
}
