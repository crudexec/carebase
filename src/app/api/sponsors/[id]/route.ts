import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import bcrypt from "bcryptjs";
import { z } from "zod";

const updateSponsorSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  password: z.string().min(8).optional(),
  isActive: z.boolean().optional(),
});

// GET /api/sponsors/[id] - Get sponsor details
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

    const sponsor = await prisma.user.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
        role: "SPONSOR",
      },
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
        sponsoredClients: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            status: true,
            phone: true,
            address: true,
            assignedCarer: {
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

    if (!sponsor) {
      return NextResponse.json(
        { error: "Sponsor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      sponsor: {
        ...sponsor,
        lastLogin: sponsor.lastLogin?.toISOString() || null,
        createdAt: sponsor.createdAt.toISOString(),
        updatedAt: sponsor.updatedAt.toISOString(),
        clientCount: sponsor.sponsoredClients.length,
      },
    });
  } catch (error) {
    console.error("Error fetching sponsor:", error);
    return NextResponse.json(
      { error: "Failed to fetch sponsor" },
      { status: 500 }
    );
  }
}

// PATCH /api/sponsors/[id] - Update sponsor
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
    const validation = updateSponsorSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    // Get existing sponsor
    const existingSponsor = await prisma.user.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
        role: "SPONSOR",
      },
    });

    if (!existingSponsor) {
      return NextResponse.json(
        { error: "Sponsor not found" },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: {
      firstName?: string;
      lastName?: string;
      phone?: string | null;
      passwordHash?: string;
      isActive?: boolean;
    } = {};

    if (validation.data.firstName) updateData.firstName = validation.data.firstName;
    if (validation.data.lastName) updateData.lastName = validation.data.lastName;
    if (validation.data.phone !== undefined) updateData.phone = validation.data.phone;
    if (validation.data.isActive !== undefined) updateData.isActive = validation.data.isActive;
    if (validation.data.password) {
      updateData.passwordHash = await bcrypt.hash(validation.data.password, 12);
    }

    const sponsor = await prisma.user.update({
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
        sponsoredClients: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            status: true,
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "SPONSOR_UPDATED",
        entityType: "User",
        entityId: sponsor.id,
        changes: {
          firstName: validation.data.firstName,
          lastName: validation.data.lastName,
          phone: validation.data.phone,
          isActive: validation.data.isActive,
          password: validation.data.password ? "[REDACTED]" : undefined,
        },
      },
    });

    return NextResponse.json({
      sponsor: {
        ...sponsor,
        lastLogin: sponsor.lastLogin?.toISOString() || null,
        createdAt: sponsor.createdAt.toISOString(),
        updatedAt: sponsor.updatedAt.toISOString(),
        clientCount: sponsor.sponsoredClients.length,
      },
    });
  } catch (error) {
    console.error("Error updating sponsor:", error);
    return NextResponse.json(
      { error: "Failed to update sponsor" },
      { status: 500 }
    );
  }
}

// DELETE /api/sponsors/[id] - Deactivate sponsor
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

    // Get existing sponsor
    const existingSponsor = await prisma.user.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
        role: "SPONSOR",
      },
    });

    if (!existingSponsor) {
      return NextResponse.json(
        { error: "Sponsor not found" },
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
        action: "SPONSOR_DEACTIVATED",
        entityType: "User",
        entityId: id,
        changes: {
          email: existingSponsor.email,
          firstName: existingSponsor.firstName,
          lastName: existingSponsor.lastName,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deactivating sponsor:", error);
    return NextResponse.json(
      { error: "Failed to deactivate sponsor" },
      { status: 500 }
    );
  }
}
