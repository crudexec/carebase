"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { UserRole } from "@prisma/client";
import { cn } from "@/lib/utils";
import { isInternalAdminClient } from "@/lib/internal-admin";

type GeneralTab = {
  label: string;
  href: string;
  path: string;
  roles: UserRole[];
};

const everyone: UserRole[] = [
  "ADMIN",
  "OPS_MANAGER",
  "CLINICAL_DIRECTOR",
  "STAFF",
  "SUPERVISOR",
  "CARER",
  "SPONSOR",
];
const management: UserRole[] = ["ADMIN", "OPS_MANAGER"];
const clinicalManagement: UserRole[] = [
  "ADMIN",
  "OPS_MANAGER",
  "CLINICAL_DIRECTOR",
  "SUPERVISOR",
];
const administrators: UserRole[] = ["ADMIN"];

const tabs: GeneralTab[] = [
  {
    label: "Company",
    href: "/settings",
    path: "/settings",
    roles: administrators,
  },
  {
    label: "Checklists",
    href: "/settings?tab=checklists",
    path: "/settings",
    roles: administrators,
  },
  {
    label: "Team invites",
    href: "/settings/invites",
    path: "/settings/invites",
    roles: management,
  },
  {
    label: "Form templates",
    href: "/visit-notes/templates",
    path: "/visit-notes/templates",
    roles: management,
  },
  {
    label: "Assessment templates",
    href: "/assessments/templates",
    path: "/assessments/templates",
    roles: administrators,
  },
  {
    label: "Care plan templates",
    href: "/care-plans/templates",
    path: "/care-plans/templates",
    roles: administrators,
  },
  {
    label: "Profile forms",
    href: "/settings/profile-templates",
    path: "/settings/profile-templates",
    roles: management,
  },
  {
    label: "Fax history",
    href: "/settings/fax",
    path: "/settings/fax",
    roles: management,
  },
  {
    label: "Notifications",
    href: "/settings/notifications",
    path: "/settings/notifications",
    roles: everyone,
  },
  {
    label: "Companies",
    href: "/settings/companies",
    path: "/settings/companies",
    roles: administrators,
  },
  {
    label: "Terminology",
    href: "/settings/terminology",
    path: "/settings/terminology",
    roles: administrators,
  },
  {
    label: "EVV settings",
    href: "/settings/evv",
    path: "/settings/evv",
    roles: management,
  },
  {
    label: "EVV dashboard",
    href: "/evv",
    path: "/evv",
    roles: clinicalManagement,
  },
  {
    label: "EVV reports",
    href: "/evv/reports",
    path: "/evv/reports",
    roles: clinicalManagement,
  },
  {
    label: "State config",
    href: "/settings/state",
    path: "/settings/state",
    roles: management,
  },
];

function GeneralSettingsTabList({
  role,
  email,
}: {
  role: UserRole;
  email: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isGeneralPage = pathname === "/settings";
  const isFeatureSettingsTab = searchParams.get("tab") === "checklists";
  const showTabs =
    pathname.startsWith("/settings") ||
    pathname === "/visit-notes/templates" ||
    pathname.startsWith("/visit-notes/templates/") ||
    pathname === "/assessments/templates" ||
    pathname.startsWith("/assessments/templates/") ||
    pathname === "/care-plans/templates" ||
    pathname.startsWith("/care-plans/templates/") ||
    pathname === "/evv" ||
    pathname.startsWith("/evv/reports");

  if (!showTabs) return null;

  return (
    <nav
      aria-label="General settings"
      className="-mx-1 mb-6 border-b border-border"
    >
      <div className="flex gap-1 overflow-x-auto px-1">
        {tabs
          .filter(
            (tab) =>
              tab.roles.includes(role) &&
              (tab.path !== "/settings/companies" ||
                isInternalAdminClient(email)),
          )
          .map((tab) => {
            const active =
              tab.path === "/settings"
                ? isGeneralPage &&
                  (tab.label === "Checklists"
                    ? isFeatureSettingsTab
                    : !isFeatureSettingsTab)
                : tab.path === "/evv"
                  ? pathname === "/evv"
                  : pathname === tab.path || pathname.startsWith(`${tab.path}/`);
            return (
              <Link
                key={tab.label}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "shrink-0 border-b-2 px-3 py-3 text-sm font-medium transition-colors",
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-foreground-secondary hover:border-border hover:text-foreground",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
      </div>
    </nav>
  );
}

export function GeneralSettingsTabs({
  role,
  email,
}: {
  role: UserRole;
  email: string;
}) {
  return (
    <Suspense fallback={null}>
      <GeneralSettingsTabList role={role} email={email} />
    </Suspense>
  );
}
