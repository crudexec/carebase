"use client";

import React, { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ContextProviders } from "@/context";

const AppQueryClientProvider = ({ children }: { children: ReactNode }) => {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools position="top" initialIsOpen={false} />
      <ContextProviders>{children}</ContextProviders>
    </QueryClientProvider>
  );
};

export default AppQueryClientProvider;
