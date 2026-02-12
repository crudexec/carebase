import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";

// Update alert schema
const updateSchema = z.object({
  isRead: z.boolean().optional(),
  isDismissed: z.boolean().optional(),
  actionTaken: z.string().optional(),
});

// GET - Get single alert
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role } = session.user;
    const { id } = await params;

    const canView = hasAnyPermission(role, [
      PERMISSIONS.USER_VIEW,
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]);

    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const alert = await prisma.credentialAlert.findFirst({
      where: { id, companyId },
      include: {
        credential: {
          include: {
            credentialType: true,
            caregiverProfile: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        dismissedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        actionTakenBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!alert) {
      return NextResponse.json(
        { error: "Alert not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ alert });
  } catch (error) {
    console.error("Error fetching credential alert:", error);
    return NextResponse.json(
      { error: "Failed to fetch credential alert" },
      { status: 500 }
    );
  }
}

// PATCH - Update alert (mark as read, dismiss, record action)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, role, id: userId } = session.user;
    const { id } = await params;

    const canManage = hasAnyPermission(role, [
      PERMISSIONS.USER_VIEW,
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]);

    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if alert exists
    const existing = await prisma.credentialAlert.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Alert not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const result = updateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};

    // Handle read status
    if (result.data.isRead !== undefined) {
      updateData.isRead = result.data.isRead;
      if (result.data.isRead && !existing.isRead) {
        updateData.readAt = new Date();
      }
    }

    // Handle dismiss status
    if (result.data.isDismissed !== undefined) {
      updateData.isDismissed = result.data.isDismissed;
      if (result.data.isDismissed && !existing.isDismissed) {
        updateData.dismissedAt = new Date();
        updateData.dismissedById = userId;
      }
    }

    // Handle action taken
    if (result.data.actionTaken !== undefined) {
      updateData.actionTaken = result.data.actionTaken;
      updateData.actionTakenAt = new Date();
      updateData.actionTakenById = userId;
    }

    const alert = await prisma.credentialAlert.update({
      where: { id },
      data: updateData,
      include: {
        credential: {
          select: {
            id: true,
            credentialType: {
              select: {
                name: true,
              },
            },
            caregiverProfile: {
              select: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ alert });
  } catch (error) {
    console.error("Error updating credential alert:", error);
    return NextResponse.json(
      { error: "Failed to update credential alert" },
      { status: 500 }
    );
  }
}
