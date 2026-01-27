"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, CheckCheck, MessageSquare, AlertTriangle, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

const NOTIFICATION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  COMMENT_MENTION: MessageSquare,
  INCIDENT: AlertTriangle,
  REMINDER: Calendar,
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = filter === "unread" ? "?unread=true&limit=50" : "?limit=50";
      const response = await fetch(`/api/notifications${params}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: [notificationId] }),
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const getIcon = (type: string) => {
    return NOTIFICATION_ICONS[type] || Bell;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Group notifications by date
  const groupedNotifications = notifications.reduce((groups, notification) => {
    const date = format(new Date(notification.createdAt), "yyyy-MM-dd");
    const label = format(new Date(notification.createdAt), "EEEE, MMMM d, yyyy");
    if (!groups[date]) {
      groups[date] = { label, notifications: [] };
    }
    groups[date].notifications.push(notification);
    return groups;
  }, {} as Record<string, { label: string; notifications: Notification[] }>);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Notifications</h1>
            <p className="text-sm text-foreground-secondary">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                : "All caught up!"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={filter === "all" ? "default" : "secondary"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "secondary"}
          size="sm"
          onClick={() => setFilter("unread")}
        >
          Unread
        </Button>
      </div>

      {/* Notifications list */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-foreground-secondary">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Bell className="w-12 h-12 mx-auto text-foreground-secondary/30 mb-3" />
            <p className="text-foreground-secondary">
              {filter === "unread"
                ? "No unread notifications"
                : "No notifications yet"}
            </p>
          </div>
        ) : (
          Object.entries(groupedNotifications).map(([date, group]) => (
            <div key={date}>
              <div className="px-4 py-2 bg-background-secondary border-b border-border">
                <p className="text-xs font-medium text-foreground-secondary">
                  {group.label}
                </p>
              </div>
              <ul className="divide-y divide-border">
                {group.notifications.map((notification) => {
                  const Icon = getIcon(notification.type);
                  return (
                    <li key={notification.id}>
                      <button
                        onClick={() => handleNotificationClick(notification)}
                        className={cn(
                          "w-full px-4 py-4 text-left hover:bg-background-secondary transition-colors flex gap-4",
                          !notification.read && "bg-primary/5"
                        )}
                      >
                        <div
                          className={cn(
                            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                            notification.type === "COMMENT_MENTION"
                              ? "bg-blue-100 text-blue-600"
                              : notification.type === "INCIDENT"
                              ? "bg-red-100 text-red-600"
                              : "bg-gray-100 text-gray-600"
                          )}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
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
                              <p className="text-sm text-foreground-secondary mt-0.5">
                                {notification.message}
                              </p>
                              <p className="text-xs text-foreground-secondary/70 mt-1">
                                {formatDistanceToNow(new Date(notification.createdAt), {
                                  addSuffix: true,
                                })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {!notification.read && (
                                <span className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-primary" />
                              )}
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className="p-1.5 h-auto"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
