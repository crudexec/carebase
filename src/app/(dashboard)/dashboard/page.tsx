import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
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
  const quickActions = [
    hasAnyPermission(user.role, [
      PERMISSIONS.ASSESSMENT_CREATE,
      PERMISSIONS.ASSESSMENT_EDIT,
      PERMISSIONS.ASSESSMENT_FULL,
    ]) && {
      title: "New Assessment",
      description: "Start a fresh assessment from your active templates.",
      href: "/assessments/new",
      icon: ClipboardList,
    },
    hasAnyPermission(user.role, [
      PERMISSIONS.CARE_PLAN_MANAGE,
      PERMISSIONS.CARE_PLAN_FULL,
    ]) && {
      title: "New Care Plan",
      description: "Choose a client and open a new plan of care.",
      href: "/care-plans",
      icon: FilePenLine,
    },
    hasAnyPermission(user.role, [
      PERMISSIONS.VISIT_NOTE_CREATE,
      PERMISSIONS.VISIT_NOTE_MANAGE,
      PERMISSIONS.VISIT_NOTE_FULL,
    ]) && {
      title: "New Visit Note",
      description: "Document a visit note without leaving the dashboard.",
      href: "/visit-notes/new",
      icon: FileText,
    },
    hasAnyPermission(user.role, [
      PERMISSIONS.INCIDENT_CREATE,
      PERMISSIONS.INCIDENT_FULL,
    ]) && {
      title: "New Incident Report",
      description: "Capture a new incident report and route it for review.",
      href: "/incidents/new",
      icon: PlusCircle,
    },
  ].filter(Boolean) as Array<{
    title: string;
    description: string;
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

      {quickActions.length > 0 && (
        <Card className="border-border/80">
          <CardHeader className="pb-3">
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Jump straight into the most common documentation workflows.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Card
                    key={action.title}
                    className="border-border/70 bg-background-secondary/40 shadow-none"
                  >
                    <CardContent className="flex h-full flex-col gap-4 p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-md bg-primary/10 p-2 text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-sm font-semibold text-foreground">
                            {action.title}
                          </h3>
                          <p className="text-sm text-foreground-secondary">
                            {action.description}
                          </p>
                        </div>
                      </div>
                      <Button asChild className="w-full justify-center">
                        <Link href={action.href}>{action.title}</Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
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
