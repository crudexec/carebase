"use client";

import * as React from "react";
import { Button } from "./button";
import { AlertTriangle, Loader2, X, Info, Send, Trash2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ConfirmActionVariant = "danger" | "warning" | "info";

interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmActionVariant;
  icon?: React.ReactNode;
  /** Additional warning text shown below the description */
  warningText?: string;
}

const variantConfig = {
  danger: {
    icon: <Trash2 className="w-6 h-6 text-error" />,
    iconBg: "bg-error/10",
    buttonClass: "bg-error hover:bg-error/90 text-white",
    defaultConfirmText: "Delete",
  },
  warning: {
    icon: <AlertTriangle className="w-6 h-6 text-warning" />,
    iconBg: "bg-warning/10",
    buttonClass: "bg-warning hover:bg-warning/90 text-white",
    defaultConfirmText: "Confirm",
  },
  info: {
    icon: <Info className="w-6 h-6 text-primary" />,
    iconBg: "bg-primary/10",
    buttonClass: "bg-primary hover:bg-primary/90 text-white",
    defaultConfirmText: "Confirm",
  },
};

export function ConfirmActionModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  confirmText,
  cancelText = "Cancel",
  variant = "danger",
  icon,
  warningText,
}: ConfirmActionModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);

  const config = variantConfig[variant];

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
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
  }, [isOpen, isLoading]);

  const handleClose = () => {
    if (isLoading) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 150);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      handleClose();
    } finally {
      setIsLoading(false);
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
          disabled={isLoading}
          className="absolute right-4 top-4 p-1 text-foreground-tertiary hover:text-foreground rounded-lg hover:bg-background-secondary transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4", config.iconBg)}>
            {icon || config.icon}
          </div>

          {/* Title */}
          <h2 className="text-lg font-semibold text-center mb-2">{title}</h2>

          {/* Description */}
          <p className="text-foreground-secondary text-center text-sm mb-2">
            {description}
          </p>

          {/* Item name highlight */}
          {itemName && (
            <div className="bg-background-secondary rounded-lg px-3 py-2 text-center mb-4">
              <span className="font-medium text-sm">{itemName}</span>
            </div>
          )}

          {/* Warning text */}
          {warningText && (
            <p className="text-xs text-foreground-tertiary text-center mb-6">
              {warningText}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={handleClose}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              variant="default"
              className={cn("flex-1", config.buttonClass)}
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                confirmText || config.defaultConfirmText
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
