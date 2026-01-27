"use client";
import { useEffect, useState } from "react";

type WithId<T> = T & { id: string };

type FetchedData<T> = {
  data: WithId<T>[];
  total: number;
};

const useInfiniteLoading = <T>(
  fetching: boolean,
  fetchedData?: FetchedData<T>,
) => {
  const [data, setData] = useState<WithId<T>[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData((prev) => {
      const exisitingIds = new Set(prev.map((item) => item.id));
      const newData = fetchedData?.data?.filter(
        (item) => !exisitingIds.has(item.id),
      );
      if (newData) return [...prev, ...newData];
      else return [...prev];
    });
  }, [fetchedData?.data]);

  const endReached = data?.length === fetchedData?.total;
  const loadMore = fetching && fetchedData?.total !== fetchedData?.data?.length;

  return { endReached, loadMore, data, setData };
};

export default useInfiniteLoading;
