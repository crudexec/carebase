"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  FileText,
  ArrowRight,
  Loader2,
  Clock,
  User,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface MissingNoteShift {
  id: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualEnd: string | null;
  client: {
    id: string;
    firstName: string;
    lastName: string;
  };
  carer: {
    id: string;
    firstName: string;
    lastName: string;
  };
  hoursSinceCompletion: number;
}

export function MissingVisitNotesWidget() {
  const { data: session } = useSession();
  const [shifts, setShifts] = React.useState<MissingNoteShift[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const isCarer = session?.user?.role === "CARER";

  const fetchMissingNotes = React.useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setIsRefreshing(true);
      const response = await fetch("/api/shifts/missing-notes");
      if (response.ok) {
        const data = await response.json();
        setShifts(data.shifts || []);
      }
    } catch (error) {
      console.error("Failed to fetch missing visit notes:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleRefresh = () => {
    fetchMissingNotes(true);
  };

  React.useEffect(() => {
    fetchMissingNotes();
    // Refresh every 5 minutes
    const interval = setInterval(() => fetchMissingNotes(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchMissingNotes]);

  const formatHoursSince = (hours: number): string => {
    if (hours < 1) return "Less than 1 hour ago";
    if (hours === 1) return "1 hour ago";
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  };

  const getUrgencyColor = (hours: number): string => {
    if (hours >= 48) return "text-error";
    if (hours >= 24) return "text-warning";
    return "text-orange-500";
  };

  const getUrgencyBgColor = (hours: number): string => {
    if (hours >= 48) return "bg-error/10";
    if (hours >= 24) return "bg-warning/10";
    return "bg-orange-100";
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border-light bg-background-tertiary h-full flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-light">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-foreground">Missing Visit Notes</h3>
          </div>
        </div>
        <div className="flex items-center justify-center py-8 flex-1">
          <Loader2 className="w-5 h-5 animate-spin text-foreground-secondary" />
        </div>
      </div>
    );
  }

  if (shifts.length === 0) {
    return (
      <div className="rounded-lg border border-border-light bg-background-tertiary h-full flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-light">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-success" />
            <h3 className="font-semibold text-foreground">Visit Notes</h3>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-foreground-secondary ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
        <div className="text-center py-8 text-foreground-secondary flex-1 flex flex-col items-center justify-center">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50 text-success" />
          <p className="text-sm text-success font-medium">All caught up!</p>
          <p className="text-xs text-foreground-tertiary mt-1">No missing visit notes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-orange-200 bg-orange-50/50 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-orange-200">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <h3 className="font-semibold text-foreground">Missing Visit Notes</h3>
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-600">
            {shifts.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1 rounded hover:bg-orange-200/50 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-orange-600 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/visit-notes"
            className="text-xs text-orange-600 hover:underline flex items-center gap-1"
          >
            View all
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-2 flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {shifts.slice(0, 5).map((shift) => (
            <li key={shift.id}>
              <div className={`px-3 py-2 rounded-md ${getUrgencyBgColor(shift.hoursSinceCompletion)} border border-orange-200/50`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full ${getUrgencyBgColor(shift.hoursSinceCompletion)} flex items-center justify-center flex-shrink-0`}>
                    <FileText className={`w-4 h-4 ${getUrgencyColor(shift.hoursSinceCompletion)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {shift.client.firstName} {shift.client.lastName}
                      </p>
                      <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${getUrgencyBgColor(shift.hoursSinceCompletion)} ${getUrgencyColor(shift.hoursSinceCompletion)} whitespace-nowrap`}>
                        {formatHoursSince(shift.hoursSinceCompletion)}
                      </span>
                    </div>
                    {!isCarer && (
                      <div className="flex items-center gap-2 text-xs text-foreground-secondary mt-0.5">
                        <User className="w-3 h-3" />
                        <span>{shift.carer.firstName} {shift.carer.lastName}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-foreground-tertiary mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{format(new Date(shift.scheduledStart), "MMM d, h:mm a")}</span>
                    </div>
                    <Link href={`/visit-notes/new?shiftId=${shift.id}`}>
                      <Button size="sm" variant="secondary" className="mt-2 w-full text-xs h-7">
                        <FileText className="w-3 h-3 mr-1" />
                        Submit Note
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {shifts.length > 5 && (
          <p className="text-xs text-center text-foreground-tertiary mt-2">
            +{shifts.length - 5} more missing notes
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-orange-200 mt-auto">
        <p className="text-xs text-orange-600 text-center">
          Please submit visit notes after completing shifts
        </p>
      </div>
    </div>
  );
}
