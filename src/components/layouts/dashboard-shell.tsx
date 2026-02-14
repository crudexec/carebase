"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { UserRole } from "@prisma/client";
import { Menu, HelpCircle, PanelLeft } from "lucide-react";
import { Sidebar } from "./sidebar";
import { cn } from "@/lib/utils";
import { AlertsDrawer, AlertsBellTrigger } from "@/components/alerts/alerts-drawer";

const SIDEBAR_COLLAPSED_KEY = "carebase-sidebar-collapsed";

// Custom hook for localStorage with SSR support
function useLocalStorage(key: string, defaultValue: boolean): [boolean, (value: boolean) => void] {
  const getSnapshot = () => {
    const stored = localStorage.getItem(key);
    return stored === "true";
  };

  const getServerSnapshot = () => defaultValue;

  const subscribe = (callback: () => void) => {
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
  };

  const storedValue = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = (value: boolean) => {
    localStorage.setItem(key, String(value));
    // Dispatch storage event to trigger re-render
    window.dispatchEvent(new StorageEvent("storage", { key }));
  };

  return [storedValue, setValue];
}

interface DashboardShellProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
  };
  companyName: string;
  children: React.ReactNode;
}

export function DashboardShell({ user, companyName, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useLocalStorage(SIDEBAR_COLLAPSED_KEY, false);

  // Toggle collapsed state (automatically persisted via useLocalStorage)
  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Handle responsive detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close sidebar when clicking outside on mobile
  const handleOverlayClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={handleOverlayClick}
        />
      )}

      {/* Sidebar - Sticky on desktop, fixed on mobile */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out",
          "lg:sticky lg:top-0 lg:h-screen lg:z-40",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <Sidebar
          user={user}
          companyName={companyName}
          onClose={() => setSidebarOpen(false)}
          showClose={isMobile}
          isCollapsed={!isMobile && isCollapsed}
          onToggleCollapse={!isMobile ? toggleCollapsed : undefined}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b border-border lg:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 -ml-1.5 rounded-md text-foreground-secondary hover:bg-background-secondary hover:text-foreground transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                <span className="text-white font-semibold text-xs">{companyName[0]?.toUpperCase() || "C"}</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{companyName}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href="/help"
              className="relative p-2 rounded-lg hover:bg-background-secondary transition-colors"
              title="Help Center"
            >
              <HelpCircle className="w-5 h-5 text-foreground-secondary" />
            </Link>
            <AlertsBellTrigger onClick={() => setAlertsOpen(true)} />
          </div>
        </header>

        {/* Desktop header */}
        <header className="hidden lg:flex sticky top-0 z-30 items-center justify-between gap-1 px-6 py-3 bg-white/80 backdrop-blur-sm border-b border-border">
          {/* Left side - Collapse toggle when collapsed */}
          <div className="flex items-center">
            {isCollapsed && (
              <button
                onClick={toggleCollapsed}
                className="p-2 -ml-2 rounded-lg text-foreground-secondary hover:bg-background-secondary hover:text-foreground transition-colors"
                title="Expand sidebar"
              >
                <PanelLeft className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Right side - Help and alerts */}
          <div className="flex items-center gap-1">
            <Link
              href="/help"
              className="relative p-2 rounded-lg hover:bg-background-secondary transition-colors"
              title="Help Center"
            >
              <HelpCircle className="w-5 h-5 text-foreground-secondary" />
            </Link>
            <AlertsBellTrigger onClick={() => setAlertsOpen(true)} />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>

      {/* Alerts Drawer */}
      <AlertsDrawer open={alertsOpen} onOpenChange={setAlertsOpen} />
    </div>
  );
}
