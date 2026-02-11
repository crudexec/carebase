"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { UserRole } from "@prisma/client";
import { Menu, HelpCircle } from "lucide-react";
import { Sidebar } from "./sidebar";
import { cn } from "@/lib/utils";
import { AlertsDrawer, AlertsBellTrigger } from "@/components/alerts/alerts-drawer";

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

  // Handle responsive detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
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
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={handleOverlayClick}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar user={user} companyName={companyName} onClose={() => setSidebarOpen(false)} showClose={isMobile} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
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
        <header className="hidden lg:flex sticky top-0 z-30 items-center justify-end gap-1 px-6 py-3 bg-white/80 backdrop-blur-sm border-b border-border">
          <Link
            href="/help"
            className="relative p-2 rounded-lg hover:bg-background-secondary transition-colors"
            title="Help Center"
          >
            <HelpCircle className="w-5 h-5 text-foreground-secondary" />
          </Link>
          <AlertsBellTrigger onClick={() => setAlertsOpen(true)} />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>

      {/* Alerts Drawer */}
      <AlertsDrawer open={alertsOpen} onOpenChange={setAlertsOpen} />
    </div>
  );
}
