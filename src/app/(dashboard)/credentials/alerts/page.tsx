"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Input,
  Select,
  Breadcrumb,
} from "@/components/ui";
import {
  RefreshCw,
  Search,
  AlertTriangle,
  AlertCircle,
  Info,
  Bell,
  Check,
  X,
  ArrowLeft,
  User,
  Award,
  Calendar,
  Eye,
  EyeOff,
  Play,
} from "lucide-react";

interface Alert {
  id: string;
  alertType: string;
  message: string;
  severity: "INFO" | "WARNING" | "HIGH" | "CRITICAL";
  isRead: boolean;
  readAt: string | null;
  isDismissed: boolean;
  dismissedAt: string | null;
  actionTaken: string | null;
  actionTakenAt: string | null;
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
        email: string;
      };
    };
  };
  dismissedBy: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  actionTakenBy: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
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

const SEVERITY_CONFIG: Record<string, { variant: "default" | "success" | "warning" | "error"; label: string; icon: React.ComponentType<{ className?: string }> }> = {
  CRITICAL: { variant: "error", label: "Critical", icon: AlertTriangle },
  HIGH: { variant: "error", label: "High", icon: AlertCircle },
  WARNING: { variant: "warning", label: "Warning", icon: Bell },
  INFO: { variant: "default", label: "Info", icon: Info },
};

export default function CredentialAlertsPage() {
  const router = useRouter();
  const [alerts, setAlerts] = React.useState<Alert[]>([]);
  const [summary, setSummary] = React.useState<AlertSummary | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = React.useState("");
  const [severityFilter, setSeverityFilter] = React.useState<string>("");
  const [readFilter, setReadFilter] = React.useState<string>("");
  const [showDismissed, setShowDismissed] = React.useState(false);

  // Check credentials state
  const [isChecking, setIsChecking] = React.useState(false);
  const [checkResult, setCheckResult] = React.useState<string | null>(null);

  const fetchAlerts = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (severityFilter) params.set("severity", severityFilter);
      if (readFilter) params.set("isRead", readFilter);
      params.set("isDismissed", showDismissed ? "true" : "false");
      params.set("limit", "100");

      const response = await fetch(`/api/credentials/alerts?${params}`);
      if (!response.ok) throw new Error("Failed to fetch alerts");
      const data = await response.json();
      setAlerts(data.alerts);
      setSummary(data.summary);
      setError(null);
    } catch {
      setError("Failed to load credential alerts");
    } finally {
      setIsLoading(false);
    }
  }, [severityFilter, readFilter, showDismissed]);

  React.useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleMarkRead = async (alertId: string, isRead: boolean) => {
    try {
      const response = await fetch(`/api/credentials/alerts/${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead }),
      });

      if (!response.ok) throw new Error("Failed to update alert");
      await fetchAlerts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update alert");
    }
  };

  const handleDismiss = async (alertId: string) => {
    try {
      const response = await fetch(`/api/credentials/alerts/${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDismissed: true }),
      });

      if (!response.ok) throw new Error("Failed to dismiss alert");
      await fetchAlerts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to dismiss alert");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const unreadAlerts = alerts.filter((a) => !a.isRead);
      await Promise.all(
        unreadAlerts.map((alert) =>
          fetch(`/api/credentials/alerts/${alert.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isRead: true }),
          })
        )
      );
      await fetchAlerts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark alerts as read");
    }
  };

  const handleCheckCredentials = async () => {
    setIsChecking(true);
    setCheckResult(null);
    setError(null);

    try {
      const response = await fetch("/api/cron/check-credentials");
      if (!response.ok) {
        throw new Error("Failed to check credentials");
      }
      const data = await response.json();

      // Build result message
      const { processed, alertsCreated, statusUpdates } = data;
      const parts = [];
      if (processed > 0) parts.push(`${processed} credentials checked`);
      if (alertsCreated > 0) parts.push(`${alertsCreated} new alerts created`);
      if (statusUpdates > 0) parts.push(`${statusUpdates} status updates`);

      setCheckResult(parts.length > 0 ? parts.join(", ") : "No updates needed");

      // Refresh alerts list
      await fetchAlerts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check credentials");
    } finally {
      setIsChecking(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  const filteredAlerts = React.useMemo(() => {
    return alerts.filter((alert) => {
      const caregiverName = `${alert.credential.caregiverProfile.user.firstName} ${alert.credential.caregiverProfile.user.lastName}`.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        caregiverName.includes(searchQuery.toLowerCase()) ||
        alert.credential.credentialType.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.message.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [alerts, searchQuery]);

  const breadcrumbItems = [
    { label: "Credentials", href: "/credentials" },
    { label: "Alerts" },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-2 text-foreground">Credential Alerts</h1>
          <p className="text-body-sm text-foreground-secondary mt-1">
            Review and manage credential expiration alerts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.push("/credentials")}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <Button variant="ghost" size="sm" onClick={() => fetchAlerts()}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          {summary && summary.unread > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
              <Check className="w-4 h-4 mr-1" />
              Mark All Read
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleCheckCredentials}
            disabled={isChecking}
          >
            {isChecking ? (
              <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-1" />
            )}
            {isChecking ? "Checking..." : "Check Now"}
          </Button>
        </div>
      </div>

      {/* Check result message */}
      {checkResult && (
        <div className="p-3 rounded-md bg-success/10 border border-success/20 text-body-sm flex items-center justify-between">
          <span className="text-success">{checkResult}</span>
          <button
            onClick={() => setCheckResult(null)}
            className="text-foreground-secondary hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className={summary.critical > 0 ? "border-error" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground-secondary">Critical</p>
                  <p className="text-2xl font-semibold text-error">{summary.critical}</p>
                </div>
                <AlertTriangle className="w-6 h-6 text-error opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className={summary.high > 0 ? "border-warning" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground-secondary">High</p>
                  <p className="text-2xl font-semibold text-warning">{summary.high}</p>
                </div>
                <AlertCircle className="w-6 h-6 text-warning opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground-secondary">Warning</p>
                  <p className="text-2xl font-semibold">{summary.warning}</p>
                </div>
                <Bell className="w-6 h-6 text-foreground-tertiary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground-secondary">Info</p>
                  <p className="text-2xl font-semibold">{summary.info}</p>
                </div>
                <Info className="w-6 h-6 text-foreground-tertiary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground-secondary">Unread</p>
                  <p className="text-2xl font-semibold text-primary">{summary.unread}</p>
                </div>
                <Eye className="w-6 h-6 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-tertiary" />
              <Input
                placeholder="Search by caregiver, credential, or message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full lg:w-40"
            >
              <option value="">All Severity</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="WARNING">Warning</option>
              <option value="INFO">Info</option>
            </Select>
            <Select
              value={readFilter}
              onChange={(e) => setReadFilter(e.target.value)}
              className="w-full lg:w-40"
            >
              <option value="">All Status</option>
              <option value="false">Unread</option>
              <option value="true">Read</option>
            </Select>
            <Button
              variant={showDismissed ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowDismissed(!showDismissed)}
            >
              {showDismissed ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
              {showDismissed ? "Showing Dismissed" : "Show Dismissed"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-md bg-error/20 text-body-sm">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-foreground-secondary hover:text-foreground"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Alerts List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredAlerts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="w-12 h-12 mx-auto text-foreground-tertiary mb-4" />
            <p className="text-foreground-secondary">
              {showDismissed ? "No dismissed alerts found" : "No active alerts"}
            </p>
            {!showDismissed && (
              <p className="text-sm text-foreground-tertiary mt-2">
                All credentials are up to date
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const SeverityIcon = SEVERITY_CONFIG[alert.severity]?.icon || Info;
            const severityConfig = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.INFO;

            return (
              <Card
                key={alert.id}
                className={`transition-all ${
                  !alert.isRead ? "border-l-4 border-l-primary" : ""
                } ${alert.isDismissed ? "opacity-60" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-2 rounded-lg ${
                        alert.severity === "CRITICAL"
                          ? "bg-error/10"
                          : alert.severity === "HIGH"
                          ? "bg-warning/10"
                          : "bg-background-secondary"
                      }`}
                    >
                      <SeverityIcon
                        className={`w-5 h-5 ${
                          alert.severity === "CRITICAL"
                            ? "text-error"
                            : alert.severity === "HIGH"
                            ? "text-warning"
                            : "text-foreground-secondary"
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className={`font-medium ${!alert.isRead ? "text-foreground" : "text-foreground-secondary"}`}>
                            {alert.message}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-foreground-secondary">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {alert.credential.caregiverProfile.user.firstName}{" "}
                              {alert.credential.caregiverProfile.user.lastName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Award className="w-4 h-4" />
                              {alert.credential.credentialType.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Expires {formatDate(alert.credential.expirationDate)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant={severityConfig.variant}>{severityConfig.label}</Badge>
                          <span className="text-xs text-foreground-tertiary">
                            {formatRelativeTime(alert.createdAt)}
                          </span>
                        </div>
                      </div>

                      {!alert.isDismissed && (
                        <div className="flex items-center gap-2 mt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkRead(alert.id, !alert.isRead)}
                          >
                            {alert.isRead ? (
                              <>
                                <EyeOff className="w-4 h-4 mr-1" />
                                Mark Unread
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 mr-1" />
                                Mark Read
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDismiss(alert.id)}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Dismiss
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(`/credentials?search=${encodeURIComponent(
                                `${alert.credential.caregiverProfile.user.firstName} ${alert.credential.caregiverProfile.user.lastName}`
                              )}`)
                            }
                          >
                            View Credential
                          </Button>
                        </div>
                      )}

                      {alert.isDismissed && alert.dismissedBy && (
                        <p className="text-xs text-foreground-tertiary mt-2">
                          Dismissed by {alert.dismissedBy.firstName} {alert.dismissedBy.lastName} on{" "}
                          {formatDate(alert.dismissedAt!)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Results count */}
      {!isLoading && filteredAlerts.length > 0 && (
        <p className="text-sm text-foreground-secondary text-center">
          Showing {filteredAlerts.length} of {alerts.length} alerts
        </p>
      )}
    </div>
  );
}
