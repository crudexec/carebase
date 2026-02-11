"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Clock, ArrowRight, Loader2, User, MapPin, Play, LogOut } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { ShiftDetailModal } from "@/components/scheduling/shift-detail-modal";
import { ShiftData } from "@/components/scheduling/shift-card";

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

export function ShiftsInProgressWidget() {
  const { data: session } = useSession();
  const [shifts, setShifts] = React.useState<Shift[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedShift, setSelectedShift] = React.useState<ShiftData | null>(null);
  const [checkingOut, setCheckingOut] = React.useState<string | null>(null);

  const isCarer = session?.user?.role === "CARER";
  const userId = session?.user?.id;

  const handleCheckOut = async (e: React.MouseEvent, shiftId: string) => {
    e.stopPropagation(); // Prevent opening the modal
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
      // Remove the shift from the list after successful check-out
      setShifts((prev) => prev.filter((s) => s.id !== shiftId));
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
        const response = await fetch("/api/shifts?filter=active&limit=10");
        if (response.ok) {
          const data = await response.json();
          setShifts(data.shifts || []);
        }
      } catch (error) {
        console.error("Failed to fetch shifts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShifts();
    
    // Refresh every minute
    const interval = setInterval(fetchShifts, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-lg border border-border-light bg-background-tertiary">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-light">
        <div className="flex items-center gap-2">
          <Play className="w-5 h-5 text-warning" />
          <h3 className="font-semibold text-foreground">Shifts in Progress</h3>
          {shifts.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-warning/10 text-warning">
              {shifts.length} active
            </span>
          )}
        </div>
        <Link
          href="/scheduling"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          View all
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Content */}
      <div className="p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-foreground-secondary" />
          </div>
        ) : shifts.length === 0 ? (
          <div className="text-center py-8 text-foreground-secondary">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No shifts in progress</p>
            <Link href="/scheduling" className="text-xs text-primary hover:underline mt-1 inline-block">
              View schedule
            </Link>
          </div>
        ) : (
          <ul className="space-y-1">
            {shifts.map((shift) => {
              const startTime = shift.actualStart || shift.scheduledStart;
              const duration = formatDistanceToNow(new Date(startTime), { addSuffix: false });
              const isMyShift = isCarer && shift.carer?.id === userId;
              const isCheckingOut = checkingOut === shift.id;

              return (
                <li key={shift.id}>
                  <div className="px-3 py-2 rounded-md transition-colors hover:bg-background-secondary">
                    <button
                      onClick={() => handleShiftClick(shift)}
                      className="block w-full text-left"
                    >
                      <div className="flex items-start gap-3">
                        {/* Status indicator */}
                        <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0 relative">
                          <Clock className="w-4 h-4 text-warning" />
                          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-warning rounded-full animate-pulse" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-foreground truncate">
                              {shift.client.firstName} {shift.client.lastName}
                            </p>
                            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-warning/10 text-warning whitespace-nowrap">
                              {duration}
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

                    {/* Check-out button for carers */}
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
            })}
          </ul>
        )}
      </div>

      {/* Footer */}
      {shifts.length > 0 && (
        <div className="px-4 py-3 border-t border-border-light">
          <Link
            href="/scheduling?status=IN_PROGRESS"
            className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-md transition-colors"
          >
            <Clock className="w-4 h-4" />
            View All Active Shifts
          </Link>
        </div>
      )}

      {/* Shift Detail Modal */}
      <ShiftDetailModal
        isOpen={!!selectedShift}
        onClose={() => setSelectedShift(null)}
        shift={selectedShift}
      />
    </div>
  );
}
