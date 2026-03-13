import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/invites/validate?token=xxx - Validate an invite token (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Token is required" },
        { status: 400 }
      );
    }

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
        { valid: false, error: "Invalid invite token" },
        { status: 404 }
      );
    }

    // Check if invite is still pending
    if (invite.status !== "PENDING") {
      const statusMessages: Record<string, string> = {
        ACCEPTED: "This invite has already been used",
        EXPIRED: "This invite has expired",
        REVOKED: "This invite has been revoked",
      };
      return NextResponse.json(
        { valid: false, error: statusMessages[invite.status] || "Invalid invite" },
        { status: 400 }
      );
    }

    // Check if invite has expired
    if (invite.expiresAt < new Date()) {
      // Update status to expired
      await prisma.invite.update({
        where: { id: invite.id },
        data: { status: "EXPIRED" },
      });

      return NextResponse.json(
        { valid: false, error: "This invite has expired" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      invite: {
        token: invite.token,
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expiresAt.toISOString(),
        company: invite.company,
      },
    });
  } catch (error) {
    console.error("Error validating invite:", error);
    return NextResponse.json(
      { valid: false, error: "Failed to validate invite" },
      { status: 500 }
    );
  }
}
