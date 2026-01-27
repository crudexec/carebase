"use client";
import { useSearchParams } from "next/navigation";

const useSearchParam = () => {
  const params = useSearchParams();
  return Object.fromEntries(params);
};

export default useSearchParam;
