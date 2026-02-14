"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Calendar,
  ArrowRight,
  Loader2,
  Clock,
  User,
  MapPin,
  Play,
  LogOut,
} from "lucide-react";
import { format, formatDistanceToNow, isToday, isTomorrow } from "date-fns";
import { Button } from "@/components/ui/button";
import { ShiftDetailModal } from "@/components/scheduling/shift-detail-modal";
import { ShiftData } from "@/components/scheduling/shift-card";
import { CollapsibleWidget } from "./collapsible-widget";

interface Shift {
  id: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  status: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    address?: string;
  };
  carer?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

function formatShiftDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "EEE, MMM d");
}

function formatShiftTime(start: string, end: string): string {
  const startFormatted = format(new Date(start), "h:mm a");
  const endFormatted = format(new Date(end), "h:mm a");
  return startFormatted + " - " + endFormatted;
}

export function ShiftsWidget() {
  const { data: session } = useSession();
  const [activeShifts, setActiveShifts] = React.useState<Shift[]>([]);
  const [upcomingShifts, setUpcomingShifts] = React.useState<Shift[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedShift, setSelectedShift] = React.useState<ShiftData | null>(null);
  const [checkingOut, setCheckingOut] = React.useState<string | null>(null);

  const isCarer = session?.user?.role === "CARER";
  const userId = session?.user?.id;

  const handleCheckOut = async (e: React.MouseEvent, shiftId: string) => {
    e.stopPropagation();
    try {
      setCheckingOut(shiftId);
      const response = await fetch(`/api/check-in/${shiftId}/check-out`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to check out");
      }
      setActiveShifts((prev) => prev.filter((s) => s.id !== shiftId));
    } catch (error) {
      console.error("Check-out failed:", error);
    } finally {
      setCheckingOut(null);
    }
  };

  const handleShiftClick = (shift: Shift) => {
    if (!shift.carer) return;
    setSelectedShift({
      id: shift.id,
      scheduledStart: shift.scheduledStart,
      scheduledEnd: shift.scheduledEnd,
      actualStart: shift.actualStart,
      actualEnd: shift.actualEnd,
      status: shift.status as ShiftData["status"],
      client: {
        id: shift.client.id,
        firstName: shift.client.firstName,
        lastName: shift.client.lastName,
        address: shift.client.address,
      },
      carer: {
        id: shift.carer.id,
        firstName: shift.carer.firstName,
        lastName: shift.carer.lastName,
      },
    });
  };

  React.useEffect(() => {
    const fetchShifts = async () => {
      try {
        const [activeRes, upcomingRes] = await Promise.all([
          fetch("/api/shifts?filter=active&limit=5"),
          fetch("/api/shifts?filter=upcoming&limit=5"),
        ]);

        if (activeRes.ok) {
          const data = await activeRes.json();
          setActiveShifts(data.shifts || []);
        }
        if (upcomingRes.ok) {
          const data = await upcomingRes.json();
          setUpcomingShifts(data.shifts || []);
        }
      } catch (error) {
        console.error("Failed to fetch shifts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShifts();
    const interval = setInterval(fetchShifts, 60000);
    return () => clearInterval(interval);
  }, []);

  // Group upcoming shifts by date
  const groupedUpcoming = upcomingShifts.reduce((acc, shift) => {
    const dateKey = formatShiftDate(shift.scheduledStart);
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(shift);
    return acc;
  }, {} as Record<string, Shift[]>);

  const totalShifts = activeShifts.length + upcomingShifts.length;

  const renderActiveShift = (shift: Shift) => {
    const startTime = shift.actualStart || shift.scheduledStart;
    const duration = formatDistanceToNow(new Date(startTime), { addSuffix: false });
    const isMyShift = isCarer && shift.carer?.id === userId;
    const isCheckingOut = checkingOut === shift.id;

    return (
      <li key={shift.id}>
        <div className="px-3 py-2 rounded-md transition-colors hover:bg-background-secondary bg-warning/5 border border-warning/20">
          <button
            onClick={() => handleShiftClick(shift)}
            className="block w-full text-left"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0 relative">
                <Play className="w-4 h-4 text-warning" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-warning rounded-full animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground truncate">
                    {shift.client.firstName} {shift.client.lastName}
                  </p>
                  <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-warning/10 text-warning whitespace-nowrap">
                    {duration} in
                  </span>
                </div>
                {shift.carer && (
                  <div className="flex items-center gap-2 text-xs text-foreground-secondary mt-0.5">
                    <User className="w-3 h-3" />
                    <span>{shift.carer.firstName} {shift.carer.lastName}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-foreground-tertiary mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>Started {format(new Date(startTime), "h:mm a")}</span>
                  <span className="text-foreground-tertiary">•</span>
                  <span>Ends {format(new Date(shift.scheduledEnd), "h:mm a")}</span>
                </div>
                {shift.client.address && (
                  <div className="flex items-center gap-2 text-[10px] text-foreground-tertiary mt-0.5">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{shift.client.address}</span>
                  </div>
                )}
              </div>
            </div>
          </button>
          {isMyShift && (
            <div className="mt-2 ml-11">
              <Button
                size="sm"
                variant="secondary"
                className="w-full"
                onClick={(e) => handleCheckOut(e, shift.id)}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Checking Out...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-1" />
                    Check Out
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </li>
    );
  };

  const renderUpcomingShift = (shift: Shift) => (
    <li key={shift.id}>
      <button
        onClick={() => handleShiftClick(shift)}
        className="block w-full text-left px-3 py-2 rounded-md transition-colors hover:bg-background-secondary"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground truncate">
                {shift.client.firstName} {shift.client.lastName}
              </p>
              <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-primary/10 text-primary">
                Scheduled
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-foreground-secondary mt-0.5">
              <Clock className="w-3 h-3" />
              <span>{formatShiftTime(shift.scheduledStart, shift.scheduledEnd)}</span>
            </div>
            {shift.carer && (
              <div className="flex items-center gap-2 text-xs text-foreground-tertiary mt-0.5">
                <User className="w-3 h-3" />
                <span>{shift.carer.firstName} {shift.carer.lastName}</span>
              </div>
            )}
            {shift.client.address && (
              <div className="flex items-center gap-2 text-[10px] text-foreground-tertiary mt-0.5">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{shift.client.address}</span>
              </div>
            )}
          </div>
        </div>
      </button>
    </li>
  );

  const badge = totalShifts > 0 ? (
    <div className="flex items-center gap-1">
      {activeShifts.length > 0 && (
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-warning/10 text-warning">
          {activeShifts.length} active
        </span>
      )}
      {upcomingShifts.length > 0 && (
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
          {upcomingShifts.length} upcoming
        </span>
      )}
    </div>
  ) : null;

  const footerContent = totalShifts > 0 ? (
    <Link
      href="/scheduling"
      className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-md transition-colors"
    >
      <Calendar className="w-4 h-4" />
      View Full Schedule
    </Link>
  ) : null;

  return (
    <>
      <CollapsibleWidget
        id="shifts-widget"
        title="Shifts"
        icon={<Calendar className="w-5 h-5" />}
        badge={badge}
        headerActions={
          <Link
            href="/scheduling"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            View all
            <ArrowRight className="w-3 h-3" />
          </Link>
        }
        footer={footerContent}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-foreground-secondary" />
          </div>
        ) : totalShifts === 0 ? (
          <div className="text-center py-8 text-foreground-secondary">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No shifts</p>
            <Link href="/scheduling" className="text-xs text-primary hover:underline mt-1 inline-block">
              View schedule
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Active Shifts Section */}
            {activeShifts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 px-2 mb-2">
                  <Play className="w-3.5 h-3.5 text-warning" />
                  <p className="text-xs font-semibold text-warning uppercase tracking-wide">
                    In Progress
                  </p>
                </div>
                <ul className="space-y-1">
                  {activeShifts.map(renderActiveShift)}
                </ul>
              </div>
            )}

            {/* Upcoming Shifts Section */}
            {upcomingShifts.length > 0 && (
              <div>
                {activeShifts.length > 0 && (
                  <div className="border-t border-border-light my-3" />
                )}
                <div className="flex items-center gap-2 px-2 mb-2">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                    Upcoming
                  </p>
                </div>
                <div className="space-y-3">
                  {Object.entries(groupedUpcoming).map(([dateLabel, dateShifts]) => (
                    <div key={dateLabel}>
                      <p className="text-xs font-medium text-foreground-secondary px-2 mb-1">
                        {dateLabel}
                      </p>
                      <ul className="space-y-1">
                        {dateShifts.map(renderUpcomingShift)}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CollapsibleWidget>

      {/* Shift Detail Modal */}
      <ShiftDetailModal
        isOpen={!!selectedShift}
        onClose={() => setSelectedShift(null)}
        shift={selectedShift}
      />
    </>
  );
}
