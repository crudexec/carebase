"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  FileText,
  ArrowRight,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { Button as _Button } from "@/components/ui/button";
import { CollapsibleWidget } from "./collapsible-widget";

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
    if (hours >= 48) return "text-red-700";
    if (hours >= 24) return "text-yellow-700";
    return "text-orange-700";
  };

  const getUrgencyBgColor = (hours: number): string => {
    if (hours >= 48) return "bg-red-100";
    if (hours >= 24) return "bg-yellow-100";
    return "bg-orange-100";
  };

  if (isLoading) {
    return (
      <CollapsibleWidget
        id="missing-visit-notes"
        title="Missing Visit Notes"
        icon={<FileText className="w-5 h-5" />}
        variant="warning"
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-foreground-secondary" />
        </div>
      </CollapsibleWidget>
    );
  }

  if (shifts.length === 0) {
    return (
      <CollapsibleWidget
        id="missing-visit-notes"
        title="Visit Notes"
        icon={<FileText className="w-5 h-5" />}
        variant="success"
        headerActions={
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-foreground-secondary ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        }
      >
        <div className="text-center py-6">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50 text-success" />
          <p className="text-sm text-success font-medium">All caught up!</p>
          <p className="text-xs text-foreground-tertiary mt-1">No missing visit notes</p>
        </div>
      </CollapsibleWidget>
    );
  }

  return (
    <CollapsibleWidget
      id="missing-visit-notes"
      title="Missing Visit Notes"
      icon={<AlertTriangle className="w-5 h-5" />}
      badge={
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-600">
          {shifts.length}
        </span>
      }
      variant="warning"
      headerActions={
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
      }
      footer={
        <p className="text-xs text-orange-600 text-center">
          Please submit visit notes after completing shifts
        </p>
      }
    >
      {/* Excel-style Table */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className={`grid ${isCarer ? "grid-cols-[1fr_90px_70px]" : "grid-cols-[1fr_1fr_90px_70px]"} bg-gray-50 border-b border-gray-200`}>
          <span className="px-3 py-1 text-[10px] font-semibold text-gray-600">Client</span>
          {!isCarer && <span className="px-3 py-1 text-[10px] font-semibold text-gray-600">Carer</span>}
          <span className="px-3 py-1 text-[10px] font-semibold text-gray-600 text-center">Overdue</span>
          <span className="px-3 py-1 text-[10px] font-semibold text-gray-600 text-right">Date</span>
        </div>

        {/* Table Body */}
        <div>
          {shifts.slice(0, 6).map((shift, index) => {
            const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-50/50";

            return (
              <Link
                key={shift.id}
                href={`/visit-notes/new?shiftId=${shift.id}&clientId=${shift.client.id}`}
                className={`grid ${isCarer ? "grid-cols-[1fr_90px_70px]" : "grid-cols-[1fr_1fr_90px_70px]"} items-center border-b border-gray-100 cursor-pointer hover:bg-blue-50 ${rowBg}`}
              >
                <span className="px-3 py-1.5 text-xs font-medium text-gray-900 truncate">
                  {shift.client.firstName} {shift.client.lastName}
                </span>
                {!isCarer && (
                  <span className="px-3 py-1.5 text-[11px] text-gray-700 truncate">
                    {shift.carer.firstName} {shift.carer.lastName}
                  </span>
                )}
                <span className="px-3 py-1.5 text-center">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${getUrgencyBgColor(shift.hoursSinceCompletion)} ${getUrgencyColor(shift.hoursSinceCompletion)}`}>
                    {formatHoursSince(shift.hoursSinceCompletion)}
                  </span>
                </span>
                <span className="px-3 py-1.5 text-[10px] text-gray-500 text-right">
                  {format(new Date(shift.scheduledStart), "MMM d")}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      {shifts.length > 6 && (
        <p className="px-3 py-1.5 text-[10px] text-center text-gray-500">
          +{shifts.length - 6} more missing notes
        </p>
      )}
    </CollapsibleWidget>
  );
}
