"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  Loader2,
  ChevronRight,
  XCircle,
  TrendingDown,
} from "lucide-react";

interface AuthorizationAlert {
  id: string;
  authNumber: string;
  serviceType: string;
  status: string;
  usagePercentage: number;
  daysRemaining: number;
  remainingUnits: number;
  authorizedUnits: number;
  unitType: string;
  isExpiringSoon: boolean;
  isExpired: boolean;
  isNearingLimit: boolean;
  client: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface AlertSummary {
  total: number;
  critical: number;
  high: number;
  warning: number;
  expiring: number;
  lowUnits: number;
}

export function AuthorizationAlertsWidget() {
  const [alerts, setAlerts] = useState<AuthorizationAlert[]>([]);
  const [summary, setSummary] = useState<AlertSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        // Fetch authorizations that need attention
        const [authResponse, alertsResponse] = await Promise.all([
          fetch("/api/authorizations?status=ACTIVE&limit=50"),
          fetch("/api/authorizations/alerts"),
        ]);

        if (authResponse.ok) {
          const authData = await authResponse.json();
          // Filter to only show ones needing attention
          const needsAttention = (authData.authorizations || []).filter(
            (auth: AuthorizationAlert) =>
              auth.isExpiringSoon || auth.isExpired || auth.isNearingLimit || auth.status === "EXHAUSTED"
          );
          setAlerts(needsAttention.slice(0, 5));
        }

        if (alertsResponse.ok) {
          const alertsData = await alertsResponse.json();
          setSummary(alertsData.summary);
        }
      } catch (error) {
        console.error("Failed to fetch authorization alerts:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAlerts();
  }, []);

  const getAlertIcon = (auth: AuthorizationAlert) => {
    if (auth.isExpired || auth.status === "EXHAUSTED") {
      return <XCircle className="h-4 w-4 text-error" />;
    }
    if (auth.isNearingLimit && auth.usagePercentage >= 90) {
      return <TrendingDown className="h-4 w-4 text-error" />;
    }
    if (auth.isExpiringSoon || auth.isNearingLimit) {
      return <AlertTriangle className="h-4 w-4 text-warning" />;
    }
    return <Clock className="h-4 w-4 text-foreground-secondary" />;
  };

  const getAlertMessage = (auth: AuthorizationAlert) => {
    if (auth.status === "EXHAUSTED" || auth.remainingUnits <= 0) {
      return "Units exhausted";
    }
    if (auth.isExpired) {
      return "Authorization expired";
    }

    const messages = [];
    if (auth.isNearingLimit) {
      messages.push(`${auth.usagePercentage.toFixed(0)}% used`);
    }
    if (auth.isExpiringSoon) {
      messages.push(`${auth.daysRemaining} days left`);
    }
    return messages.join(" • ") || "Needs attention";
  };

  const getUnitLabel = (unitType: string) => {
    switch (unitType) {
      case "QUARTER_HOURLY":
        return "15-min units";
      case "DAILY":
        return "days";
      default:
        return "hours";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Authorization Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Authorization Alerts
        </CardTitle>
        <Link
          href="/authorizations/alerts"
          className="text-body-sm text-primary hover:underline flex items-center gap-1"
        >
          View All
          <ChevronRight className="h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent>
        {/* Summary Banner */}
        {summary && summary.total > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-warning/10 border border-warning/30">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="font-medium">
                {summary.total} authorization{summary.total !== 1 ? "s" : ""} need attention
              </span>
            </div>
            <div className="mt-1 text-xs text-foreground-secondary">
              {summary.critical > 0 && (
                <span className="text-error">{summary.critical} critical</span>
              )}
              {summary.critical > 0 && summary.high > 0 && " • "}
              {summary.high > 0 && (
                <span className="text-warning">{summary.high} high priority</span>
              )}
              {(summary.critical > 0 || summary.high > 0) && summary.warning > 0 && " • "}
              {summary.warning > 0 && (
                <span>{summary.warning} warnings</span>
              )}
            </div>
          </div>
        )}

        {/* Alerts List */}
        {alerts.length === 0 ? (
          <div className="text-center py-6">
            <ShieldCheck className="h-10 w-10 mx-auto text-success/50 mb-2" />
            <p className="text-body-sm text-foreground-secondary">
              All authorizations are in good standing
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((auth) => (
              <Link
                key={auth.id}
                href={`/authorizations/${auth.id}`}
                className="block"
              >
                <div
                  className={`p-3 rounded-lg border transition-colors hover:border-primary/50 ${
                    auth.isExpired || auth.status === "EXHAUSTED"
                      ? "bg-error/5 border-error/30"
                      : auth.isNearingLimit && auth.usagePercentage >= 90
                      ? "bg-error/5 border-error/30"
                      : "bg-warning/5 border-warning/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      {getAlertIcon(auth)}
                      <div>
                        <p className="text-body-sm font-medium">
                          {auth.client.firstName} {auth.client.lastName}
                        </p>
                        <p className="text-xs text-foreground-secondary">
                          {auth.serviceType} • {auth.authNumber}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={
                        auth.isExpired || auth.status === "EXHAUSTED" || auth.usagePercentage >= 90
                          ? "bg-error/10 text-error"
                          : "bg-warning/10 text-warning"
                      }
                    >
                      {getAlertMessage(auth)}
                    </Badge>
                  </div>

                  {/* Mini progress bar */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[10px] text-foreground-tertiary mb-1">
                      <span>
                        {auth.remainingUnits} {getUnitLabel(auth.unitType)} remaining
                      </span>
                      <span>{auth.usagePercentage.toFixed(0)}% used</span>
                    </div>
                    <div className="h-1.5 bg-background-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          auth.usagePercentage >= 90
                            ? "bg-error"
                            : auth.usagePercentage >= 80
                            ? "bg-warning"
                            : "bg-primary"
                        }`}
                        style={{ width: `${Math.min(auth.usagePercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Quick Link to Create New */}
        {alerts.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border">
            <Link
              href="/authorizations"
              className="text-body-sm text-primary hover:underline flex items-center justify-center gap-1"
            >
              Manage All Authorizations
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
