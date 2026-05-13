import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import {
  hasAnyPermission,
  PERMISSIONS,
  ROLE_LABELS,
} from "@/lib/permissions";
import { CheckInWidget } from "@/components/dashboard/check-in-widget";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { SponsorDashboard } from "@/components/dashboard/sponsor-dashboard";
import { ShiftsWidget } from "@/components/dashboard/shifts-widget";
import { CredentialAlertsWidget } from "@/components/dashboard/credential-alerts-widget";
import { MissingVisitNotesWidget } from "@/components/dashboard/missing-visit-notes-widget";
import { ClientLookupWidget } from "@/components/dashboard/client-lookup-widget";
import {
  ClipboardList,
  FilePenLine,
  FileText,
  PlusCircle,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { user } = session;
  const userRole = user.role as string;
  const roleLabel = ROLE_LABELS[user.role];
  const canViewClients =
    user.role === "SPONSOR" ||
    hasAnyPermission(user.role, [
      PERMISSIONS.USER_VIEW,
      PERMISSIONS.SCHEDULING_VIEW,
      PERMISSIONS.ONBOARDING_VIEW,
    ]);
  const quickActions = [
    hasAnyPermission(user.role, [
      PERMISSIONS.ASSESSMENT_CREATE,
    PERMISSIONS.ASSESSMENT_EDIT,
    PERMISSIONS.ASSESSMENT_FULL,
    ]) && {
      title: "Assessment",
      href: "/assessments/new",
      icon: ClipboardList,
    },
    hasAnyPermission(user.role, [
    PERMISSIONS.CARE_PLAN_MANAGE,
    PERMISSIONS.CARE_PLAN_FULL,
    ]) && {
      title: "Care Plan",
      href: "/care-plans",
      icon: FilePenLine,
    },
    hasAnyPermission(user.role, [
    PERMISSIONS.VISIT_NOTE_CREATE,
    PERMISSIONS.VISIT_NOTE_MANAGE,
    PERMISSIONS.VISIT_NOTE_FULL,
    ]) && {
      title: "Visit Note",
      href: "/visit-notes/new",
      icon: FileText,
    },
    hasAnyPermission(user.role, [
    PERMISSIONS.INCIDENT_CREATE,
    PERMISSIONS.INCIDENT_FULL,
    ]) && {
      title: "Incident",
      href: "/incidents/new",
      icon: PlusCircle,
    },
  ].filter(Boolean) as Array<{
    title: string;
    href: string;
    icon: typeof ClipboardList;
  }>;

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

      {(quickActions.length > 0 || canViewClients) && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {quickActions.length > 0 && (
            <Card className="border-border/80">
              <CardHeader className="pb-2">
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action) => {
                    const Icon = action.icon;

                    return (
                      <Link
                        key={action.title}
                        href={action.href}
                        className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-lg border border-border/70 bg-background-secondary/40 px-4 py-5 text-center transition-colors hover:bg-background-secondary"
                      >
                        <Icon className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium text-foreground">
                          {action.title}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {canViewClients && <ClientLookupWidget />}
        </div>
      )}

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

      {/* Credential Alerts and Missing Visit Notes side by side for Admin/Ops Manager */}
      {(user.role === "ADMIN" || user.role === "OPS_MANAGER") && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CredentialAlertsWidget />
          <MissingVisitNotesWidget />
        </div>
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
