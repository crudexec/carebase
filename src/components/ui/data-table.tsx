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
      return <ChevronsUpDown className="w-3 h-3 text-gray-400" />;
    }
    if (sortDirection === "asc") {
      return <ChevronUp className="w-3 h-3 text-blue-600" />;
    }
    if (sortDirection === "desc") {
      return <ChevronDown className="w-3 h-3 text-blue-600" />;
    }
    return <ChevronsUpDown className="w-3 h-3 text-gray-400" />;
  };

  const getCellValue = (row: T, column: ColumnDef<T>): React.ReactNode => {
    if (column.cell) {
      return column.cell(row);
    }
    if (column.accessorKey) {
      const value = getNestedValue(row, column.accessorKey as string);
      if (value === null || value === undefined) return <span className="text-gray-400">-</span>;
      return String(value);
    }
    return <span className="text-gray-400">-</span>;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("bg-white rounded border border-gray-200", className)}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className={cn("bg-white rounded border border-gray-200", className)}>
        <div className="flex flex-col items-center justify-center py-12 px-4">
          {emptyState || (
            <>
              {emptyIcon && (
                <div className="text-gray-400 mb-3">{emptyIcon}</div>
              )}
              <p className="text-gray-500 text-sm text-center">{emptyMessage}</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded border border-gray-200 overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className={cn(
            "bg-gray-50 border-b border-gray-200",
            stickyHeader && "sticky top-0 z-10"
          )}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={cn(
                    "text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600 uppercase tracking-wide",
                    column.align === "center" && "text-center",
                    column.align === "right" && "text-right",
                    column.hideOnMobile && "hidden md:table-cell",
                    column.sortable && onSortChange && "cursor-pointer select-none hover:text-gray-900 hover:bg-gray-100 transition-colors",
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
                <th className="text-center px-3 py-1.5 text-[10px] font-semibold text-gray-600 uppercase tracking-wide w-16">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => {
              const isEven = index % 2 === 0;
              return (
                <tr
                  key={getRowKey(row)}
                  className={cn(
                    "border-b border-gray-100 transition-colors",
                    isEven ? "bg-white" : "bg-gray-50/50",
                    clickableRows && onRowClick && "cursor-pointer hover:bg-blue-50",
                    getRowClassName?.(row)
                  )}
                  onClick={() => clickableRows && onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={cn(
                        "px-3 py-1.5 text-[11px] text-gray-700",
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
                      className="px-3 py-1.5 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {rowActions(row)}
                    </td>
                  )}
                </tr>
              );
            })}
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
    primary: "bg-blue-100 text-blue-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    error: "bg-red-100 text-red-700",
    default: "bg-gray-100 text-gray-700",
  };

  return (
    <span className={cn(
      "inline-block px-1.5 py-0.5 rounded text-[10px] font-medium",
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
  if (!date) return <span className="text-gray-400">-</span>;

  const dateObj = typeof date === "string" ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    month: format === "long" ? "long" : "short",
    day: "numeric",
    year: "numeric",
    ...(showTime && { hour: "2-digit", minute: "2-digit" }),
  };

  return (
    <span className="text-gray-700 whitespace-nowrap text-[11px]">
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

  if (!name && !email) return <span className="text-gray-400">-</span>;

  return (
    <div className="flex items-center gap-2">
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          className="w-6 h-6 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <span className="text-[10px] font-medium text-green-700">
            {initials || "?"}
          </span>
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-900 truncate">{name || email}</p>
        {subtitle && (
          <p className="text-[10px] text-gray-500 truncate">{subtitle}</p>
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

  if (!start && !end) return <span className="text-gray-400">-</span>;
  if (!end) return <span className="text-gray-700 text-[11px]">{start} - Present</span>;

  return (
    <span className="text-gray-700 whitespace-nowrap text-[11px]">
      {start} - {end}
    </span>
  );
}
