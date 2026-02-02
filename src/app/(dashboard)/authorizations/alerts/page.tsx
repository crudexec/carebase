"use client";

import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Breadcrumb,
} from "@/components/ui";
import {
  AlertTriangle,
  AlertCircle,
  Clock,
  BarChart3,
  CheckCircle,
} from "lucide-react";

interface Alert {
  id: string;
  type: string;
  severity: string;
  message: string;
  createdAt: string;
  authorization: {
    id: string;
    authorizationNumber: string;
    serviceCode: string;
    client: {
      id: string;
      firstName: string;
      lastName: string;
    };
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

const SEVERITY_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  CRITICAL: { label: "Critical", color: "bg-error/10 text-error border-error/30", icon: AlertCircle },
  HIGH: { label: "High", color: "bg-warning/10 text-warning border-warning/30", icon: AlertTriangle },
  WARNING: { label: "Warning", color: "bg-secondary/10 text-secondary border-secondary/30", icon: Clock },
};

const TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType }> = {
  EXPIRING_SOON: { label: "Expiring Soon", icon: Clock },
  EXPIRING_CRITICAL: { label: "Expiring Critical", icon: AlertCircle },
  EXPIRED: { label: "Expired", icon: AlertCircle },
  UNITS_LOW: { label: "Low Units", icon: BarChart3 },
  UNITS_EXHAUSTED: { label: "Units Exhausted", icon: AlertCircle },
};

export default function AuthorizationAlertsPage() {
  const [alerts, setAlerts] = React.useState<Alert[]>([]);
  const [summary, setSummary] = React.useState<AlertSummary | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [acknowledgedIds, setAcknowledgedIds] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/authorizations/alerts");
      const data = await response.json();

      if (response.ok) {
        setAlerts(data.alerts || []);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch("/api/authorizations/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId }),
      });

      if (response.ok) {
        setAcknowledgedIds((prev) => new Set([...prev, alertId]));
      }
    } catch (error) {
      console.error("Failed to acknowledge alert:", error);
    }
  };

  const activeAlerts = alerts.filter((alert) => !acknowledgedIds.has(alert.id));

  // Group alerts by severity
  const criticalAlerts = activeAlerts.filter((a) => a.severity === "CRITICAL");
  const highAlerts = activeAlerts.filter((a) => a.severity === "HIGH");
  const warningAlerts = activeAlerts.filter((a) => a.severity === "WARNING");

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Authorizations", href: "/authorizations" },
          { label: "Alerts" },
        ]}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Authorization Alerts</h1>
        <p className="text-foreground-secondary">
          Monitor expiring authorizations and unit limits
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-error/30 bg-error/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="h-8 w-8 text-error" />
                <div>
                  <p className="text-3xl font-bold text-error">{summary.critical}</p>
                  <p className="text-sm text-foreground-secondary">Critical</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <AlertTriangle className="h-8 w-8 text-warning" />
                <div>
                  <p className="text-3xl font-bold text-warning">{summary.high}</p>
                  <p className="text-sm text-foreground-secondary">High Priority</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Clock className="h-8 w-8 text-secondary" />
                <div>
                  <p className="text-3xl font-bold">{summary.expiring}</p>
                  <p className="text-sm text-foreground-secondary">Expiring Soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <BarChart3 className="h-8 w-8 text-secondary" />
                <div>
                  <p className="text-3xl font-bold">{summary.lowUnits}</p>
                  <p className="text-sm text-foreground-secondary">Low Units</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : activeAlerts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <CheckCircle className="mx-auto h-12 w-12 text-success" />
              <h3 className="mt-4 text-lg font-medium">No Active Alerts</h3>
              <p className="mt-2 text-sm text-foreground-secondary">
                All authorizations are within normal parameters.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Critical Alerts */}
          {criticalAlerts.length > 0 && (
            <Card className="border-error/30">
              <CardHeader className="bg-error/5">
                <CardTitle className="flex items-center gap-2 text-error">
                  <AlertCircle className="h-5 w-5" />
                  Critical Alerts ({criticalAlerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {criticalAlerts.map((alert) => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      onAcknowledge={acknowledgeAlert}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* High Priority Alerts */}
          {highAlerts.length > 0 && (
            <Card className="border-warning/30">
              <CardHeader className="bg-warning/5">
                <CardTitle className="flex items-center gap-2 text-warning">
                  <AlertTriangle className="h-5 w-5" />
                  High Priority Alerts ({highAlerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {highAlerts.map((alert) => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      onAcknowledge={acknowledgeAlert}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warning Alerts */}
          {warningAlerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-secondary" />
                  Warnings ({warningAlerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {warningAlerts.map((alert) => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      onAcknowledge={acknowledgeAlert}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function AlertCard({
  alert,
  onAcknowledge,
}: {
  alert: Alert;
  onAcknowledge: (id: string) => void;
}) {
  const severityConfig = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.WARNING;
  const typeConfig = TYPE_CONFIG[alert.type] || { label: alert.type, icon: AlertTriangle };
  const TypeIcon = typeConfig.icon;

  return (
    <div className={`p-4 rounded-lg border ${severityConfig.color}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <TypeIcon className="h-5 w-5 mt-0.5" />
          <div>
            <div className="flex items-center gap-2">
              <Link
                href={`/authorizations/${alert.authorization.id}`}
                className="font-medium hover:underline"
              >
                {alert.authorization.client.firstName} {alert.authorization.client.lastName}
              </Link>
              <Badge>{typeConfig.label}</Badge>
            </div>
            <p className="text-sm mt-1">{alert.message}</p>
            <p className="text-xs text-foreground-secondary mt-1">
              Auth #: {alert.authorization.authorizationNumber} • {alert.authorization.serviceCode}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/authorizations/${alert.authorization.id}`}>
            <Button variant="secondary" size="sm">
              View
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAcknowledge(alert.id)}
          >
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}
