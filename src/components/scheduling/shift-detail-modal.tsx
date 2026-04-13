"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { X, Clock, User, MapPin, Calendar, AlertTriangle, Loader2, FileText, CheckCircle2, LogIn, LogOut, PenLine, XCircle, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShiftData, VisitNoteData } from "./shift-card";
import { getShiftStatusConfig, formatTime, getShiftDuration } from "@/lib/scheduling";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ClientSignatureModal } from "./client-signature-modal";
import { MissedVisitModal } from "./missed-visit-modal";
import { getMissedVisitReasonLabel } from "@/lib/missed-visit-reasons";

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
  const { data: session } = useSession();
  const router = useRouter();
  const [fullShift, setFullShift] = useState<ShiftData | null>(null);
  const [fetchId, setFetchId] = useState<string | null>(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showMissedVisitModal, setShowMissedVisitModal] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkInError, setCheckInError] = useState<string | null>(null);

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
  const canMarkAsMissed = ["SCHEDULED", "IN_PROGRESS"].includes(displayShift.status);

  // Multi-day shifts track daily attendance separately from the lifetime shift fields.
  const todayAttendance = displayShift.todayAttendance;
  const todayCheckInTime = todayAttendance?.checkInTime ?? null;
  const todayCheckOutTime = todayAttendance?.checkOutTime ?? null;
  const isCheckedIn = isMultiDay ? !!todayCheckInTime : !!displayShift.actualStart;
  const isCheckedOut = isMultiDay ? !!todayCheckOutTime : !!displayShift.actualEnd;
  const visitNotes = displayShift.visitNotes || [];

  // Check if current user can perform check-in/check-out
  // Assigned carer can always check in/out their own shifts
  // Managers can also check in/out on behalf of carers
  const isAssignedCarer = session?.user?.id === displayShift.carer.id;
  const canManageShifts = canManage; // Passed from parent - admins, ops managers, etc.
  const canPerformCheckActions = isAssignedCarer || canManageShifts;

  // Allow check-in for SCHEDULED shifts (or IN_PROGRESS for multi-day that needs daily check-in)
  const canCheckIn = canPerformCheckActions &&
    (displayShift.status === "SCHEDULED" || displayShift.status === "IN_PROGRESS") &&
    !isCheckedIn;

  // Allow check-out for IN_PROGRESS shifts that are checked in
  const canCheckOut = canPerformCheckActions &&
    displayShift.status === "IN_PROGRESS" &&
    isCheckedIn &&
    !isCheckedOut;

  // Check-in handler
  const handleCheckIn = async () => {
    try {
      setIsCheckingIn(true);
      setCheckInError(null);
      const response = await fetch(`/api/check-in/${displayShift.id}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to check in");
      }
      // Refetch shift details to update the UI
      setFetchId(null);
    } catch (error) {
      setCheckInError(error instanceof Error ? error.message : "Failed to check in");
    } finally {
      setIsCheckingIn(false);
    }
  };

  // Check-out handler
  const handleCheckOut = async () => {
    try {
      setIsCheckingOut(true);
      setCheckInError(null);
      const response = await fetch(`/api/check-in/${displayShift.id}/check-out`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to check out");
      }
      // Refetch shift details to update the UI
      setFetchId(null);
    } catch (error) {
      setCheckInError(error instanceof Error ? error.message : "Failed to check out");
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Navigate to add note
  const handleAddNote = () => {
    router.push(`/visit-notes/new?clientId=${displayShift.client.id}`);
    onClose();
  };

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

            {/* Check-in Status Row */}
            <div className={cn(
              "flex items-center gap-3 p-3 rounded-lg transition-all",
              isCheckedIn
                ? "bg-green-50 border border-green-200"
                : "bg-gray-50 border border-gray-200"
            )}>
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                isCheckedIn ? "bg-green-500 text-white" : "bg-gray-300 text-gray-500"
              )}>
                <LogIn className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "text-sm font-semibold",
                  isCheckedIn ? "text-green-800" : "text-gray-700"
                )}>
                  {isCheckedIn ? "Checked In" : "Not Checked In"}
                </div>
                {isCheckedIn && (isMultiDay ? todayCheckInTime : displayShift.actualStart) ? (
                  <div className="text-xs text-green-600">
                    {new Date(isMultiDay ? todayCheckInTime! : displayShift.actualStart!).toLocaleString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                ) : !isCheckedIn && (
                  <div className="text-xs text-gray-500">Awaiting check-in</div>
                )}
              </div>
              {isCheckedIn ? (
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
              ) : canCheckIn ? (
                <Button
                  size="sm"
                  className="h-9 px-4 bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow transition-all"
                  onClick={handleCheckIn}
                  disabled={isCheckingIn}
                >
                  {isCheckingIn ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-1.5" />
                      Check In
                    </>
                  )}
                </Button>
              ) : null}
            </div>

            {/* Check-out Status Row */}
            <div className={cn(
              "flex items-center gap-3 p-3 rounded-lg transition-all",
              isCheckedOut
                ? "bg-green-50 border border-green-200"
                : isCheckedIn
                  ? "bg-amber-50 border border-amber-200"
                  : "bg-gray-50 border border-gray-200 opacity-60"
            )}>
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                isCheckedOut
                  ? "bg-green-500 text-white"
                  : isCheckedIn
                    ? "bg-amber-400 text-white"
                    : "bg-gray-300 text-gray-500"
              )}>
                <LogOut className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "text-sm font-semibold",
                  isCheckedOut
                    ? "text-green-800"
                    : isCheckedIn
                      ? "text-amber-800"
                      : "text-gray-500"
                )}>
                  {isCheckedOut ? "Checked Out" : "Not Checked Out"}
                </div>
                {isCheckedOut && (isMultiDay ? todayCheckOutTime : displayShift.actualEnd) ? (
                  <div className="text-xs text-green-600">
                    {new Date(isMultiDay ? todayCheckOutTime! : displayShift.actualEnd!).toLocaleString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                ) : isCheckedIn && !isCheckedOut ? (
                  <div className="text-xs text-amber-600">In progress - ready to check out</div>
                ) : (
                  <div className="text-xs text-gray-400">Check in first</div>
                )}
              </div>
              {isCheckedOut ? (
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
              ) : canCheckOut ? (
                <Button
                  size="sm"
                  className="h-9 px-4 bg-amber-500 hover:bg-amber-600 text-white shadow-sm hover:shadow transition-all"
                  onClick={handleCheckOut}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <LogOut className="w-4 h-4 mr-1.5" />
                      Check Out
                    </>
                  )}
                </Button>
              ) : null}
            </div>

            {/* Check-in/Check-out Error */}
            {checkInError && (
              <div className="p-2 rounded-md bg-red-50 border border-red-200 text-sm text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {checkInError}
              </div>
            )}
          </div>

          {/* Missed Visit Info */}
          {displayShift.status === "MISSED" && (
            <div className="p-3 rounded-lg border border-orange-200 bg-orange-50 space-y-2">
              <h5 className="text-sm font-medium text-orange-800 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Visit Marked as Missed
              </h5>
              <div className="text-sm">
                <span className="font-medium text-orange-900">Reason: </span>
                <span className="text-orange-800">
                  {displayShift.missedReason
                    ? getMissedVisitReasonLabel(displayShift.missedReason)
                    : "Not specified"}
                </span>
              </div>
              {displayShift.missedReasonNotes && (
                <div className="text-sm">
                  <span className="font-medium text-orange-900">Notes: </span>
                  <span className="text-orange-800">{displayShift.missedReasonNotes}</span>
                </div>
              )}
              {displayShift.missedAt && (
                <div className="text-xs text-orange-600 mt-1">
                  Marked at {new Date(displayShift.missedAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </div>
              )}
            </div>
          )}

          {/* Client Signature Section */}
          <div className="p-3 rounded-lg border space-y-3">
            <h5 className="text-sm font-medium text-foreground flex items-center gap-2">
              <PenLine className="w-4 h-4" />
              Client Signature
            </h5>

            {displayShift.clientSignature ? (
              <div className="space-y-2">
                <div className="bg-background-secondary rounded-lg p-2">
                  <img
                    src={displayShift.clientSignature}
                    alt="Client Signature"
                    className="max-h-24 mx-auto"
                  />
                </div>
                <div className="text-xs text-foreground-secondary text-center">
                  {displayShift.clientSignatureName && (
                    <span className="font-medium">{displayShift.clientSignatureName} &bull; </span>
                  )}
                  {displayShift.clientSignatureTimestamp && (
                    <span>
                      Signed {new Date(displayShift.clientSignatureTimestamp).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              </div>
            ) : displayShift.status === "IN_PROGRESS" ? (
              <Button
                variant="secondary"
                onClick={() => setShowSignatureModal(true)}
                className="w-full h-10 bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100 hover:border-purple-300 transition-all"
              >
                <PenLine className="w-4 h-4 mr-2" />
                Request Client Signature
              </Button>
            ) : (
              <div className="text-sm text-foreground-secondary text-center py-2">
                No signature captured
              </div>
            )}
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

          {/* Add Note Button */}
          <Button
            variant="secondary"
            onClick={handleAddNote}
            className="w-full h-10 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all"
          >
            <StickyNote className="w-4 h-4 mr-2" />
            Add Visit Note
          </Button>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={onClose}
              className="flex-1 h-9 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              Close
            </Button>
            {canMarkAsMissed && (
              <Button
                variant="secondary"
                onClick={() => setShowMissedVisitModal(true)}
                className="flex-1 h-9 bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100 hover:border-orange-300 transition-all"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Mark as Missed
              </Button>
            )}
            {canEditShift && (
              <Button
                variant="secondary"
                onClick={onEdit}
                className="flex-1 h-9 bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 hover:border-blue-300 transition-all"
              >
                Edit Shift
              </Button>
            )}
            {canCancelShift && (
              <Button
                variant="secondary"
                onClick={onCancel}
                disabled={isCancelling}
                className="flex-1 h-9 bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300 transition-all"
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

      {/* Client Signature Modal */}
      {showSignatureModal && displayShift && (
        <ClientSignatureModal
          shiftId={displayShift.id}
          clientName={`${displayShift.client.firstName} ${displayShift.client.lastName}`}
          onSuccess={() => {
            // Refetch shift details to show the new signature
            setFetchId(null);
          }}
          onClose={() => setShowSignatureModal(false)}
        />
      )}

      {/* Missed Visit Modal */}
      {showMissedVisitModal && displayShift && (
        <MissedVisitModal
          shiftId={displayShift.id}
          clientName={`${displayShift.client.firstName} ${displayShift.client.lastName}`}
          onSuccess={() => {
            // Refetch shift details to show the missed status
            setFetchId(null);
          }}
          onClose={() => setShowMissedVisitModal(false)}
        />
      )}
    </div>
  );
}
