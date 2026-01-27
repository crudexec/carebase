"use client";

import { format } from "date-fns";
import {
  Activity,
  FileText,
  Calendar,
  UserPlus,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ActivityItem {
  id: string;
  type: "admission" | "visit" | "assessment" | "note" | "qa";
  title: string;
  patient: string;
  user: string;
  avatar?: string;
  time: Date;
  status?: "completed" | "pending" | "overdue";
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now - replace with actual API calls
    // TODO: Implement actual API calls to get recent activities
    setTimeout(() => {
      setActivities([
        {
          id: "1",
          type: "admission",
          title: "New Patient Admission",
          patient: "Sarah Johnson",
          user: "Dr. Smith",
          time: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          status: "completed",
        },
        {
          id: "2",
          type: "visit",
          title: "Skilled Nursing Visit",
          patient: "Robert Chen",
          user: "Nurse Wilson",
          time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          status: "completed",
        },
        {
          id: "3",
          type: "assessment",
          title: "OASIS Assessment",
          patient: "Maria Garcia",
          user: "Therapist Davis",
          time: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          status: "pending",
        },
        {
          id: "4",
          type: "note",
          title: "Clinical Note Updated",
          patient: "James Brown",
          user: "Nurse Johnson",
          time: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          status: "completed",
        },
        {
          id: "5",
          type: "qa",
          title: "QA Review Completed",
          patient: "Lisa Wong",
          user: "QA Manager Lee",
          time: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
          status: "completed",
        },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "admission":
        return <UserPlus className="h-4 w-4" />;
      case "visit":
        return <Calendar className="h-4 w-4" />;
      case "assessment":
        return <FileText className="h-4 w-4" />;
      case "note":
        return <Activity className="h-4 w-4" />;
      case "qa":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "pending":
        return "text-orange-600";
      case "overdue":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-white via-purple-50 to-white shadow-lg border-0">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Recent Activity
          </CardTitle>
          <CardDescription className="text-gray-600">
            Latest patient care activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-4 p-3 bg-gradient-to-r from-white to-gray-50 rounded-lg shadow-sm"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-200 to-purple-300 rounded-full animate-pulse shadow-md" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2 animate-pulse" />
                </div>
                <div className="h-8 w-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-white via-purple-50 to-white shadow-lg border-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          Recent Activity
        </CardTitle>
        <CardDescription className="text-gray-600">
          Latest patient care activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="group relative flex items-center space-x-4 p-4 bg-gradient-to-r from-white via-white to-purple-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-purple-100/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />

              <Avatar className="relative h-11 w-11 shadow-lg ring-2 ring-white">
                <AvatarImage src={activity.avatar} alt={activity.user} />
                <AvatarFallback className="bg-gradient-to-br from-purple-100 to-purple-200">
                  <div className="text-purple-600">
                    {getIcon(activity.type)}
                  </div>
                </AvatarFallback>
              </Avatar>

              <div className="relative space-y-1 flex-1 min-w-0">
                <p className="text-sm font-semibold leading-none truncate text-gray-900 group-hover:text-purple-900 transition-colors">
                  {activity.title}
                </p>
                <div className="flex items-center text-xs text-gray-600 space-x-2 font-medium">
                  <span>
                    Patient:{" "}
                    <span className="text-gray-800">{activity.patient}</span>
                  </span>
                  <span className="text-purple-400">•</span>
                  <span>
                    By <span className="text-gray-800">{activity.user}</span>
                  </span>
                </div>
              </div>

              <div className="relative text-right text-xs">
                <div className="font-semibold text-gray-700 mb-1">
                  {format(activity.time, "HH:mm")}
                </div>
                {activity.status && (
                  <div
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(activity.status)} bg-white shadow-sm`}
                  >
                    {activity.status}
                  </div>
                )}
              </div>

              <div className="absolute -right-1 -bottom-1 w-8 h-8 bg-gradient-to-br from-purple-400/10 to-indigo-400/20 rounded-full blur-lg" />
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-purple-100">
          <Link
            href="/log"
            className="inline-flex items-center text-sm bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent hover:from-purple-700 hover:to-purple-800 font-semibold transition-all duration-200"
          >
            View all activity →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
