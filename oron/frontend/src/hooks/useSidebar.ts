"use client";

import { useContext } from "react";
import { SidebarContext } from "@/app/(dashboard)/sidebar-context";

// Custom hook to access sidebar context and control sidebar state
const useSidebar = () => {
  // Accessing sidebar context using useContext hook
  const sidebarContext = useContext(SidebarContext);

  // Throw an error if the hook is not used within a SidebarProvider
  if (!sidebarContext) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }

  // Destructure necessary values from the sidebar context
  const { isSidebarOpen, openSidebar, closeSidebar } = sidebarContext;

  // Return the values and functions to control the sidebar state
  return { isSidebarOpen, openSidebar, closeSidebar };
};

export default useSidebar;
