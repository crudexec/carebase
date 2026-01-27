"use client";
import { ColumnDef, Row } from "@tanstack/react-table";
import { useEffect, useMemo } from "react";

import { fetchTableColumnDefs } from "@/components/data-table";
import { getOrStoreColumns } from "@/lib";
import { SearchParamsType } from "@/schema";
import { ColType, ISetState, QueryType } from "@/types";

import useDataTable from "./useDataTable";
import usePaginateSortFilter from "./usePaginateSortFilter";

type TableProps<T> = {
  data: T[];
  columns: ColType[];
  query: QueryType;
  setQuery: ISetState<QueryType>;
  name: string;
  resetTableState?: string;
  columnProps?: {
    selectable?: boolean;
    actionsCell?: (row: Row<T>) => React.ReactNode;
    modal?: boolean;
  };
};

const useTable = <T extends Record<string, unknown>>({
  data,
  columns,
  query,
  setQuery,
  name,
  resetTableState,
  columnProps,
}: TableProps<T>) => {
  const {
    data: filteredResult,
    total,
    sortConfig,
    resetSort,
    requestSort,
  } = usePaginateSortFilter(data, {
    search: query as SearchParamsType,
    pageIndex: query?.pageIndex,
    pageSize: query?.pageSize,
    filteredKeys: columns.map((column) => column.key),
  });

  const tableColumns = useMemo<ColumnDef<T, unknown>[]>(
    () =>
      fetchTableColumnDefs({
        tableKey: name,
        columns: columns,
        requestSort,
        ...columnProps,
      }),
    [columnProps, columns, name, requestSort],
  );

  const { table, resetPagination } = useDataTable({
    data: filteredResult,
    columns: tableColumns,
    totalCount: Number(total),
    query: query,
    setQuery: setQuery,
    sort: `${sortConfig?.key}.${sortConfig?.direction}`,
  });

  useEffect(() => {
    const col = getOrStoreColumns(columns, name);
    table
      .getAllColumns()
      .filter(
        (column) =>
          typeof column.accessorFn !== "undefined" && column.getCanHide(),
      )
      .map((column) => {
        column.toggleVisibility(col?.find((c) => c.key === column.id)?.visible);
      });
  }, [columns, name, table]);

  useEffect(() => {
    table.resetSorting();
    resetPagination();
    resetSort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetTableState]);

  return { table, resetPagination, tableColumns, tableKey: name };
};

export default useTable;
