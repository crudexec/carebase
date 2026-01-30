"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SheetContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SheetContext = React.createContext<SheetContextValue | null>(null);

function useSheetContext() {
  const context = React.useContext(SheetContext);
  if (!context) {
    throw new Error("Sheet components must be used within a Sheet provider");
  }
  return context;
}

interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Sheet({ open = false, onOpenChange, children }: SheetProps) {
  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      onOpenChange?.(newOpen);
    },
    [onOpenChange]
  );

  return (
    <SheetContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      {children}
    </SheetContext.Provider>
  );
}

interface SheetTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

export function SheetTrigger({ children, asChild, className }: SheetTriggerProps) {
  const { onOpenChange } = useSheetContext();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: () => onOpenChange(true),
    });
  }

  return (
    <button className={className} onClick={() => onOpenChange(true)}>
      {children}
    </button>
  );
}

interface SheetContentProps {
  children: React.ReactNode;
  side?: "left" | "right";
  className?: string;
}

export function SheetContent({ children, side = "right", className }: SheetContentProps) {
  const { open, onOpenChange } = useSheetContext();
  const [mounted, setMounted] = React.useState(false);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (open) {
      setVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      const timer = setTimeout(() => setVisible(false), 300);
      document.body.style.overflow = "";
      return () => clearTimeout(timer);
    }
  }, [open]);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onOpenChange]);

  if (!mounted || !visible) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Sheet panel */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "fixed inset-y-0 z-50 flex flex-col bg-background shadow-2xl transition-transform duration-300 ease-out",
          side === "right" && "right-0 w-full max-w-md border-l border-border",
          side === "left" && "left-0 w-full max-w-md border-r border-border",
          open
            ? "translate-x-0"
            : side === "right"
            ? "translate-x-full"
            : "-translate-x-full",
          className
        )}
      >
        {children}
      </div>
    </>,
    document.body
  );
}

interface SheetHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function SheetHeader({ children, className }: SheetHeaderProps) {
  const { onOpenChange } = useSheetContext();

  return (
    <div className={cn("flex items-center justify-between p-4 border-b border-border", className)}>
      <div className="flex-1">{children}</div>
      <button
        onClick={() => onOpenChange(false)}
        className="p-2 rounded-md hover:bg-background-secondary transition-colors"
        aria-label="Close"
      >
        <X className="w-5 h-5 text-foreground-secondary" />
      </button>
    </div>
  );
}

interface SheetTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function SheetTitle({ children, className }: SheetTitleProps) {
  return (
    <h2 className={cn("text-lg font-semibold text-foreground", className)}>
      {children}
    </h2>
  );
}

interface SheetDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function SheetDescription({ children, className }: SheetDescriptionProps) {
  return (
    <p className={cn("text-sm text-foreground-secondary", className)}>
      {children}
    </p>
  );
}

interface SheetBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function SheetBody({ children, className }: SheetBodyProps) {
  return (
    <div className={cn("flex-1 overflow-y-auto", className)}>
      {children}
    </div>
  );
}

interface SheetFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function SheetFooter({ children, className }: SheetFooterProps) {
  return (
    <div className={cn("p-4 border-t border-border bg-background-secondary", className)}>
      {children}
    </div>
  );
}
