"use client";
import {
  type ColumnDef,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

import { ISetState, QueryType } from "@/types";

interface UseDataTableProps<TData, TValue> {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  totalCount: number;
  sort?: string;
  query: QueryType;
  setQuery: ISetState<QueryType>;
}

export default function useDataTable<TData, TValue>({
  data,
  columns,
  totalCount,
  query,
  setQuery,
  sort,
}: UseDataTableProps<TData, TValue>) {
  const [column, order] = sort?.split(".") ?? [];
  // Table states
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const pagination = useMemo(
    () => ({
      pageIndex: query.pageIndex,
      pageSize: query.pageSize,
    }),
    [query.pageIndex, query.pageSize],
  );

  // Handle server-side sorting
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: column ?? "",
      desc: order === "desc",
    },
  ]);

  const resetPagination = () => {
    setQuery((prev) => ({ ...prev, pageIndex: 0, pageSize: 10 }));
  };

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(totalCount / query.pageSize) || 1,
    state: {
      pagination,
      sorting,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (updater) => {
      if (typeof updater !== "function") return;
      setQuery((prev) => updater({ ...prev }));
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    autoResetPageIndex: false,
  });

  return { table, resetPagination };
}
