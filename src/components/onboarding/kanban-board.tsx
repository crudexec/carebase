"use client";

import { useState, useMemo, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { OnboardingStage } from "@prisma/client";
import { KanbanColumn } from "./kanban-column";
import { KanbanCardOverlay, OnboardingClient } from "./kanban-card";
import { ONBOARDING_STAGES, stageRequiresApproval } from "@/lib/onboarding";

interface KanbanBoardProps {
  clients: OnboardingClient[];
  canMoveCards: boolean;
  canApproveClinical: boolean;
  onStageChange: (clientId: string, fromStage: OnboardingStage, toStage: OnboardingStage) => Promise<void>;
  onCardClick?: (client: OnboardingClient) => void;
  onAddClick?: () => void;
}

export function KanbanBoard({
  clients,
  canMoveCards,
  canApproveClinical,
  onStageChange,
  onCardClick,
  onAddClick,
}: KanbanBoardProps) {
  const [activeClient, setActiveClient] = useState<OnboardingClient | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const originalStageRef = useRef<string | null>(null);

  // Group clients by stage - use clients prop directly
  const clientsByStage = useMemo(() => {
    const grouped: Record<OnboardingStage, OnboardingClient[]> = {} as Record<OnboardingStage, OnboardingClient[]>;

    ONBOARDING_STAGES.forEach((stage) => {
      grouped[stage.id] = [];
    });

    clients.forEach((client) => {
      const stage = client.stage as OnboardingStage;
      if (grouped[stage]) {
        grouped[stage].push(client);
      }
    });

    return grouped;
  }, [clients]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const client = clients.find((c) => c.id === active.id);
    if (client) {
      setActiveClient(client);
      originalStageRef.current = client.stage;
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) {
      setDragOverStage(null);
      return;
    }

    const overId = over.id as string;

    // Determine target stage for visual feedback
    let targetStage: string | null = null;

    if (ONBOARDING_STAGES.some((s) => s.id === overId)) {
      targetStage = overId;
    } else {
      const targetClient = clients.find((c) => c.id === overId);
      if (targetClient) {
        targetStage = targetClient.stage;
      }
    }

    setDragOverStage(targetStage);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    const draggedClient = activeClient;
    const fromStage = originalStageRef.current;

    // Reset drag state
    setActiveClient(null);
    setDragOverStage(null);
    originalStageRef.current = null;

    if (!over || !draggedClient || !fromStage) {
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Determine target stage
    let targetStage: OnboardingStage | null = null;

    if (ONBOARDING_STAGES.some((s) => s.id === overId)) {
      targetStage = overId as OnboardingStage;
    } else {
      const targetClient = clients.find((c) => c.id === overId);
      if (targetClient) {
        targetStage = targetClient.stage as OnboardingStage;
      }
    }

    if (!targetStage || fromStage === targetStage) {
      return;
    }

    // Check permissions
    if (!canMoveCards) {
      return;
    }

    // Check clinical approval requirement
    if (targetStage === "CLINICAL_AUTHORIZATION" || fromStage === "CLINICAL_AUTHORIZATION") {
      if (stageRequiresApproval(targetStage as OnboardingStage) && !canApproveClinical) {
        return;
      }
    }

    // Call parent handler - parent handles optimistic update
    try {
      await onStageChange(activeId, fromStage as OnboardingStage, targetStage);
    } catch {
      // Error handling is done in parent
    }
  };

  const handleDragCancel = () => {
    setActiveClient(null);
    setDragOverStage(null);
    originalStageRef.current = null;
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 px-1">
        {ONBOARDING_STAGES.map((stage, index) => (
          <KanbanColumn
            key={stage.id}
            id={stage.id}
            title={stage.label}
            description={stage.description}
            color={stage.color}
            clients={clientsByStage[stage.id]}
            requiresApproval={stage.requiresApproval}
            onCardClick={onCardClick}
            onAddClick={onAddClick}
            canAdd={index === 0 && canMoveCards}
            isDropTarget={dragOverStage === stage.id}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeClient ? <KanbanCardOverlay client={activeClient} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
