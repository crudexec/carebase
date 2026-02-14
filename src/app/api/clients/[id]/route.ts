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
  // Insurance fields
  medicaidId: z.string().max(50).nullable().optional(),
  medicaidPayerId: z.string().max(50).nullable().optional(),
  secondaryInsuranceId: z.string().max(50).nullable().optional(),
  secondaryPayerId: z.string().max(50).nullable().optional(),
  // PCP (Primary Care Physician) fields
  physicianName: z.string().max(200).nullable().optional(),
  physicianNpi: z.string().max(20).nullable().optional(),
  physicianPhone: z.string().max(20).nullable().optional(),
  physicianFax: z.string().max(20).nullable().optional(),
  physicianAddress: z.string().max(500).nullable().optional(),
  // Referral fields
  referralSource: z.string().max(200).nullable().optional(),
  referralDate: z.string().nullable().optional(),
  referringPhysicianName: z.string().max(200).nullable().optional(),
  referringPhysicianNpi: z.string().max(20).nullable().optional(),
  referringPhysicianPhone: z.string().max(20).nullable().optional(),
  referringPhysicianFax: z.string().max(20).nullable().optional(),
  referralNotes: z.string().nullable().optional(),
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
        // Insurance fields
        medicaidId: true,
        medicaidPayerId: true,
        secondaryInsuranceId: true,
        secondaryPayerId: true,
        // PCP fields
        physicianName: true,
        physicianNpi: true,
        physicianPhone: true,
        physicianFax: true,
        physicianAddress: true,
        // Referral fields
        referralSource: true,
        referralDate: true,
        referringPhysicianName: true,
        referringPhysicianNpi: true,
        referringPhysicianPhone: true,
        referringPhysicianFax: true,
        referralNotes: true,
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
      // Insurance fields
      medicaidId,
      medicaidPayerId,
      secondaryInsuranceId,
      secondaryPayerId,
      // PCP fields
      physicianName,
      physicianNpi,
      physicianPhone,
      physicianFax,
      physicianAddress,
      // Referral fields
      referralSource,
      referralDate,
      referringPhysicianName,
      referringPhysicianNpi,
      referringPhysicianPhone,
      referringPhysicianFax,
      referralNotes,
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
      // Insurance fields
      medicaidId?: string | null;
      medicaidPayerId?: string | null;
      secondaryInsuranceId?: string | null;
      secondaryPayerId?: string | null;
      // PCP fields
      physicianName?: string | null;
      physicianNpi?: string | null;
      physicianPhone?: string | null;
      physicianFax?: string | null;
      physicianAddress?: string | null;
      // Referral fields
      referralSource?: string | null;
      referralDate?: Date | null;
      referringPhysicianName?: string | null;
      referringPhysicianNpi?: string | null;
      referringPhysicianPhone?: string | null;
      referringPhysicianFax?: string | null;
      referralNotes?: string | null;
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
    // Insurance fields
    if (medicaidId !== undefined) updateData.medicaidId = medicaidId;
    if (medicaidPayerId !== undefined) updateData.medicaidPayerId = medicaidPayerId;
    if (secondaryInsuranceId !== undefined) updateData.secondaryInsuranceId = secondaryInsuranceId;
    if (secondaryPayerId !== undefined) updateData.secondaryPayerId = secondaryPayerId;
    // PCP fields
    if (physicianName !== undefined) updateData.physicianName = physicianName;
    if (physicianNpi !== undefined) updateData.physicianNpi = physicianNpi;
    if (physicianPhone !== undefined) updateData.physicianPhone = physicianPhone;
    if (physicianFax !== undefined) updateData.physicianFax = physicianFax;
    if (physicianAddress !== undefined) updateData.physicianAddress = physicianAddress;
    // Referral fields
    if (referralSource !== undefined) updateData.referralSource = referralSource;
    if (referralDate !== undefined) {
      updateData.referralDate = referralDate ? new Date(referralDate) : null;
    }
    if (referringPhysicianName !== undefined) updateData.referringPhysicianName = referringPhysicianName;
    if (referringPhysicianNpi !== undefined) updateData.referringPhysicianNpi = referringPhysicianNpi;
    if (referringPhysicianPhone !== undefined) updateData.referringPhysicianPhone = referringPhysicianPhone;
    if (referringPhysicianFax !== undefined) updateData.referringPhysicianFax = referringPhysicianFax;
    if (referralNotes !== undefined) updateData.referralNotes = referralNotes;

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
        // Insurance fields
        medicaidId: true,
        medicaidPayerId: true,
        secondaryInsuranceId: true,
        secondaryPayerId: true,
        // PCP fields
        physicianName: true,
        physicianNpi: true,
        physicianPhone: true,
        physicianFax: true,
        physicianAddress: true,
        // Referral fields
        referralSource: true,
        referralDate: true,
        referringPhysicianName: true,
        referringPhysicianNpi: true,
        referringPhysicianPhone: true,
        referringPhysicianFax: true,
        referralNotes: true,
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
