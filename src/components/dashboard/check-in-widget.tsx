"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  MapPin,
  LogIn,
  LogOut,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TodayAttendance {
  id: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
}

interface ShiftData {
  id: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart: string | null;
  actualEnd: string | null;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  client: {
    id: string;
    firstName: string;
    lastName: string;
    address: string | null;
  };
  todayAttendance: TodayAttendance | null;
}

export function CheckInWidget() {
  const [shifts, setShifts] = useState<ShiftData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchShifts = useCallback(async () => {
    try {
      const response = await fetch("/api/check-in");
      if (!response.ok) throw new Error("Failed to fetch shifts");
      const data = await response.json();
      setShifts(data.shifts);
      setError(null);
    } catch {
      setError("Failed to load shifts");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  // Check if a shift is for today
  const isShiftToday = (shift: ShiftData) => {
    const shiftStart = new Date(shift.scheduledStart);
    const shiftEnd = new Date(shift.scheduledEnd);
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    return shiftStart <= todayEnd && shiftEnd >= todayStart;
  };

  // Filter to today's shifts only
  const todayShifts = shifts.filter(isShiftToday);

  const handleCheckIn = async (shiftId: string) => {
    try {
      setActionLoading(shiftId);
      const response = await fetch(`/api/check-in/${shiftId}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to check in");
      }
      await fetchShifts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check in");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckOut = async (shiftId: string) => {
    try {
      setActionLoading(shiftId);
      const response = await fetch(`/api/check-in/${shiftId}/check-out`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to check out");
      }
      await fetchShifts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check out");
    } finally {
      setActionLoading(null);
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Check if can check out today
  const canCheckOut = (shift: ShiftData) => {
    return shift.todayAttendance?.checkInTime && !shift.todayAttendance?.checkOutTime;
  };

  // Check if completed for today
  const isCompletedForToday = (shift: ShiftData) => {
    return shift.todayAttendance?.checkInTime && shift.todayAttendance?.checkOutTime;
  };

  // Check if can check in
  const canCheckIn = (shift: ShiftData) => {
    if (shift.status === "COMPLETED" || shift.status === "CANCELLED") return false;
    if (shift.todayAttendance?.checkInTime) return false;
    return true;
  };

  const getStatusConfig = (shift: ShiftData) => {
    if (isCompletedForToday(shift)) {
      return { label: "Done Today", className: "bg-green-100 text-green-800" };
    }
    if (canCheckOut(shift)) {
      return { label: "Checked In", className: "bg-yellow-100 text-yellow-800" };
    }
    if (shift.status === "IN_PROGRESS") {
      return { label: "Awaiting", className: "bg-blue-100 text-blue-800" };
    }
    return { label: "Scheduled", className: "bg-blue-100 text-blue-800" };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Today&apos;s Shifts
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Today&apos;s Shifts
          </CardTitle>
          <Link
            href="/check-in"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            View All <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <div className="flex items-center gap-2 p-2 rounded bg-error-light text-red-800 text-xs">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {todayShifts.length === 0 ? (
          <div className="text-center py-6">
            <Clock className="w-10 h-10 mx-auto text-foreground-tertiary mb-2" />
            <p className="text-sm text-foreground-secondary">No shifts scheduled</p>
            <p className="text-xs text-foreground-tertiary">You&apos;re all caught up!</p>
          </div>
        ) : (
          todayShifts.slice(0, 3).map((shift) => {
            const statusConfig = getStatusConfig(shift);
            const isActionLoading = actionLoading === shift.id;
            const completedToday = isCompletedForToday(shift);
            const checkOutEnabled = canCheckOut(shift);
            const checkInEnabled = canCheckIn(shift);

            return (
              <div
                key={shift.id}
                className="p-3 rounded-lg border border-border bg-background-secondary/50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm text-foreground">
                      {shift.client.firstName} {shift.client.lastName}
                    </p>
                    <p className="text-xs text-foreground-secondary">
                      {formatTime(shift.scheduledStart)} - {formatTime(shift.scheduledEnd)}
                    </p>
                  </div>
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusConfig.className)}>
                    {statusConfig.label}
                  </span>
                </div>

                {shift.client.address && (
                  <div className="flex items-center gap-1.5 text-xs text-foreground-tertiary mb-3">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{shift.client.address}</span>
                  </div>
                )}

                {/* Today's attendance times */}
                {shift.todayAttendance?.checkInTime && (
                  <div className="text-xs text-foreground-secondary mb-2 p-2 rounded bg-background">
                    <div className="flex items-center gap-1.5">
                      <LogIn className="w-3 h-3 text-success" />
                      Checked in: {formatTime(shift.todayAttendance.checkInTime)}
                    </div>
                    {shift.todayAttendance.checkOutTime && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <LogOut className="w-3 h-3 text-primary" />
                        Checked out: {formatTime(shift.todayAttendance.checkOutTime)}
                      </div>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                {!completedToday && !checkOutEnabled && checkInEnabled && (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => handleCheckIn(shift.id)}
                    disabled={isActionLoading}
                  >
                    {isActionLoading ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <LogIn className="w-4 h-4 mr-1" />
                    )}
                    Check In
                  </Button>
                )}
                {checkOutEnabled && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full"
                    onClick={() => handleCheckOut(shift.id)}
                    disabled={isActionLoading}
                  >
                    {isActionLoading ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <LogOut className="w-4 h-4 mr-1" />
                    )}
                    Check Out
                  </Button>
                )}
                {completedToday && (
                  <div className="flex items-center justify-center gap-1.5 py-1.5 text-xs text-success">
                    <CheckCircle className="w-4 h-4" />
                    Done for Today
                  </div>
                )}
              </div>
            );
          })
        )}

        {todayShifts.length > 3 && (
          <Link
            href="/check-in"
            className="block text-center text-xs text-primary hover:underline py-2"
          >
            +{todayShifts.length - 3} more shifts
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
