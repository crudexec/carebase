"use client";
import { useEffect, useState } from "react";

import { PaginateSortFilterType, SortConfig } from "@/types";

import useDebounce from "./useDebounce";
import useSort from "./useSort";

type PaginateSortFilterReturnType<T> = {
  data: T[];
  sortConfig: SortConfig;
  requestSort: (key: string, value: string) => void;
  resetSort: () => void;
  setSortConfig: (config: SortConfig) => void;
  total: number;
};

const usePaginateSortFilter = <T extends Record<string, unknown>>(
  data: T[],
  { search, pageIndex, pageSize = 10, filteredKeys }: PaginateSortFilterType,
): PaginateSortFilterReturnType<T> => {
  const { tableData, sortConfig, requestSort, setSortConfig, resetSort } =
    useSort<T>(data);
  const [paginatedData, setPaginatedData] = useState<T[]>([]);
  const [total, setTotal] = useState<number>(0);
  const searchKeyword = useDebounce(search?.search, 500) as string;

  useEffect(() => {
    let filteredData = tableData;
    if (searchKeyword) {
      filteredData = tableData.filter((item) => {
        return Object.keys(item).some((key) => {
          if (filteredKeys && filteredKeys.includes(key)) {
            return (item[key] as string)
              ?.toLowerCase()
              .includes(searchKeyword?.toLowerCase());
          }
          return false;
        });
      });
    }
    if (filteredData && Number(filteredData?.length) > 0) {
      const start = pageIndex * pageSize;
      const end = start + Number(pageSize);
      setPaginatedData(filteredData.slice(start, end));
    } else {
      setPaginatedData([]);
    }
    setTotal(filteredData.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize, searchKeyword, tableData, sortConfig]);

  return {
    data: paginatedData,
    sortConfig,
    requestSort,
    setSortConfig,
    total,
    resetSort,
  };
};

export default usePaginateSortFilter;
