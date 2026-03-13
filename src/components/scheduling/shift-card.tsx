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
  missedReason?: string | null;
  missedReasonNotes?: string | null;
  missedAt?: string | null;
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
          "w-full text-left px-1 py-0.5 rounded text-[10px] transition-all hover:ring-1 hover:ring-blue-400",
          statusConfig.color
        )}
      >
        <div className="font-medium truncate leading-tight">
          {shift.client.firstName} {shift.client.lastName[0]}.
        </div>
        <div className="text-[9px] opacity-75 leading-tight">
          {isMultiDay ? (
            <>
              {formatTime(startTime)}
              <span className="ml-0.5">(+{Math.ceil((endDay.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24))}d)</span>
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
        "w-full text-left p-2.5 rounded border border-gray-200 bg-white transition-all",
        "hover:border-blue-300 hover:bg-blue-50/50",
        "focus:outline-none focus:ring-1 focus:ring-blue-500"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-[11px] text-gray-900 truncate">
            {shift.client.firstName} {shift.client.lastName}
          </h4>
        </div>
        <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-medium", statusConfig.color)}>
          {statusConfig.label}
        </span>
      </div>

      <div className="space-y-1 text-[10px] text-gray-500">
        {isMultiDay && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>
              {startTime.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {endTime.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>
            {formatTime(startTime)} - {formatTime(endTime)}
            <span className="ml-1 text-gray-400">({getShiftDuration(startTime, endTime)})</span>
          </span>
        </div>

        <div className="flex items-center gap-1">
          <User className="w-3 h-3" />
          <span>{shift.carer.firstName} {shift.carer.lastName}</span>
        </div>

        {shift.client.address && (
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{shift.client.address}</span>
          </div>
        )}
      </div>
    </button>
  );
}

export function ShiftCardSkeleton() {
  return (
    <div className="w-full p-2.5 rounded border border-gray-200 bg-white animate-pulse">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="h-3 w-24 bg-gray-200 rounded" />
        <div className="h-4 w-16 bg-gray-200 rounded" />
      </div>
      <div className="space-y-1">
        <div className="h-2.5 w-20 bg-gray-200 rounded" />
        <div className="h-2.5 w-24 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
