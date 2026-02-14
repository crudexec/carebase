"use client";

import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleWidgetProps {
  /** Unique ID for localStorage persistence */
  id: string;
  /** Widget title */
  title: string;
  /** Icon component to display */
  icon: React.ReactNode;
  /** Optional badge/count to show next to title */
  badge?: React.ReactNode;
  /** Optional actions to show in header (e.g., "View All" link) */
  headerActions?: React.ReactNode;
  /** Whether to start collapsed by default (only used on first render) */
  defaultCollapsed?: boolean;
  /** Main content of the widget */
  children: React.ReactNode;
  /** Optional footer content */
  footer?: React.ReactNode;
  /** Custom class for the outer container */
  className?: string;
  /** Custom class for the header */
  headerClassName?: string;
  /** Custom class for the content area */
  contentClassName?: string;
  /** Variant styling */
  variant?: "default" | "warning" | "success" | "error";
}

const STORAGE_KEY_PREFIX = "carebase-widget-collapsed-";

// Custom hook for localStorage with SSR support to prevent hydration mismatch
function useLocalStorageState(key: string, defaultValue: boolean): [boolean, (value: boolean) => void] {
  const getSnapshot = React.useCallback(() => {
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      return stored === "true";
    }
    return defaultValue;
  }, [key, defaultValue]);

  const getServerSnapshot = React.useCallback(() => defaultValue, [defaultValue]);

  const subscribe = React.useCallback((callback: () => void) => {
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
  }, []);

  const storedValue = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = React.useCallback((value: boolean) => {
    localStorage.setItem(key, String(value));
    // Dispatch storage event to trigger re-render
    window.dispatchEvent(new StorageEvent("storage", { key }));
  }, [key]);

  return [storedValue, setValue];
}

export function CollapsibleWidget({
  id,
  title,
  icon,
  badge,
  headerActions,
  defaultCollapsed = false,
  children,
  footer,
  className,
  headerClassName,
  contentClassName,
  variant = "default",
}: CollapsibleWidgetProps) {
  const storageKey = STORAGE_KEY_PREFIX + id;
  const [isCollapsed, setIsCollapsed] = useLocalStorageState(storageKey, defaultCollapsed);

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  const variantStyles = {
    default: {
      container: "border-border-light bg-background-tertiary",
      header: "border-border-light",
      icon: "text-primary",
    },
    warning: {
      container: "border-orange-200 bg-orange-50/50",
      header: "border-orange-200",
      icon: "text-orange-500",
    },
    success: {
      container: "border-success/30 bg-success/5",
      header: "border-success/30",
      icon: "text-success",
    },
    error: {
      container: "border-error/30 bg-error/5",
      header: "border-error/30",
      icon: "text-error",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "rounded-lg border h-full flex flex-col",
        styles.container,
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-3 border-b",
          styles.header,
          headerClassName
        )}
      >
        <button
          onClick={toggleCollapsed}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          type="button"
          aria-expanded={!isCollapsed}
          aria-controls={`widget-content-${id}`}
        >
          <span className={styles.icon}>{icon}</span>
          <h3 className="font-semibold text-foreground">{title}</h3>
          {badge}
          {isCollapsed ? (
            <ChevronDown className="w-4 h-4 text-foreground-secondary ml-1" />
          ) : (
            <ChevronUp className="w-4 h-4 text-foreground-secondary ml-1" />
          )}
        </button>
        {headerActions && (
          <div className="flex items-center gap-2">{headerActions}</div>
        )}
      </div>

      {/* Content */}
      <div
        id={`widget-content-${id}`}
        className={cn(
          "transition-all duration-200 ease-in-out overflow-hidden",
          isCollapsed ? "max-h-0" : "max-h-[2000px] flex-1"
        )}
      >
        <div className={cn("p-2", contentClassName)}>{children}</div>
        {footer && !isCollapsed && (
          <div className={cn("px-4 py-3 border-t mt-auto", styles.header)}>
            {footer}
          </div>
        )}
      </div>

      {/* Collapsed summary */}
      {isCollapsed && (
        <div className="px-4 py-2 text-xs text-foreground-tertiary italic">
          Click header to expand
        </div>
      )}
    </div>
  );
}
