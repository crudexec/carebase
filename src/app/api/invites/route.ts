import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";

// Only admins and ops managers can manage invites
const ALLOWED_ROLES: UserRole[] = ["ADMIN", "OPS_MANAGER"];

const createInviteSchema = z.object({
  email: z.string().email().optional(),
  role: z.enum(["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF", "SUPERVISOR", "CARER", "SPONSOR"]),
  expiresInDays: z.number().min(1).max(30).default(7),
});

// GET /api/invites - List all invites for the company
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!ALLOWED_ROLES.includes(session.user.role as UserRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const invites = await prisma.invite.findMany({
      where: {
        companyId: session.user.companyId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        usedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Auto-expire pending invites that have passed their expiration date
    const now = new Date();
    const expiredInviteIds = invites
      .filter((inv) => inv.status === "PENDING" && inv.expiresAt < now)
      .map((inv) => inv.id);

    if (expiredInviteIds.length > 0) {
      await prisma.invite.updateMany({
        where: { id: { in: expiredInviteIds } },
        data: { status: "EXPIRED" },
      });
    }

    // Update local status for response
    const updatedInvites = invites.map((inv) => ({
      ...inv,
      status: inv.status === "PENDING" && inv.expiresAt < now ? "EXPIRED" : inv.status,
    }));

    return NextResponse.json({ invites: updatedInvites });
  } catch (error) {
    console.error("Error fetching invites:", error);
    return NextResponse.json(
      { error: "Failed to fetch invites" },
      { status: 500 }
    );
  }
}

// POST /api/invites - Create a new invite
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!ALLOWED_ROLES.includes(session.user.role as UserRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = createInviteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, role, expiresInDays } = validation.data;

    // If email is provided, check if there's already a pending invite for this email
    if (email) {
      const existingInvite = await prisma.invite.findFirst({
        where: {
          companyId: session.user.companyId,
          email: email.toLowerCase(),
          status: "PENDING",
          expiresAt: { gt: new Date() },
        },
      });

      if (existingInvite) {
        return NextResponse.json(
          { error: "An active invite already exists for this email" },
          { status: 409 }
        );
      }

      // Check if user already exists with this email in this company
      const existingUser = await prisma.user.findFirst({
        where: {
          email: email.toLowerCase(),
          companyId: session.user.companyId,
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "A user with this email already exists in your company" },
          { status: 409 }
        );
      }
    }

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const invite = await prisma.invite.create({
      data: {
        email: email?.toLowerCase() || null,
        role: role as UserRole,
        expiresAt,
        companyId: session.user.companyId,
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Generate the invite URL
    const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || "https://app.carebasehealth.com";
    const inviteUrl = `${appUrl}/register/invite?token=${invite.token}`;

    return NextResponse.json(
      {
        invite,
        inviteUrl,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating invite:", error);
    return NextResponse.json(
      { error: "Failed to create invite" },
      { status: 500 }
    );
  }
}
