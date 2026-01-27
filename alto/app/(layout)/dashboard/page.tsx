import dynamic from "next/dynamic";
import { Calendar, Filter, RefreshCw, Settings } from "lucide-react";

import {
  HealthcareStats,
  RecentActivity,
  QuickActions,
  UpcomingVisits,
} from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamic import for heavy chart component
const Overview = dynamic(
  () =>
    import("@/components/dashboard").then((mod) => ({ default: mod.Overview })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[350px] w-full rounded-lg" />,
  },
);

export default function DashboardPage() {
  return (
    <div className="flex-col md:flex max-w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="flex-1 space-y-6 p-4 md:px-8 pb-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-6 text-white shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent" />
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Healthcare Dashboard
                </h1>
                <p className="mt-2 text-blue-100">
                  Welcome back! Here's an overview of your patient care
                  operations.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Today
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-indigo-400/20 blur-3xl" />
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-1">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-200"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-200"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-200"
            >
              Reports
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-200"
            >
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8 mt-8">
            {/* Healthcare Statistics */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Key Metrics
              </h2>
              <HealthcareStats />
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Quick Actions
              </h2>
              <QuickActions />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Upcoming Visits */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Today's Schedule
                </h2>
                <UpcomingVisits />
              </div>

              {/* Recent Activity */}
              <div className="lg:col-span-1 space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recent Activity
                </h2>
                <RecentActivity />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Analytics & Reports
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Overview />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg text-center">
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6">
                <Settings className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Reports Coming Soon
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Comprehensive healthcare reports, compliance documentation, and
                detailed analytics will be available here.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg text-center">
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6">
                <RefreshCw className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Notifications Coming Soon
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Patient alerts, visit reminders, system notifications, and
                real-time updates will be displayed here.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
