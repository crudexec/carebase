"use client";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import { Column, type Table } from "@tanstack/react-table";

import { cn, toggleAllColumns, toggleColumn } from "@/lib";
import { ColType } from "@/types";

import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  Switch,
} from "../ui";

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
  name?: string;
  columns: ColType[];
  modal?: boolean;
}

export function DataTableViewOptions<TData>({
  table,
  name,
  columns: allColumns,
  modal,
}: DataTableViewOptionsProps<TData>) {
  const columns = table
    .getAllColumns()
    .filter(
      (column) =>
        typeof column.accessorFn !== "undefined" && column.getCanHide(),
    );

  const getHeaderLabel = (column: Column<TData>): string => {
    const columnData = allColumns.find((col) => col.key === column.id);
    if (columnData) {
      return columnData.label;
    }
    return column.id;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onSelect={(e) => e.preventDefault()}>
        <Button
          aria-label={"Toggle columns"}
          variant="secondary"
          size="sm"
          className="ml-auto h-8 lg:flex"
        >
          <MixerHorizontalIcon className="size-4" />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px]" modal={modal}>
        <DropdownMenuLabel className="flex items-center gap-3">
          Toggle Columns
          <Switch
            size="md"
            onClick={() => {
              table.toggleAllColumnsVisible(!table.getIsAllColumnsVisible());
              if (!table.getIsAllColumnsVisible()) {
                toggleAllColumns(name as string);
              } else {
                toggleAllColumns(name as string, true);
              }
            }}
            checked={table.getIsAllColumnsVisible()}
          />
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div
          className={cn(
            columns.length > 15 &&
              'className="min-w-[150px] max-h-[500px] max-w-[400px] grid grid-cols-2  overflow-auto scrollbar-hide',
          )}
        >
          {columns.map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => {
                  toggleColumn(name as string, {
                    key: column.id,
                    visible: !!value,
                  });
                  column.toggleVisibility(!!value);
                }}
              >
                {getHeaderLabel(column)}
              </DropdownMenuCheckboxItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
