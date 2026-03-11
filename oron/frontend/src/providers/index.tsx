"use client";

import { ReactNode } from "react";
import AppQueryClientProvider from "./queryClientProvider";
import ReduxStoreProvider from "./reduxStoreProvider";

const Provider = ({ children }: { children: ReactNode }) => {
  return (
    <AppQueryClientProvider>
      <ReduxStoreProvider>{children}</ReduxStoreProvider>
    </AppQueryClientProvider>
  );
};

export default Provider;
