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

import { columns, ClientsTableContainer } from "./ClientsColumns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export function ClientsTable({
  data,
  height,
  customColumns,
}: Readonly<{
  data: ClientsTableContainer[];
  height?: string;
  customColumns?: any;
}>) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns: customColumns ?? columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    manualPagination: false,
  });

  const maxItemsPerPage = data.length;

  return (
    <div>
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
                table.getRowModel().rows?.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => router.push(row.original.route)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        <div>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="overflow-auto bg-white border rounded-md border-gray-200 p-4 flex gap-5 items-center justify-end">
        <div className="flex gap-2 items-center">
          <h4 className="text-[14px] font-[500] text[#09090B] hidden md:inline">
            Rows per page
          </h4>
          <Select
            defaultValue={table.initialState.pagination.pageSize.toString()}
            onValueChange={(value) => {
              const newPageSize = parseInt(value, 10);
              table.setPageSize(newPageSize);
            }}
          >
            <SelectTrigger className="md:w-[120px]">
              <SelectValue
                placeholder={table.initialState.pagination.pageSize.toString()}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {Array.from(Array(maxItemsPerPage), (_, index) => {
                  const pageSize = (index + 1) * 1;
                  return (
                    <SelectItem key={pageSize} value={pageSize.toString()}>
                      {pageSize}{" "}
                      <span className="hidden md:inline">per page</span>
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div>
          <div>
            <h4 className="text-[14px] font-[500] text[#09090B]">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </h4>
          </div>
        </div>

        <div className="space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
