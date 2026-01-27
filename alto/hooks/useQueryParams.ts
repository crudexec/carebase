"use client";
import { useQueryState } from "nuqs";

const useQueryParams = <T>(key: string, options: { defaultValue: T }) => {
  const [formTab, setFormTab] = useQueryState(key, { ...options });

  return [formTab, setFormTab];
};

export default useQueryParams;
