import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/lib/permissions";
import { CheckInWidget } from "@/components/dashboard/check-in-widget";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { SponsorDashboard } from "@/components/dashboard/sponsor-dashboard";
import { ShiftsInProgressWidget } from "@/components/dashboard/shifts-in-progress-widget";
import { UpcomingShiftsWidget } from "@/components/dashboard/upcoming-shifts-widget";
import {
  Users,
  Calendar,
  FileText,
  AlertTriangle,
  DollarSign,
  Clock,
  CheckCircle,
  UserCircle,
} from "lucide-react";

// Quick action card
function QuickAction({
  title,
  description,
  href,
  icon: Icon,
  primary = false,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  primary?: boolean;
}) {
  return (
    <a
      href={href}
      className={
        primary
          ? "block p-4 rounded-lg border-2 border-primary bg-primary/10 hover:bg-primary/20 hover:shadow-md transition-all"
          : "block p-4 rounded-lg border border-border-light bg-background-tertiary hover:border-primary/50 hover:shadow-sm transition-all"
      }
    >
      <div className="flex items-start gap-3">
        <div className={primary ? "p-2 rounded-md bg-primary" : "p-2 rounded-md bg-primary/10"}>
          <Icon className={primary ? "w-5 h-5 text-white" : "w-5 h-5 text-primary"} />
        </div>
        <div>
          <p className={primary ? "text-body font-semibold text-primary" : "text-body font-medium text-foreground"}>{title}</p>
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
  const userRole = user.role as string;
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
  if (userRole === "SPONSOR") {
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

      {/* Dashboard Stats - Hide for Carers */}
      {user.role !== "CARER" && <DashboardStats role={user.role} />}

      {/* Quick Actions */}
      <div>
        <h2 className="text-heading-2 text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                href="/staff"
                icon={Users}
              />
              <QuickAction
                title="Manage Clients"
                description="View and manage client profiles"
                href="/clients"
                icon={UserCircle}
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
                primary
              />
              <QuickAction
                title="My Schedule"
                description="View your upcoming shifts"
                href="/scheduling"
                icon={Calendar}
              />
              <QuickAction
                title="Visit Notes"
                description="View and create visit notes"
                href="/visit-notes"
                icon={FileText}
              />
              <QuickAction
                title="My Availability"
                description="Set your availability"
                href="/availability"
                icon={Calendar}
              />
            </>
          )}

          {userRole === "SPONSOR" && (
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

      {/* Carer Widgets - Today's Shifts + Upcoming side by side, then Shifts in Progress */}
      {user.role === "CARER" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CheckInWidget />
            <UpcomingShiftsWidget />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ShiftsInProgressWidget />
          </div>
        </>
      )}

      {/* Widgets Section for non-carers */}
      {user.role !== "CARER" && user.role !== "SPONSOR" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ShiftsInProgressWidget />
          <UpcomingShiftsWidget />
        </div>
      )}

      {/* Activity Feed at bottom for Admin/Ops Manager */}
      {(user.role === "ADMIN" || user.role === "OPS_MANAGER") && (
        <ActivityFeed />
      )}
    </div>
  );
}
