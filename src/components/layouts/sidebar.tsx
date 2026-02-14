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
  PanelLeftClose,
  PanelLeft,
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
        label: "Assessment Templates",
        href: "/assessments/templates",
        icon: ClipboardList,
        roles: ["ADMIN"],
      },
      {
        label: "Care Plan Templates",
        href: "/care-plans/templates",
        icon: ClipboardList,
        roles: ["ADMIN"],
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
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

// Tooltip component for collapsed state
function Tooltip({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="relative group/tooltip">
      {children}
      <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-white text-xs rounded-md whitespace-nowrap opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-150 z-50 pointer-events-none">
        {label}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-foreground" />
      </div>
    </div>
  );
}

function NavGroupItem({
  group,
  userRole,
  pathname,
  onClose,
  isCollapsed,
}: {
  group: NavGroup;
  userRole: UserRole;
  pathname: string;
  onClose?: () => void;
  isCollapsed?: boolean;
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

  // Collapsed view - show icon with dropdown on hover
  if (isCollapsed) {
    return (
      <li className="relative group/nav">
        <Tooltip label={group.label}>
          <div
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-150 cursor-pointer mx-auto",
              hasActiveChild
                ? "bg-sidebar-active text-white"
                : "text-sidebar-text hover:bg-sidebar-hover hover:text-white"
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        </Tooltip>

        {/* Flyout menu on hover */}
        <div className="absolute left-full top-0 ml-1 py-2 px-1 bg-sidebar rounded-lg shadow-xl opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-150 z-50 min-w-[180px]">
          <div className="px-3 py-1.5 text-xs font-semibold text-sidebar-text border-b border-sidebar-hover mb-1">
            {group.label}
          </div>
          {filteredItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const ItemIcon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-xs transition-all duration-150",
                  isActive
                    ? "bg-sidebar-active text-white font-medium"
                    : "text-sidebar-text hover:bg-sidebar-hover hover:text-white"
                )}
              >
                <ItemIcon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </li>
    );
  }

  // Expanded view
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

export function Sidebar({ user, companyName, onClose, showClose = false, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const navRef = React.useRef<HTMLElement>(null);
  const [scrollState, setScrollState] = React.useState({ top: false, bottom: false });

  // Track scroll position for gradient indicators
  React.useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const updateScrollState = () => {
      const { scrollTop, scrollHeight, clientHeight } = nav;
      setScrollState({
        top: scrollTop > 10,
        bottom: scrollTop < scrollHeight - clientHeight - 10,
      });
    };

    updateScrollState();
    nav.addEventListener("scroll", updateScrollState);

    // Also update on resize
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(nav);

    return () => {
      nav.removeEventListener("scroll", updateScrollState);
      resizeObserver.disconnect();
    };
  }, []);

  const filteredNavigation = navigation.filter((entry) => {
    if (isNavGroup(entry)) {
      // Show group if user has access to at least one item
      return entry.items.some((item) => item.roles.includes(user.role));
    }
    return entry.roles.includes(user.role);
  });

  return (
    <aside className={cn(
      "bg-sidebar h-full flex flex-col transition-all duration-300 ease-in-out shadow-xl lg:shadow-none",
      isCollapsed ? "w-16" : "w-56"
    )}>
      {/* Logo */}
      <div className={cn(
        "py-4 border-b border-sidebar-hover flex items-center",
        isCollapsed ? "px-3 justify-center" : "px-4 justify-between"
      )}>
        <Link href="/dashboard" className="flex items-center gap-2" onClick={onClose}>
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-xs">{companyName[0]?.toUpperCase() || "C"}</span>
          </div>
          {!isCollapsed && (
            <span className="text-sm font-semibold text-white truncate">{companyName}</span>
          )}
        </Link>
        {showClose && !isCollapsed && (
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
      <div className="flex-1 relative overflow-hidden">
        {/* Top scroll indicator */}
        <div
          className={cn(
            "absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-sidebar to-transparent z-10 pointer-events-none transition-opacity duration-200",
            scrollState.top ? "opacity-100" : "opacity-0"
          )}
        />

        <nav
          ref={navRef}
          className="h-full px-2 py-3 overflow-y-auto overflow-x-hidden sidebar-scroll"
        >
          <ul className={cn("space-y-1", isCollapsed && "space-y-2")}>
          {filteredNavigation.map((entry) => {
            if (isNavGroup(entry)) {
              return (
                <NavGroupItem
                  key={entry.label}
                  group={entry}
                  userRole={user.role}
                  pathname={pathname}
                  onClose={onClose}
                  isCollapsed={isCollapsed}
                />
              );
            }

            const isActive = pathname === entry.href || pathname.startsWith(entry.href + "/");
            const Icon = entry.icon;

            if (isCollapsed) {
              return (
                <li key={entry.href}>
                  <Tooltip label={entry.label}>
                    <Link
                      href={entry.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-lg mx-auto transition-all duration-150",
                        isActive
                          ? "bg-sidebar-active text-white"
                          : "text-sidebar-text hover:bg-sidebar-hover hover:text-white"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </Link>
                  </Tooltip>
                </li>
              );
            }

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

        {/* Bottom scroll indicator */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-sidebar to-transparent z-10 pointer-events-none transition-opacity duration-200",
            scrollState.bottom ? "opacity-100" : "opacity-0"
          )}
        />
      </div>

      {/* Collapse Toggle - Desktop only */}
      {onToggleCollapse && !showClose && (
        <div className={cn(
          "px-2 py-2 border-t border-sidebar-hover",
          isCollapsed && "flex justify-center"
        )}>
          <button
            onClick={onToggleCollapse}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg text-xs text-sidebar-text hover:bg-sidebar-hover hover:text-white transition-all duration-200",
              isCollapsed ? "w-10 h-10 mx-auto" : "w-full px-2.5 py-2"
            )}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <PanelLeft className="w-5 h-5" />
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4" />
                <span className="flex-1 text-left">Collapse menu</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* User Profile */}
      <div className={cn(
        "py-3 border-t border-sidebar-hover",
        isCollapsed ? "px-2" : "px-3"
      )}>
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <Tooltip label={`${user.firstName} ${user.lastName}`}>
              <div className="w-8 h-8 rounded-full bg-sidebar-hover flex items-center justify-center cursor-default">
                <span className="text-white font-medium text-xs">
                  {user.firstName[0]}{user.lastName[0]}
                </span>
              </div>
            </Tooltip>
            <Tooltip label="Sign out">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="p-2 rounded-md text-sidebar-text hover:bg-sidebar-hover hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </aside>
  );
}
