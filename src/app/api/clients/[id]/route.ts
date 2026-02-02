import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/mobile-auth";
import { prisma } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { ClientStatus } from "@prisma/client";
import { z } from "zod";

const updateClientSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  dateOfBirth: z.string().nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  medicalNotes: z.string().nullable().optional(),
  status: z.nativeEnum(ClientStatus).optional(),
  assignedCarerId: z.string().nullable().optional(),
  sponsorId: z.string().nullable().optional(),
});

// GET /api/clients/[id] - Get client details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions - allow carers to view their assigned clients
    const canView =
      hasPermission(user.role, PERMISSIONS.USER_VIEW) ||
      hasPermission(user.role, PERMISSIONS.SCHEDULING_VIEW) ||
      hasPermission(user.role, PERMISSIONS.ONBOARDING_VIEW) ||
      user.role === "CARER";

    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const client = await prisma.client.findFirst({
      where: {
        id,
        companyId: user.companyId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        address: true,
        latitude: true,
        longitude: true,
        phone: true,
        medicalNotes: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        sponsor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        assignedCarer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({
      client: {
        ...client,
        latitude: client.latitude ? Number(client.latitude) : null,
        longitude: client.longitude ? Number(client.longitude) : null,
        dateOfBirth: client.dateOfBirth?.toISOString() || null,
        createdAt: client.createdAt.toISOString(),
        updatedAt: client.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching client:", error);
    return NextResponse.json(
      { error: "Failed to fetch client" },
      { status: 500 }
    );
  }
}

// PATCH /api/clients/[id] - Update client
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions
    if (!hasPermission(user.role, PERMISSIONS.USER_MANAGE)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const validation = updateClientSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    // Get existing client
    const existingClient = await prisma.client.findFirst({
      where: {
        id,
        companyId: user.companyId,
      },
    });

    if (!existingClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const {
      firstName,
      lastName,
      dateOfBirth,
      address,
      phone,
      medicalNotes,
      status,
      assignedCarerId,
      sponsorId,
    } = validation.data;

    // Validate assigned carer if provided
    if (assignedCarerId) {
      const carer = await prisma.user.findFirst({
        where: {
          id: assignedCarerId,
          companyId: user.companyId,
          role: "CARER",
          isActive: true,
        },
      });

      if (!carer) {
        return NextResponse.json(
          { error: "Invalid carer assignment" },
          { status: 400 }
        );
      }
    }

    // Validate sponsor if provided
    if (sponsorId) {
      const sponsor = await prisma.user.findFirst({
        where: {
          id: sponsorId,
          companyId: user.companyId,
          role: "SPONSOR",
          isActive: true,
        },
      });

      if (!sponsor) {
        return NextResponse.json(
          { error: "Invalid sponsor assignment" },
          { status: 400 }
        );
      }
    }

    // Build update data
    const updateData: {
      firstName?: string;
      lastName?: string;
      dateOfBirth?: Date | null;
      address?: string | null;
      phone?: string | null;
      medicalNotes?: string | null;
      status?: ClientStatus;
      assignedCarerId?: string | null;
      sponsorId?: string | null;
    } = {};

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (dateOfBirth !== undefined) {
      updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    }
    if (address !== undefined) updateData.address = address;
    if (phone !== undefined) updateData.phone = phone;
    if (medicalNotes !== undefined) updateData.medicalNotes = medicalNotes;
    if (status !== undefined) updateData.status = status;
    if (assignedCarerId !== undefined) updateData.assignedCarerId = assignedCarerId;
    if (sponsorId !== undefined) updateData.sponsorId = sponsorId;

    const client = await prisma.client.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        address: true,
        phone: true,
        medicalNotes: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        sponsor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        assignedCarer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: user.companyId,
        userId: user.id,
        action: "CLIENT_UPDATED",
        entityType: "Client",
        entityId: client.id,
        changes: validation.data,
      },
    });

    return NextResponse.json({
      client: {
        ...client,
        dateOfBirth: client.dateOfBirth?.toISOString() || null,
        createdAt: client.createdAt.toISOString(),
        updatedAt: client.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating client:", error);
    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 }
    );
  }
}

// DELETE /api/clients/[id] - Delete (set inactive) client
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions
    if (!hasPermission(user.role, PERMISSIONS.USER_MANAGE)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Get existing client
    const existingClient = await prisma.client.findFirst({
      where: {
        id,
        companyId: user.companyId,
      },
    });

    if (!existingClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Soft delete by setting status to INACTIVE
    await prisma.client.update({
      where: { id },
      data: { status: "INACTIVE" },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: user.companyId,
        userId: user.id,
        action: "CLIENT_DEACTIVATED",
        entityType: "Client",
        entityId: id,
        changes: {
          firstName: existingClient.firstName,
          lastName: existingClient.lastName,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting client:", error);
    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 }
    );
  }
}
