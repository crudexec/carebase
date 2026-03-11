"use client";

import * as React from "react";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/state/hooks";
import { openSpecificNeedsPdfModal } from "@/state/features/specific-needs-pdf-modal/specificNeedsPdfModalSlice";
import { ClientDocumentTypes } from "./types";
import { columns } from "./columns";

interface FormsTableProps {
  data: ClientDocumentTypes[];
  admin?: boolean;
  onSpecificNeedsClick: () => Promise<void>;
}

export function FormsTable({
  data,
  admin,
  onSpecificNeedsClick,
}: FormsTableProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 11,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    manualPagination: false,
  });

  return (
    <div className="relative w-full border rounded-lg">
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  className="cursor-pointer"
                  data-testid={`form-row-${row.original.document
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                  onClick={() => {
                    if (row.original.document === "Specific Needs") {
                      if (row.original.progress === 100) {
                        dispatch(
                          openSpecificNeedsPdfModal({
                            id: row.original.formId,
                          })
                        );
                      } else {
                        onSpecificNeedsClick();
                      }
                    } else {
                      router.push(row.original.route);
                    }
                  }}
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      data-testid={`${row.original.document
                        .toLowerCase()
                        .replace(/\s+/g, "-")}-${cell.column.id}`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
