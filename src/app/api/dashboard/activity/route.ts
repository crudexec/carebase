import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

// GET /api/dashboard/activity - Get recent activity feed for admins
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins and ops managers can see full activity feed
    if (!hasPermission(session.user.role, PERMISSIONS.USER_VIEW)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    const companyId = session.user.companyId;

    // Fetch recent activities from multiple sources
    const [
      recentClients,
      recentShifts,
      recentVisitNotes,
      recentIncidents,
      recentAuditLogs,
    ] = await Promise.all([
      // Recent clients
      prisma.client.findMany({
        where: { companyId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      // Recent completed/in-progress shifts
      prisma.shift.findMany({
        where: {
          companyId,
          status: { in: ["COMPLETED", "IN_PROGRESS"] },
        },
        select: {
          id: true,
          status: true,
          scheduledStart: true,
          updatedAt: true,
          carer: { select: { firstName: true, lastName: true } },
          client: { select: { firstName: true, lastName: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      // Recent visit notes
      prisma.visitNote.findMany({
        where: { companyId },
        select: {
          id: true,
          submittedAt: true,
          carer: { select: { firstName: true, lastName: true } },
          client: { select: { firstName: true, lastName: true } },
          template: { select: { name: true } },
        },
        orderBy: { submittedAt: "desc" },
        take: 5,
      }),
      // Recent incidents
      prisma.incidentReport.findMany({
        where: { companyId },
        select: {
          id: true,
          category: true,
          severity: true,
          status: true,
          createdAt: true,
          reporter: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      // Recent audit logs (this captures all activities including staff creation)
      prisma.auditLog.findMany({
        where: { companyId },
        select: {
          id: true,
          action: true,
          entityType: true,
          entityId: true,
          changes: true,
          createdAt: true,
          user: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    // Combine and format activities
    const activities: Array<{
      id: string;
      type: string;
      title: string;
      description: string;
      timestamp: string;
      icon: string;
      link?: string;
    }> = [];

    // Add client activities
    recentClients.forEach((client) => {
      activities.push({
        id: `client-${client.id}`,
        type: "client",
        title: "New Client",
        description: `${client.firstName} ${client.lastName} added (${client.status})`,
        timestamp: client.createdAt.toISOString(),
        icon: "user-plus",
        link: `/clients/${client.id}`,
      });
    });

    // Add shift activities
    recentShifts.forEach((shift) => {
      activities.push({
        id: `shift-${shift.id}`,
        type: "shift",
        title: shift.status === "COMPLETED" ? "Shift Completed" : "Shift In Progress",
        description: `${shift.carer.firstName} ${shift.carer.lastName} - ${shift.client.firstName} ${shift.client.lastName}`,
        timestamp: shift.updatedAt.toISOString(),
        icon: shift.status === "COMPLETED" ? "check-circle" : "clock",
        link: "/scheduling",
      });
    });

    // Add visit note activities
    recentVisitNotes.forEach((note) => {
      activities.push({
        id: `note-${note.id}`,
        type: "visit-note",
        title: "Visit Note Submitted",
        description: `${note.carer.firstName} ${note.carer.lastName} submitted ${note.template?.name || "note"} for ${note.client.firstName} ${note.client.lastName}`,
        timestamp: note.submittedAt.toISOString(),
        icon: "clipboard",
        link: `/visit-notes/${note.id}`,
      });
    });

    // Add incident activities
    recentIncidents.forEach((incident) => {
      activities.push({
        id: `incident-${incident.id}`,
        type: "incident",
        title: `Incident Reported (${incident.severity})`,
        description: `${incident.category} - reported by ${incident.reporter.firstName} ${incident.reporter.lastName}`,
        timestamp: incident.createdAt.toISOString(),
        icon: "alert-triangle",
        link: `/incidents/${incident.id}`,
      });
    });

    // Add audit log activities (staff created, updated, etc.)
    recentAuditLogs.forEach((log) => {
      const changes = log.changes as Record<string, unknown> | null;
      let title = "";
      let description = "";
      let icon = "activity";
      let link: string | undefined;
      let type = "audit";

      switch (log.action) {
        case "STAFF_CREATED":
          title = "Staff Member Added";
          description = changes
            ? `${changes.firstName || ""} ${changes.lastName || ""} joined as ${changes.role || "staff"}`
            : `New staff member added by ${log.user.firstName} ${log.user.lastName}`;
          icon = "user-plus";
          type = "staff";
          link = `/staff/${log.entityId}`;
          break;
        case "STAFF_UPDATED":
          title = "Staff Profile Updated";
          description = `Updated by ${log.user.firstName} ${log.user.lastName}`;
          icon = "user";
          type = "staff";
          link = `/staff/${log.entityId}`;
          break;
        case "STAFF_DEACTIVATED":
          title = "Staff Deactivated";
          description = changes
            ? `${changes.firstName || ""} ${changes.lastName || ""} was deactivated`
            : `Staff deactivated by ${log.user.firstName} ${log.user.lastName}`;
          icon = "user";
          type = "staff";
          break;
        case "CLIENT_CREATED":
          title = "Client Added";
          description = `Added by ${log.user.firstName} ${log.user.lastName}`;
          icon = "user-plus";
          type = "client";
          link = `/clients/${log.entityId}`;
          break;
        case "CLIENT_UPDATED":
          title = "Client Updated";
          description = `Updated by ${log.user.firstName} ${log.user.lastName}`;
          icon = "user";
          type = "client";
          link = `/clients/${log.entityId}`;
          break;
        case "SHIFT_CREATED":
          title = "Shift Scheduled";
          description = `Created by ${log.user.firstName} ${log.user.lastName}`;
          icon = "calendar";
          type = "shift";
          link = "/scheduling";
          break;
        case "LOGIN":
          title = "User Login";
          description = `${log.user.firstName} ${log.user.lastName} logged in`;
          icon = "log-in";
          type = "login";
          break;
        default:
          // Skip unknown actions
          return;
      }

      activities.push({
        id: `audit-${log.id}`,
        type,
        title,
        description,
        timestamp: log.createdAt.toISOString(),
        icon,
        link,
      });
    });

    // Sort all activities by timestamp
    activities.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      activities: activities.slice(0, limit),
    });
  } catch (error) {
    console.error("Error fetching activity feed:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity feed" },
      { status: 500 }
    );
  }
}
