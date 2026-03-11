"use client";

import { useRouter } from "next/navigation";
import { UserPlus, FileText, Calendar, Users } from "lucide-react";

type QuickAction = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  color: string;
  roles: string[];
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "new-employee",
    title: "New Employee",
    description: "Create a new employee account",
    icon: <UserPlus className="w-6 h-6" />,
    route: "/admin",
    color: "bg-blue-500",
    roles: ["ADMINISTRATOR", "EMPLOYEE_MANAGER"],
  },
  {
    id: "new-intake",
    title: "New Client Intake",
    description: "Add a new client to the system",
    icon: <Users className="w-6 h-6" />,
    route: "/admin/clients/new-intake",
    color: "bg-green-500",
    roles: ["ADMINISTRATOR", "CLIENT_MANAGER"],
  },
  {
    id: "log-visit-admin",
    title: "Log New Visit",
    description: "Record a client visit",
    icon: <FileText className="w-6 h-6" />,
    route: "/admin/visits",
    color: "bg-purple-500",
    roles: ["ADMINISTRATOR"],
  },
  {
    id: "log-visit-cm",
    title: "Log New Visit",
    description: "Record a client visit",
    icon: <FileText className="w-6 h-6" />,
    route: "/client-manager/visits",
    color: "bg-purple-500",
    roles: ["CLIENT_MANAGER"],
  },
  {
    id: "log-visit-employee",
    title: "Log New Visit",
    description: "Record a client visit",
    icon: <FileText className="w-6 h-6" />,
    route: "/visits",
    color: "bg-purple-500",
    roles: ["STANDARD"],
  },
  {
    id: "view-schedule-admin",
    title: "View Schedule",
    description: "Check your upcoming appointments",
    icon: <Calendar className="w-6 h-6" />,
    route: "/admin/events",
    color: "bg-orange-500",
    roles: ["ADMINISTRATOR"],
  },
  {
    id: "view-schedule-employee",
    title: "View Schedule",
    description: "Check your upcoming appointments",
    icon: <Calendar className="w-6 h-6" />,
    route: "/schedule",
    color: "bg-orange-500",
    roles: ["CLIENT_MANAGER", "STANDARD"],
  },
];

interface QuickActionsProps {
  userRole?: string;
}

export default function QuickActions({ userRole }: QuickActionsProps) {
  const router = useRouter();

  // Filter actions based on user role
  const filteredActions = QUICK_ACTIONS.filter((action) =>
    action.roles.includes(userRole || "")
  );

  if (filteredActions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
        <p className="text-sm text-gray-600 mt-1">
          Commonly used actions for quick access
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredActions.map((action) => (
          <button
            key={action.id}
            onClick={() => router.push(action.route)}
            className="group relative flex flex-col items-start p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white"
          >
            {/* Icon with colored background */}
            <div
              className={`${action.color} text-white p-3 rounded-lg mb-3 group-hover:scale-110 transition-transform duration-200`}
            >
              {action.icon}
            </div>

            {/* Content */}
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                {action.title}
              </h3>
              <p className="text-xs text-gray-600">{action.description}</p>
            </div>

            {/* Hover arrow */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
