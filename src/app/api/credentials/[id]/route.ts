import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";
import { CredentialStatus } from "@prisma/client";

// Update credential schema
const updateSchema = z.object({
  licenseNumber: z.string().nullable().optional(),
  issuingAuthority: z.string().nullable().optional(),
  issuingState: z.string().nullable().optional(),
  issueDate: z.string().transform((s) => new Date(s)).optional(),
  expirationDate: z.string().transform((s) => new Date(s)).optional(),
  documentUrls: z.array(z.string()).optional(),
  verificationUrl: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  isVerified: z.boolean().optional(),
});

// Helper to calculate credential status
function calculateStatus(expirationDate: Date, reminderDays: number[]): CredentialStatus {
  const now = new Date();
  const daysUntilExpiration = Math.ceil(
    (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiration < 0) {
    return CredentialStatus.EXPIRED;
  }

  const minReminderDays = Math.min(...reminderDays);
  if (daysUntilExpiration <= minReminderDays) {
    return CredentialStatus.EXPIRING_SOON;
  }

  return CredentialStatus.ACTIVE;
}

// GET - Get single credential
export async function GET(
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

    const canViewAll = hasAnyPermission(role, [
      PERMISSIONS.USER_VIEW,
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]);

    const isCarer = role === "CARER";

    if (!canViewAll && !isCarer) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const credential = await prisma.caregiverCredential.findFirst({
      where: {
        id,
        caregiverProfile: {
          user: { companyId },
        },
      },
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
              },
            },
          },
        },
        verifiedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        alerts: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!credential) {
      return NextResponse.json(
        { error: "Credential not found" },
        { status: 404 }
      );
    }

    // If carer, can only view their own credentials
    if (isCarer && !canViewAll && credential.caregiverProfile.user.id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ credential });
  } catch (error) {
    console.error("Error fetching credential:", error);
    return NextResponse.json(
      { error: "Failed to fetch credential" },
      { status: 500 }
    );
  }
}

// PATCH - Update credential
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
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]);

    const isCarer = role === "CARER";

    if (!canManage && !isCarer) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch existing credential
    const existing = await prisma.caregiverCredential.findFirst({
      where: {
        id,
        caregiverProfile: {
          user: { companyId },
        },
      },
      include: {
        credentialType: true,
        caregiverProfile: {
          select: {
            user: { select: { id: true } },
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Credential not found" },
        { status: 404 }
      );
    }

    // If carer, can only update their own credentials
    if (isCarer && !canManage && existing.caregiverProfile.user.id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const result = updateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: result.error.flatten() },
        { status: 400 }
      );
    }

    // If carer is updating, they can't verify credentials
    if (isCarer && !canManage && result.data.isVerified !== undefined) {
      delete result.data.isVerified;
    }

    // Calculate new status if expiration date is changing
    let statusUpdate = {};
    const newExpirationDate = result.data.expirationDate || existing.expirationDate;
    if (result.data.expirationDate) {
      const newStatus = calculateStatus(newExpirationDate, existing.credentialType.reminderDays);
      statusUpdate = {
        status: newStatus,
        // Reset reminder tracking if renewed (new expiration date is later)
        ...(newExpirationDate > existing.expirationDate && {
          remindersSentDays: [],
          expiredAlertSent: false,
          lastReminderSent: null,
        }),
      };
    }

    // Handle verification
    let verificationUpdate = {};
    if (result.data.isVerified !== undefined && canManage) {
      verificationUpdate = {
        isVerified: result.data.isVerified,
        verifiedAt: result.data.isVerified ? new Date() : null,
        verifiedById: result.data.isVerified ? userId : null,
      };
      delete result.data.isVerified;
    }

    const credential = await prisma.caregiverCredential.update({
      where: { id },
      data: {
        ...result.data,
        ...statusUpdate,
        ...verificationUpdate,
      },
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
              },
            },
          },
        },
        verifiedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({ credential });
  } catch (error) {
    console.error("Error updating credential:", error);
    return NextResponse.json(
      { error: "Failed to update credential" },
      { status: 500 }
    );
  }
}

// DELETE - Delete credential
export async function DELETE(
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

    // Only admins can delete credentials
    const canManage = hasAnyPermission(role, [
      PERMISSIONS.USER_MANAGE,
      PERMISSIONS.USER_FULL,
    ]);

    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if credential exists
    const existing = await prisma.caregiverCredential.findFirst({
      where: {
        id,
        caregiverProfile: {
          user: { companyId },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Credential not found" },
        { status: 404 }
      );
    }

    await prisma.caregiverCredential.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting credential:", error);
    return NextResponse.json(
      { error: "Failed to delete credential" },
      { status: 500 }
    );
  }
}
