"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Calendar,
  ArrowRight,
  Loader2,
  Clock,
  LogIn,
  LogOut,
} from "lucide-react";
import { format, formatDistanceToNow, isToday, isTomorrow } from "date-fns";
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

  const isCarer = session?.user?.role === "CARER";
  const isAdmin = ["ADMIN", "OPS_MANAGER", "SUPERVISOR", "STAFF"].includes(session?.user?.role || "");

  const fetchShifts = React.useCallback(async () => {
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
  }, []);

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

  const handleModalClose = () => {
    setSelectedShift(null);
    // Refresh shifts in case check-in/check-out happened in the modal
    fetchShifts();
  };

  React.useEffect(() => {
    fetchShifts();
    const interval = setInterval(fetchShifts, 60000);
    return () => clearInterval(interval);
  }, [fetchShifts]);

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
    const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-50/50";
    const showCarer = !isCarer;

    return (
      <button
        key={shift.id}
        onClick={() => handleShiftClick(shift)}
        className={`grid ${showCarer ? "grid-cols-[1fr_1fr_90px_70px]" : "grid-cols-[1fr_90px_70px]"} items-center w-full text-left cursor-pointer hover:bg-blue-50 border-b border-gray-100 ${rowBg}`}
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
    );
  };

  const renderUpcomingShiftRow = (shift: Shift, index: number) => {
    const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-50/50";
    const showCarer = !isCarer;

    return (
      <button
        key={shift.id}
        onClick={() => handleShiftClick(shift)}
        className={`grid ${showCarer ? "grid-cols-[1fr_1fr_90px_70px]" : "grid-cols-[1fr_90px_70px]"} items-center w-full text-left cursor-pointer hover:bg-blue-50 border-b border-gray-100 ${rowBg}`}
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
    );
  };

  // For admin view, categorize shifts by attendance status
  const notCheckedIn = upcomingShifts.filter((s) => s.status === "SCHEDULED");
  const notCheckedOut = activeShifts; // Active shifts are checked in but not checked out

  const badge = totalShifts > 0 ? (
    <div className="flex items-center gap-1">
      {notCheckedOut.length > 0 && (
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-warning/10 text-warning">
          {notCheckedOut.length} active
        </span>
      )}
      {notCheckedIn.length > 0 && (
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
          {notCheckedIn.length} pending
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
            {/* Attendance Section Header */}
            {(notCheckedOut.length > 0 || notCheckedIn.length > 0) && (
              <div className="flex items-center gap-1.5 px-3 py-1">
                <Clock className="h-3.5 w-3.5 text-gray-600" />
                <span className="text-xs font-semibold text-gray-700">Attendance</span>
              </div>
            )}

            {/* Not Checked Out Section (Active/In Progress) */}
            {notCheckedOut.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 mb-1">
                  <LogOut className="h-3 w-3 text-yellow-600" />
                  <span className="text-xs font-medium text-gray-600">Not Checked Out</span>
                  <span className="text-[10px] text-gray-500">({notCheckedOut.length})</span>
                </div>
                <div className="bg-white rounded border border-gray-200 overflow-hidden">
                  <TableHeader showCarer={!isCarer} />
                  <div>
                    {notCheckedOut.map((shift, index) => renderActiveShiftRow(shift, index))}
                  </div>
                </div>
              </div>
            )}

            {/* Not Checked In Section (Scheduled/Upcoming) */}
            {notCheckedIn.length > 0 && (
              <div>
                {notCheckedOut.length > 0 && (
                  <div className="border-t border-gray-100 my-3" />
                )}
                <div className="flex items-center gap-1.5 px-3 py-1.5 mb-1">
                  <LogIn className="h-3 w-3 text-blue-600" />
                  <span className="text-xs font-medium text-gray-600">Not Checked In</span>
                  <span className="text-[10px] text-gray-500">({notCheckedIn.length})</span>
                </div>
                <div className="bg-white rounded border border-gray-200 overflow-hidden">
                  <TableHeader showCarer={!isCarer} />
                  <div>
                    {Object.entries(groupedUpcoming).map(([dateLabel, dateShifts]) => {
                      const scheduledShifts = dateShifts.filter((s) => s.status === "SCHEDULED");
                      if (scheduledShifts.length === 0) return null;
                      return (
                        <div key={dateLabel}>
                          {/* Date label row */}
                          <div className="px-3 py-1 bg-gray-100 border-b border-gray-200">
                            <p className="text-[10px] font-medium text-gray-600">
                              {dateLabel}
                            </p>
                          </div>
                          {/* Shifts for this date */}
                          {scheduledShifts.map((shift, index) => renderUpcomingShiftRow(shift, index))}
                        </div>
                      );
                    })}
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
        onClose={handleModalClose}
        shift={selectedShift}
        canManage={isAdmin}
      />
    </>
  );
}
