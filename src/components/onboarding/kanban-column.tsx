"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { KanbanCard, OnboardingClient } from "./kanban-card";

interface KanbanColumnProps {
  id: string;
  title: string;
  description: string;
  color: string;
  clients: OnboardingClient[];
  requiresApproval?: boolean;
  onCardClick?: (client: OnboardingClient) => void;
  onAddClick?: () => void;
  canAdd?: boolean;
  isDropTarget?: boolean;
}

export function KanbanColumn({
  id,
  title,
  description,
  color,
  clients,
  requiresApproval,
  onCardClick,
  onAddClick,
  canAdd = false,
  isDropTarget = false,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      className={cn(
        "flex flex-col w-72 min-w-72 rounded-lg transition-all duration-150",
        color,
        (isOver || isDropTarget) && "ring-2 ring-primary ring-offset-2 scale-[1.02]"
      )}
    >
      {/* Column Header */}
      <div className="p-3 border-b border-black/5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground text-sm">{title}</h3>
            {requiresApproval && (
              <Lock className="w-3.5 h-3.5 text-foreground-secondary" />
            )}
          </div>
          <span className="text-xs font-medium text-foreground-secondary bg-white/50 px-2 py-0.5 rounded-full">
            {clients.length}
          </span>
        </div>
        <p className="text-xs text-foreground-secondary line-clamp-1">
          {description}
        </p>
      </div>

      {/* Cards Container */}
      <div
        ref={setNodeRef}
        className="flex-1 p-2 space-y-2 min-h-32 overflow-y-auto max-h-[calc(100vh-280px)]"
      >
        <SortableContext items={clients.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {clients.map((client) => (
            <KanbanCard
              key={client.id}
              client={client}
              onClick={() => onCardClick?.(client)}
            />
          ))}
        </SortableContext>

        {clients.length === 0 && (
          <div className="flex items-center justify-center h-20 text-foreground-tertiary text-xs">
            No clients in this stage
          </div>
        )}
      </div>

      {/* Add Button (only for first column) */}
      {canAdd && (
        <div className="p-2 border-t border-black/5">
          <button
            onClick={onAddClick}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium text-foreground-secondary hover:bg-white/50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Client
          </button>
        </div>
      )}
    </div>
  );
}
