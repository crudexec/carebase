"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  TrendingDown,
  Calendar,
  MessageSquare,
  ChevronRight,
  RefreshCw,
  Inbox,
} from "lucide-react";

// Types
interface AuthorizationAlert {
  id: string;
  type: string;
  severity: string;
  message: string;
  authorization: {
    id: string;
    authNumber: string;
    serviceType: string;
    status: string;
    client: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
  createdAt: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

interface AlertsSummary {
  total: number;
  critical: number;
  high: number;
  warning: number;
}

type TabType = "all" | "critical" | "authorizations" | "notifications";

// Severity config
const SEVERITY_CONFIG: Record<string, { color: string; bgColor: string; icon: typeof AlertTriangle }> = {
  CRITICAL: { color: "text-error", bgColor: "bg-error/10", icon: XCircle },
  HIGH: { color: "text-warning", bgColor: "bg-warning/10", icon: AlertTriangle },
  WARNING: { color: "text-amber-500", bgColor: "bg-amber-500/10", icon: Clock },
  INFO: { color: "text-primary", bgColor: "bg-primary/10", icon: Bell },
};

const NOTIFICATION_ICONS: Record<string, typeof Bell> = {
  COMMENT_MENTION: MessageSquare,
  INCIDENT: AlertTriangle,
  REMINDER: Calendar,
  SHIFT_ASSIGNED: Calendar,
  DEFAULT: Bell,
};

interface AlertsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AlertsDrawer({ open, onOpenChange }: AlertsDrawerProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [authAlerts, setAuthAlerts] = useState<AuthorizationAlert[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [summary, setSummary] = useState<AlertsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const [authResponse, notifResponse] = await Promise.all([
        fetch("/api/authorizations/alerts"),
        fetch("/api/notifications?limit=20"),
      ]);

      if (authResponse.ok) {
        const data = await authResponse.json();
        setAuthAlerts(data.alerts || []);
        setSummary(data.summary);
      }

      if (notifResponse.ok) {
        const data = await notifResponse.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, fetchData]);

  // Poll for updates when drawer is open
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => fetchData(true), 60000);
    return () => clearInterval(interval);
  }, [open, fetchData]);

  const dismissNotification = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: [id] }),
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Failed to dismiss notification:", error);
    }
  };

  const dismissAllNotifications = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications([]);
    } catch (error) {
      console.error("Failed to dismiss all:", error);
    }
  };

  const handleAlertClick = (alert: AuthorizationAlert) => {
    onOpenChange(false);
    router.push(`/authorizations/${alert.authorization.id}`);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.link) {
      dismissNotification(notification.id);
      onOpenChange(false);
      router.push(notification.link);
    }
  };

  // Filter items based on active tab
  const filteredAuthAlerts = activeTab === "notifications"
    ? []
    : activeTab === "critical"
    ? authAlerts.filter((a) => a.severity === "CRITICAL" || a.severity === "HIGH")
    : authAlerts;

  const filteredNotifications = activeTab === "authorizations" || activeTab === "critical"
    ? []
    : notifications;

  const totalCount = authAlerts.length + notifications.filter((n) => !n.read).length;
  const criticalCount = (summary?.critical || 0) + (summary?.high || 0);

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: "all", label: "All", count: totalCount },
    { id: "critical", label: "Critical", count: criticalCount },
    { id: "authorizations", label: "Authorizations", count: authAlerts.length },
    { id: "notifications", label: "Notifications", count: notifications.filter((n) => !n.read).length },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-lg">
        <SheetHeader className="pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <SheetTitle>Alerts & Notifications</SheetTitle>
                {summary && totalCount > 0 && (
                  <p className="text-xs text-foreground-secondary mt-0.5">
                    {totalCount} item{totalCount !== 1 ? "s" : ""} need attention
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            </Button>
          </div>
        </SheetHeader>

        {/* Tabs */}
        <div className="px-4 pt-4 pb-2 border-b border-border">
          <div className="flex gap-1 p-1 bg-background-secondary rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                  activeTab === tab.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-foreground-secondary hover:text-foreground"
                )}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={cn(
                      "ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full",
                      activeTab === tab.id
                        ? tab.id === "critical"
                          ? "bg-error/10 text-error"
                          : "bg-primary/10 text-primary"
                        : "bg-foreground/10"
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <SheetBody className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="w-6 h-6 animate-spin text-foreground-secondary" />
            </div>
          ) : filteredAuthAlerts.length === 0 && filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <p className="text-base font-medium text-foreground">All clear!</p>
              <p className="text-sm text-foreground-secondary mt-1 text-center">
                {activeTab === "all"
                  ? "No alerts or notifications at this time"
                  : `No ${activeTab} items to show`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {/* Critical Alerts Section */}
              {filteredAuthAlerts.filter((a) => a.severity === "CRITICAL").length > 0 && (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldAlert className="w-4 h-4 text-error" />
                    <span className="text-xs font-semibold text-error uppercase tracking-wide">
                      Critical
                    </span>
                  </div>
                  <div className="space-y-2">
                    {filteredAuthAlerts
                      .filter((a) => a.severity === "CRITICAL")
                      .map((alert) => (
                        <AlertItem
                          key={alert.id}
                          alert={alert}
                          onClick={() => handleAlertClick(alert)}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* High Priority Alerts Section */}
              {filteredAuthAlerts.filter((a) => a.severity === "HIGH").length > 0 && (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    <span className="text-xs font-semibold text-warning uppercase tracking-wide">
                      High Priority
                    </span>
                  </div>
                  <div className="space-y-2">
                    {filteredAuthAlerts
                      .filter((a) => a.severity === "HIGH")
                      .map((alert) => (
                        <AlertItem
                          key={alert.id}
                          alert={alert}
                          onClick={() => handleAlertClick(alert)}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* Warning Alerts Section */}
              {filteredAuthAlerts.filter((a) => a.severity === "WARNING").length > 0 && (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-semibold text-amber-500 uppercase tracking-wide">
                      Warnings
                    </span>
                  </div>
                  <div className="space-y-2">
                    {filteredAuthAlerts
                      .filter((a) => a.severity === "WARNING")
                      .map((alert) => (
                        <AlertItem
                          key={alert.id}
                          alert={alert}
                          onClick={() => handleAlertClick(alert)}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* Notifications Section */}
              {filteredNotifications.length > 0 && (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Inbox className="w-4 h-4 text-primary" />
                      <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                        Notifications
                      </span>
                    </div>
                    {filteredNotifications.filter((n) => !n.read).length > 0 && (
                      <button
                        onClick={dismissAllNotifications}
                        className="text-xs text-foreground-secondary hover:text-foreground"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {filteredNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onClick={() => handleNotificationClick(notification)}
                        onDismiss={() => dismissNotification(notification.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetBody>

        {/* Footer */}
        {(filteredAuthAlerts.length > 0 || filteredNotifications.length > 0) && (
          <div className="p-4 border-t border-border bg-background-secondary">
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => {
                  onOpenChange(false);
                  router.push("/authorizations");
                }}
              >
                <ShieldAlert className="w-4 h-4 mr-2" />
                Manage Authorizations
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => {
                  onOpenChange(false);
                  router.push("/notifications");
                }}
              >
                <Bell className="w-4 h-4 mr-2" />
                All Notifications
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// Alert Item Component
function AlertItem({
  alert,
  onClick,
}: {
  alert: AuthorizationAlert;
  onClick: () => void;
}) {
  const config = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.INFO;

  const renderAlertIcon = () => {
    const iconClass = cn("w-4 h-4", config.color);
    if (alert.type.includes("EXPIR")) return <Clock className={iconClass} />;
    if (alert.type.includes("EXHAUST")) return <XCircle className={iconClass} />;
    if (alert.type.includes("UNITS")) return <TrendingDown className={iconClass} />;
    return <AlertTriangle className={iconClass} />;
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-3 rounded-lg border text-left transition-all",
        "hover:shadow-md hover:border-primary/30",
        config.bgColor,
        "border-transparent"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("p-1.5 rounded-md", config.bgColor)}>
          {renderAlertIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground truncate">
              {alert.authorization.client.firstName} {alert.authorization.client.lastName}
            </p>
            <Badge variant="default" className="text-[10px] px-1.5 py-0">
              {alert.authorization.serviceType}
            </Badge>
          </div>
          <p className={cn("text-xs mt-0.5", config.color)}>{alert.message}</p>
          <p className="text-[10px] text-foreground-tertiary mt-1">
            Auth #{alert.authorization.authNumber}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-foreground-secondary flex-shrink-0" />
      </div>
    </button>
  );
}

// Notification Item Component
function NotificationItem({
  notification,
  onClick,
  onDismiss,
}: {
  notification: Notification;
  onClick: () => void;
  onDismiss: () => void;
}) {
  const Icon = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.DEFAULT;

  return (
    <div
      className={cn(
        "p-3 rounded-lg border transition-all",
        notification.read
          ? "bg-background border-border"
          : "bg-primary/5 border-primary/20"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "p-1.5 rounded-md",
            notification.read ? "bg-foreground/5" : "bg-primary/10"
          )}
        >
          <Icon
            className={cn(
              "w-4 h-4",
              notification.read ? "text-foreground-secondary" : "text-primary"
            )}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm",
              notification.read
                ? "text-foreground-secondary"
                : "text-foreground font-medium"
            )}
          >
            {notification.title}
          </p>
          <p className="text-xs text-foreground-secondary mt-0.5 line-clamp-2">
            {notification.message}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] text-foreground-tertiary">
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
              })}
            </span>
            {notification.link && (
              <button
                onClick={onClick}
                className="text-[10px] text-primary hover:underline font-medium"
              >
                View details
              </button>
            )}
            {!notification.read && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss();
                }}
                className="text-[10px] text-foreground-secondary hover:text-foreground"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Bell Icon Trigger Component (for use in sidebar/header)
export function AlertsBellTrigger({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  const [count, setCount] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [authResponse, notifResponse] = await Promise.all([
          fetch("/api/authorizations/alerts"),
          fetch("/api/notifications?limit=50"),
        ]);

        let total = 0;
        let critical = 0;

        if (authResponse.ok) {
          const data = await authResponse.json();
          total += data.alerts?.length || 0;
          critical += (data.summary?.critical || 0) + (data.summary?.high || 0);
        }

        if (notifResponse.ok) {
          const data = await notifResponse.json();
          total += data.notifications?.filter((n: Notification) => !n.read).length || 0;
        }

        setCount(total);
        setCriticalCount(critical);
      } catch (error) {
        console.error("Failed to fetch alert counts:", error);
      }
    }

    fetchCounts();
    const interval = setInterval(fetchCounts, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative p-2 rounded-lg hover:bg-background-secondary transition-colors",
        className
      )}
      aria-label={`Alerts and notifications${count > 0 ? ` (${count} unread)` : ""}`}
    >
      <Bell className="w-5 h-5 text-foreground-secondary" />
      {count > 0 && (
        <span
          className={cn(
            "absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center",
            "text-[10px] font-bold rounded-full px-1",
            criticalCount > 0
              ? "bg-error text-white"
              : "bg-primary text-white"
          )}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
