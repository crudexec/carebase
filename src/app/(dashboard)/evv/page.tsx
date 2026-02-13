"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  TrendingUp,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface EVVMetrics {
  totalActive: number;
  compliantCount: number;
  outOfRangeCount: number;
  missingLocationCount: number;
  complianceRate: number;
  todayCompletedCount: number;
}

interface ActiveShift {
  id: string;
  client: {
    id: string;
    name: string;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    geofenceRadius: number | null;
  };
  carer: {
    id: string | undefined;
    name: string;
  };
  scheduledStart: string;
  scheduledEnd: string;
  actualStart: string | null;
  checkInLocation: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
    isWithinGeofence: boolean;
    distanceFromClient: number;
  } | null;
  evvStatus: "COMPLIANT" | "OUT_OF_RANGE" | "LOCATION_UNAVAILABLE";
}

interface EVVAlert {
  id: string;
  shiftId: string;
  type: "CHECK_IN_OUT_OF_RANGE" | "CHECK_OUT_OUT_OF_RANGE";
  carerName: string;
  clientName: string;
  distance: number;
  timestamp: string;
}

interface DashboardData {
  activeShifts: ActiveShift[];
  metrics: EVVMetrics;
  alerts: EVVAlert[];
}

export default function EVVDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("/api/evv/dashboard");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      const result = await response.json();
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching EVV dashboard:", err);
      setError("Failed to load EVV dashboard data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLIANT":
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle className="w-3 h-3" />
            Compliant
          </Badge>
        );
      case "OUT_OF_RANGE":
        return (
          <Badge variant="warning" className="gap-1">
            <AlertTriangle className="w-3 h-3" />
            Out of Range
          </Badge>
        );
      default:
        return (
          <Badge variant="default" className="gap-1">
            <MapPin className="w-3 h-3" />
            No Location
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-error mx-auto mb-4" />
        <p className="text-foreground-secondary">{error}</p>
        <Button onClick={fetchData} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">EVV Dashboard</h1>
          <p className="text-foreground-secondary">
            Real-time Electronic Visit Verification monitoring
          </p>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-sm text-foreground-tertiary">
              Last updated: {formatDistanceToNow(lastUpdated, { addSuffix: true })}
            </span>
          )}
          <Button variant="default" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-secondary">Active Shifts</p>
                <p className="text-3xl font-semibold">
                  {data?.metrics.totalActive || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-secondary">Compliance Rate</p>
                <p className="text-3xl font-semibold">
                  {data?.metrics.complianceRate || 0}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-secondary">Compliant Check-ins</p>
                <p className="text-3xl font-semibold text-success">
                  {data?.metrics.compliantCount || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-secondary">Out of Range</p>
                <p className="text-3xl font-semibold text-warning">
                  {data?.metrics.outOfRangeCount || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Shifts List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Active Shifts ({data?.activeShifts.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.activeShifts.length === 0 ? (
              <div className="text-center py-8 text-foreground-secondary">
                No active shifts at the moment
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {data?.activeShifts.map((shift) => (
                  <div
                    key={shift.id}
                    className="flex items-center justify-between p-3 bg-background-secondary rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{shift.carer.name}</p>
                      <p className="text-sm text-foreground-secondary truncate">
                        with {shift.client.name}
                      </p>
                      {shift.checkInLocation && (
                        <p className="text-xs text-foreground-tertiary">
                          {shift.checkInLocation.distanceFromClient}m from client
                        </p>
                      )}
                    </div>
                    <div className="ml-4">{getStatusBadge(shift.evvStatus)}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              EVV Alerts ({data?.alerts.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.alerts.length === 0 ? (
              <div className="text-center py-8 text-foreground-secondary">
                No alerts - all check-ins are compliant
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {data?.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 bg-warning/5 border border-warning/20 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{alert.carerName}</p>
                        <p className="text-sm text-foreground-secondary">
                          {alert.type === "CHECK_IN_OUT_OF_RANGE"
                            ? "Check-in"
                            : "Check-out"}{" "}
                          {alert.distance}m from {alert.clientName}
                        </p>
                      </div>
                      <span className="text-xs text-foreground-tertiary">
                        {formatDistanceToNow(new Date(alert.timestamp), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today's Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-semibold">
                {data?.metrics.todayCompletedCount || 0}
              </p>
              <p className="text-sm text-foreground-secondary">Completed Shifts</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-success">
                {data?.metrics.compliantCount || 0}
              </p>
              <p className="text-sm text-foreground-secondary">Compliant Locations</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-warning">
                {data?.metrics.outOfRangeCount || 0}
              </p>
              <p className="text-sm text-foreground-secondary">Out of Range</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground-tertiary">
                {data?.metrics.missingLocationCount || 0}
              </p>
              <p className="text-sm text-foreground-secondary">Missing Location</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
