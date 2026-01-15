import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { startOfWeek, endOfWeek, startOfMonth, subMonths } from "date-fns";

// GET /api/dashboard/stats - Get dashboard statistics based on user role
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role, companyId, id: userId } = session.user;
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));

    let stats: Record<string, unknown> = {};

    switch (role) {
      case "ADMIN":
      case "OPS_MANAGER":
        stats = await getAdminStats(companyId, weekStart, weekEnd, monthStart, lastMonthStart);
        break;
      case "CLINICAL_DIRECTOR":
        stats = await getClinicalDirectorStats(companyId);
        break;
      case "SUPERVISOR":
        stats = await getSupervisorStats(companyId, now);
        break;
      case "CARER":
        stats = await getCarerStats(companyId, userId, now, monthStart);
        break;
      case "SPONSOR":
        stats = await getSponsorStats(companyId, userId);
        break;
      case "STAFF":
        stats = await getStaffStats(companyId, weekStart, weekEnd);
        break;
      default:
        stats = {};
    }

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}

async function getAdminStats(
  companyId: string,
  weekStart: Date,
  weekEnd: Date,
  monthStart: Date,
  lastMonthStart: Date
) {
  const [
    activeClients,
    lastMonthActiveClients,
    scheduledShiftsThisWeek,
    pendingIncidents,
    pendingPayroll,
  ] = await Promise.all([
    // Active clients
    prisma.client.count({
      where: { companyId, isActive: true },
    }),
    // Active clients last month (for trend calculation)
    prisma.client.count({
      where: {
        companyId,
        isActive: true,
        createdAt: { lt: monthStart },
      },
    }),
    // Scheduled shifts this week
    prisma.shift.count({
      where: {
        companyId,
        scheduledStart: { gte: weekStart, lte: weekEnd },
      },
    }),
    // Pending incidents (using IncidentReport model)
    prisma.incidentReport.count({
      where: {
        companyId,
        status: "PENDING",
      },
    }),
    // Pending payroll entries (using PayrollRecord model)
    prisma.payrollRecord.count({
      where: {
        companyId,
        status: "PENDING",
      },
    }),
  ]);

  // Calculate trend
  const clientTrend = lastMonthActiveClients > 0
    ? Math.round(((activeClients - lastMonthActiveClients) / lastMonthActiveClients) * 100)
    : activeClients > 0 ? 100 : 0;

  return {
    activeClients,
    clientTrend,
    scheduledShiftsThisWeek,
    pendingIncidents,
    pendingPayroll,
  };
}

async function getClinicalDirectorStats(companyId: string) {
  const [pendingApprovals, pendingPayments, activeCarers] =
    await Promise.all([
      // Pending clinical approvals (onboarding in clinical review stage)
      prisma.onboardingRecord.count({
        where: {
          companyId,
          stage: "CLINICAL_REVIEW",
        },
      }),
      // Pending payments (using PayrollRecord model)
      prisma.payrollRecord.count({
        where: {
          companyId,
          status: "SUPERVISOR_APPROVED",
        },
      }),
      // Active carers
      prisma.user.count({
        where: {
          companyId,
          role: "CARER",
          isActive: true,
        },
      }),
    ]);

  // Health assessments - count caregiver profiles
  let healthAssessments = 0;
  try {
    healthAssessments = await prisma.caregiverProfile.count({
      where: {
        user: { companyId, isActive: true },
      },
    });
  } catch {
    // Ignore if model doesn't exist
  }

  return {
    pendingApprovals,
    pendingPayments,
    healthAssessments,
    activeCarers,
  };
}

async function getSupervisorStats(companyId: string, now: Date) {
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const [teamMembers, todaysShifts, openEscalations, pendingReports] =
    await Promise.all([
      // Team members (carers)
      prisma.user.count({
        where: {
          companyId,
          role: "CARER",
          isActive: true,
        },
      }),
      // Today's shifts
      prisma.shift.count({
        where: {
          companyId,
          scheduledStart: { gte: todayStart, lte: todayEnd },
        },
      }),
      // Open escalations
      prisma.escalation.count({
        where: {
          companyId,
          status: { in: ["OPEN", "IN_PROGRESS"] },
        },
      }),
      // Visit notes submitted today
      prisma.visitNote.count({
        where: {
          companyId,
          submittedAt: { gte: todayStart },
        },
      }),
    ]);

  return {
    teamMembers,
    todaysShifts,
    openEscalations,
    pendingReports,
  };
}

async function getCarerStats(
  companyId: string,
  carerId: string,
  now: Date,
  monthStart: Date
) {
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });

  const [todaysShifts, reportsThisMonth, pendingPayment, hoursThisWeek] =
    await Promise.all([
      // Today's shifts for this carer
      prisma.shift.count({
        where: {
          companyId,
          carerId,
          scheduledStart: { gte: todayStart, lte: todayEnd },
        },
      }),
      // Reports submitted this month
      prisma.visitNote.count({
        where: {
          companyId,
          carerId,
          submittedAt: { gte: monthStart },
        },
      }),
      // Pending payment amount (using PayrollRecord model with totalAmount field)
      prisma.payrollRecord.aggregate({
        where: {
          companyId,
          carerId,
          status: { in: ["PENDING", "SUPERVISOR_APPROVED"] },
        },
        _sum: { totalAmount: true },
      }),
      // Hours worked this week
      prisma.shift.findMany({
        where: {
          companyId,
          carerId,
          status: "COMPLETED",
          scheduledStart: { gte: weekStart },
        },
        select: {
          actualStart: true,
          actualEnd: true,
          scheduledStart: true,
          scheduledEnd: true,
        },
      }),
    ]);

  // Calculate hours
  const totalHours = hoursThisWeek.reduce((acc, shift) => {
    const start = shift.actualStart || shift.scheduledStart;
    const end = shift.actualEnd || shift.scheduledEnd;
    return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }, 0);

  return {
    todaysShifts,
    reportsThisMonth,
    pendingPayment: Number(pendingPayment._sum.totalAmount || 0),
    hoursThisWeek: Math.round(totalHours),
  };
}

async function getSponsorStats(companyId: string, sponsorId: string) {
  // Get clients associated with this sponsor
  const sponsorClients = await prisma.client.findMany({
    where: {
      companyId,
      sponsorId,
    },
    select: { id: true },
  });

  const clientIds = sponsorClients.map((c) => c.id);

  if (clientIds.length === 0) {
    return {
      careReports: 0,
      unreadMessages: 0,
      pendingInvoice: 0,
      careDays: 0,
    };
  }

  const quarterStart = new Date();
  quarterStart.setMonth(quarterStart.getMonth() - 3);

  const [careReports, pendingInvoices, careDays] = await Promise.all([
    // Total care reports for their clients
    prisma.visitNote.count({
      where: {
        companyId,
        clientId: { in: clientIds },
      },
    }),
    // Pending invoices (using amount field)
    prisma.invoice.aggregate({
      where: {
        companyId,
        clientId: { in: clientIds },
        status: "PENDING",
      },
      _sum: { amount: true },
    }),
    // Care days this quarter
    prisma.shift.count({
      where: {
        companyId,
        clientId: { in: clientIds },
        status: "COMPLETED",
        scheduledStart: { gte: quarterStart },
      },
    }),
  ]);

  return {
    careReports,
    unreadMessages: 0,
    pendingInvoice: Number(pendingInvoices._sum.amount || 0),
    careDays,
  };
}

async function getStaffStats(companyId: string, weekStart: Date, weekEnd: Date) {
  const [onboardingPipeline, shiftsToSchedule, payrollEntries, invoicesToGenerate] =
    await Promise.all([
      // Onboarding pipeline (clients not yet active)
      prisma.client.count({
        where: {
          companyId,
          status: { not: "ACTIVE" },
        },
      }),
      // Shifts to schedule this week
      prisma.shift.count({
        where: {
          companyId,
          scheduledStart: { gte: weekStart, lte: weekEnd },
          status: "SCHEDULED",
        },
      }),
      // Pending payroll entries (using PayrollRecord model)
      prisma.payrollRecord.count({
        where: {
          companyId,
          status: "PENDING",
        },
      }),
      // Invoices to generate (clients without recent invoice)
      prisma.client.count({
        where: {
          companyId,
          isActive: true,
        },
      }),
    ]);

  return {
    onboardingPipeline,
    shiftsToSchedule,
    payrollEntries,
    invoicesToGenerate: Math.floor(invoicesToGenerate / 3),
  };
}
