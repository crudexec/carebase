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
import { CollapsibleWidget } from "./collapsible-widget";

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

  // Loading state
  if (isLoading) {
    return (
      <CollapsibleWidget
        id="credential-alerts"
        title="Credential Alerts"
        icon={<Award className="h-5 w-5" />}
        headerActions={
          <Link
            href="/credentials"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            Manage
            <ChevronRight className="h-3 w-3" />
          </Link>
        }
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-foreground-secondary" />
        </div>
      </CollapsibleWidget>
    );
  }

  // No alerts state
  if (!summary || summary.total === 0) {
    return (
      <CollapsibleWidget
        id="credential-alerts"
        title="Credential Alerts"
        icon={<CheckCircle className="h-5 w-5" />}
        variant="success"
        headerActions={
          <Link
            href="/credentials"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            Manage Credentials
            <ChevronRight className="h-3 w-3" />
          </Link>
        }
      >
        <div className="text-center py-6">
          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-success opacity-50" />
          <p className="text-sm font-medium text-foreground">All Credentials Up to Date</p>
          <p className="text-xs text-foreground-secondary">No expiring or expired credentials</p>
        </div>
      </CollapsibleWidget>
    );
  }

  // Determine severity styling
  const hasCritical = summary.critical > 0;
  const hasHigh = summary.high > 0;
  const PanelIcon = hasCritical ? AlertTriangle : hasHigh ? AlertCircle : Bell;
  const variant = hasCritical ? "error" : hasHigh ? "warning" : "warning";

  const alertBadge = (
    <Badge className={hasCritical ? "bg-error/10 text-error" : hasHigh ? "bg-warning/10 text-warning" : "bg-amber-100 text-amber-700"}>
      {summary.total} alert{summary.total !== 1 ? "s" : ""}
    </Badge>
  );

  const footerContent = summary.total > alerts.length ? (
    <Link
      href="/credentials/alerts"
      className="text-xs text-foreground-secondary hover:text-primary flex items-center justify-center gap-1"
    >
      +{summary.total - alerts.length} more alerts
      <ChevronRight className="h-3 w-3" />
    </Link>
  ) : null;

  return (
    <CollapsibleWidget
      id="credential-alerts"
      title="Credential Alerts"
      icon={<PanelIcon className="h-5 w-5" />}
      badge={alertBadge}
      variant={variant}
      headerActions={
        <Link
          href="/credentials/alerts"
          className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
        >
          View All
          <ChevronRight className="h-3 w-3" />
        </Link>
      }
      footer={footerContent}
    >
      {/* Summary */}
      <div className="px-2 mb-3 text-xs text-foreground-secondary">
        {summary.critical > 0 && <span className="text-error font-medium">{summary.critical} expired</span>}
        {summary.critical > 0 && summary.high > 0 && " · "}
        {summary.high > 0 && <span className="text-warning font-medium">{summary.high} expiring soon</span>}
        {(summary.critical > 0 || summary.high > 0) && summary.warning > 0 && " · "}
        {summary.warning > 0 && <span>{summary.warning} warnings</span>}
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
    </CollapsibleWidget>
  );
}
