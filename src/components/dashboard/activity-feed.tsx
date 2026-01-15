"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  UserPlus,
  CheckCircle,
  Clock,
  ClipboardList,
  AlertTriangle,
  User,
  Loader2,
  ChevronRight,
  LogIn,
  Calendar,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  link?: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "user-plus": UserPlus,
  "check-circle": CheckCircle,
  clock: Clock,
  clipboard: ClipboardList,
  "alert-triangle": AlertTriangle,
  user: User,
  "log-in": LogIn,
  calendar: Calendar,
  activity: Activity,
};

const TYPE_COLORS: Record<string, string> = {
  client: "bg-green-100 text-green-600",
  shift: "bg-blue-100 text-blue-600",
  "visit-note": "bg-purple-100 text-purple-600",
  incident: "bg-red-100 text-red-600",
  staff: "bg-orange-100 text-orange-600",
  login: "bg-indigo-100 text-indigo-600",
  audit: "bg-gray-100 text-gray-600",
};

export function ActivityFeed() {
  const [activities, setActivities] = React.useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchActivities() {
      try {
        const response = await fetch("/api/dashboard/activity?limit=15");
        if (response.ok) {
          const data = await response.json();
          setActivities(data.activities);
        }
      } catch {
        // Silently fail
      } finally {
        setIsLoading(false);
      }
    }
    fetchActivities();

    // Refresh every 30 seconds
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Activity Feed
          </CardTitle>
          <span className="text-xs text-foreground-secondary">
            Auto-refreshes every 30s
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-10 h-10 mx-auto text-foreground-tertiary mb-2" />
            <p className="text-sm text-foreground-secondary">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-1">
            {activities.map((activity) => {
              const IconComponent = ICON_MAP[activity.icon] || Activity;
              const colorClass = TYPE_COLORS[activity.type] || "bg-gray-100 text-gray-600";

              const content = (
                <div
                  className={`flex items-start gap-3 p-3 rounded-lg hover:bg-background-secondary/50 transition-colors ${
                    activity.link ? "cursor-pointer" : ""
                  }`}
                >
                  <div className={`p-2 rounded-lg flex-shrink-0 ${colorClass}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {activity.title}
                      </p>
                      <span className="text-xs text-foreground-tertiary whitespace-nowrap">
                        {formatTime(activity.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-foreground-secondary mt-0.5 line-clamp-1">
                      {activity.description}
                    </p>
                  </div>
                  {activity.link && (
                    <ChevronRight className="w-4 h-4 text-foreground-tertiary flex-shrink-0 mt-1" />
                  )}
                </div>
              );

              return activity.link ? (
                <Link key={activity.id} href={activity.link}>
                  {content}
                </Link>
              ) : (
                <div key={activity.id}>{content}</div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
