"use client";

import * as React from "react";
import { Button } from "./button";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  confirmText = "Delete",
  cancelText = "Cancel",
}: ConfirmDeleteModalProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeleting) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, isDeleting]);

  const handleClose = () => {
    if (isDeleting) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 150);
  };

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      handleClose();
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/50 transition-opacity duration-150",
          isClosing ? "opacity-0" : "opacity-100"
        )}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "relative bg-background rounded-xl shadow-xl w-full max-w-md mx-4 transition-all duration-150",
          isClosing
            ? "opacity-0 scale-95"
            : "opacity-100 scale-100 animate-in fade-in zoom-in-95"
        )}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={isDeleting}
          className="absolute right-4 top-4 p-1 text-foreground-tertiary hover:text-foreground rounded-lg hover:bg-background-secondary transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-error" />
          </div>

          {/* Title */}
          <h2 className="text-lg font-semibold text-center mb-2">{title}</h2>

          {/* Description */}
          <p className="text-foreground-secondary text-center text-sm mb-2">
            {description}
          </p>

          {/* Item name highlight */}
          {itemName && (
            <div className="bg-background-secondary rounded-lg px-3 py-2 text-center mb-6">
              <span className="font-medium text-sm">{itemName}</span>
            </div>
          )}

          {/* Warning */}
          <p className="text-xs text-foreground-tertiary text-center mb-6">
            This action cannot be undone.
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={handleClose}
              disabled={isDeleting}
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              variant="default"
              className="flex-1 bg-error hover:bg-error/90 text-white"
              onClick={handleConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                confirmText
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
