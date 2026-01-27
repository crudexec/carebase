"use client";
import { useRouter } from "next-nprogress-bar";
import { useEffect } from "react";

import { FetcherError } from "@/types";

const use404Redirect = (error?: FetcherError) => {
  const router = useRouter();
  useEffect(() => {
    if (
      error?.status === 401 &&
      error?.message === "Forbidden: Access denied"
    ) {
      router.push("/404");
    }
  }, [error?.message, error?.status, router]);
};

export default use404Redirect;
