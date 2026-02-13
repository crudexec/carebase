"use client";

import { ShiftStatus } from "@prisma/client";
import { Clock, User, MapPin, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { getShiftStatusConfig, formatTime, getShiftDuration } from "@/lib/scheduling";

export interface VisitNoteData {
  id: string;
  formSchemaSnapshot: {
    templateName: string;
    version: number;
  };
  submittedAt: string;
  qaStatus: string;
  carer: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface ShiftData {
  id: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string | null;
  actualEnd?: string | null;
  status: ShiftStatus;
  carer: {
    id: string;
    firstName: string;
    lastName: string;
  };
  client: {
    id: string;
    firstName: string;
    lastName: string;
    address?: string | null;
  };
  visitNotes?: VisitNoteData[];
  clientSignature?: string | null;
  clientSignatureTimestamp?: string | null;
  clientSignatureName?: string | null;
}

interface ShiftCardProps {
  shift: ShiftData;
  onClick?: () => void;
  compact?: boolean;
}

export function ShiftCard({ shift, onClick, compact = false }: ShiftCardProps) {
  const statusConfig = getShiftStatusConfig(shift.status);
  const startTime = new Date(shift.scheduledStart);
  const endTime = new Date(shift.scheduledEnd);

  // Check if shift spans multiple days
  const startDay = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate());
  const endDay = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate());
  const isMultiDay = startDay.getTime() !== endDay.getTime();

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "w-full text-left p-1.5 rounded text-xs transition-all hover:ring-2 hover:ring-primary/50",
          statusConfig.color
        )}
      >
        <div className="font-medium truncate">
          {shift.client.firstName} {shift.client.lastName[0]}.
        </div>
        <div className="text-[10px] opacity-75">
          {isMultiDay ? (
            <>
              {formatTime(startTime)} - {formatTime(endTime)}
              <span className="ml-1">(+{Math.ceil((endDay.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24))}d)</span>
            </>
          ) : (
            formatTime(startTime)
          )}
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 rounded-lg border bg-background transition-all",
        "hover:shadow-md hover:border-primary/50",
        "focus:outline-none focus:ring-2 focus:ring-primary/50"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-foreground truncate">
            {shift.client.firstName} {shift.client.lastName}
          </h4>
        </div>
        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusConfig.color)}>
          {statusConfig.label}
        </span>
      </div>

      <div className="space-y-1.5 text-xs text-foreground-secondary">
        {isMultiDay && (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {startTime.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {endTime.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>
            {formatTime(startTime)} - {formatTime(endTime)}
            <span className="ml-1 opacity-75">({getShiftDuration(startTime, endTime)})</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" />
          <span>{shift.carer.firstName} {shift.carer.lastName}</span>
        </div>

        {shift.client.address && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">{shift.client.address}</span>
          </div>
        )}
      </div>
    </button>
  );
}

export function ShiftCardSkeleton() {
  return (
    <div className="w-full p-3 rounded-lg border bg-background animate-pulse">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="h-4 w-32 bg-gray-200 rounded" />
        <div className="h-5 w-20 bg-gray-200 rounded-full" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3 w-24 bg-gray-200 rounded" />
        <div className="h-3 w-28 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
