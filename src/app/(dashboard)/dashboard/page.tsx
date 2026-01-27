import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/lib/permissions";
import { CheckInWidget } from "@/components/dashboard/check-in-widget";
import { UpcomingShiftsWidget } from "@/components/dashboard/upcoming-shifts-widget";
import { NotificationsPanel } from "@/components/dashboard/notifications-panel";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { SponsorDashboard } from "@/components/dashboard/sponsor-dashboard";
import {
  Users,
  Calendar,
  FileText,
  AlertTriangle,
  DollarSign,
  Clock,
  CheckCircle,
} from "lucide-react";

// Quick action card
function QuickAction({
  title,
  description,
  href,
  icon: Icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <a
      href={href}
      className="block p-4 rounded-lg border border-border-light bg-background-tertiary hover:border-primary/50 hover:shadow-sm transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-md bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-body font-medium text-foreground">{title}</p>
          <p className="text-body-sm text-foreground-secondary">{description}</p>
        </div>
      </div>
    </a>
  );
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { user } = session;
  const roleLabel = ROLE_LABELS[user.role];

  // Role-specific badge variant
  const roleBadgeVariant = user.role.toLowerCase().replace("_", "-") as
    | "admin"
    | "ops-manager"
    | "clinical"
    | "staff"
    | "supervisor"
    | "carer"
    | "sponsor";

  // Render dedicated sponsor dashboard for sponsors
  if (user.role === "SPONSOR") {
    return <SponsorDashboard user={user} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-display text-foreground">
          Welcome back, {user.firstName}
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <p className="text-body-lg text-foreground-secondary">
            Here&apos;s what&apos;s happening today
          </p>
          <Badge variant={roleBadgeVariant}>{roleLabel}</Badge>
        </div>
      </div>

      {/* Activity Feed for Admin/Ops Manager, Stats for others */}
      {(user.role === "ADMIN" || user.role === "OPS_MANAGER") ? (
        <ActivityFeed />
      ) : (
        <DashboardStats role={user.role} />
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-heading-2 text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(user.role === "ADMIN" || user.role === "OPS_MANAGER") && (
            <>
              <QuickAction
                title="View Onboarding Pipeline"
                description="Manage client onboarding stages"
                href="/onboarding"
                icon={Users}
              />
              <QuickAction
                title="Review Incidents"
                description="Approve pending incident reports"
                href="/incidents"
                icon={AlertTriangle}
              />
              <QuickAction
                title="Manage Users"
                description="Add or modify system users"
                href="/admin/users"
                icon={Users}
              />
            </>
          )}

          {user.role === "CLINICAL_DIRECTOR" && (
            <>
              <QuickAction
                title="Process Payments"
                description="Approve pending payroll"
                href="/payroll"
                icon={DollarSign}
              />
              <QuickAction
                title="Review Authorizations"
                description="Clinical approvals pending"
                href="/onboarding"
                icon={CheckCircle}
              />
              <QuickAction
                title="Health Assessments"
                description="Review carer health status"
                href="/assessments"
                icon={FileText}
              />
            </>
          )}

          {user.role === "SUPERVISOR" && (
            <>
              <QuickAction
                title="Manage Schedule"
                description="Assign shifts to caregivers"
                href="/scheduling"
                icon={Calendar}
              />
              <QuickAction
                title="Review Reports"
                description="Check daily report compliance"
                href="/reports/daily"
                icon={FileText}
              />
              <QuickAction
                title="Handle Escalations"
                description="Resolve open issues"
                href="/escalations"
                icon={AlertTriangle}
              />
            </>
          )}

          {user.role === "CARER" && (
            <>
              <QuickAction
                title="Check In"
                description="Start your shift"
                href="/check-in"
                icon={Clock}
              />
              <QuickAction
                title="Submit Report"
                description="Complete daily care report"
                href="/reports/daily/new"
                icon={FileText}
              />
              <QuickAction
                title="Message Sponsor"
                description="Chat with family member"
                href="/chat"
                icon={FileText}
              />
            </>
          )}

          {user.role === "SPONSOR" && (
            <>
              <QuickAction
                title="View Care Reports"
                description="See daily updates"
                href="/reports/daily"
                icon={FileText}
              />
              <QuickAction
                title="Message Caregiver"
                description="Chat with your carer"
                href="/chat"
                icon={FileText}
              />
              <QuickAction
                title="View Invoices"
                description="Manage payments"
                href="/invoices"
                icon={DollarSign}
              />
            </>
          )}

          {user.role === "STAFF" && (
            <>
              <QuickAction
                title="Manage Schedule"
                description="Create and edit shifts"
                href="/scheduling"
                icon={Calendar}
              />
              <QuickAction
                title="Enter Payroll"
                description="Process payroll data"
                href="/payroll"
                icon={DollarSign}
              />
              <QuickAction
                title="Generate Invoices"
                description="Create sponsor invoices"
                href="/invoices"
                icon={FileText}
              />
            </>
          )}
        </div>
      </div>

      {/* Widgets Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Check-in Widget for Carers */}
        {user.role === "CARER" && <CheckInWidget />}

        {/* Upcoming Shifts Widget for managers/admins */}
        {["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF", "SUPERVISOR"].includes(user.role) && (
          <UpcomingShiftsWidget />
        )}

        {/* Notifications Panel - shown for all roles */}
        <NotificationsPanel />
      </div>
    </div>
  );
}
