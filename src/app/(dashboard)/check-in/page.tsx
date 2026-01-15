"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Clock,
  Phone,
  LogIn,
  LogOut,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Calendar,
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
    phone: string | null;
  };
  todayAttendance: TodayAttendance | null;
}

export default function CheckInPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [shifts, setShifts] = useState<ShiftData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch shifts
  const fetchShifts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/check-in");
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch shifts");
      }
      const data = await response.json();
      setShifts(data.shifts);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load shifts");
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

    // Check if today falls within the shift's date range
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    return shiftStart <= todayEnd && shiftEnd >= todayStart;
  };

  // Check if shift can be checked into today
  const canCheckIn = (shift: ShiftData) => {
    // Must be today's shift
    if (!isShiftToday(shift)) return false;

    // Must not be completed or cancelled
    if (shift.status === "COMPLETED" || shift.status === "CANCELLED") return false;

    // Check if already checked in today
    if (shift.todayAttendance?.checkInTime) return false;

    const shiftStart = new Date(shift.scheduledStart);
    const shiftEnd = new Date(shift.scheduledEnd);
    const now = new Date();

    // Can check in up to 30 minutes before shift starts and before shift ends
    const thirtyMinsBefore = new Date(shiftStart.getTime() - 30 * 60 * 1000);

    return now >= thirtyMinsBefore && now <= shiftEnd;
  };

  // Check if can check out today
  const canCheckOut = (shift: ShiftData) => {
    // Must have checked in today but not checked out
    return shift.todayAttendance?.checkInTime && !shift.todayAttendance?.checkOutTime;
  };

  // Check if completed for today
  const isCompletedForToday = (shift: ShiftData) => {
    return shift.todayAttendance?.checkInTime && shift.todayAttendance?.checkOutTime;
  };

  // Handle check-in
  const handleCheckIn = async (shiftId: string) => {
    try {
      setActionLoading(shiftId);
      setError(null);

      const response = await fetch(`/api/check-in/${shiftId}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to check in");
      }

      await fetchShifts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check in");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle check-out
  const handleCheckOut = async (shiftId: string) => {
    try {
      setActionLoading(shiftId);
      setError(null);

      const response = await fetch(`/api/check-in/${shiftId}/check-out`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to check out");
      }

      await fetchShifts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check out");
    } finally {
      setActionLoading(null);
    }
  };

  // Format time
  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    }
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Format date range for multi-day shifts
  const formatDateRange = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);

    if (start.toDateString() === end.toDateString()) {
      return formatDate(startStr);
    }

    return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  };

  // Check if multi-day shift
  const isMultiDayShift = (shift: ShiftData) => {
    const start = new Date(shift.scheduledStart);
    const end = new Date(shift.scheduledEnd);
    return start.toDateString() !== end.toDateString();
  };

  // Get status badge
  const getStatusBadge = (shift: ShiftData, isToday: boolean) => {
    // For today's shifts, show attendance-based status
    if (isToday) {
      if (isCompletedForToday(shift)) {
        return { label: "Done for Today", className: "bg-green-100 text-green-800" };
      }
      if (canCheckOut(shift)) {
        return { label: "Checked In", className: "bg-yellow-100 text-yellow-800" };
      }
      if (shift.status === "IN_PROGRESS") {
        return { label: "Awaiting Check-in", className: "bg-blue-100 text-blue-800" };
      }
      return { label: "Scheduled", className: "bg-blue-100 text-blue-800" };
    }

    // For upcoming shifts
    return { label: "Upcoming", className: "bg-gray-100 text-gray-700" };
  };

  // Separate today's shifts and upcoming shifts
  const todayShifts = shifts.filter(isShiftToday);
  const upcomingShifts = shifts.filter((s) => !isShiftToday(s));

  // Show loading while session is being fetched
  if (sessionStatus === "loading") {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (session?.user?.role !== "CARER") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-error mb-4" />
            <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
            <p className="text-sm text-foreground-secondary">
              Only carers can access the check-in page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Check In / Out</h1>
          <p className="text-sm text-foreground-secondary">
            Manage your daily attendance
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchShifts} disabled={isLoading}>
          <RefreshCw className={cn("w-4 h-4 mr-1", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-error-light text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : shifts.length === 0 ? (
        /* Empty State */
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="w-12 h-12 mx-auto text-foreground-tertiary mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Upcoming Shifts</h3>
            <p className="text-sm text-foreground-secondary">
              You don&apos;t have any scheduled shifts.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Today's Shifts */}
          {todayShifts.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Today - {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </h2>
              <div className="space-y-3">
                {todayShifts.map((shift) => {
                  const statusBadge = getStatusBadge(shift, true);
                  const isActionLoading = actionLoading === shift.id;
                  const checkInEnabled = canCheckIn(shift);
                  const checkOutEnabled = canCheckOut(shift);
                  const completedToday = isCompletedForToday(shift);
                  const multiDay = isMultiDayShift(shift);

                  return (
                    <Card key={shift.id} className="overflow-hidden border-primary/30">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">
                              {shift.client.firstName} {shift.client.lastName}
                            </CardTitle>
                            <p className="text-sm text-foreground-secondary mt-0.5">
                              {multiDay ? (
                                <>
                                  <span className="font-medium">{formatDateRange(shift.scheduledStart, shift.scheduledEnd)}</span>
                                  {" "}&middot;{" "}
                                  {formatTime(shift.scheduledStart)} - {formatTime(shift.scheduledEnd)}
                                </>
                              ) : (
                                <>
                                  {formatTime(shift.scheduledStart)} - {formatTime(shift.scheduledEnd)}
                                </>
                              )}
                            </p>
                            {multiDay && (
                              <p className="text-xs text-foreground-tertiary mt-1">
                                Multi-day shift - check in/out daily
                              </p>
                            )}
                          </div>
                          <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", statusBadge.className)}>
                            {statusBadge.label}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-4">
                        {/* Client Info */}
                        <div className="space-y-2">
                          {shift.client.address && (
                            <div className="flex items-start gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-foreground-tertiary mt-0.5 flex-shrink-0" />
                              <span className="text-foreground-secondary">{shift.client.address}</span>
                            </div>
                          )}
                          {shift.client.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-foreground-tertiary flex-shrink-0" />
                              <a
                                href={`tel:${shift.client.phone}`}
                                className="text-primary hover:underline"
                              >
                                {shift.client.phone}
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Today's Attendance Times */}
                        {shift.todayAttendance?.checkInTime && (
                          <div className="p-3 rounded-lg bg-background-secondary space-y-1.5">
                            <div className="flex items-center gap-2 text-sm">
                              <LogIn className="w-4 h-4 text-success" />
                              <span className="text-foreground-secondary">Checked in today:</span>
                              <span className="font-medium">{formatTime(shift.todayAttendance.checkInTime)}</span>
                            </div>
                            {shift.todayAttendance.checkOutTime && (
                              <div className="flex items-center gap-2 text-sm">
                                <LogOut className="w-4 h-4 text-primary" />
                                <span className="text-foreground-secondary">Checked out today:</span>
                                <span className="font-medium">{formatTime(shift.todayAttendance.checkOutTime)}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {!completedToday && !checkOutEnabled && (
                            <Button
                              className="flex-1"
                              onClick={() => handleCheckIn(shift.id)}
                              disabled={isActionLoading || !checkInEnabled}
                            >
                              {isActionLoading ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Checking In...
                                </>
                              ) : (
                                <>
                                  <LogIn className="w-4 h-4 mr-2" />
                                  Check In
                                </>
                              )}
                            </Button>
                          )}
                          {checkOutEnabled && (
                            <Button
                              className="flex-1"
                              variant="secondary"
                              onClick={() => handleCheckOut(shift.id)}
                              disabled={isActionLoading}
                            >
                              {isActionLoading ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Checking Out...
                                </>
                              ) : (
                                <>
                                  <LogOut className="w-4 h-4 mr-2" />
                                  Check Out
                                </>
                              )}
                            </Button>
                          )}
                          {completedToday && (
                            <div className="flex-1 flex items-center justify-center gap-2 py-2 text-sm text-success">
                              <CheckCircle className="w-4 h-4" />
                              {multiDay ? "Done for Today" : "Shift Completed"}
                            </div>
                          )}
                        </div>

                        {/* Info message if can't check in yet */}
                        {!completedToday && !checkOutEnabled && !checkInEnabled && (
                          <p className="text-xs text-foreground-tertiary text-center">
                            Check-in available 30 minutes before shift starts
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upcoming Shifts */}
          {upcomingShifts.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Upcoming Shifts
              </h2>
              <div className="space-y-3">
                {upcomingShifts.map((shift) => {
                  const statusBadge = getStatusBadge(shift, false);
                  const multiDay = isMultiDayShift(shift);

                  return (
                    <Card key={shift.id} className="overflow-hidden opacity-75">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">
                              {shift.client.firstName} {shift.client.lastName}
                            </CardTitle>
                            <p className="text-sm text-foreground-secondary mt-0.5">
                              <span className="font-medium">
                                {multiDay
                                  ? formatDateRange(shift.scheduledStart, shift.scheduledEnd)
                                  : formatDate(shift.scheduledStart)}
                              </span>
                              {" "}&middot;{" "}
                              {formatTime(shift.scheduledStart)} - {formatTime(shift.scheduledEnd)}
                            </p>
                            {multiDay && (
                              <p className="text-xs text-foreground-tertiary mt-1">
                                Multi-day shift
                              </p>
                            )}
                          </div>
                          <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", statusBadge.className)}>
                            {statusBadge.label}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {shift.client.address && (
                            <div className="flex items-start gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-foreground-tertiary mt-0.5 flex-shrink-0" />
                              <span className="text-foreground-secondary">{shift.client.address}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
