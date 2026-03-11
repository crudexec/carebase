"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { MatrixGridConfig, MatrixGridRow } from "@/lib/oasis/types";

interface MatrixGridValue {
  [rowId: string]: {
    [columnId: string]: string | number | null;
  };
}

interface MatrixGridFieldProps {
  value: MatrixGridValue | null;
  onChange: (value: MatrixGridValue) => void;
  config: MatrixGridConfig;
  disabled?: boolean;
  error?: boolean;
  id?: string;
}

export function MatrixGridField({
  value,
  onChange,
  config,
  disabled,
  error,
  id,
}: MatrixGridFieldProps) {
  const { columns, rows, allowNA = false, naValue = "NA" } = config;

  const handleCellChange = (
    rowId: string,
    columnId: string,
    cellValue: string | number | null
  ) => {
    const newValue = { ...value };
    if (!newValue[rowId]) {
      newValue[rowId] = {};
    }
    newValue[rowId][columnId] = cellValue;
    onChange(newValue);
  };

  const getCellValue = (rowId: string, columnId: string): string | number | null => {
    return value?.[rowId]?.[columnId] ?? null;
  };

  return (
    <div
      id={id}
      className={cn(
        "overflow-x-auto rounded-lg border",
        error ? "border-error" : "border-border"
      )}
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-background-secondary">
            <th className="px-3 py-2 text-left font-medium text-foreground-secondary border-r border-border">
              {/* Row header column */}
            </th>
            {columns.map((col) => (
              <th
                key={col.id}
                className="px-3 py-2 text-center font-medium text-foreground-secondary border-r border-border last:border-r-0 min-w-[80px]"
              >
                <div className="flex flex-col items-center">
                  <span className="font-semibold">{col.code || col.id}</span>
                  {col.label && (
                    <span className="text-xs font-normal text-foreground-tertiary mt-0.5">
                      {col.label}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row: MatrixGridRow, rowIndex) => (
            <tr
              key={row.id}
              className={cn(
                "border-t border-border",
                rowIndex % 2 === 1 && "bg-background-secondary/50"
              )}
            >
              <td className="px-3 py-2 font-medium border-r border-border">
                <div className="flex flex-col">
                  <span className="text-foreground">{row.code || row.id}</span>
                  {row.label && (
                    <span className="text-xs text-foreground-tertiary">
                      {row.label}
                    </span>
                  )}
                </div>
              </td>
              {columns.map((col) => {
                const cellValue = getCellValue(row.id, col.id);
                const cellOptions = col.options || [];

                // Skip this cell if row has skipColumns
                if (row.skipColumns?.includes(col.id)) {
                  return (
                    <td
                      key={col.id}
                      className="px-3 py-2 text-center border-r border-border last:border-r-0 bg-background-tertiary/30"
                    >
                      <span className="text-foreground-tertiary">—</span>
                    </td>
                  );
                }

                return (
                  <td
                    key={col.id}
                    className="px-3 py-2 text-center border-r border-border last:border-r-0"
                  >
                    {cellOptions.length > 0 ? (
                      <select
                        value={cellValue?.toString() ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleCellChange(
                            row.id,
                            col.id,
                            val === "" ? null : isNaN(Number(val)) ? val : Number(val)
                          );
                        }}
                        disabled={disabled}
                        className={cn(
                          "w-full rounded border bg-background px-2 py-1 text-sm text-center",
                          "focus:outline-none focus:ring-1 focus:ring-primary/50",
                          disabled && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <option value="">-</option>
                        {cellOptions.map((opt) => (
                          <option key={String(opt.value)} value={opt.value}>
                            {opt.label || String(opt.value)}
                          </option>
                        ))}
                        {allowNA && <option value={naValue}>NA</option>}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={cellValue?.toString() ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleCellChange(
                            row.id,
                            col.id,
                            val === "" ? null : val
                          );
                        }}
                        disabled={disabled}
                        className={cn(
                          "w-16 rounded border bg-background px-2 py-1 text-sm text-center",
                          "focus:outline-none focus:ring-1 focus:ring-primary/50",
                          disabled && "opacity-50 cursor-not-allowed"
                        )}
                      />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
