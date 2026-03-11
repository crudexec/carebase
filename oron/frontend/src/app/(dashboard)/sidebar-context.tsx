"use client";

import { createContext, useState, ReactNode, useMemo } from "react";

interface SidebarContextType {
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
}

export const SidebarContext = createContext<SidebarContextType | undefined>(
  undefined
);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const contextValue = useMemo(() => ({
    isSidebarOpen,
    openSidebar: () => setIsSidebarOpen(true),
    closeSidebar: () => setIsSidebarOpen(false)
  }), [isSidebarOpen]);

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
};
