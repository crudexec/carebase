"use client";
import { isEmpty } from "lodash";
import { useMemo, useState } from "react";

import { SortConfig } from "@/types";

const sortTableData = <T>(
  array: T[] = [],
  { key, direction }: { key: string; direction: string },
): T[] => {
  return array.sort((a: T, b: T) => {
    const compareValue = direction === "asc" ? -1 : 1;

    const dateA = new Date((a as { [key: string]: string })[key]);
    const dateB = new Date((b as { [key: string]: string })[key]);

    // Check if the values are valid dates
    const isValidDateA = !Number.isNaN(dateA.getTime());
    const isValidDateB = !Number.isNaN(dateB.getTime());

    // If both values are valid dates, compare them
    if (isValidDateA && isValidDateB) {
      return dateA < dateB ? compareValue : dateA > dateB ? -compareValue : 0;
    }

    // If only one value is a valid date, sort the dates first
    if (isValidDateA) return compareValue;
    if (isValidDateB) return -compareValue;

    // Finally, If neither value is a valid date, use the default string comparison
    if (
      (a as { [key: string]: string })[key] <
      (b as { [key: string]: string })[key]
    )
      return compareValue;
    if (
      (a as { [key: string]: string })[key] >
      (b as { [key: string]: string })[key]
    )
      return -compareValue;
    return 0;
  });
};

const useSort = <T>(items: T[] = []) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "createdAt",
    direction: "desc",
  });

  const requestSort = (key: string, direction: string) => {
    setSortConfig({ key, direction: direction ?? "desc" });
  };

  const resetSort = () => {
    setSortConfig({ key: "createdAt", direction: "desc" });
  };

  const sortedItems: T[] = useMemo(() => {
    if (!isEmpty(items)) {
      // If no config was defined then return the unsorted array
      if (!sortConfig?.key) return items;
      return sortTableData<T>(items, { ...sortConfig });
    }
    return [];
  }, [items, sortConfig]);

  return {
    tableData: sortedItems,
    requestSort,
    resetSort,
    sortConfig,
    setSortConfig,
  };
};

export default useSort;
