import {
  type ColumnDef,
  flexRender,
  type Table as TanstackTable,
} from "@tanstack/react-table";

import { cn } from "@/lib";
import { ColType, ISetState, QueryType } from "@/types";

import {
  SegmentedControlProps,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui";
import { DataTablePagination } from "./pagination";
import { DataTableSkeleton } from "./skeleton";
import { DataTableToolbar } from "./toolbar";

interface DataTableProps<TData, TValue> {
  table: TanstackTable<TData>;
  columns: ColumnDef<TData, TValue>[];
  rawColumns: ColType[];
  setQuery: ISetState<QueryType>;
  search: string;
  setSearch: (search: string) => void;
  fetching?: boolean;
  segmentedControl?: SegmentedControlProps;
  extraToolbar?: React.ReactNode;
  tableKey: string;
  title?: string;
  subtitle?: string | React.ReactNode;
  onRowClick?: (row: TData) => void;
  className?: string;
  modal?: boolean;
}

export function DataTable<TData, TValue>({
  table,
  columns,
  fetching,
  segmentedControl,
  extraToolbar,
  tableKey,
  title,
  rawColumns,
  subtitle,
  onRowClick,
  className,
  setQuery,
  setSearch,
  search,
  modal = false,
}: DataTableProps<TData, TValue>) {
  return (
    <div className="w-full space-y-2.5 overflow-auto">
      <div>
        <div className="capitalize text-xl md:text-2xl font-bold tracking-tight">
          {title}
        </div>
        <div className="text-muted-foreground text-base font-semibold">
          {subtitle}
        </div>
      </div>

      <DataTableToolbar
        table={table}
        segmentedControl={segmentedControl}
        extraToolbar={extraToolbar}
        tableKey={tableKey}
        columns={rawColumns}
        setQuery={setQuery}
        search={search}
        setSearch={setSearch}
        modal={modal}
      />
      {fetching ? (
        <DataTableSkeleton columnCount={12} filterableColumnCount={0} />
      ) : (
        <>
          <Table
            boundingClass={`rounded-md border h-[calc(100vh-330px)] md:h-[calc(100vh-250px)] scrollbar-hide ${className}`}
          >
            <TableHeader className="sticky top-0 bg-background z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          (header.id === "select" || header.id === "actions") &&
                            "sticky left-0 bg-background dark:group-hover:bg-[#0F1829] group-hover:bg-[#F8F9FB]",
                          header.id === "select"
                            ? "left-0"
                            : header.id === "actions" && "right-0",
                        )}
                        onClick={() => {
                          header.column.getToggleSortingHandler();
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table && table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row?.getIsSelected() && "selected"}
                    onClick={() => onRowClick && onRowClick(row.original)}
                    className={`${onRowClick && "cursor-pointer"}`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          (cell.column.id === "select" ||
                            cell.column.id === "actions") &&
                            "sticky bg-background dark:group-hover:bg-[#0F1829] group-hover:bg-[#F8F9FB] group-data-[state=selected]:bg-muted dark:group-data-[state=selected]:bg-muted",
                          cell.column.id === "select"
                            ? "left-0"
                            : cell.column.id === "actions" && "right-0",
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
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
          <div className="space-y-2.5">
            <DataTablePagination table={table} setQuery={setQuery} />
          </div>
        </>
      )}
    </div>
  );
}
