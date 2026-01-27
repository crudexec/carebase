"use client";

import { PropsWithChildren } from "react";
import toast from "react-hot-toast";
import { SWRConfig } from "swr";

import { fetcher } from "@/lib/utils";

export const SWRProvider = ({ children }: PropsWithChildren) => {
  return (
    <SWRConfig
      value={{
        fetcher,
        onError: (error) => {
          if (error.status) {
            toast.error(
              error?.response?.data?.message ??
                error.message ??
                "An error occurred",
            );
            if (error?.status === 403) {
              location.replace("/login");
              localStorage.removeItem("authUser");
            }
          } else if (
            error.response?.status === 404 &&
            error?.response?.statusText === "Not Found"
          ) {
            toast.error(error?.message);
          }
        },
      }}
    >
      {children}
    </SWRConfig>
  );
};
