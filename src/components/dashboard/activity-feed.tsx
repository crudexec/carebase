"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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
  FileText,
  Download,
  Search,
  Filter,
  LogOut,
  X,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

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
  "log-out": LogOut,
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
  "check-in": "bg-emerald-100 text-emerald-600",
  "check-out": "bg-amber-100 text-amber-600",
  audit: "bg-gray-100 text-gray-600",
};

export function ActivityFeed() {
  const [activities, setActivities] = React.useState<ActivityItem[]>([]);
  const [allActivities, setAllActivities] = React.useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showReportModal, setShowReportModal] = React.useState(false);
  const [isLoadingAll, setIsLoadingAll] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterType, setFilterType] = React.useState<string>("all");

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

  const loadAllActivities = async () => {
    setIsLoadingAll(true);
    try {
      const response = await fetch("/api/dashboard/activity?limit=100");
      if (response.ok) {
        const data = await response.json();
        setAllActivities(data.activities);
      }
    } catch {
      // Silently fail
    } finally {
      setIsLoadingAll(false);
    }
  };

  const handleViewAll = () => {
    setShowReportModal(true);
    loadAllActivities();
  };

  const filteredActivities = React.useMemo(() => {
    return allActivities.filter((activity) => {
      const matchesSearch =
        searchTerm === "" ||
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || activity.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [allActivities, searchTerm, filterType]);

  const exportToCSV = () => {
    const headers = ["Timestamp", "Type", "Title", "Description"];
    const rows = filteredActivities.map((a) => [
      format(new Date(a.timestamp), "yyyy-MM-dd HH:mm:ss"),
      a.type,
      a.title,
      a.description,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `activity-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const activityTypes = React.useMemo(() => {
    const types = new Set(allActivities.map((a) => a.type));
    return Array.from(types).sort();
  }, [allActivities]);

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
    <>
    <Card className="col-span-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Activity Feed
          </CardTitle>
          <div className="flex items-center gap-3">
            <span className="text-xs text-foreground-secondary">
              Auto-refreshes every 30s
            </span>
            <Button variant="ghost" size="sm" onClick={handleViewAll}>
              <FileText className="w-4 h-4 mr-1" />
              View All
            </Button>
          </div>
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

    {/* Activity Report Modal */}
    {showReportModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-4xl max-h-[85vh] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Activity Report
            </CardTitle>
            <button
              onClick={() => setShowReportModal(false)}
              className="text-foreground-secondary hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </CardHeader>
          <CardContent className="flex flex-col flex-1 overflow-hidden">
            {/* Filters and Export */}
            <div className="flex items-center gap-3 py-3 border-b mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-tertiary" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-40"
              >
                <option value="all">All Types</option>
                {activityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </Select>
              <Button variant="secondary" size="sm" onClick={exportToCSV}>
                <Download className="w-4 h-4 mr-1" />
                Export CSV
              </Button>
            </div>

            {/* Activities List */}
            <div className="flex-1 overflow-hidden">
              {isLoadingAll ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : filteredActivities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Activity className="w-10 h-10 text-foreground-tertiary mb-2" />
                  <p className="text-sm text-foreground-secondary">
                    {searchTerm || filterType !== "all"
                      ? "No activities match your filters"
                      : "No activities found"}
                  </p>
                </div>
              ) : (
                <div className="h-[400px] overflow-y-auto pr-2">
                  <div className="space-y-1">
                    {filteredActivities.map((activity) => {
                      const IconComponent = ICON_MAP[activity.icon] || Activity;
                      const colorClass =
                        TYPE_COLORS[activity.type] || "bg-gray-100 text-gray-600";

                      return (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-background-secondary/50 transition-colors"
                        >
                          <div className={`p-2 rounded-lg flex-shrink-0 ${colorClass}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-medium text-foreground truncate">
                                {activity.title}
                              </p>
                              <div className="flex items-center gap-2">
                                <Badge variant="default" className="text-xs">
                                  {activity.type.replace("-", " ")}
                                </Badge>
                                <span className="text-xs text-foreground-tertiary whitespace-nowrap">
                                  {format(new Date(activity.timestamp), "MMM d, h:mm a")}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-foreground-secondary mt-0.5">
                              {activity.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t text-sm text-foreground-secondary mt-4">
              <span>
                Showing {filteredActivities.length} of {allActivities.length} activities
              </span>
              <Button variant="ghost" size="sm" onClick={() => setShowReportModal(false)}>
                <X className="w-4 h-4 mr-1" />
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )}
    </>
  );
}
