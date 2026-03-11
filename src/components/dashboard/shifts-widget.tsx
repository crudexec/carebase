"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Calendar,
  ArrowRight,
  Loader2,
  Clock,
  Play,
  LogIn,
  LogOut,
  StickyNote,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [activeShifts, setActiveShifts] = React.useState<Shift[]>([]);
  const [upcomingShifts, setUpcomingShifts] = React.useState<Shift[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedShift, setSelectedShift] = React.useState<ShiftData | null>(null);
  const [checkingOut, setCheckingOut] = React.useState<string | null>(null);

  const isCarer = session?.user?.role === "CARER";
  const userId = session?.user?.id;
  const [checkingIn, setCheckingIn] = React.useState<string | null>(null);

  const handleAddNote = (e: React.MouseEvent, clientId: string) => {
    e.stopPropagation();
    router.push(`/visit-notes/new?clientId=${clientId}`);
  };

  const handleCheckIn = async (e: React.MouseEvent, shiftId: string) => {
    e.stopPropagation();
    try {
      setCheckingIn(shiftId);
      const response = await fetch(`/api/check-in/${shiftId}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to check in");
      }
      // Refresh the shifts list
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
      console.error("Check-in failed:", error);
    } finally {
      setCheckingIn(null);
    }
  };

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

  // Table header component for reuse
  const TableHeader = ({ showCarer }: { showCarer: boolean }) => (
    <div className={`grid ${showCarer ? "grid-cols-[1fr_1fr_90px_70px]" : "grid-cols-[1fr_90px_70px]"} bg-gray-50 border-b border-gray-200`}>
      <span className="px-3 py-1 text-[10px] font-semibold text-gray-600">Client</span>
      {showCarer && <span className="px-3 py-1 text-[10px] font-semibold text-gray-600">Carer</span>}
      <span className="px-3 py-1 text-[10px] font-semibold text-gray-600 text-center">Time</span>
      <span className="px-3 py-1 text-[10px] font-semibold text-gray-600 text-center">Status</span>
    </div>
  );

  const renderActiveShiftRow = (shift: Shift, index: number) => {
    const startTime = shift.actualStart || shift.scheduledStart;
    const duration = formatDistanceToNow(new Date(startTime), { addSuffix: false });
    const isMyShift = isCarer && shift.carer?.id === userId;
    const isCheckingOut = checkingOut === shift.id;
    const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-50/50";
    const showCarer = !isCarer;

    return (
      <div key={shift.id} className={`border-b border-gray-100 ${rowBg}`}>
        <button
          onClick={() => handleShiftClick(shift)}
          className={`grid ${showCarer ? "grid-cols-[1fr_1fr_90px_70px]" : "grid-cols-[1fr_90px_70px]"} items-center w-full text-left cursor-pointer hover:bg-blue-50`}
        >
          <span className="px-3 py-1.5 text-xs font-medium text-gray-900 truncate">
            {shift.client.firstName} {shift.client.lastName}
          </span>
          {showCarer && shift.carer && (
            <span className="px-3 py-1.5 text-[11px] text-gray-700 truncate">
              {shift.carer.firstName} {shift.carer.lastName}
            </span>
          )}
          <span className="px-3 py-1.5 text-[10px] text-gray-500 text-center">
            {format(new Date(startTime), "h:mm a")}
          </span>
          <span className="px-3 py-1.5 text-center">
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-100 text-yellow-700">
              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
              {duration}
            </span>
          </span>
        </button>
        {isMyShift && (
          <div className="px-3 pb-2 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="flex-1"
              onClick={(e) => handleCheckOut(e, shift.id)}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Checking Out...
                </>
              ) : (
                <>
                  <LogOut className="h-3 w-3 mr-1" />
                  Check Out
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => handleAddNote(e, shift.client.id)}
            >
              <StickyNote className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderUpcomingShiftRow = (shift: Shift, index: number) => {
    const isMyShift = isCarer && shift.carer?.id === userId;
    const isCheckingIn = checkingIn === shift.id;
    const canCheckIn = isMyShift && shift.status === "SCHEDULED";
    const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-50/50";
    const showCarer = !isCarer;

    return (
      <div key={shift.id} className={`border-b border-gray-100 ${rowBg}`}>
        <button
          onClick={() => handleShiftClick(shift)}
          className={`grid ${showCarer ? "grid-cols-[1fr_1fr_90px_70px]" : "grid-cols-[1fr_90px_70px]"} items-center w-full text-left cursor-pointer hover:bg-blue-50`}
        >
          <span className="px-3 py-1.5 text-xs font-medium text-gray-900 truncate">
            {shift.client.firstName} {shift.client.lastName}
          </span>
          {showCarer && shift.carer && (
            <span className="px-3 py-1.5 text-[11px] text-gray-700 truncate">
              {shift.carer.firstName} {shift.carer.lastName}
            </span>
          )}
          <span className="px-3 py-1.5 text-[10px] text-gray-500 text-center">
            {formatShiftTime(shift.scheduledStart, shift.scheduledEnd)}
          </span>
          <span className="px-3 py-1.5 text-center">
            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700">
              Scheduled
            </span>
          </span>
        </button>
        {(canCheckIn || isMyShift) && (
          <div className="px-3 pb-2 flex gap-2">
            {canCheckIn && (
              <Button
                size="sm"
                className="flex-1"
                onClick={(e) => handleCheckIn(e, shift.id)}
                disabled={isCheckingIn}
              >
                {isCheckingIn ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Checking In...
                  </>
                ) : (
                  <>
                    <LogIn className="h-3 w-3 mr-1" />
                    Check In
                  </>
                )}
              </Button>
            )}
            {isMyShift && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => handleAddNote(e, shift.client.id)}
              >
                <StickyNote className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

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
                <div className="flex items-center gap-1.5 px-3 py-1.5 mb-1">
                  <Play className="h-3 w-3 text-yellow-600" />
                  <span className="text-xs font-semibold text-gray-700">In Progress</span>
                  <span className="text-[10px] text-gray-500">({activeShifts.length})</span>
                </div>
                <div className="bg-white rounded border border-gray-200 overflow-hidden">
                  <TableHeader showCarer={!isCarer} />
                  <div>
                    {activeShifts.map((shift, index) => renderActiveShiftRow(shift, index))}
                  </div>
                </div>
              </div>
            )}

            {/* Upcoming Shifts Section */}
            {upcomingShifts.length > 0 && (
              <div>
                {activeShifts.length > 0 && (
                  <div className="border-t border-gray-100 my-3" />
                )}
                <div className="flex items-center gap-1.5 px-3 py-1.5 mb-1">
                  <Clock className="h-3 w-3 text-blue-600" />
                  <span className="text-xs font-semibold text-gray-700">Upcoming</span>
                  <span className="text-[10px] text-gray-500">({upcomingShifts.length})</span>
                </div>
                <div className="bg-white rounded border border-gray-200 overflow-hidden">
                  <TableHeader showCarer={!isCarer} />
                  <div>
                    {Object.entries(groupedUpcoming).map(([dateLabel, dateShifts]) => (
                      <div key={dateLabel}>
                        {/* Date label row */}
                        <div className="px-3 py-1 bg-gray-100 border-b border-gray-200">
                          <p className="text-[10px] font-medium text-gray-600">
                            {dateLabel}
                          </p>
                        </div>
                        {/* Shifts for this date */}
                        {dateShifts.map((shift, index) => renderUpcomingShiftRow(shift, index))}
                      </div>
                    ))}
                  </div>
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
