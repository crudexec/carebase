"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  AlertTriangle,
  AlertCircle,
  Loader2,
  ChevronRight,
  Calendar,
  Bell,
  CheckCircle,
} from "lucide-react";

interface CredentialAlert {
  id: string;
  alertType: string;
  message: string;
  severity: "INFO" | "WARNING" | "HIGH" | "CRITICAL";
  isRead: boolean;
  credential: {
    id: string;
    expirationDate: string;
    credentialType: {
      name: string;
    };
    caregiverProfile: {
      id: string;
      user: {
        id: string;
        firstName: string;
        lastName: string;
      };
    };
  };
  createdAt: string;
}

interface AlertSummary {
  critical: number;
  high: number;
  warning: number;
  info: number;
  total: number;
  unread: number;
}

export function CredentialAlertsWidget() {
  const [alerts, setAlerts] = useState<CredentialAlert[]>([]);
  const [summary, setSummary] = useState<AlertSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const response = await fetch("/api/credentials/alerts?isDismissed=false&limit=6");
        if (response.ok) {
          const data = await response.json();
          setAlerts(data.alerts || []);
          setSummary(data.summary || null);
        }
      } catch (error) {
        console.error("Failed to fetch credential alerts:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 300000);
    return () => clearInterval(interval);
  }, []);

  const getDaysUntilExpiry = (expirationDate: string) => {
    const now = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryLabel = (expirationDate: string) => {
    const days = getDaysUntilExpiry(expirationDate);
    if (days < 0) return "Expired";
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    if (days <= 7) return `${days}d`;
    if (days <= 30) return `${Math.ceil(days / 7)}w`;
    return `${Math.ceil(days / 30)}mo`;
  };

  // Don't render anything if loading
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border-light bg-background-tertiary p-4">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-foreground-secondary" />
          <span className="text-sm text-foreground-secondary">Loading credential alerts...</span>
        </div>
      </div>
    );
  }

  // Don't render if no alerts
  if (!summary || summary.total === 0) {
    return (
      <div className="rounded-lg border border-success/30 bg-success/5 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-success/10">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">All Credentials Up to Date</p>
              <p className="text-xs text-foreground-secondary">No expiring or expired credentials</p>
            </div>
          </div>
          <Link
            href="/credentials"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            Manage Credentials
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    );
  }

  // Determine panel severity styling
  const hasCritical = summary.critical > 0;
  const hasHigh = summary.high > 0;
  const panelBg = hasCritical ? "bg-error/5 border-error/30" : hasHigh ? "bg-warning/5 border-warning/30" : "bg-amber-50 border-amber-200";
  const iconBg = hasCritical ? "bg-error/10" : hasHigh ? "bg-warning/10" : "bg-amber-100";
  const iconColor = hasCritical ? "text-error" : hasHigh ? "text-warning" : "text-amber-600";
  const PanelIcon = hasCritical ? AlertTriangle : hasHigh ? AlertCircle : Bell;

  return (
    <div className={`rounded-lg border ${panelBg} p-4`}>
      {/* Header Row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${iconBg}`}>
            <PanelIcon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">
                Credential Alerts
              </p>
              <Badge className={hasCritical ? "bg-error/10 text-error" : hasHigh ? "bg-warning/10 text-warning" : "bg-amber-100 text-amber-700"}>
                {summary.total} alert{summary.total !== 1 ? "s" : ""}
              </Badge>
            </div>
            <p className="text-xs text-foreground-secondary mt-0.5">
              {summary.critical > 0 && <span className="text-error font-medium">{summary.critical} expired</span>}
              {summary.critical > 0 && summary.high > 0 && " · "}
              {summary.high > 0 && <span className="text-warning font-medium">{summary.high} expiring soon</span>}
              {(summary.critical > 0 || summary.high > 0) && summary.warning > 0 && " · "}
              {summary.warning > 0 && <span>{summary.warning} warnings</span>}
            </p>
          </div>
        </div>
        <Link
          href="/credentials/alerts"
          className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
        >
          View All
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {alerts.map((alert) => {
          const daysLeft = getDaysUntilExpiry(alert.credential.expirationDate);
          const isExpired = daysLeft < 0;
          const isUrgent = alert.severity === "CRITICAL" || alert.severity === "HIGH";

          const cardBg = isExpired
            ? "bg-error/10 border-error/30 hover:border-error/50"
            : isUrgent
            ? "bg-warning/10 border-warning/30 hover:border-warning/50"
            : "bg-white border-border-light hover:border-primary/50";

          return (
            <Link
              key={alert.id}
              href={`/staff/${alert.credential.caregiverProfile.user.id}?tab=certifications`}
              className={`block p-3 rounded-lg border transition-all ${cardBg}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <Award className={`h-3.5 w-3.5 flex-shrink-0 ${isExpired ? "text-error" : isUrgent ? "text-warning" : "text-foreground-secondary"}`} />
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                    isExpired
                      ? "bg-error/20 text-error"
                      : isUrgent
                      ? "bg-warning/20 text-warning"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {getExpiryLabel(alert.credential.expirationDate)}
                  </span>
                </div>
              </div>
              <p className="text-sm font-medium text-foreground truncate">
                {alert.credential.caregiverProfile.user.firstName} {alert.credential.caregiverProfile.user.lastName}
              </p>
              <p className="text-xs text-foreground-secondary truncate mt-0.5">
                {alert.credential.credentialType.name}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-foreground-tertiary mt-1.5">
                <Calendar className="w-3 h-3" />
                {new Date(alert.credential.expirationDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer Link */}
      {summary.total > alerts.length && (
        <div className="mt-3 pt-3 border-t border-border-light/50">
          <Link
            href="/credentials/alerts"
            className="text-xs text-foreground-secondary hover:text-primary flex items-center justify-center gap-1"
          >
            +{summary.total - alerts.length} more alerts
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
