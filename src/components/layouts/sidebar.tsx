"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { UserRole } from "@prisma/client";
import { cn } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/permissions";
import {
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  AlertTriangle,
  MessageSquare,
  Receipt,
  Settings,
  LogOut,
  Kanban,
  UserCheck,
  Clock,
  X,
  ClipboardList,
  FileEdit,
  BarChart3,
  CreditCard,
  MapPin,
  UserPlus,
  ClipboardCheck,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Stethoscope,
  Wallet,
  UserCog,
  Cog,
  FolderOpen,
  Send,
  Bell,
  Heart,
  HelpCircle,
  Award,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

interface NavGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  items: NavItem[];
  defaultOpen?: boolean;
}

type NavEntry = NavItem | NavGroup;

function isNavGroup(entry: NavEntry): entry is NavGroup {
  return "items" in entry;
}

const navigation: NavEntry[] = [
  // Dashboard - standalone
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF", "SUPERVISOR", "CARER", "SPONSOR"],
  },

  // Client Management Group
  {
    label: "Client Management",
    icon: FolderOpen,
    roles: ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF", "SUPERVISOR"],
    defaultOpen: true,
    items: [
      {
        label: "Referrals",
        href: "/referrals",
        icon: UserPlus,
        roles: ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF"],
      },
      {
        label: "Intake",
        href: "/intake",
        icon: ClipboardCheck,
        roles: ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF"],
      },
      {
        label: "Clients",
        href: "/clients",
        icon: UserCheck,
        roles: ["ADMIN", "OPS_MANAGER", "STAFF", "SUPERVISOR"],
      },
      {
        label: "Onboarding",
        href: "/onboarding",
        icon: Kanban,
        roles: ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF", "SUPERVISOR"],
      },
      {
        label: "Assessments",
        href: "/assessments",
        icon: ClipboardList,
        roles: ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF"],
      },
      {
        label: "Authorizations",
        href: "/authorizations",
        icon: ShieldCheck,
        roles: ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF"],
      },
      {
        label: "Care Plans",
        href: "/care-plans",
        icon: ClipboardList,
        roles: ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF"],
      },
      {
        label: "Sponsors",
        href: "/sponsors",
        icon: Heart,
        roles: ["ADMIN", "OPS_MANAGER"],
      },
    ],
  },

  // Staff Management Group
  {
    label: "Staff Management",
    icon: UserCog,
    roles: ["ADMIN", "OPS_MANAGER", "CARER"],
    items: [
      {
        label: "Staff Directory",
        href: "/staff",
        icon: Users,
        roles: ["ADMIN", "OPS_MANAGER"],
      },
      {
        label: "Credentials",
        href: "/credentials",
        icon: Award,
        roles: ["ADMIN", "OPS_MANAGER"],
      },
      {
        label: "My Credentials",
        href: "/my-credentials",
        icon: Award,
        roles: ["CARER"],
      },
      {
        label: "My Availability",
        href: "/availability",
        icon: Calendar,
        roles: ["CARER"],
      },
    ],
  },

  // Care Operations Group
  {
    label: "Care Operations",
    icon: Stethoscope,
    roles: ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF", "SUPERVISOR", "CARER", "SPONSOR"],
    defaultOpen: true,
    items: [
      {
        label: "Scheduling",
        href: "/scheduling",
        icon: Calendar,
        roles: ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF", "SUPERVISOR", "CARER"],
      },
      {
        label: "Check In/Out",
        href: "/check-in",
        icon: Clock,
        roles: ["CARER"],
      },
      {
        label: "Visit Notes",
        href: "/visit-notes",
        icon: ClipboardList,
        roles: ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF", "SUPERVISOR", "CARER", "SPONSOR"],
      },
      {
        label: "Incidents",
        href: "/incidents",
        icon: AlertTriangle,
        roles: ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF", "SUPERVISOR", "CARER", "SPONSOR"],
      },
      {
        label: "QA Manager",
        href: "/qa",
        icon: ClipboardCheck,
        roles: ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR"],
      },
      {
        label: "EVV Dashboard",
        href: "/evv",
        icon: MapPin,
        roles: ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "SUPERVISOR"],
      },
      {
        label: "EVV Reports",
        href: "/evv/reports",
        icon: BarChart3,
        roles: ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "SUPERVISOR"],
      },
    ],
  },

  // Financials Group
  {
    label: "Financials",
    icon: Wallet,
    roles: ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF", "SUPERVISOR", "CARER", "SPONSOR"],
    items: [
      {
        label: "Billing",
        href: "/billing",
        icon: CreditCard,
        roles: ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF"],
      },
      {
        label: "Payroll",
        href: "/payroll",
        icon: DollarSign,
        roles: ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF", "SUPERVISOR", "CARER"],
      },
      {
        label: "Invoices",
        href: "/invoices",
        icon: Receipt,
        roles: ["ADMIN", "OPS_MANAGER", "STAFF", "SPONSOR"],
      },
    ],
  },

  // Inbox - standalone
  {
    label: "Inbox",
    href: "/inbox",
    icon: MessageSquare,
    roles: ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF", "SUPERVISOR", "CARER", "SPONSOR"],
  },

  // Reports - standalone
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart3,
    roles: ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF", "SUPERVISOR"],
  },

  // Help - standalone (accessible to all roles)
  {
    label: "Help",
    href: "/help",
    icon: HelpCircle,
    roles: ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF", "SUPERVISOR", "CARER", "SPONSOR"],
  },

  // Settings Group
  {
    label: "Settings",
    icon: Cog,
    roles: ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF", "SUPERVISOR", "CARER", "SPONSOR"],
    items: [
      {
        label: "General",
        href: "/settings",
        icon: Settings,
        roles: ["ADMIN"],
      },
      {
        label: "State Config",
        href: "/settings/state",
        icon: MapPin,
        roles: ["ADMIN", "OPS_MANAGER"],
      },
      {
        label: "Form Templates",
        href: "/visit-notes/templates",
        icon: FileEdit,
        roles: ["ADMIN", "OPS_MANAGER"],
      },
      {
        label: "Profile Forms",
        href: "/settings/profile-templates",
        icon: FileEdit,
        roles: ["ADMIN", "OPS_MANAGER"],
      },
      {
        label: "Fax History",
        href: "/settings/fax",
        icon: Send,
        roles: ["ADMIN", "OPS_MANAGER"],
      },
      {
        label: "Notifications",
        href: "/settings/notifications",
        icon: Bell,
        roles: ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF", "SUPERVISOR", "CARER", "SPONSOR"],
      },
      {
        label: "EVV Settings",
        href: "/settings/evv",
        icon: MapPin,
        roles: ["ADMIN", "OPS_MANAGER"],
      },
    ],
  },
];

interface SidebarProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
  };
  companyName: string;
  onClose?: () => void;
  showClose?: boolean;
}

function NavGroupItem({
  group,
  userRole,
  pathname,
  onClose,
}: {
  group: NavGroup;
  userRole: UserRole;
  pathname: string;
  onClose?: () => void;
}) {
  const filteredItems = group.items.filter((item) => item.roles.includes(userRole));

  // Check if any child is active
  const hasActiveChild = filteredItems.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );

  const [isOpen, setIsOpen] = React.useState(hasActiveChild || group.defaultOpen || false);

  // Update isOpen when a child becomes active
  React.useEffect(() => {
    if (hasActiveChild && !isOpen) {
      setIsOpen(true);
    }
  }, [hasActiveChild, isOpen]);

  if (filteredItems.length === 0) return null;

  const Icon = group.icon;

  return (
    <li>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full px-2.5 py-1.5 rounded-md text-xs transition-all duration-150",
          hasActiveChild
            ? "text-white font-medium"
            : "text-sidebar-text hover:bg-sidebar-hover hover:text-white"
        )}
      >
        <span className="flex items-center gap-2.5">
          <Icon className="w-4 h-4 flex-shrink-0" />
          {group.label}
        </span>
        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
      </button>

      {isOpen && (
        <ul className="mt-0.5 ml-4 pl-2.5 border-l border-sidebar-hover space-y-0.5">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const ItemIcon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-all duration-150",
                    isActive
                      ? "bg-sidebar-active text-white font-medium"
                      : "text-sidebar-text hover:bg-sidebar-hover hover:text-white"
                  )}
                >
                  <ItemIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

export function Sidebar({ user, companyName, onClose, showClose = false }: SidebarProps) {
  const pathname = usePathname();

  const filteredNavigation = navigation.filter((entry) => {
    if (isNavGroup(entry)) {
      // Show group if user has access to at least one item
      return entry.items.some((item) => item.roles.includes(user.role));
    }
    return entry.roles.includes(user.role);
  });

  return (
    <aside className="w-56 bg-sidebar h-screen flex flex-col">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-sidebar-hover flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={onClose}>
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white font-semibold text-xs">{companyName[0]?.toUpperCase() || "C"}</span>
          </div>
          <span className="text-sm font-semibold text-white">{companyName}</span>
        </Link>
        {showClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-md text-sidebar-text hover:bg-sidebar-hover hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        <ul className="space-y-0.5">
          {filteredNavigation.map((entry) => {
            if (isNavGroup(entry)) {
              return (
                <NavGroupItem
                  key={entry.label}
                  group={entry}
                  userRole={user.role}
                  pathname={pathname}
                  onClose={onClose}
                />
              );
            }

            const isActive = pathname === entry.href || pathname.startsWith(entry.href + "/");
            const Icon = entry.icon;

            return (
              <li key={entry.href}>
                <Link
                  href={entry.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-all duration-150",
                    isActive
                      ? "bg-sidebar-active text-white font-medium"
                      : "text-sidebar-text hover:bg-sidebar-hover hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {entry.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="px-3 py-3 border-t border-sidebar-hover">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-full bg-sidebar-hover flex items-center justify-center">
            <span className="text-white font-medium text-xs">
              {user.firstName[0]}{user.lastName[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-[10px] text-sidebar-text">
              {ROLE_LABELS[user.role]}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-md text-xs text-sidebar-text hover:bg-sidebar-hover hover:text-white transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
