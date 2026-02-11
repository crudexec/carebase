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
  clientsToAdd: z.array(z.string()).optional(),
  clientsToRemove: z.array(z.string()).optional(),
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

    // Use transaction if we have client changes
    const { clientsToAdd, clientsToRemove } = validation.data;
    const hasClientChanges = (clientsToAdd && clientsToAdd.length > 0) || (clientsToRemove && clientsToRemove.length > 0);

    let sponsor;

    if (hasClientChanges) {
      // Use transaction for atomic update
      sponsor = await prisma.$transaction(async (tx) => {
        // Update user data
        await tx.user.update({
          where: { id },
          data: updateData,
        });

        // Remove sponsor from clients
        if (clientsToRemove && clientsToRemove.length > 0) {
          await tx.client.updateMany({
            where: {
              id: { in: clientsToRemove },
              companyId: session.user.companyId,
              sponsorId: id,
            },
            data: { sponsorId: null },
          });
        }

        // Add sponsor to clients
        if (clientsToAdd && clientsToAdd.length > 0) {
          await tx.client.updateMany({
            where: {
              id: { in: clientsToAdd },
              companyId: session.user.companyId,
            },
            data: { sponsorId: id },
          });
        }

        // Return updated user with clients
        return tx.user.findUnique({
          where: { id },
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
      });
    } else {
      // Simple update without client changes
      sponsor = await prisma.user.update({
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
    }

    if (!sponsor) {
      return NextResponse.json(
        { error: "Failed to update sponsor" },
        { status: 500 }
      );
    }

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
          clientsAdded: clientsToAdd,
          clientsRemoved: clientsToRemove,
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

// DELETE /api/sponsors/[id] - Permanently delete sponsor
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

    // Get existing sponsor with their clients
    const existingSponsor = await prisma.user.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
        role: "SPONSOR",
      },
      include: {
        sponsoredClients: {
          select: { id: true },
        },
      },
    });

    if (!existingSponsor) {
      return NextResponse.json(
        { error: "Sponsor not found" },
        { status: 404 }
      );
    }

    // Use transaction to safely delete sponsor
    await prisma.$transaction(async (tx) => {
      // Remove sponsor assignment from all clients
      if (existingSponsor.sponsoredClients.length > 0) {
        await tx.client.updateMany({
          where: { sponsorId: id },
          data: { sponsorId: null },
        });
      }

      // Delete any notifications for this user
      await tx.notification.deleteMany({
        where: { userId: id },
      });

      // Delete the user
      await tx.user.delete({
        where: { id },
      });
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "SPONSOR_DELETED",
        entityType: "User",
        entityId: id,
        changes: {
          email: existingSponsor.email,
          firstName: existingSponsor.firstName,
          lastName: existingSponsor.lastName,
          clientsUnassigned: existingSponsor.sponsoredClients.length,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting sponsor:", error);
    return NextResponse.json(
      { error: "Failed to delete sponsor" },
      { status: 500 }
    );
  }
}
