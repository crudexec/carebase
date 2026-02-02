"use client";

import { useState, useEffect } from "react";
import { X, Clock, User, MapPin, Calendar, AlertTriangle, Loader2, FileText, CheckCircle2, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShiftData, VisitNoteData } from "./shift-card";
import { getShiftStatusConfig, formatTime, getShiftDuration } from "@/lib/scheduling";
import { cn } from "@/lib/utils";
import Link from "next/link";

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
  const [fullShift, setFullShift] = useState<ShiftData | null>(null);
  const [fetchId, setFetchId] = useState<string | null>(null);

  // Derive loading state from comparing the current shift id with the fetched one
  const isLoadingDetails = isOpen && shift && (!fullShift || fullShift.id !== shift.id);

  // Fetch full shift details including visit notes when modal opens
  useEffect(() => {
    if (!isOpen || !shift) {
      return;
    }

    if (shift.id === fetchId) {
      return;
    }

    let cancelled = false;

    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/scheduling/${shift.id}`);
        const data = await res.json();
        if (!cancelled && data.shift) {
          setFullShift(data.shift);
          setFetchId(shift.id);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchDetails();

    return () => {
      cancelled = true;
    };
  }, [isOpen, shift, fetchId]);

  // Reset state when modal closes - done outside effect to avoid lint error
  useEffect(() => {
    if (!isOpen) {
      // Use setTimeout to defer the state update
      const timer = setTimeout(() => {
        setFullShift(null);
        setFetchId(null);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || !shift) return null;

  const displayShift = fullShift || shift;
  const statusConfig = getShiftStatusConfig(displayShift.status);
  const startTime = new Date(displayShift.scheduledStart);
  const endTime = new Date(displayShift.scheduledEnd);

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

  const canCancelShift = canManage && displayShift.status === "SCHEDULED";
  const canEditShift = canManage && ["SCHEDULED", "IN_PROGRESS"].includes(displayShift.status);

  // Check-in/out status
  const isCheckedIn = !!displayShift.actualStart;
  const isCheckedOut = !!displayShift.actualEnd;
  const visitNotes = displayShift.visitNotes || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
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
              {displayShift.client.firstName} {displayShift.client.lastName}
            </h4>
            {displayShift.client.address && (
              <div className="flex items-center gap-1.5 text-sm text-foreground-secondary">
                <MapPin className="w-4 h-4" />
                <span>{displayShift.client.address}</span>
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
                {displayShift.carer.firstName} {displayShift.carer.lastName}
              </span>
            </div>
          </div>

          {/* Check-in/Check-out Status */}
          <div className="p-3 rounded-lg border space-y-3">
            <h5 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Attendance
            </h5>

            {/* Check-in Status */}
            <div className={cn(
              "flex items-center gap-3 p-2 rounded-md",
              isCheckedIn ? "bg-success/10" : "bg-background-secondary"
            )}>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                isCheckedIn ? "bg-success text-white" : "bg-gray-200 text-gray-400"
              )}>
                <LogIn className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">
                  {isCheckedIn ? "Checked In" : "Not Checked In"}
                </div>
                {isCheckedIn && displayShift.actualStart && (
                  <div className="text-xs text-foreground-secondary">
                    {new Date(displayShift.actualStart).toLocaleString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                )}
              </div>
              {isCheckedIn && <CheckCircle2 className="w-5 h-5 text-success" />}
            </div>

            {/* Check-out Status */}
            <div className={cn(
              "flex items-center gap-3 p-2 rounded-md",
              isCheckedOut ? "bg-success/10" : "bg-background-secondary"
            )}>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                isCheckedOut ? "bg-success text-white" : "bg-gray-200 text-gray-400"
              )}>
                <LogOut className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">
                  {isCheckedOut ? "Checked Out" : "Not Checked Out"}
                </div>
                {isCheckedOut && displayShift.actualEnd && (
                  <div className="text-xs text-foreground-secondary">
                    {new Date(displayShift.actualEnd).toLocaleString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                )}
              </div>
              {isCheckedOut && <CheckCircle2 className="w-5 h-5 text-success" />}
            </div>
          </div>

          {/* Visit Notes Section */}
          <div className="p-3 rounded-lg border space-y-3">
            <h5 className="text-sm font-medium text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Visit Notes ({isLoadingDetails ? "..." : visitNotes.length})
            </h5>

            {isLoadingDetails ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-foreground-secondary" />
              </div>
            ) : visitNotes.length === 0 ? (
              <div className="text-sm text-foreground-secondary text-center py-3">
                No visit notes submitted for this shift
              </div>
            ) : (
              <div className="space-y-2">
                {visitNotes.map((note: VisitNoteData) => (
                  <Link
                    key={note.id}
                    href={`/visit-notes/${note.id}`}
                    className="flex items-center gap-3 p-2 rounded-md bg-background-secondary hover:bg-background-secondary/80 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {note.formSchemaSnapshot?.templateName || "Visit Note"}
                      </div>
                      <div className="text-xs text-foreground-secondary">
                        {new Date(note.submittedAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                        {" by "}
                        {note.carer.firstName} {note.carer.lastName}
                      </div>
                    </div>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-xs font-medium",
                      note.qaStatus === "APPROVED" ? "bg-success/20 text-success" :
                      note.qaStatus === "NEEDS_REVISION" ? "bg-warning/20 text-warning" :
                      "bg-gray-100 text-gray-600"
                    )}>
                      {note.qaStatus === "PENDING_REVIEW" ? "Pending" :
                       note.qaStatus === "NEEDS_REVISION" ? "Revision" :
                       note.qaStatus === "APPROVED" ? "Approved" : note.qaStatus}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

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
