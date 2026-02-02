import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAuthUser } from "@/lib/mobile-auth";
import { prisma } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { IncidentSeverity, IncidentStatus } from "@prisma/client";
import { z } from "zod";

// Update schema
const updateIncidentSchema = z.object({
  incidentDate: z.string().transform((val) => new Date(val)).optional(),
  location: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  description: z.string().min(10).optional(),
  actionsTaken: z.string().min(1).optional(),
  witnesses: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
});

// GET /api/incidents/[id] - Get incident details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Try mobile auth first (Bearer token), then fall back to session auth
    let user = await getAuthUser(request);
    if (!user) {
      const session = await auth();
      if (session?.user) {
        user = session.user;
      }
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check permissions
    const canViewAll = hasPermission(user.role, PERMISSIONS.INCIDENT_FULL) ||
      hasPermission(user.role, PERMISSIONS.INCIDENT_VIEW);
    const canViewApproved = hasPermission(user.role, PERMISSIONS.INCIDENT_VIEW_APPROVED);
    const canCreate = hasPermission(user.role, PERMISSIONS.INCIDENT_CREATE);

    if (!canViewAll && !canViewApproved && !canCreate) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const incident = await prisma.incidentReport.findFirst({
      where: {
        id,
        companyId: user.companyId,
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            address: true,
            sponsor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    // Sponsors can only see approved incidents for their clients
    if ((user.role as string) === "SPONSOR") {
      if (incident.status !== "APPROVED" || incident.client.sponsor?.id !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Carers can only see their own incidents
    if (user.role === "CARER" && incident.reporterId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      incident: {
        ...incident,
        incidentDate: incident.incidentDate.toISOString(),
        createdAt: incident.createdAt.toISOString(),
        updatedAt: incident.updatedAt.toISOString(),
        approvedAt: incident.approvedAt?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error("Error fetching incident:", error);
    return NextResponse.json(
      { error: "Failed to fetch incident" },
      { status: 500 }
    );
  }
}

// PATCH /api/incidents/[id] - Update incident
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Try mobile auth first (Bearer token), then fall back to session auth
    let user = await getAuthUser(request);
    if (!user) {
      const session = await auth();
      if (session?.user) {
        user = session.user;
      }
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const body = await request.json();
    const validation = updateIncidentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    // Get existing incident
    const existingIncident = await prisma.incidentReport.findFirst({
      where: {
        id,
        companyId: user.companyId,
      },
    });

    if (!existingIncident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    const canManage = hasPermission(user.role, PERMISSIONS.INCIDENT_FULL);
    const canApprove = hasPermission(user.role, PERMISSIONS.INCIDENT_APPROVE);
    const isReporter = existingIncident.reporterId === user.id;

    // Check update permissions
    const { status, ...otherUpdates } = validation.data;

    // Only admins/ops managers can update status
    if (status && !canManage && !canApprove) {
      return NextResponse.json(
        { error: "You don't have permission to change incident status" },
        { status: 403 }
      );
    }

    // Only reporter (if pending) or admins can update other fields
    if (Object.keys(otherUpdates).length > 0) {
      if (!canManage && (!isReporter || existingIncident.status !== "PENDING")) {
        return NextResponse.json(
          { error: "You can only edit pending incidents that you reported" },
          { status: 403 }
        );
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (validation.data.incidentDate) updateData.incidentDate = validation.data.incidentDate;
    if (validation.data.location) updateData.location = validation.data.location;
    if (validation.data.category) updateData.category = validation.data.category;
    if (validation.data.severity) updateData.severity = validation.data.severity as IncidentSeverity;
    if (validation.data.description) updateData.description = validation.data.description;
    if (validation.data.actionsTaken) updateData.actionsTaken = validation.data.actionsTaken;
    if (validation.data.witnesses !== undefined) updateData.witnesses = validation.data.witnesses || null;
    if (validation.data.attachments) updateData.attachments = validation.data.attachments;

    // Handle status change
    if (status) {
      updateData.status = status as IncidentStatus;
      if (status === "APPROVED") {
        updateData.approvedById = user.id;
        updateData.approvedAt = new Date();
      } else if (status === "REJECTED") {
        updateData.approvedById = user.id;
        updateData.approvedAt = new Date();
      }
    }

    const incident = await prisma.incidentReport.update({
      where: { id },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            sponsor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        approvedBy: {
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
        action: status ? `INCIDENT_${status}` : "INCIDENT_UPDATED",
        entityType: "IncidentReport",
        entityId: incident.id,
        changes: validation.data,
      },
    });

    // If approved, notify the sponsor
    if (status === "APPROVED" && incident.client.sponsor) {
      await prisma.notification.create({
        data: {
          companyId: user.companyId,
          userId: incident.client.sponsor.id,
          type: "INCIDENT_APPROVED",
          title: "Incident Report Available",
          message: `An incident report for ${incident.client.firstName} ${incident.client.lastName} has been approved and is now available for review.`,
          link: `/incidents/${incident.id}`,
        },
      });

      // Update sponsorNotified flag
      await prisma.incidentReport.update({
        where: { id },
        data: { sponsorNotified: true },
      });
    }

    return NextResponse.json({
      incident: {
        ...incident,
        incidentDate: incident.incidentDate.toISOString(),
        createdAt: incident.createdAt.toISOString(),
        updatedAt: incident.updatedAt.toISOString(),
        approvedAt: incident.approvedAt?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error("Error updating incident:", error);
    return NextResponse.json(
      { error: "Failed to update incident" },
      { status: 500 }
    );
  }
}

// DELETE /api/incidents/[id] - Delete incident (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Try mobile auth first (Bearer token), then fall back to session auth
    let user = await getAuthUser(request);
    if (!user) {
      const session = await auth();
      if (session?.user) {
        user = session.user;
      }
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Only admins can delete incidents
    if (!hasPermission(user.role, PERMISSIONS.INCIDENT_FULL)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const incident = await prisma.incidentReport.findFirst({
      where: {
        id,
        companyId: user.companyId,
      },
    });

    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    await prisma.incidentReport.delete({
      where: { id },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: user.companyId,
        userId: user.id,
        action: "INCIDENT_DELETED",
        entityType: "IncidentReport",
        entityId: id,
        changes: {
          clientId: incident.clientId,
          severity: incident.severity,
          status: incident.status,
        },
      },
    });

    return NextResponse.json({ message: "Incident deleted successfully" });
  } catch (error) {
    console.error("Error deleting incident:", error);
    return NextResponse.json(
      { error: "Failed to delete incident" },
      { status: 500 }
    );
  }
}
