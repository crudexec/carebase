import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/lib/permissions";
import { CheckInWidget } from "@/components/dashboard/check-in-widget";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { SponsorDashboard } from "@/components/dashboard/sponsor-dashboard";
import { ShiftsWidget } from "@/components/dashboard/shifts-widget";
import { CredentialAlertsWidget } from "@/components/dashboard/credential-alerts-widget";
import { MissingVisitNotesWidget } from "@/components/dashboard/missing-visit-notes-widget";

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

      {/* Carer Widgets - Check-in widget and combined shifts widget */}
      {user.role === "CARER" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CheckInWidget />
            <ShiftsWidget />
          </div>
          <MissingVisitNotesWidget />
        </>
      )}

      {/* Credential Alerts Panel at top for Admin/Ops Manager */}
      {(user.role === "ADMIN" || user.role === "OPS_MANAGER") && (
        <>
          <CredentialAlertsWidget />
          <MissingVisitNotesWidget />
        </>
      )}

      {/* Shifts + Activity Feed side by side for Admin/Ops Manager */}
      {(user.role === "ADMIN" || user.role === "OPS_MANAGER") && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ShiftsWidget />
          <ActivityFeed />
        </div>
      )}

      {/* Shifts widget for other non-carer, non-sponsor roles */}
      {user.role !== "CARER" && user.role !== "SPONSOR" && user.role !== "ADMIN" && user.role !== "OPS_MANAGER" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ShiftsWidget />
        </div>
      )}
    </div>
  );
}
