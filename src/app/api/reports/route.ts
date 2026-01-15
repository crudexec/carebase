import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";

const reportQuerySchema = z.object({
  entity: z.enum(["clients", "staff", "shifts", "visit-notes"]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  templateId: z.string().optional(), // For visit note reports
  clientId: z.string().optional(),
  carerId: z.string().optional(),
  groupBy: z.enum(["day", "week", "month"]).optional(),
});

// GET /api/reports - Generate entity reports
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions - need at least visit note view all or similar
    if (
      !hasPermission(session.user.role, PERMISSIONS.VISIT_NOTE_VIEW_ALL) &&
      !hasPermission(session.user.role, PERMISSIONS.USER_VIEW)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const queryValidation = reportQuerySchema.safeParse(
      Object.fromEntries(searchParams)
    );

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: queryValidation.error.issues },
        { status: 400 }
      );
    }

    const { entity, startDate, endDate, templateId, clientId, carerId, groupBy } =
      queryValidation.data;

    const dateFilter = {
      ...(startDate ? { gte: new Date(startDate) } : {}),
      ...(endDate ? { lte: new Date(endDate) } : {}),
    };

    let reportData;

    switch (entity) {
      case "clients":
        reportData = await generateClientsReport(
          session.user.companyId,
          dateFilter
        );
        break;
      case "staff":
        reportData = await generateStaffReport(
          session.user.companyId,
          dateFilter
        );
        break;
      case "shifts":
        reportData = await generateShiftsReport(
          session.user.companyId,
          dateFilter,
          clientId,
          carerId,
          groupBy
        );
        break;
      case "visit-notes":
        reportData = await generateVisitNotesReport(
          session.user.companyId,
          dateFilter,
          templateId,
          clientId,
          carerId,
          groupBy
        );
        break;
    }

    return NextResponse.json({ report: reportData });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}

async function generateClientsReport(
  companyId: string,
  dateFilter: { gte?: Date; lte?: Date }
) {
  const [totalClients, activeClients, clientsByStatus, recentClients] =
    await Promise.all([
      prisma.client.count({ where: { companyId } }),
      prisma.client.count({ where: { companyId, status: "ACTIVE" } }),
      prisma.client.groupBy({
        by: ["status"],
        where: { companyId },
        _count: { id: true },
      }),
      prisma.client.findMany({
        where: {
          companyId,
          createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

  // Count inactive as all non-active statuses
  const inactiveClients = clientsByStatus
    .filter((s) => s.status === "INACTIVE")
    .reduce((sum, s) => sum + s._count.id, 0);

  return {
    summary: {
      totalClients,
      activeClients,
      inactiveClients,
      onboarding: clientsByStatus.find((s) => s.status === "ONBOARDING")?._count.id || 0,
    },
    byStatus: clientsByStatus.map((s) => ({
      status: s.status,
      count: s._count.id,
    })),
    recentClients: recentClients.map((c) => ({
      id: c.id,
      name: `${c.firstName} ${c.lastName}`,
      status: c.status,
      createdAt: c.createdAt.toISOString(),
    })),
  };
}

async function generateStaffReport(
  companyId: string,
  dateFilter: { gte?: Date; lte?: Date }
) {
  const staffRoles = [
    "ADMIN",
    "OPS_MANAGER",
    "CLINICAL_DIRECTOR",
    "STAFF",
    "SUPERVISOR",
    "CARER",
  ];

  const [totalStaff, activeStaff, staffByRole, recentStaff] = await Promise.all([
    prisma.user.count({
      where: { companyId, role: { in: staffRoles as never[] } },
    }),
    prisma.user.count({
      where: { companyId, role: { in: staffRoles as never[] }, isActive: true },
    }),
    prisma.user.groupBy({
      by: ["role"],
      where: { companyId, role: { in: staffRoles as never[] } },
      _count: { id: true },
    }),
    prisma.user.findMany({
      where: {
        companyId,
        role: { in: staffRoles as never[] },
        createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return {
    summary: {
      totalStaff,
      activeStaff,
      inactiveStaff: totalStaff - activeStaff,
    },
    byRole: staffByRole.map((s) => ({
      role: s.role,
      count: s._count.id,
    })),
    recentStaff: recentStaff.map((s) => ({
      id: s.id,
      name: `${s.firstName} ${s.lastName}`,
      role: s.role,
      isActive: s.isActive,
      createdAt: s.createdAt.toISOString(),
    })),
  };
}

async function generateShiftsReport(
  companyId: string,
  dateFilter: { gte?: Date; lte?: Date },
  clientId?: string,
  carerId?: string,
  groupBy?: "day" | "week" | "month"
) {
  const where = {
    companyId,
    ...(clientId ? { clientId } : {}),
    ...(carerId ? { carerId } : {}),
    ...(Object.keys(dateFilter).length > 0 ? { scheduledStart: dateFilter } : {}),
  };

  const [totalShifts, shiftsByStatus, shifts, allShiftsForTrend] = await Promise.all([
    prisma.shift.count({ where }),
    prisma.shift.groupBy({
      by: ["status"],
      where,
      _count: { id: true },
    }),
    prisma.shift.findMany({
      where,
      include: {
        client: { select: { firstName: true, lastName: true } },
        carer: { select: { firstName: true, lastName: true } },
      },
      orderBy: { scheduledStart: "desc" },
      take: 50,
    }),
    prisma.shift.findMany({
      where,
      select: { scheduledStart: true, status: true },
      orderBy: { scheduledStart: "asc" },
    }),
  ]);

  // Calculate hours
  const totalHours = shifts.reduce((acc, shift) => {
    const start = new Date(shift.scheduledStart);
    const end = new Date(shift.scheduledEnd);
    return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }, 0);

  // Generate trend data by day
  const trendMap = new Map<string, { total: number; completed: number }>();
  allShiftsForTrend.forEach((shift) => {
    const dateKey = shift.scheduledStart.toISOString().split("T")[0];
    const existing = trendMap.get(dateKey) || { total: 0, completed: 0 };
    existing.total += 1;
    if (shift.status === "COMPLETED") existing.completed += 1;
    trendMap.set(dateKey, existing);
  });

  const trend = Array.from(trendMap.entries())
    .map(([date, data]) => ({
      date,
      total: data.total,
      completed: data.completed,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    summary: {
      totalShifts,
      totalHours: Math.round(totalHours * 10) / 10,
      completedShifts:
        shiftsByStatus.find((s) => s.status === "COMPLETED")?._count.id || 0,
      completionRate: totalShifts > 0
        ? Math.round(((shiftsByStatus.find((s) => s.status === "COMPLETED")?._count.id || 0) / totalShifts) * 100)
        : 0,
    },
    byStatus: shiftsByStatus.map((s) => ({
      status: s.status,
      count: s._count.id,
    })),
    trend,
    shifts: shifts.map((s) => ({
      id: s.id,
      client: `${s.client.firstName} ${s.client.lastName}`,
      carer: `${s.carer.firstName} ${s.carer.lastName}`,
      status: s.status,
      scheduledStart: s.scheduledStart.toISOString(),
      scheduledEnd: s.scheduledEnd.toISOString(),
    })),
  };
}

async function generateVisitNotesReport(
  companyId: string,
  dateFilter: { gte?: Date; lte?: Date },
  templateId?: string,
  clientId?: string,
  carerId?: string,
  groupBy?: "day" | "week" | "month"
) {
  const where = {
    companyId,
    ...(templateId ? { templateId } : {}),
    ...(clientId ? { clientId } : {}),
    ...(carerId ? { carerId } : {}),
    ...(Object.keys(dateFilter).length > 0 ? { submittedAt: dateFilter } : {}),
  };

  const [totalNotes, notesByTemplate, visitNotes, allNotesForTrend, uniqueCarers, uniqueClients] = await Promise.all([
    prisma.visitNote.count({ where }),
    prisma.visitNote.groupBy({
      by: ["templateId"],
      where,
      _count: { id: true },
    }),
    prisma.visitNote.findMany({
      where,
      include: {
        template: { select: { name: true } },
        client: { select: { firstName: true, lastName: true } },
        carer: { select: { firstName: true, lastName: true } },
      },
      orderBy: { submittedAt: "desc" },
      take: 50,
    }),
    prisma.visitNote.findMany({
      where,
      select: { submittedAt: true },
      orderBy: { submittedAt: "asc" },
    }),
    prisma.visitNote.groupBy({
      by: ["carerId"],
      where,
      _count: { id: true },
    }),
    prisma.visitNote.groupBy({
      by: ["clientId"],
      where,
      _count: { id: true },
    }),
  ]);

  // Get template names for the groupBy
  const templateIds = notesByTemplate.map((n) => n.templateId);
  const templates = await prisma.formTemplate.findMany({
    where: { id: { in: templateIds } },
    select: { id: true, name: true },
  });
  const templateMap = new Map(templates.map((t) => [t.id, t.name]));

  // Generate trend data by day
  const trendMap = new Map<string, number>();
  allNotesForTrend.forEach((note) => {
    const dateKey = note.submittedAt.toISOString().split("T")[0];
    trendMap.set(dateKey, (trendMap.get(dateKey) || 0) + 1);
  });

  const trend = Array.from(trendMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    summary: {
      totalNotes,
      uniqueCarers: uniqueCarers.length,
      uniqueClients: uniqueClients.length,
      avgNotesPerDay: trend.length > 0 ? Math.round((totalNotes / trend.length) * 10) / 10 : 0,
    },
    byTemplate: notesByTemplate.map((n) => ({
      templateId: n.templateId,
      templateName: templateMap.get(n.templateId) || "Unknown",
      count: n._count.id,
    })),
    trend,
    visitNotes: visitNotes.map((v) => ({
      id: v.id,
      template: v.template?.name || "Unknown",
      client: `${v.client.firstName} ${v.client.lastName}`,
      carer: `${v.carer.firstName} ${v.carer.lastName}`,
      submittedAt: v.submittedAt.toISOString(),
    })),
  };
}
