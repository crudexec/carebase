"use client";
import type { Table } from "@tanstack/react-table";
import React, { useEffect } from "react";

import { DataTableViewOptions } from "@/components/data-table/view-options";
import {
  Input,
  SegmentedControl,
  SegmentedControlProps,
} from "@/components/ui";
import { useDebounce } from "@/hooks";
import { ColType, ISetState, QueryType } from "@/types";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  segmentedControl?: SegmentedControlProps;
  extraToolbar?: React.ReactNode;
  tableKey?: string;
  columns: ColType[];
  setQuery: ISetState<QueryType>;
  search: string;
  setSearch: (search: string) => void;
  modal?: boolean;
}

const DataTableToolbar = <TData,>({
  table,
  segmentedControl,
  extraToolbar,
  tableKey,
  columns,
  setSearch,
  search,
  setQuery,
  modal,
}: DataTableToolbarProps<TData>) => {
  const debouncedSearch = useDebounce(search, 200);

  useEffect(() => {
    setQuery((prev) => ({
      ...prev,
      search: debouncedSearch,
      pageIndex: 0,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  return (
    <div className="flex w-full items-center justify-between gap-2 overflow-auto flex-col md:flex-row">
      <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap">
        {segmentedControl && (
          <SegmentedControl
            data={segmentedControl.data}
            onChange={segmentedControl.onChange}
            value={segmentedControl.value}
          />
        )}
        <Input
          placeholder={"Search by any column"}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setSearch(event.target.value);
          }}
          className="w-auto focus-visible:ring-0 focus:outline-none focus-visible:ring-offset-0"
          value={search}
        />
      </div>
      <div className="justify-self-end items-center gap-2 flex">
        {extraToolbar}
        <DataTableViewOptions
          table={table}
          name={tableKey}
          columns={columns}
          modal={modal}
        />
      </div>
    </div>
  );
};

export { DataTableToolbar };
