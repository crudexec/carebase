"use client";

import * as React from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortDirection = "asc" | "desc" | null;

export interface ColumnDef<T> {
  /** Unique identifier for the column */
  id: string;
  /** Header label */
  header: string;
  /** Key to access data (supports dot notation) */
  accessorKey?: keyof T | string;
  /** Custom cell renderer */
  cell?: (row: T) => React.ReactNode;
  /** Whether this column is sortable */
  sortable?: boolean;
  /** Column width (CSS value) */
  width?: string;
  /** Minimum width (CSS value) */
  minWidth?: string;
  /** Alignment */
  align?: "left" | "center" | "right";
  /** Hide on mobile */
  hideOnMobile?: boolean;
  /** Additional class names for the cell */
  className?: string;
}

export interface DataTableProps<T> {
  /** Data to display */
  data: T[];
  /** Column definitions */
  columns: ColumnDef<T>[];
  /** Loading state */
  isLoading?: boolean;
  /** Key extractor for rows */
  getRowKey: (row: T) => string;
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Empty state content */
  emptyState?: React.ReactNode;
  /** Custom empty icon */
  emptyIcon?: React.ReactNode;
  /** Empty message */
  emptyMessage?: string;
  /** Current sort column */
  sortColumn?: string | null;
  /** Current sort direction */
  sortDirection?: SortDirection;
  /** Sort change handler */
  onSortChange?: (column: string, direction: SortDirection) => void;
  /** Whether rows are clickable (shows hover effect) */
  clickableRows?: boolean;
  /** Row actions column (rendered at the end) */
  rowActions?: (row: T) => React.ReactNode;
  /** Additional class for table container */
  className?: string;
  /** Sticky header */
  stickyHeader?: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Custom row class name function */
  getRowClassName?: (row: T) => string;
}

// Helper to access nested properties
function getNestedValue<T>(obj: T, path: string): unknown {
  return path.split(".").reduce((acc: unknown, part) => {
    if (acc && typeof acc === "object" && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

export function DataTable<T>({
  data,
  columns,
  isLoading = false,
  getRowKey,
  onRowClick,
  emptyState,
  emptyIcon,
  emptyMessage = "No data available",
  sortColumn,
  sortDirection,
  onSortChange,
  clickableRows = true,
  rowActions,
  className,
  stickyHeader = false,
  compact = false,
  getRowClassName,
}: DataTableProps<T>) {
  const handleSort = (columnId: string) => {
    if (!onSortChange) return;

    let newDirection: SortDirection = "asc";
    if (sortColumn === columnId) {
      if (sortDirection === "asc") {
        newDirection = "desc";
      } else if (sortDirection === "desc") {
        newDirection = null;
      }
    }
    onSortChange(columnId, newDirection);
  };

  const renderSortIcon = (columnId: string) => {
    if (sortColumn !== columnId) {
      return <ChevronsUpDown className="w-4 h-4 text-foreground-tertiary" />;
    }
    if (sortDirection === "asc") {
      return <ChevronUp className="w-4 h-4 text-primary" />;
    }
    if (sortDirection === "desc") {
      return <ChevronDown className="w-4 h-4 text-primary" />;
    }
    return <ChevronsUpDown className="w-4 h-4 text-foreground-tertiary" />;
  };

  const getCellValue = (row: T, column: ColumnDef<T>): React.ReactNode => {
    if (column.cell) {
      return column.cell(row);
    }
    if (column.accessorKey) {
      const value = getNestedValue(row, column.accessorKey as string);
      if (value === null || value === undefined) return "-";
      return String(value);
    }
    return "-";
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("rounded-lg border border-border bg-background", className)}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className={cn("rounded-lg border border-border bg-background", className)}>
        <div className="flex flex-col items-center justify-center py-16 px-4">
          {emptyState || (
            <>
              {emptyIcon && (
                <div className="text-foreground-tertiary mb-4">{emptyIcon}</div>
              )}
              <p className="text-foreground-secondary text-center">{emptyMessage}</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border border-border bg-background overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className={cn(
            "bg-background-secondary/50 border-b border-border",
            stickyHeader && "sticky top-0 z-10"
          )}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={cn(
                    "text-left text-xs font-semibold text-foreground-secondary uppercase tracking-wider",
                    compact ? "px-3 py-2" : "px-4 py-3",
                    column.align === "center" && "text-center",
                    column.align === "right" && "text-right",
                    column.hideOnMobile && "hidden md:table-cell",
                    column.sortable && onSortChange && "cursor-pointer select-none hover:bg-background-secondary/80 transition-colors",
                    column.className
                  )}
                  style={{
                    width: column.width,
                    minWidth: column.minWidth,
                  }}
                  onClick={() => column.sortable && handleSort(column.id)}
                >
                  <div className={cn(
                    "flex items-center gap-1",
                    column.align === "center" && "justify-center",
                    column.align === "right" && "justify-end"
                  )}>
                    <span>{column.header}</span>
                    {column.sortable && onSortChange && renderSortIcon(column.id)}
                  </div>
                </th>
              ))}
              {rowActions && (
                <th className={cn(
                  "text-right text-xs font-semibold text-foreground-secondary uppercase tracking-wider",
                  compact ? "px-3 py-2" : "px-4 py-3",
                  "w-20"
                )}>
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row) => (
              <tr
                key={getRowKey(row)}
                className={cn(
                  "transition-all duration-300",
                  clickableRows && onRowClick && "cursor-pointer hover:bg-background-secondary/50",
                  getRowClassName?.(row)
                )}
                onClick={() => clickableRows && onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={cn(
                      "text-sm text-foreground",
                      compact ? "px-3 py-2" : "px-4 py-3",
                      column.align === "center" && "text-center",
                      column.align === "right" && "text-right",
                      column.hideOnMobile && "hidden md:table-cell",
                      column.className
                    )}
                  >
                    {getCellValue(row, column)}
                  </td>
                ))}
                {rowActions && (
                  <td
                    className={cn(
                      "text-right",
                      compact ? "px-3 py-2" : "px-4 py-3"
                    )}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {rowActions(row)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Utility components for common cell types

interface StatusCellProps {
  status: string;
  label?: string;
  variant?: "primary" | "success" | "warning" | "error" | "default";
}

export function StatusCell({ status, label, variant = "default" }: StatusCellProps) {
  const variantClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    error: "bg-error/10 text-error",
    default: "bg-foreground-tertiary/10 text-foreground-secondary",
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
      variantClasses[variant]
    )}>
      {label || status}
    </span>
  );
}

interface DateCellProps {
  date: string | Date | null;
  format?: "short" | "long" | "relative";
  showTime?: boolean;
}

export function DateCell({ date, format = "short", showTime = false }: DateCellProps) {
  if (!date) return <span className="text-foreground-tertiary">-</span>;

  const dateObj = typeof date === "string" ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    month: format === "long" ? "long" : "short",
    day: "numeric",
    year: "numeric",
    ...(showTime && { hour: "2-digit", minute: "2-digit" }),
  };

  return (
    <span className="text-foreground-secondary whitespace-nowrap">
      {dateObj.toLocaleDateString("en-US", options)}
    </span>
  );
}

interface UserCellProps {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  subtitle?: string;
}

export function UserCell({ firstName, lastName, email, avatar, subtitle }: UserCellProps) {
  const name = [firstName, lastName].filter(Boolean).join(" ");
  const initials = [firstName?.[0], lastName?.[0]].filter(Boolean).join("").toUpperCase();

  if (!name && !email) return <span className="text-foreground-tertiary">-</span>;

  return (
    <div className="flex items-center gap-3">
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          className="w-8 h-8 rounded-full object-cover"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
          {initials || "?"}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{name || email}</p>
        {subtitle && (
          <p className="text-xs text-foreground-secondary truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

interface DateRangeCellProps {
  startDate: string | Date | null;
  endDate: string | Date | null;
}

export function DateRangeCell({ startDate, endDate }: DateRangeCellProps) {
  const formatDate = (date: string | Date | null) => {
    if (!date) return null;
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const start = formatDate(startDate);
  const end = formatDate(endDate);

  if (!start && !end) return <span className="text-foreground-tertiary">-</span>;
  if (!end) return <span className="text-foreground-secondary">{start} - Present</span>;

  return (
    <span className="text-foreground-secondary whitespace-nowrap">
      {start} - {end}
    </span>
  );
}
