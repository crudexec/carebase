"use client";

import * as React from "react";
import Link from "next/link";
import {
  Stethoscope,
  AlertTriangle,
  Clock,
  FileText,
  ChevronRight,
  ChevronDown,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui";
import { getICD10Description } from "@/lib/visit-notes/diagnosis-task-mapping";

interface ClientData {
  id: string;
  firstName: string;
  lastName: string;
  diagnosisCodes?: string[];
  primaryDiagnosis?: string;
  address?: string;
}

interface ShiftData {
  id: string;
  scheduledStart: string;
  scheduledEnd: string;
  client: ClientData;
}

interface LastVisitNote {
  id: string;
  submittedAt: string;
  templateName: string;
  excerpt?: string;
}

interface ClientContextPanelProps {
  shift: ShiftData;
  lastVisitNote?: LastVisitNote | null;
  alerts?: string[];
  className?: string;
}

export function ClientContextPanel({
  shift,
  lastVisitNote,
  alerts = [],
  className,
}: ClientContextPanelProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const { client } = shift;
  const clientInitials = `${client.firstName[0]}${client.lastName[0]}`;
  const diagnosisCodes = client.diagnosisCodes || [];

  const hasDetails = diagnosisCodes.length > 0 || alerts.length > 0 || lastVisitNote;

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className={cn("rounded-lg border border-border bg-background overflow-hidden", className)}>
      {/* Compact header - always visible */}
      <div
        className={cn(
          "flex items-center justify-between py-2 px-3",
          hasDetails && "cursor-pointer hover:bg-background-secondary"
        )}
        onClick={() => hasDetails && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {/* Small avatar */}
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white text-xs font-medium flex-shrink-0">
            {clientInitials}
          </span>

          {/* Client name and shift */}
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{client.firstName} {client.lastName}</span>
            <span className="text-foreground-tertiary">•</span>
            <span className="text-foreground-secondary flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatShortDate(shift.scheduledStart)}
            </span>
            <span className="text-foreground-secondary flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(shift.scheduledStart)} - {formatTime(shift.scheduledEnd)}
            </span>
          </div>

          {/* Indicators */}
          {diagnosisCodes.length > 0 && (
            <Badge variant="default" className="text-xs py-0 px-1.5 h-5">
              {diagnosisCodes.length} Dx
            </Badge>
          )}
          {alerts.length > 0 && (
            <Badge variant="warning" className="text-xs py-0 px-1.5 h-5">
              {alerts.length} Alert{alerts.length > 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/clients/${client.id}`}
            className="text-xs text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            View profile
          </Link>
          {hasDetails && (
            <ChevronDown
              className={cn(
                "h-4 w-4 text-foreground-tertiary transition-transform",
                isExpanded && "rotate-180"
              )}
            />
          )}
        </div>
      </div>

      {/* Expandable details */}
      {isExpanded && hasDetails && (
        <div className="border-t border-border px-3 py-2 space-y-2 bg-background-secondary/50">
          {/* Alerts - compact */}
          {alerts.length > 0 && (
            <div className="flex items-start gap-2 text-xs">
              <AlertTriangle className="h-3.5 w-3.5 text-warning mt-0.5 flex-shrink-0" />
              <div className="text-foreground-secondary">
                {alerts.join(" • ")}
              </div>
            </div>
          )}

          {/* Diagnoses - compact inline */}
          {diagnosisCodes.length > 0 && (
            <div className="flex items-start gap-2 text-xs">
              <Stethoscope className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex flex-wrap gap-1">
                {diagnosisCodes.map((code) => {
                  const description = getICD10Description(code);
                  const isPrimary = code === client.primaryDiagnosis;
                  return (
                    <span
                      key={code}
                      className={cn(
                        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-background border text-xs",
                        isPrimary && "border-primary/50 bg-primary/5"
                      )}
                      title={description || code}
                    >
                      <span className="font-mono">{code}</span>
                      {description && (
                        <span className="text-foreground-tertiary max-w-[100px] truncate">
                          {description}
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Last visit - compact */}
          {lastVisitNote && (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-foreground-secondary">
                <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                <span>Last: {lastVisitNote.templateName}</span>
                <span className="text-foreground-tertiary">
                  {formatShortDate(lastVisitNote.submittedAt)}
                </span>
              </div>
              <Link
                href={`/visit-notes/${lastVisitNote.id}`}
                className="text-primary hover:underline flex items-center gap-0.5"
              >
                View <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
