import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const updateSettingsSchema = z.object({
  sponsorEmailInvite: z.boolean().optional(),
  sponsorEmailWelcome: z.boolean().optional(),
  sponsorEmailCheckIn: z.boolean().optional(),
  sponsorEmailCheckOut: z.boolean().optional(),
  sponsorEmailShiftCompleted: z.boolean().optional(),
  sponsorEmailIncidentReported: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can view sponsor email settings
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      select: {
        sponsorEmailInvite: true,
        sponsorEmailWelcome: true,
        sponsorEmailCheckIn: true,
        sponsorEmailCheckOut: true,
        sponsorEmailShiftCompleted: true,
        sponsorEmailIncidentReported: true,
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("Error fetching sponsor email settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch sponsor email settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can edit sponsor email settings
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = updateSettingsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const company = await prisma.company.update({
      where: { id: session.user.companyId },
      data: validation.data,
      select: {
        sponsorEmailInvite: true,
        sponsorEmailWelcome: true,
        sponsorEmailCheckIn: true,
        sponsorEmailCheckOut: true,
        sponsorEmailShiftCompleted: true,
        sponsorEmailIncidentReported: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "SPONSOR_EMAIL_SETTINGS_UPDATED",
        entityType: "Company",
        entityId: session.user.companyId,
        changes: validation.data,
      },
    });

    return NextResponse.json({
      success: true,
      ...company,
    });
  } catch (error) {
    console.error("Error updating sponsor email settings:", error);
    return NextResponse.json(
      { error: "Failed to update sponsor email settings" },
      { status: 500 }
    );
  }
}
