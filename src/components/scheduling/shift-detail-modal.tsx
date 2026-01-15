"use client";

import { X, Clock, User, MapPin, Calendar, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShiftData } from "./shift-card";
import { getShiftStatusConfig, formatTime, getShiftDuration } from "@/lib/scheduling";
import { cn } from "@/lib/utils";

interface ShiftDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  shift: ShiftData | null;
  onEdit?: () => void;
  onCancel?: () => Promise<void>;
  canManage?: boolean;
  isCancelling?: boolean;
}

export function ShiftDetailModal({
  isOpen,
  onClose,
  shift,
  onEdit,
  onCancel,
  canManage = false,
  isCancelling = false,
}: ShiftDetailModalProps) {
  if (!isOpen || !shift) return null;

  const statusConfig = getShiftStatusConfig(shift.status);
  const startTime = new Date(shift.scheduledStart);
  const endTime = new Date(shift.scheduledEnd);

  // Check if shift spans multiple days
  const startDay = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate());
  const endDay = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate());
  const isMultiDay = startDay.getTime() !== endDay.getTime();

  const dateStr = isMultiDay
    ? `${startTime.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" })} - ${endTime.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}`
    : startTime.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const canCancelShift = canManage && shift.status === "SCHEDULED";
  const canEditShift = canManage && ["SCHEDULED", "IN_PROGRESS"].includes(shift.status);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Shift Details</CardTitle>
          <button
            onClick={onClose}
            className="text-foreground-secondary hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className={cn("px-3 py-1 rounded-full text-sm font-medium", statusConfig.color)}>
              {statusConfig.label}
            </span>
          </div>

          {/* Client Info */}
          <div className="p-3 rounded-lg bg-background-secondary">
            <h4 className="font-semibold text-foreground mb-1">
              {shift.client.firstName} {shift.client.lastName}
            </h4>
            {shift.client.address && (
              <div className="flex items-center gap-1.5 text-sm text-foreground-secondary">
                <MapPin className="w-4 h-4" />
                <span>{shift.client.address}</span>
              </div>
            )}
          </div>

          {/* Shift Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-foreground-secondary" />
              <span className="text-foreground">{dateStr}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-foreground-secondary" />
              <span className="text-foreground">
                {formatTime(startTime)} - {formatTime(endTime)}
                <span className="ml-2 text-foreground-secondary">
                  ({getShiftDuration(startTime, endTime)})
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-foreground-secondary" />
              <span className="text-foreground">
                {shift.carer.firstName} {shift.carer.lastName}
              </span>
            </div>
          </div>

          {/* Actual Times (if available) */}
          {(shift.actualStart || shift.actualEnd) && (
            <div className="p-3 rounded-lg bg-background-secondary">
              <h5 className="text-sm font-medium text-foreground-secondary mb-2">
                Actual Times
              </h5>
              <div className="text-sm text-foreground">
                {shift.actualStart && (
                  <div>Check-in: {formatTime(new Date(shift.actualStart))}</div>
                )}
                {shift.actualEnd && (
                  <div>Check-out: {formatTime(new Date(shift.actualEnd))}</div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <Button variant="ghost" onClick={onClose} className="flex-1">
              Close
            </Button>
            {canEditShift && (
              <Button variant="secondary" onClick={onEdit} className="flex-1">
                Edit Shift
              </Button>
            )}
            {canCancelShift && (
              <Button
                variant="secondary"
                onClick={onCancel}
                disabled={isCancelling}
                className="flex-1 border-error text-error hover:bg-error/10"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Cancel Shift
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
