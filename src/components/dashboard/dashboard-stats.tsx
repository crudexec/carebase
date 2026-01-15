"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Calendar,
  FileText,
  AlertTriangle,
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { UserRole } from "@prisma/client";

interface DashboardStatsProps {
  role: UserRole;
}

interface Stats {
  // Admin/OpsManager
  activeClients?: number;
  clientTrend?: number;
  scheduledShiftsThisWeek?: number;
  pendingIncidents?: number;
  pendingPayroll?: number;
  // Clinical Director
  pendingApprovals?: number;
  pendingPayments?: number;
  healthAssessments?: number;
  activeCarers?: number;
  // Supervisor
  teamMembers?: number;
  todaysShifts?: number;
  openEscalations?: number;
  pendingReports?: number;
  // Carer
  reportsThisMonth?: number;
  pendingPayment?: number;
  hoursThisWeek?: number;
  // Sponsor
  careReports?: number;
  unreadMessages?: number;
  pendingInvoice?: number;
  careDays?: number;
  // Staff
  onboardingPipeline?: number;
  shiftsToSchedule?: number;
  payrollEntries?: number;
  invoicesToGenerate?: number;
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  loading,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: { value: number; positive: boolean };
  loading?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-foreground-secondary">{title}</p>
            {loading ? (
              <div className="flex items-center gap-2 mt-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
                {description && (
                  <p className="text-xs text-foreground-secondary mt-1">
                    {description}
                  </p>
                )}
                {trend && trend.value !== 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    {trend.positive ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span
                      className={`text-xs ${
                        trend.positive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {trend.positive ? "+" : ""}{trend.value}%
                    </span>
                    <span className="text-xs text-foreground-secondary">
                      vs last month
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="p-3 rounded-lg bg-primary/10">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardStats({ role }: DashboardStatsProps) {
  const [stats, setStats] = React.useState<Stats>({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {(role === "ADMIN" || role === "OPS_MANAGER") && (
        <>
          <StatCard
            title="Active Clients"
            value={stats.activeClients ?? 0}
            description="Currently receiving care"
            icon={Users}
            trend={
              stats.clientTrend !== undefined
                ? { value: stats.clientTrend, positive: stats.clientTrend >= 0 }
                : undefined
            }
            loading={loading}
          />
          <StatCard
            title="Scheduled Shifts"
            value={stats.scheduledShiftsThisWeek ?? 0}
            description="This week"
            icon={Calendar}
            loading={loading}
          />
          <StatCard
            title="Pending Incidents"
            value={stats.pendingIncidents ?? 0}
            description="Awaiting review"
            icon={AlertTriangle}
            loading={loading}
          />
          <StatCard
            title="Pending Payroll"
            value={stats.pendingPayroll ?? 0}
            description="Awaiting approval"
            icon={DollarSign}
            loading={loading}
          />
        </>
      )}

      {role === "CLINICAL_DIRECTOR" && (
        <>
          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals ?? 0}
            description="Clinical authorizations"
            icon={CheckCircle}
            loading={loading}
          />
          <StatCard
            title="Payments to Process"
            value={stats.pendingPayments ?? 0}
            description="Ready for disbursement"
            icon={DollarSign}
            loading={loading}
          />
          <StatCard
            title="Health Assessments"
            value={stats.healthAssessments ?? 0}
            description="Pending review"
            icon={FileText}
            loading={loading}
          />
          <StatCard
            title="Active Carers"
            value={stats.activeCarers ?? 0}
            description="Currently assigned"
            icon={Users}
            loading={loading}
          />
        </>
      )}

      {role === "SUPERVISOR" && (
        <>
          <StatCard
            title="My Team"
            value={stats.teamMembers ?? 0}
            description="Active caregivers"
            icon={Users}
            loading={loading}
          />
          <StatCard
            title="Today's Shifts"
            value={stats.todaysShifts ?? 0}
            description="Scheduled for today"
            icon={Clock}
            loading={loading}
          />
          <StatCard
            title="Escalations"
            value={stats.openEscalations ?? 0}
            description="Open issues"
            icon={AlertTriangle}
            loading={loading}
          />
          <StatCard
            title="Reports Due"
            value={stats.pendingReports ?? 0}
            description="Visit notes today"
            icon={FileText}
            loading={loading}
          />
        </>
      )}

      {role === "CARER" && (
        <>
          <StatCard
            title="Today's Shifts"
            value={stats.todaysShifts ?? 0}
            description="Scheduled for today"
            icon={Calendar}
            loading={loading}
          />
          <StatCard
            title="Reports Submitted"
            value={stats.reportsThisMonth ?? 0}
            description="This month"
            icon={FileText}
            loading={loading}
          />
          <StatCard
            title="Pending Payment"
            value={formatCurrency(stats.pendingPayment ?? 0)}
            description="Awaiting processing"
            icon={DollarSign}
            loading={loading}
          />
          <StatCard
            title="Hours This Week"
            value={stats.hoursThisWeek ?? 0}
            description="Logged hours"
            icon={Clock}
            loading={loading}
          />
        </>
      )}

      {role === "SPONSOR" && (
        <>
          <StatCard
            title="Care Reports"
            value={stats.careReports ?? 0}
            description="Total reports received"
            icon={FileText}
            loading={loading}
          />
          <StatCard
            title="Unread Messages"
            value={stats.unreadMessages ?? 0}
            description="From your caregiver"
            icon={FileText}
            loading={loading}
          />
          <StatCard
            title="Pending Invoice"
            value={formatCurrency(stats.pendingInvoice ?? 0)}
            description="Due this month"
            icon={DollarSign}
            loading={loading}
          />
          <StatCard
            title="Care Days"
            value={stats.careDays ?? 0}
            description="This quarter"
            icon={Calendar}
            loading={loading}
          />
        </>
      )}

      {role === "STAFF" && (
        <>
          <StatCard
            title="Onboarding Pipeline"
            value={stats.onboardingPipeline ?? 0}
            description="Active prospects"
            icon={Users}
            loading={loading}
          />
          <StatCard
            title="Shifts to Schedule"
            value={stats.shiftsToSchedule ?? 0}
            description="This week"
            icon={Calendar}
            loading={loading}
          />
          <StatCard
            title="Payroll Entries"
            value={stats.payrollEntries ?? 0}
            description="Pending data entry"
            icon={DollarSign}
            loading={loading}
          />
          <StatCard
            title="Invoices"
            value={stats.invoicesToGenerate ?? 0}
            description="To generate"
            icon={FileText}
            loading={loading}
          />
        </>
      )}
    </div>
  );
}
