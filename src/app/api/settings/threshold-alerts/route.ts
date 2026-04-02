import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const updateSettingsSchema = z.object({
  thresholdAlertsEnabled: z.boolean(),
});

// GET /api/settings/threshold-alerts - Get current threshold alert settings
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      select: {
        thresholdAlertsEnabled: true,
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({
      thresholdAlertsEnabled: company.thresholdAlertsEnabled,
    });
  } catch (error) {
    console.error("Error fetching threshold alert settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch threshold alert settings" },
      { status: 500 }
    );
  }
}

// PATCH /api/settings/threshold-alerts - Update threshold alert settings
// Admin only
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can update company-level settings
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

    const { thresholdAlertsEnabled } = validation.data;

    const company = await prisma.company.update({
      where: { id: session.user.companyId },
      data: { thresholdAlertsEnabled },
      select: {
        thresholdAlertsEnabled: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "THRESHOLD_ALERTS_SETTING_UPDATED",
        entityType: "Company",
        entityId: session.user.companyId,
        changes: { thresholdAlertsEnabled },
      },
    });

    return NextResponse.json({
      success: true,
      thresholdAlertsEnabled: company.thresholdAlertsEnabled,
    });
  } catch (error) {
    console.error("Error updating threshold alert settings:", error);
    return NextResponse.json(
      { error: "Failed to update threshold alert settings" },
      { status: 500 }
    );
  }
}
