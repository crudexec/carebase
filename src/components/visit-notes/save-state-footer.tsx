"use client";

import * as React from "react";
import { Button } from "@/components/ui";
import { Loader2, Check, AlertCircle, Save } from "lucide-react";
import { cn } from "@/lib/utils";

export type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

interface SaveStateFooterProps {
  saveState: SaveState;
  onSave: () => void;
  disabled?: boolean;
  submitLabel?: string;
  savingLabel?: string;
  errorMessage?: string;
  className?: string;
}

export function SaveStateFooter({
  saveState,
  onSave,
  disabled,
  submitLabel = "Save changes",
  savingLabel = "Saving...",
  errorMessage,
  className,
}: SaveStateFooterProps) {
  const isSaving = saveState === "saving";
  const isDirty = saveState === "dirty";
  const isSaved = saveState === "saved";
  const hasError = saveState === "error";

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40",
        "bg-background/95 backdrop-blur-sm border-t border-border",
        "px-4 py-3 md:py-4",
        "safe-area-bottom",
        className
      )}
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        {/* Status indicator */}
        <div className="flex items-center gap-2 min-w-0">
          {isDirty && (
            <>
              <div className="h-2 w-2 rounded-full bg-warning animate-pulse flex-shrink-0" />
              <span className="text-sm text-foreground-secondary truncate">
                Unsaved changes
              </span>
            </>
          )}
          {isSaving && (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-foreground-tertiary flex-shrink-0" />
              <span className="text-sm text-foreground-secondary truncate">
                Saving...
              </span>
            </>
          )}
          {isSaved && (
            <>
              <Check className="h-4 w-4 text-success flex-shrink-0" />
              <span className="text-sm text-success truncate">
                All changes saved
              </span>
            </>
          )}
          {hasError && (
            <>
              <AlertCircle className="h-4 w-4 text-error flex-shrink-0" />
              <span className="text-sm text-error truncate">
                {errorMessage || "Failed to save"}
              </span>
            </>
          )}
          {saveState === "idle" && (
            <span className="text-sm text-foreground-tertiary truncate">
              No changes
            </span>
          )}
        </div>

        {/* Save button */}
        <Button
          type="button"
          onClick={onSave}
          disabled={disabled || isSaving || saveState === "idle"}
          size="default"
          className="flex-shrink-0"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {savingLabel}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Hook to manage save state with auto-reset
export function useSaveState(initialState: SaveState = "idle") {
  const [saveState, setSaveState] = React.useState<SaveState>(initialState);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const markDirty = React.useCallback(() => {
    setSaveState("dirty");
  }, []);

  const markSaving = React.useCallback(() => {
    setSaveState("saving");
  }, []);

  const markSaved = React.useCallback((autoResetMs: number = 2000) => {
    setSaveState("saved");
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setSaveState("idle");
    }, autoResetMs);
  }, []);

  const markError = React.useCallback(() => {
    setSaveState("error");
  }, []);

  const reset = React.useCallback(() => {
    setSaveState("idle");
  }, []);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    saveState,
    setSaveState,
    markDirty,
    markSaving,
    markSaved,
    markError,
    reset,
  };
}
