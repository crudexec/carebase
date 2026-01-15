"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ShiftData {
  id: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: string;
  carer: {
    id: string;
    firstName: string;
    lastName: string;
  };
  client: {
    id: string;
    firstName: string;
    lastName: string;
    address: string | null;
  };
}

export function UpcomingShiftsWidget() {
  const [todayShifts, setTodayShifts] = useState<ShiftData[]>([]);
  const [upcomingShifts, setUpcomingShifts] = useState<ShiftData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchShifts() {
      try {
        const response = await fetch("/api/scheduling?limit=10");
        if (response.ok) {
          const data = await response.json();
          const now = new Date();
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          // Filter and sort all relevant shifts
          const allShifts = data.shifts
            .filter((s: ShiftData) => new Date(s.scheduledStart) >= today || s.status === "IN_PROGRESS")
            .sort((a: ShiftData, b: ShiftData) =>
              new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime()
            );

          // Split into today's shifts and upcoming shifts
          const todaysList = allShifts.filter((s: ShiftData) => {
            const shiftDate = new Date(s.scheduledStart);
            return shiftDate >= today && shiftDate < tomorrow;
          });

          const upcomingList = allShifts.filter((s: ShiftData) => {
            const shiftDate = new Date(s.scheduledStart);
            return shiftDate >= tomorrow;
          }).slice(0, 5);

          setTodayShifts(todaysList);
          setUpcomingShifts(upcomingList);
        }
      } catch {
        // Silently fail
      } finally {
        setIsLoading(false);
      }
    }
    fetchShifts();
  }, []);

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (isToday) return `Today, ${timeStr}`;
    if (isTomorrow) return `Tomorrow, ${timeStr}`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; className: string }> = {
      SCHEDULED: { label: "Scheduled", className: "bg-blue-100 text-blue-800" },
      IN_PROGRESS: { label: "In Progress", className: "bg-yellow-100 text-yellow-800" },
      COMPLETED: { label: "Completed", className: "bg-green-100 text-green-800" },
      CANCELLED: { label: "Cancelled", className: "bg-gray-100 text-gray-800" },
    };
    return configs[status] || configs.SCHEDULED;
  };

  const renderShiftCard = (shift: ShiftData) => {
    const statusConfig = getStatusConfig(shift.status);
    return (
      <div
        key={shift.id}
        className="p-3 rounded-lg border border-border bg-background-secondary/50"
      >
        <div className="flex items-start justify-between mb-1.5">
          <p className="font-medium text-sm text-foreground">
            {shift.client.firstName} {shift.client.lastName}
          </p>
          <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusConfig.className)}>
            {statusConfig.label}
          </span>
        </div>

        <div className="space-y-1 text-xs text-foreground-secondary">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-foreground-tertiary" />
            {formatDateTime(shift.scheduledStart)}
          </div>
          <div className="flex items-center gap-1.5">
            <User className="w-3 h-3 text-foreground-tertiary" />
            {shift.carer.firstName} {shift.carer.lastName}
          </div>
          {shift.client.address && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-foreground-tertiary" />
              <span className="truncate">{shift.client.address}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Shifts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasNoShifts = todayShifts.length === 0 && upcomingShifts.length === 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Shifts
          </CardTitle>
          <Link
            href="/scheduling"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            View All <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {hasNoShifts ? (
          <div className="text-center py-6">
            <Calendar className="w-10 h-10 mx-auto text-foreground-tertiary mb-2" />
            <p className="text-sm text-foreground-secondary">No shifts scheduled</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Today's Shifts Section */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Today&apos;s Shifts</h3>
              {todayShifts.length === 0 ? (
                <p className="text-xs text-foreground-secondary py-2">No shifts scheduled for today</p>
              ) : (
                <div className="space-y-2">
                  {todayShifts.map(renderShiftCard)}
                </div>
              )}
            </div>

            {/* Upcoming Shifts Section */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Upcoming Shifts</h3>
              {upcomingShifts.length === 0 ? (
                <p className="text-xs text-foreground-secondary py-2">No upcoming shifts scheduled</p>
              ) : (
                <div className="space-y-2">
                  {upcomingShifts.map(renderShiftCard)}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
