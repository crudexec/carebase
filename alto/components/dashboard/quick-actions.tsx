"use client";

import {
  Calendar,
  FileText,
  Users,
  CheckSquare,
  ClipboardList,
  Activity,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const quickActions = [
  {
    title: "Add New Patient",
    description: "Register a new patient in the system",
    href: "/patient?action=create",
    icon: Users,
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    title: "Schedule Visit",
    description: "Schedule a patient visit or appointment",
    href: "/schedule?action=create",
    icon: Calendar,
    color: "bg-green-500 hover:bg-green-600",
  },
  {
    title: "Create Assessment",
    description: "Start a new patient assessment",
    href: "/assessment?action=create",
    icon: ClipboardList,
    color: "bg-purple-500 hover:bg-purple-600",
  },
  {
    title: "Clinical Note",
    description: "Document patient care activities",
    href: "/clinical/sn-note?action=create",
    icon: FileText,
    color: "bg-orange-500 hover:bg-orange-600",
  },
  {
    title: "EVV Entry",
    description: "Electronic Visit Verification",
    href: "/evv?action=create",
    icon: CheckSquare,
    color: "bg-teal-500 hover:bg-teal-600",
  },
  {
    title: "Plan of Care",
    description: "Create or update care plans",
    href: "/clinical/poc?action=create",
    icon: Activity,
    color: "bg-indigo-500 hover:bg-indigo-600",
  },
];

export function QuickActions() {
  return (
    <Card className="bg-gradient-to-br from-white via-gray-50 to-white shadow-lg border-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          Quick Actions
        </CardTitle>
        <CardDescription className="text-gray-600">
          Common healthcare management tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.title} href={action.href}>
                <Button
                  variant="outline"
                  className="group relative h-auto p-5 flex flex-col items-center justify-center text-center space-y-3 hover:shadow-xl hover:scale-105 transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 shadow-md overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-gray-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div
                    className={`relative p-3 rounded-xl ${action.color} text-white shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="relative">
                    <div className="font-semibold text-sm text-gray-800 group-hover:text-gray-900 transition-colors">
                      {action.title}
                    </div>
                    <div className="text-xs text-gray-600 leading-tight mt-1">
                      {action.description}
                    </div>
                  </div>
                  <div className="absolute -right-2 -bottom-2 w-8 h-8 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-lg" />
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
