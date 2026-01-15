import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { Prisma, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const updateStaffSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  role: z.nativeEnum(UserRole).optional(),
  phone: z.string().max(20).optional().nullable(),
  password: z.string().min(8).optional(),
  isActive: z.boolean().optional(),
  profileData: z.record(z.string(), z.any()).optional().nullable(),
});

// GET /api/staff/[id] - Get staff member details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions
    if (!hasPermission(session.user.role, PERMISSIONS.USER_VIEW)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const user = await prisma.user.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
        role: { not: "SPONSOR" }, // Exclude sponsors
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        profileData: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        // Assigned clients (for carers)
        carerClients: {
          where: { status: "ACTIVE" },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            status: true,
          },
          take: 10,
        },
        // Recent shifts
        shifts: {
          orderBy: { scheduledStart: "desc" },
          take: 10,
          select: {
            id: true,
            scheduledStart: true,
            scheduledEnd: true,
            status: true,
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        // Recent visit notes
        carerVisitNotes: {
          orderBy: { submittedAt: "desc" },
          take: 10,
          select: {
            id: true,
            submittedAt: true,
            template: {
              select: {
                id: true,
                name: true,
              },
            },
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Staff member not found" },
        { status: 404 }
      );
    }

    // Get stats
    const [totalShifts, completedShifts, totalVisitNotes, totalClients] = await Promise.all([
      prisma.shift.count({
        where: { carerId: id, companyId: session.user.companyId },
      }),
      prisma.shift.count({
        where: { carerId: id, companyId: session.user.companyId, status: "COMPLETED" },
      }),
      prisma.visitNote.count({
        where: { carerId: id, companyId: session.user.companyId },
      }),
      prisma.client.count({
        where: { assignedCarerId: id, companyId: session.user.companyId, status: "ACTIVE" },
      }),
    ]);

    return NextResponse.json({
      staff: {
        ...user,
        profileData: user.profileData || null,
        lastLogin: user.lastLogin?.toISOString() || null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      stats: {
        totalShifts,
        completedShifts,
        completionRate: totalShifts > 0 ? Math.round((completedShifts / totalShifts) * 100) : 0,
        totalVisitNotes,
        assignedClients: totalClients,
      },
    });
  } catch (error) {
    console.error("Error fetching staff member:", error);
    return NextResponse.json(
      { error: "Failed to fetch staff member" },
      { status: 500 }
    );
  }
}

// PATCH /api/staff/[id] - Update staff member
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions
    if (!hasPermission(session.user.role, PERMISSIONS.USER_MANAGE)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const validation = updateStaffSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    // Get existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
        role: { not: "SPONSOR" },
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Staff member not found" },
        { status: 404 }
      );
    }

    // Prevent deactivating yourself
    if (validation.data.isActive === false && id === session.user.id) {
      return NextResponse.json(
        { error: "You cannot deactivate your own account" },
        { status: 400 }
      );
    }

    // Prevent demoting yourself from admin
    if (
      validation.data.role &&
      validation.data.role !== "ADMIN" &&
      id === session.user.id &&
      existingUser.role === "ADMIN"
    ) {
      return NextResponse.json(
        { error: "You cannot change your own admin role" },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: {
      firstName?: string;
      lastName?: string;
      role?: UserRole;
      phone?: string | null;
      passwordHash?: string;
      isActive?: boolean;
      profileData?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
    } = {};

    if (validation.data.firstName) updateData.firstName = validation.data.firstName;
    if (validation.data.lastName) updateData.lastName = validation.data.lastName;
    if (validation.data.role) updateData.role = validation.data.role;
    if (validation.data.phone !== undefined) updateData.phone = validation.data.phone;
    if (validation.data.isActive !== undefined) updateData.isActive = validation.data.isActive;
    if (validation.data.password) {
      updateData.passwordHash = await bcrypt.hash(validation.data.password, 12);
    }
    if (validation.data.profileData !== undefined) {
      updateData.profileData = validation.data.profileData
        ? (validation.data.profileData as Prisma.InputJsonValue)
        : Prisma.DbNull;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "STAFF_UPDATED",
        entityType: "User",
        entityId: user.id,
        changes: {
          firstName: validation.data.firstName,
          lastName: validation.data.lastName,
          role: validation.data.role,
          phone: validation.data.phone,
          isActive: validation.data.isActive,
          password: validation.data.password ? "[REDACTED]" : undefined,
          profileData: validation.data.profileData ? "[UPDATED]" : undefined,
        },
      },
    });

    return NextResponse.json({
      staff: {
        ...user,
        lastLogin: user.lastLogin?.toISOString() || null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating staff member:", error);
    return NextResponse.json(
      { error: "Failed to update staff member" },
      { status: 500 }
    );
  }
}

// DELETE /api/staff/[id] - Delete (deactivate) staff member
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions
    if (!hasPermission(session.user.role, PERMISSIONS.USER_MANAGE)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Prevent deleting yourself
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    // Get existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
        role: { not: "SPONSOR" },
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Staff member not found" },
        { status: 404 }
      );
    }

    // Soft delete by setting isActive to false
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "STAFF_DEACTIVATED",
        entityType: "User",
        entityId: id,
        changes: {
          email: existingUser.email,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting staff member:", error);
    return NextResponse.json(
      { error: "Failed to delete staff member" },
      { status: 500 }
    );
  }
}
