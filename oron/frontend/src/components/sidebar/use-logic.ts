"use client";

import useSidebar from "@/hooks/useSidebar";
import { useParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { SIDEBAR_LINKS } from "./constant";

export interface ExpandedSubLinks {
  [key: string]: boolean;
}

const useSidebarLogic = () => {
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const pathname = usePathname();
  const [expandedSubLinks, setExpandedSubLinks] = useState<{
    [key: string]: boolean;
  }>({});
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const params = useParams<{ slug: string }>();

  const isUserDetailPage = pathname.includes("/users");
  const pathnameArray = pathname.split("/");

  // Determine active route for both admin and employee views
  let adminPathname: string;
  let employeePathname: string;

  // Admin pathname logic
  if (pathnameArray.includes("dashboard")) {
    adminPathname = "dashboard";
  } else if (pathnameArray.includes("clients")) {
    adminPathname = "clients";
  } else if (pathnameArray.includes("visits")) {
    adminPathname = "visits";
  } else if (pathnameArray.includes("events")) {
    adminPathname = "events";
  } else if (pathnameArray.includes("reports")) {
    adminPathname = "reports";
  } else {
    adminPathname = "admin";
  }

  // Employee pathname logic
  if (pathname.startsWith("/overview")) {
    employeePathname = "overview";
  } else if (pathname.startsWith("/onboarding")) {
    employeePathname = "onboarding";
  } else if (pathname.startsWith("/clients")) {
    employeePathname = "clients";
  } else if (pathname.startsWith("/schedule")) {
    employeePathname = "schedule";
  } else if (pathname.startsWith("/visits")) {
    employeePathname = "visits";
  } else if (pathname.startsWith("/reports")) {
    employeePathname = "reports";
  } else {
    employeePathname = "";
  }

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const initialExpandedSubLinks: ExpandedSubLinks = {};
    SIDEBAR_LINKS.forEach((item) => {
      if (pathname.includes(item.route)) {
        initialExpandedSubLinks[item.id.toString()] = true;
      } else {
        initialExpandedSubLinks[item.id.toString()] = false;
      }
    });
    setExpandedSubLinks(initialExpandedSubLinks);
  }, [pathname]);

  const toggleSubLinks = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    id: number
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setExpandedSubLinks((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  return {
    isSidebarOpen,
    expandedSubLinks,
    isMobile,
    pathname,
    params,
    isUserDetailPage,
    toggleSubLinks,
    adminPathname,
    employeePathname,
    closeSidebar,
  };
};

export default useSidebarLogic;
