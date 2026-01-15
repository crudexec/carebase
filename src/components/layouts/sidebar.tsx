"use client";

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
  FileText,
  MessageSquare,
  Receipt,
  TrendingUp,
  Settings,
  LogOut,
  Kanban,
  UserCheck,
  Clock,
  X,
  ClipboardList,
  FileEdit,
  BarChart3,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF", "SUPERVISOR", "CARER", "SPONSOR"],
  },
  {
    label: "Onboarding",
    href: "/onboarding",
    icon: Kanban,
    roles: ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF", "SUPERVISOR"],
  },
  {
    label: "Scheduling",
    href: "/scheduling",
    icon: Calendar,
    roles: ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF", "SUPERVISOR", "CARER"],
  },
  {
    label: "Payroll",
    href: "/payroll",
    icon: DollarSign,
    roles: ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF", "SUPERVISOR", "CARER"],
  },
  {
    label: "Incidents",
    href: "/incidents",
    icon: AlertTriangle,
    roles: ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF", "SUPERVISOR", "CARER", "SPONSOR"],
  },
  {
    label: "Daily Reports",
    href: "/reports/daily",
    icon: FileText,
    roles: ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF", "SUPERVISOR", "CARER", "SPONSOR"],
  },
  {
    label: "Visit Notes",
    href: "/visit-notes",
    icon: ClipboardList,
    roles: ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF", "SUPERVISOR", "CARER", "SPONSOR"],
  },
  {
    label: "Form Templates",
    href: "/visit-notes/templates",
    icon: FileEdit,
    roles: ["ADMIN", "OPS_MANAGER"],
  },
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart3,
    roles: ["ADMIN", "OPS_MANAGER", "CLINICAL_DIRECTOR", "STAFF", "SUPERVISOR"],
  },
  {
    label: "Chat",
    href: "/chat",
    icon: MessageSquare,
    roles: ["ADMIN", "CARER", "SPONSOR"],
  },
  {
    label: "Invoices",
    href: "/invoices",
    icon: Receipt,
    roles: ["ADMIN", "OPS_MANAGER", "STAFF", "SPONSOR"],
  },
  {
    label: "Escalations",
    href: "/escalations",
    icon: TrendingUp,
    roles: ["ADMIN", "OPS_MANAGER", "SUPERVISOR", "CARER"],
  },
  {
    label: "Check In/Out",
    href: "/check-in",
    icon: Clock,
    roles: ["CARER"],
  },
  {
    label: "My Availability",
    href: "/availability",
    icon: Calendar,
    roles: ["CARER"],
  },
  {
    label: "Staff",
    href: "/staff",
    icon: Users,
    roles: ["ADMIN", "OPS_MANAGER"],
  },
  {
    label: "Clients",
    href: "/clients",
    icon: UserCheck,
    roles: ["ADMIN", "OPS_MANAGER", "STAFF", "SUPERVISOR"],
  },
  {
    label: "Profile Forms",
    href: "/settings/profile-templates",
    icon: FileEdit,
    roles: ["ADMIN", "OPS_MANAGER"],
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["ADMIN"],
  },
];

interface SidebarProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
  };
  onClose?: () => void;
  showClose?: boolean;
}

export function Sidebar({ user, onClose, showClose = false }: SidebarProps) {
  const pathname = usePathname();

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user.role)
  );

  return (
    <aside className="w-56 bg-sidebar h-screen flex flex-col">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-sidebar-hover flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={onClose}>
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white font-semibold text-xs">C</span>
          </div>
          <span className="text-sm font-semibold text-white">CareBase</span>
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
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

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
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
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
