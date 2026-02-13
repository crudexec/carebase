import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

const updateSettingsSchema = z.object({
  evvEnabled: z.boolean().optional(),
  defaultGeofenceRadius: z.number().min(50).max(1000).optional(),
});

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins and ops managers can view settings
    if (!hasPermission(session.user.role, PERMISSIONS.USER_MANAGE)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      select: {
        evvEnabled: true,
        defaultGeofenceRadius: true,
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({
      evvEnabled: company.evvEnabled,
      defaultGeofenceRadius: company.defaultGeofenceRadius,
    });
  } catch (error) {
    console.error("Error fetching EVV settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch EVV settings" },
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

    // Only admins and ops managers can edit settings
    if (!hasPermission(session.user.role, PERMISSIONS.USER_MANAGE)) {
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

    const { evvEnabled, defaultGeofenceRadius } = validation.data;

    const updateData: {
      evvEnabled?: boolean;
      defaultGeofenceRadius?: number;
    } = {};

    if (evvEnabled !== undefined) {
      updateData.evvEnabled = evvEnabled;
    }

    if (defaultGeofenceRadius !== undefined) {
      updateData.defaultGeofenceRadius = defaultGeofenceRadius;
    }

    const company = await prisma.company.update({
      where: { id: session.user.companyId },
      data: updateData,
      select: {
        evvEnabled: true,
        defaultGeofenceRadius: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "EVV_SETTINGS_UPDATED",
        entityType: "Company",
        entityId: session.user.companyId,
        changes: updateData,
      },
    });

    return NextResponse.json({
      success: true,
      evvEnabled: company.evvEnabled,
      defaultGeofenceRadius: company.defaultGeofenceRadius,
    });
  } catch (error) {
    console.error("Error updating EVV settings:", error);
    return NextResponse.json(
      { error: "Failed to update EVV settings" },
      { status: 500 }
    );
  }
}
