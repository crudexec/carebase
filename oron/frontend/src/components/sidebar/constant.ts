export const SIDEBAR_LINKS = [
  {
    id: 1,
    name: "Overview",
    route: "/overview",
    icon: "/assets/images/dashboard/overview.svg",
    hasSubLink: false,
  },
  {
    id: 2,
    name: "Onboarding",
    route: "/onboarding",
    icon: "/assets/images/dashboard/onboarding.svg",
    hasSubLink: true,
    subLinks: [
      {
        name: "Summary",
        route: "/onboarding/summary",
      },
      {
        name: "Forms",
        route: "/onboarding/form",
      },
      {
        name: "Documents",
        route: "/onboarding/documents",
      },
    ],
  },
  {
    id: 3,
    name: "Clients",
    route: "/clients",
    icon: "/assets/images/dashboard/clients.svg",
    hasSubLink: false,
  },
  {
    id: 4,
    name: "Schedule",
    route: "/schedule",
    icon: "/assets/images/dashboard/events.svg",
    hasSubLink: false,
  },
  {
    id: 5,
    name: "Visits",
    route: "/visits",
    icon: "/assets/images/dashboard/overview.svg",
    hasSubLink: false,
    activeId: "visits",
  },
];

export const CLIENT_MANAGER_SIDEBAR_LINKS = [
  {
    id: 1,
    name: "Clients",
    route: "/client-manager/clients",
    icon: "/assets/images/dashboard/clients.svg",
    hasSubLink: false,
    activeId: "clients",
  },
];

export const EMPLOYEE_MANAGER_SIDEBAR_LINKS = [
  {
    id: 1,
    name: "Employees",
    route: "/employee-manager",
    icon: "/assets/images/dashboard/overview.svg",
    hasSubLink: false,
    activeId: "employees",
  },
];

export const ADMIN_SIDEBAR_LINKS = [
  {
    id: 1,
    name: "Dashboard",
    route: "/admin/dashboard",
    icon: "/assets/images/dashboard/overview.svg",
    hasSubLink: false,
    activeId: "dashboard",
  },
  {
    id: 2,
    name: "Employees",
    route: "/admin",
    icon: "/assets/images/dashboard/overview.svg",
    hasSubLink: false,
    activeId: "admin",
  },
  {
    id: 3,
    name: "Clients",
    route: "/admin/clients",
    icon: "/assets/images/dashboard/clients.svg",
    hasSubLink: false,
    activeId: "clients",
  },
  {
    id: 4,
    name: "Visits",
    route: "/admin/visits",
    icon: "/assets/images/dashboard/overview.svg",
    hasSubLink: false,
    activeId: "visits",
  },
  {
    id: 5,
    name: "Events",
    route: "/admin/events",
    icon: "/assets/images/dashboard/events.svg",
    hasSubLink: false,
    activeId: "events",
  },
  {
    id: 6,
    name: "Reports",
    route: "/admin/reports",
    icon: "/assets/images/dashboard/overview.svg",
    hasSubLink: true,
    activeId: "reports",
    subLinks: [
      {
        name: "Six Month Reports",
        route: "/admin/reports/six-month",
      },
    ],
  },
];
