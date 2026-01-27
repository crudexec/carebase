import { CheckedState } from "@radix-ui/react-checkbox";
import type {
  CellContext,
  Column,
  ColumnDef,
  HeaderContext,
  Row,
} from "@tanstack/react-table";
import dayjs from "dayjs";
import { ReactNode } from "react";

import { ColType } from "@/types";

import { Checkbox } from "../ui";
import { DataTableColumnHeader } from "./column-header";

export function fetchTableColumnDefs<T>({
  columns,
  sortable,
  hideable,
  actionsCell,
  requestSort,
  selectable = true,
  tableKey,
  modal,
}: {
  columns: ColType[];
  tableKey?: string;
  sortable?: string;
  hideable?: string;
  actionsCell?: (row: Row<T>) => ReactNode;
  requestSort?: (key: string, value: string) => void;
  modal?: boolean;
  selectable?: boolean;
}): ColumnDef<T, unknown>[] {
  return [
    selectable
      ? {
          id: "select",
          header: ({ table }: HeaderContext<T, unknown>) => (
            <Checkbox
              checked={table?.getIsAllPageRowsSelected()}
              onCheckedChange={(value: CheckedState) => {
                table.toggleAllPageRowsSelected(!!value);
              }}
              aria-label="Select all"
              className="translate-y-[2px]"
            />
          ),
          cell: ({ row }: CellContext<T, unknown>) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value: CheckedState) => {
                row.toggleSelected(!!value);
              }}
              aria-label="Select row"
              className="translate-y-[2px]"
              disabled={
                (
                  row.original as {
                    id: string;
                  }
                )?.id?.split(":")[0] === "administrator"
              }
              onClick={(e) => e.stopPropagation()}
            />
          ),
          enableSorting: false,
          enableHiding: false,
        }
      : ({} as ColumnDef<T, unknown>),
    ...columns.map((col) => {
      const returnValue = (row: Row<T>) => {
        const value = row.getValue(col.key) as string;
        switch (col.key) {
          case "createdAt":
          case "updatedAt":
          case "dob":
            return value ? dayjs(value).format("MMM D, YYYY") : "-";
          default:
            return value;
        }
      };
      return {
        accessorKey: col.key,
        header: ({ column }: { column: Column<T> }) => (
          <DataTableColumnHeader
            column={column}
            title={col.label}
            enableHiding={
              col.hideable
                ? col.hideable === "enabled"
                : hideable
                  ? hideable === "enabled"
                  : true
            }
            sortKey={col.key}
            requestSort={requestSort}
            tableKey={tableKey}
            modal={modal}
          />
        ),
        cell: ({ row }: CellContext<T, unknown>) => (
          <div className="w-auto max-w-80 line-clamp-2">
            {returnValue(row) || "-"}
          </div>
        ),
        enableSorting: col.sortable
          ? col.sortable === "enabled"
          : sortable
            ? sortable === "enabled"
            : true,
        enableHiding: col.hideable
          ? col.hideable === "enabled"
          : hideable
            ? hideable === "enabled"
            : true,
      };
    }),
    actionsCell
      ? {
          id: "actions",
          cell: ({ row }: CellContext<T, unknown>) => actionsCell(row),
        }
      : ({} as ColumnDef<T, unknown>),
  ].filter((value) => Object.keys(value).length !== 0) as ColumnDef<
    T,
    unknown
  >[];
}
