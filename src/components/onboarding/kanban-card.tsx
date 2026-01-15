"use client";

import { useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Clock, User, FileText, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface OnboardingClient {
  id: string;
  clientId: string;
  clientName: string;
  sponsorName: string | null;
  stage: string;
  stageEnteredAt: string;
  notes: string | null;
  documentsCount: number;
  clinicalApproval: boolean | null;
  assignedTo: string | null;
}

interface KanbanCardProps {
  client: OnboardingClient;
  onClick?: () => void;
  isDragging?: boolean;
}

export function KanbanCard({ client, onClick, isDragging }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: client.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const daysInStage = useMemo(() => {
    const now = Date.now();
    return Math.floor(
      (now - new Date(client.stageEnteredAt).getTime()) / (1000 * 60 * 60 * 24)
    );
  }, [client.stageEnteredAt]);

  const isOverdue = daysInStage > 7;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "bg-white rounded-lg border p-3 shadow-sm cursor-grab active:cursor-grabbing",
        "hover:shadow-md transition-shadow",
        (isDragging || isSortableDragging) && "opacity-50 shadow-lg rotate-2",
        isOverdue && "border-l-4 border-l-warning"
      )}
    >
      {/* Client Name */}
      <h4 className="font-medium text-foreground text-sm mb-2 line-clamp-1">
        {client.clientName}
      </h4>

      {/* Sponsor */}
      {client.sponsorName && (
        <div className="flex items-center gap-1.5 text-foreground-secondary text-xs mb-2">
          <User className="w-3 h-3" />
          <span className="line-clamp-1">{client.sponsorName}</span>
        </div>
      )}

      {/* Meta info */}
      <div className="flex items-center justify-between text-xs text-foreground-tertiary">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{daysInStage}d</span>
        </div>

        <div className="flex items-center gap-2">
          {client.documentsCount > 0 && (
            <div className="flex items-center gap-0.5">
              <FileText className="w-3 h-3" />
              <span>{client.documentsCount}</span>
            </div>
          )}

          {isOverdue && (
            <AlertCircle className="w-3.5 h-3.5 text-warning" />
          )}
        </div>
      </div>

      {/* Clinical Approval Badge */}
      {client.stage === "CLINICAL_AUTHORIZATION" && (
        <div className={cn(
          "mt-2 px-2 py-0.5 rounded-full text-xs font-medium text-center",
          client.clinicalApproval === true && "bg-success/20 text-foreground",
          client.clinicalApproval === false && "bg-error/20 text-foreground",
          client.clinicalApproval === null && "bg-warning/20 text-foreground"
        )}>
          {client.clinicalApproval === true && "Approved"}
          {client.clinicalApproval === false && "Rejected"}
          {client.clinicalApproval === null && "Pending Approval"}
        </div>
      )}
    </div>
  );
}

// Placeholder for drag overlay
export function KanbanCardOverlay({ client }: { client: OnboardingClient }) {
  return (
    <div className="bg-white rounded-lg border p-3 shadow-lg rotate-3 opacity-90">
      <h4 className="font-medium text-foreground text-sm mb-2 line-clamp-1">
        {client.clientName}
      </h4>
      {client.sponsorName && (
        <div className="flex items-center gap-1.5 text-foreground-secondary text-xs">
          <User className="w-3 h-3" />
          <span className="line-clamp-1">{client.sponsorName}</span>
        </div>
      )}
    </div>
  );
}
