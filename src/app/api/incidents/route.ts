import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { Prisma, IncidentSeverity } from "@prisma/client";
import { z } from "zod";

// Validation schemas
const createIncidentSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  incidentDate: z.string().transform((val) => new Date(val)),
  location: z.string().min(1, "Location is required"),
  category: z.string().min(1, "Category is required"),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  description: z.string().min(10, "Description must be at least 10 characters"),
  actionsTaken: z.string().min(1, "Actions taken is required"),
  witnesses: z.string().nullable().optional(),
  attachments: z.array(z.string()).optional(),
});

const listQuerySchema = z.object({
  clientId: z.string().optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  startDate: z.string().transform((val) => new Date(val)).optional(),
  endDate: z.string().transform((val) => new Date(val)).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

// Incident categories for validation
export const INCIDENT_CATEGORIES = [
  "Fall",
  "Medication Error",
  "Injury",
  "Behavioral",
  "Property Damage",
  "Abuse/Neglect",
  "Missing Person",
  "Medical Emergency",
  "Equipment Failure",
  "Other",
];

// GET /api/incidents - List incidents
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions
    const canViewAll = hasPermission(session.user.role, PERMISSIONS.INCIDENT_FULL) ||
      hasPermission(session.user.role, PERMISSIONS.INCIDENT_VIEW);
    const canViewApproved = hasPermission(session.user.role, PERMISSIONS.INCIDENT_VIEW_APPROVED);
    const canCreate = hasPermission(session.user.role, PERMISSIONS.INCIDENT_CREATE);

    if (!canViewAll && !canViewApproved && !canCreate) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const queryValidation = listQuerySchema.safeParse(Object.fromEntries(searchParams));

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: queryValidation.error.issues },
        { status: 400 }
      );
    }

    const { clientId, status, severity, startDate, endDate, page, limit } = queryValidation.data;

    // Build query filters
    const where: Prisma.IncidentReportWhereInput = {
      companyId: session.user.companyId,
    };

    // Sponsors can only see approved incidents for their clients
    if (session.user.role === "SPONSOR") {
      where.status = "APPROVED";
      where.client = {
        sponsorId: session.user.id,
      };
    } else if (session.user.role === "CARER") {
      // Carers can see incidents they reported
      where.reporterId = session.user.id;
    }

    // Apply filters
    if (clientId) {
      where.clientId = clientId;
    }

    if (status && session.user.role !== "SPONSOR") {
      where.status = status;
    }

    if (severity) {
      where.severity = severity;
    }

    if (startDate) {
      where.incidentDate = { ...(where.incidentDate as object), gte: startDate };
    }

    if (endDate) {
      where.incidentDate = { ...(where.incidentDate as object), lte: endDate };
    }

    const [incidents, total] = await Promise.all([
      prisma.incidentReport.findMany({
        where,
        select: {
          id: true,
          incidentDate: true,
          location: true,
          category: true,
          severity: true,
          description: true,
          actionsTaken: true,
          witnesses: true,
          attachments: true,
          status: true,
          sponsorNotified: true,
          createdAt: true,
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
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
          approvedAt: true,
        },
        orderBy: { incidentDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.incidentReport.count({ where }),
    ]);

    return NextResponse.json({
      incidents: incidents.map((incident) => ({
        ...incident,
        incidentDate: incident.incidentDate.toISOString(),
        createdAt: incident.createdAt.toISOString(),
        approvedAt: incident.approvedAt?.toISOString() || null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching incidents:", error);
    return NextResponse.json(
      { error: "Failed to fetch incidents" },
      { status: 500 }
    );
  }
}

// POST /api/incidents - Create incident
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions
    const canCreate = hasPermission(session.user.role, PERMISSIONS.INCIDENT_CREATE) ||
      hasPermission(session.user.role, PERMISSIONS.INCIDENT_FULL);

    if (!canCreate) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = createIncidentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const {
      clientId,
      incidentDate,
      location,
      category,
      severity,
      description,
      actionsTaken,
      witnesses,
      attachments,
    } = validation.data;

    // Verify client exists and belongs to the company
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        companyId: session.user.companyId,
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    // Create incident
    const incident = await prisma.incidentReport.create({
      data: {
        companyId: session.user.companyId,
        clientId,
        reporterId: session.user.id,
        incidentDate,
        location,
        category,
        severity: severity as IncidentSeverity,
        description,
        actionsTaken,
        witnesses: witnesses || null,
        attachments: attachments || [],
        status: "PENDING",
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: "INCIDENT_CREATED",
        entityType: "IncidentReport",
        entityId: incident.id,
        changes: {
          clientId,
          category,
          severity,
          incidentDate: incidentDate.toISOString(),
        },
      },
    });

    // Create notification for admins/ops managers
    const admins = await prisma.user.findMany({
      where: {
        companyId: session.user.companyId,
        role: { in: ["ADMIN", "OPS_MANAGER"] },
        isActive: true,
      },
      select: { id: true },
    });

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          companyId: session.user.companyId,
          userId: admin.id,
          type: "INCIDENT_REPORTED",
          title: "New Incident Report",
          message: `A ${severity.toLowerCase()} severity incident has been reported for ${client.firstName} ${client.lastName}`,
          link: `/incidents/${incident.id}`,
        })),
      });
    }

    return NextResponse.json({
      incident: {
        ...incident,
        incidentDate: incident.incidentDate.toISOString(),
        createdAt: incident.createdAt.toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating incident:", error);
    return NextResponse.json(
      { error: "Failed to create incident" },
      { status: 500 }
    );
  }
}
