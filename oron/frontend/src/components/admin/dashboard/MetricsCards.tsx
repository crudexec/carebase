"use client";

import { Users, UserCheck, Clock, FileText } from "lucide-react";
import { DashboardMetrics } from "@/types/DashboardTypes";

interface MetricsCardsProps {
  metrics?: DashboardMetrics;
  loading: boolean;
}

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

function MetricCard({ title, value, icon, iconBg, iconColor }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${iconBg}`}>
          <div className={iconColor}>{icon}</div>
        </div>
      </div>
    </div>
  );
}

function MetricsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white rounded-lg border p-6 shadow-sm animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MetricsCards({ metrics, loading }: MetricsCardsProps) {
  if (loading || !metrics) {
    return <MetricsCardsSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Total Clients"
        value={metrics.totalClients}
        icon={<Users className="h-5 w-5" />}
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
      />
      <MetricCard
        title="Active Employees"
        value={metrics.totalEmployees}
        icon={<UserCheck className="h-5 w-5" />}
        iconBg="bg-green-100"
        iconColor="text-green-600"
      />
      <MetricCard
        title="Pending Approvals"
        value={metrics.pendingApprovals}
        icon={<Clock className="h-5 w-5" />}
        iconBg="bg-amber-100"
        iconColor="text-amber-600"
      />
      <MetricCard
        title="Recent Submissions"
        value={metrics.recentSubmissions}
        icon={<FileText className="h-5 w-5" />}
        iconBg="bg-purple-100"
        iconColor="text-purple-600"
      />
    </div>
  );
}
