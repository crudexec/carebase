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
      <div className="px-3 py-1.5 text-[11px] text-gray-600">
        {summary.critical > 0 && <span className="text-red-700 font-medium">{summary.critical} expired</span>}
        {summary.critical > 0 && summary.high > 0 && " · "}
        {summary.high > 0 && <span className="text-yellow-700 font-medium">{summary.high} expiring soon</span>}
        {(summary.critical > 0 || summary.high > 0) && summary.warning > 0 && " · "}
        {summary.warning > 0 && <span>{summary.warning} warnings</span>}
      </div>

      {/* Excel-style Table */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[1fr_1fr_70px_80px] bg-gray-50 border-b border-gray-200">
          <span className="px-3 py-1 text-[10px] font-semibold text-gray-600">Staff Member</span>
          <span className="px-3 py-1 text-[10px] font-semibold text-gray-600">Credential</span>
          <span className="px-3 py-1 text-[10px] font-semibold text-gray-600 text-center">Status</span>
          <span className="px-3 py-1 text-[10px] font-semibold text-gray-600 text-right">Expires</span>
        </div>

        {/* Table Body */}
        <div>
          {alerts.map((alert, index) => {
            const daysLeft = getDaysUntilExpiry(alert.credential.expirationDate);
            const isExpired = daysLeft < 0;
            const isUrgent = alert.severity === "CRITICAL" || alert.severity === "HIGH";
            const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-50/50";

            return (
              <Link
                key={alert.id}
                href={`/staff/${alert.credential.caregiverProfile.user.id}?tab=certifications`}
                className={`grid grid-cols-[1fr_1fr_70px_80px] items-center border-b border-gray-100 cursor-pointer hover:bg-blue-50 ${rowBg}`}
              >
                <span className="px-3 py-1.5 text-xs font-medium text-gray-900 truncate">
                  {alert.credential.caregiverProfile.user.firstName} {alert.credential.caregiverProfile.user.lastName}
                </span>
                <span className="px-3 py-1.5 text-[11px] text-gray-700 truncate">
                  {alert.credential.credentialType.name}
                </span>
                <span className="px-3 py-1.5 text-center">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    isExpired
                      ? "bg-red-100 text-red-700"
                      : isUrgent
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-orange-100 text-orange-700"
                  }`}>
                    {getExpiryLabel(alert.credential.expirationDate)}
                  </span>
                </span>
                <span className="px-3 py-1.5 text-[10px] text-gray-500 text-right">
                  {new Date(alert.credential.expirationDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </CollapsibleWidget>
  );
}
