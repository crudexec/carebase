"use client";

import { useState } from "react";
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
import { getColumns, UserTableContainer } from "./UsersColumns";
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
import Loader from "../Loader";

export function UsersTable({
  data,
  handlePageChange,
  handleSizeChange,
  total,
  page,
  allUsersLoading,
  isLoading,
  searchEnabled,
  isEmployeeManager,
  onStatusChange,
}: Readonly<{
  data: UserTableContainer[];
  handlePageChange: (mode: "increment" | "decrement") => void;
  handleSizeChange: (newSize: number) => void;
  total: number;
  page: number;
  allUsersLoading: boolean;
  isLoading: boolean;
  searchEnabled: boolean;
  isEmployeeManager?: boolean;
  onStatusChange?: () => void;
}>) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pageSize, setPageSize] = useState<number>(10);

  const columns = getColumns(onStatusChange);

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
    manualPagination: !searchEnabled,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: 0, // Keep the first page
        pageSize: searchEnabled ? data.length : pageSize, // When search is enabled, use data.length
      },
    },
  });

  const maxItemsPerPage = total;

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
              {!allUsersLoading &&
              !isLoading &&
              table.getRowModel().rows?.length ? (
                table.getRowModel().rows?.map((row) => (
                  <TableRow
                    className="cursor-pointer"
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() =>
                      router.push(
                        `${isEmployeeManager ? '/employee-manager' : '/admin'}/employees/${row.original.id}?name=${row.original.employeeName}`
                      )
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
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

              {allUsersLoading && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    <Loader height="h-fit" />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {!allUsersLoading && total !== 0 && !searchEnabled && (
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
                setPageSize(newPageSize);
                if (newPageSize > 5) {
                  handleSizeChange(newPageSize);
                }
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
                Page {page} of {Math.ceil(total / pageSize)}
              </h4>
            </div>
          </div>

          <div className="space-x-2">
            <Button
              disabled={page === 1}
              variant="outline"
              size="icon"
              onClick={() => {
                handlePageChange("decrement");
                table.previousPage();
              }}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                handlePageChange("increment");
                table.nextPage();
              }}
              disabled={page * pageSize >= total}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
