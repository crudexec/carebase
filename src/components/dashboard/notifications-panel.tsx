"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CheckCheck,
  MessageSquare,
  AlertTriangle,
  Calendar,
  ExternalLink,
  X,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

const NOTIFICATION_CONFIG: Record<string, {
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  textColor: string;
  actionLabel: string;
}> = {
  COMMENT_MENTION: {
    icon: MessageSquare,
    bgColor: "bg-blue-100",
    textColor: "text-blue-600",
    actionLabel: "View Comment",
  },
  INCIDENT: {
    icon: AlertTriangle,
    bgColor: "bg-red-100",
    textColor: "text-red-600",
    actionLabel: "Review Incident",
  },
  REMINDER: {
    icon: Calendar,
    bgColor: "bg-amber-100",
    textColor: "text-amber-600",
    actionLabel: "View Details",
  },
  SHIFT_ASSIGNED: {
    icon: Calendar,
    bgColor: "bg-green-100",
    textColor: "text-green-600",
    actionLabel: "View Shift",
  },
  DEFAULT: {
    icon: Bell,
    bgColor: "bg-gray-100",
    textColor: "text-gray-600",
    actionLabel: "View",
  },
};

export function NotificationsPanel() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await fetch("/api/notifications?limit=5");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll for new notifications every 60 seconds
    const interval = setInterval(() => fetchNotifications(true), 60000);
    return () => clearInterval(interval);
  }, []);

  const acknowledgeNotification = async (notificationId: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: [notificationId] }),
      });

      setNotifications((prev) =>
        prev.filter((n) => n.id !== notificationId)
      );
    } catch (error) {
      console.error("Failed to acknowledge notification:", error);
    }
  };

  const acknowledgeAll = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });

      setNotifications([]);
    } catch (error) {
      console.error("Failed to acknowledge all notifications:", error);
    }
  };

  const handleAction = (notification: Notification) => {
    if (notification.link) {
      acknowledgeNotification(notification.id);
      router.push(notification.link);
    }
  };

  const getConfig = (type: string) => {
    return NOTIFICATION_CONFIG[type] || NOTIFICATION_CONFIG.DEFAULT;
  };

  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Alerts & Notifications</CardTitle>
            {unreadNotifications.length > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                {unreadNotifications.length} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchNotifications(true)}
              disabled={refreshing}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            </Button>
            {unreadNotifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={acknowledgeAll}
                className="h-8 text-xs"
              >
                <CheckCheck className="w-3.5 h-3.5 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="py-8 text-center text-sm text-foreground-secondary">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-3">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-foreground">All caught up!</p>
            <p className="text-xs text-foreground-secondary mt-1">
              No pending notifications
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const config = getConfig(notification.type);
              const Icon = config.icon;

              return (
                <div
                  key={notification.id}
                  className={cn(
                    "relative p-3 rounded-lg border transition-colors",
                    notification.read
                      ? "bg-background border-border"
                      : "bg-primary/5 border-primary/20"
                  )}
                >
                  {/* Dismiss button */}
                  <button
                    onClick={() => acknowledgeNotification(notification.id)}
                    className="absolute top-2 right-2 p-1 rounded hover:bg-background-secondary transition-colors"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5 text-foreground-secondary" />
                  </button>

                  <div className="flex gap-3 pr-6">
                    {/* Icon */}
                    <div className={cn(
                      "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center",
                      config.bgColor
                    )}>
                      <Icon className={cn("w-4 h-4", config.textColor)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm leading-tight",
                        notification.read ? "text-foreground-secondary" : "text-foreground font-medium"
                      )}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-foreground-secondary mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>

                      {/* Actions row */}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-foreground-secondary/70">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </span>

                        <div className="flex items-center gap-2">
                          {notification.link && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleAction(notification)}
                              className="h-7 text-xs px-2"
                            >
                              {config.actionLabel}
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </Button>
                          )}
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => acknowledgeNotification(notification.id)}
                              className="h-7 text-xs px-2"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Acknowledge
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* View all link */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/notifications")}
              className="w-full text-xs text-foreground-secondary hover:text-foreground"
            >
              View all notifications
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
