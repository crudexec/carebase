"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Pill,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ClipboardList,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";

interface EmarStats {
  totalMedications: number;
  activeMedications: number;
  controlledSubstances: number;
  pendingDoses: number;
  completedToday: number;
  missedToday: number;
  pendingRefills: number;
}

export default function EmarDashboardPage() {
  const [stats, setStats] = useState<EmarStats>({
    totalMedications: 0,
    activeMedications: 0,
    controlledSubstances: 0,
    pendingDoses: 0,
    completedToday: 0,
    missedToday: 0,
    pendingRefills: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch medication counts and refill stats
        const [activeRes, controlledRes, refillsRes] = await Promise.all([
          fetch("/api/medications?status=ACTIVE&limit=1"),
          fetch("/api/medications?controlledOnly=true&limit=1"),
          fetch("/api/refills?status=PENDING&limit=1"),
        ]);

        const activeData = activeRes.ok ? await activeRes.json() : { pagination: { total: 0 } };
        const controlledData = controlledRes.ok ? await controlledRes.json() : { pagination: { total: 0 } };
        const refillsData = refillsRes.ok ? await refillsRes.json() : { pagination: { total: 0 } };

        setStats({
          totalMedications: activeData.pagination?.total || 0,
          activeMedications: activeData.pagination?.total || 0,
          controlledSubstances: controlledData.pagination?.total || 0,
          pendingDoses: 0, // Will be implemented with med-pass API
          completedToday: 0,
          missedToday: 0,
          pendingRefills: refillsData.pagination?.total || 0,
        });
      } catch (error) {
        console.error("Error fetching eMAR stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const quickLinks = [
    {
      title: "Med Pass",
      description: "Administer scheduled medications",
      href: "/emar/med-pass",
      icon: Clock,
      color: "bg-blue-500",
    },
    {
      title: "Medications",
      description: "Manage client medications",
      href: "/emar/medications",
      icon: Pill,
      color: "bg-green-500",
    },
    {
      title: "Narcotic Counts",
      description: "Perform shift narcotic counts",
      href: "/emar/narcotics",
      icon: AlertTriangle,
      color: "bg-orange-500",
    },
    {
      title: "Refill Requests",
      description: "Manage medication refills",
      href: "/emar/refills",
      icon: RefreshCw,
      color: "bg-purple-500",
    },
    {
      title: "MAR Reports",
      description: "View and export MAR reports",
      href: "/emar/reports",
      icon: ClipboardList,
      color: "bg-indigo-500",
    },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "eMAR" },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Pill className="h-6 w-6" />
            eMAR Dashboard
          </h1>
          <p className="text-muted-foreground">
            Electronic Medication Administration Record
          </p>
        </div>
        <Link href="/emar/med-pass">
          <Button className="min-h-[44px] px-6">
            <Clock className="h-4 w-4 mr-2" />
            Start Med Pass
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/emar/medications?status=ACTIVE">
          <Card className="hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98] touch-manipulation h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Active Medications
              </CardTitle>
              <Pill className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : stats.activeMedications}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all clients
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/emar/medications?controlledOnly=true">
          <Card className="hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98] touch-manipulation h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Controlled Substances
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : stats.controlledSubstances}
              </div>
              <p className="text-xs text-muted-foreground">
                Requires witness
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/emar/med-pass?status=completed">
          <Card className="hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98] touch-manipulation h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Today
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : stats.completedToday}
              </div>
              <p className="text-xs text-muted-foreground">
                Doses administered
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/emar/med-pass">
          <Card className="hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98] touch-manipulation h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Doses
              </CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : stats.pendingDoses}
              </div>
              <p className="text-xs text-muted-foreground">
                Due today
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Alert Cards */}
      {stats.missedToday > 0 && (
        <Link href="/emar/med-pass?status=missed">
          <Card className="border-red-200 bg-red-50 hover:shadow-md transition-shadow cursor-pointer active:scale-[0.99] touch-manipulation">
            <CardContent className="flex items-center justify-between py-4 min-h-[72px]">
              <div className="flex items-center gap-3">
                <XCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium text-red-900">
                    {stats.missedToday} Missed Doses Today
                  </p>
                  <p className="text-sm text-red-700">
                    Review and document missed medications
                  </p>
                </div>
              </div>
              <Button variant="error" className="min-h-[44px] px-4">
                Review
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </Link>
      )}

      {stats.pendingRefills > 0 && (
        <Link href="/emar/refills?status=PENDING">
          <Card className="border-purple-200 bg-purple-50 hover:shadow-md transition-shadow cursor-pointer active:scale-[0.99] touch-manipulation">
            <CardContent className="flex items-center justify-between py-4 min-h-[72px]">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium text-purple-900">
                    {stats.pendingRefills} Pending Refill Request{stats.pendingRefills === 1 ? "" : "s"}
                  </p>
                  <p className="text-sm text-purple-700">
                    Review and process refill requests
                  </p>
                </div>
              </div>
              <Button variant="secondary" className="min-h-[44px] px-4">
                Review
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full active:scale-[0.98] touch-manipulation">
                <CardContent className="flex items-start gap-4 pt-6 min-h-[88px]">
                  <div
                    className={`p-3 rounded-lg ${link.color} text-white`}
                  >
                    <link.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{link.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {link.description}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent medication activity</p>
            <p className="text-sm">
              Administered medications will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
