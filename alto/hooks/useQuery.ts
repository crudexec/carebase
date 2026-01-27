"use client";

import useSWR from "swr";

import { ApiResponse } from "@/types";

const useQuery = <T>(key: string, validate: boolean = true) => {
  const { data, isLoading, mutate } = useSWR<ApiResponse<T>>(
    validate ? key : null,
  );
  return { data, isLoading, mutate };
};

export default useQuery;
