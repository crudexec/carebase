"use client";

import {
  Users,
  Calendar,
  FileText,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HealthcareStats {
  totalPatients: number;
  activePatients: number;
  pendingVisits: number;
  completedVisits: number;
  pendingAssessments: number;
  completedAssessments: number;
  overdueVisits: number;
  qaReviews: number;
}

export function HealthcareStats() {
  const [stats, setStats] = useState<HealthcareStats>({
    totalPatients: 0,
    activePatients: 0,
    pendingVisits: 0,
    completedVisits: 0,
    pendingAssessments: 0,
    completedAssessments: 0,
    overdueVisits: 0,
    qaReviews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now - replace with actual API calls
    // TODO: Implement actual API calls to gather statistics
    setTimeout(() => {
      setStats({
        totalPatients: 247,
        activePatients: 189,
        pendingVisits: 23,
        completedVisits: 156,
        pendingAssessments: 12,
        completedAssessments: 89,
        overdueVisits: 5,
        qaReviews: 8,
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 shadow-lg"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20 animate-pulse" />
              <div className="h-5 w-5 bg-gradient-to-r from-blue-200 to-blue-300 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16 mb-2 animate-pulse" />
              <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-24 animate-pulse" />
            </CardContent>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/20 animate-pulse" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Link href="/patient">
        <Card className="group relative overflow-hidden cursor-pointer bg-gradient-to-br from-blue-50 via-white to-blue-50 hover:shadow-xl hover:scale-105 transition-all duration-300 border-0 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 group-hover:text-blue-700 transition-colors">
              Active Patients
            </CardTitle>
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md group-hover:shadow-lg transition-shadow">
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-1">
              {stats.activePatients}
            </div>
            <p className="text-xs text-gray-600">
              {stats.totalPatients} total patients
            </p>
          </CardContent>
          <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-full blur-xl" />
        </Card>
      </Link>

      <Link href="/schedule">
        <Card className="group relative overflow-hidden cursor-pointer bg-gradient-to-br from-green-50 via-white to-green-50 hover:shadow-xl hover:scale-105 transition-all duration-300 border-0 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 group-hover:text-green-700 transition-colors">
              Today's Visits
            </CardTitle>
            <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md group-hover:shadow-lg transition-shadow">
              <Calendar className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-1">
              {stats.pendingVisits}
            </div>
            <p className="text-xs text-gray-600">
              {stats.completedVisits} completed this week
            </p>
          </CardContent>
          <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-full blur-xl" />
        </Card>
      </Link>

      <Link href="/clinical/assessment">
        <Card className="group relative overflow-hidden cursor-pointer bg-gradient-to-br from-orange-50 via-white to-orange-50 hover:shadow-xl hover:scale-105 transition-all duration-300 border-0 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 group-hover:text-orange-700 transition-colors">
              Pending Assessments
            </CardTitle>
            <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md group-hover:shadow-lg transition-shadow">
              <FileText className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent mb-1">
              {stats.pendingAssessments}
            </div>
            <p className="text-xs text-gray-600">
              {stats.completedAssessments} completed this month
            </p>
          </CardContent>
          <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-gradient-to-br from-orange-400/20 to-orange-600/20 rounded-full blur-xl" />
        </Card>
      </Link>

      <Link href="/qamanager">
        <Card className="group relative overflow-hidden cursor-pointer bg-gradient-to-br from-purple-50 via-white to-purple-50 hover:shadow-xl hover:scale-105 transition-all duration-300 border-0 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 group-hover:text-purple-700 transition-colors">
              QA Reviews
            </CardTitle>
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md group-hover:shadow-lg transition-shadow">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent mb-1">
              {stats.qaReviews}
            </div>
            <p className="text-xs text-gray-600">Pending quality reviews</p>
          </CardContent>
          <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-full blur-xl" />
        </Card>
      </Link>

      {stats.overdueVisits > 0 && (
        <Card className="group relative overflow-hidden md:col-span-2 lg:col-span-1 bg-gradient-to-br from-red-50 via-white to-red-50 border-red-200 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-red-800">
              Overdue Visits
            </CardTitle>
            <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-md animate-bounce">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-1">
              {stats.overdueVisits}
            </div>
            <p className="text-xs text-red-700 font-medium">
              Require immediate attention
            </p>
          </CardContent>
          <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-gradient-to-br from-red-400/20 to-red-600/20 rounded-full blur-xl" />
        </Card>
      )}
    </div>
  );
}
