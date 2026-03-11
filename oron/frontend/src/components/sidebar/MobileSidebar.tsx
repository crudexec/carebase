"use client";

import Logo from "@/components/Logo";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ExpandedSubLinks } from "./use-logic";
import { ADMIN_SIDEBAR_LINKS, SIDEBAR_LINKS, CLIENT_MANAGER_SIDEBAR_LINKS, EMPLOYEE_MANAGER_SIDEBAR_LINKS } from "./constant";
import { motion, AnimatePresence } from "framer-motion";
import SidebarFooterLinks from "./SidebarFooterLinks";

interface Props {
  isSidebarOpen: boolean;
  expandedSubLinks: ExpandedSubLinks;
  toggleSubLinks: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    id: number
  ) => void;
  isUserDetailPage: boolean;
  pathname: string;
  params: {
    slug: string;
  };
  isAdmin?: boolean;
  isClientManager?: boolean;
  isEmployeeManager?: boolean;
  adminPathname: string;
  employeePathname: string;
  closeSidebar: () => void;
}

const sidebarVariants = {
  open: { x: 0 },
  closed: { x: "-100%" },
};

const overlayVariants = {
  open: { opacity: 1, pointerEvents: "auto" as const },
  closed: { opacity: 0, pointerEvents: "none" as const },
};

const MobileSidebar = ({
  isSidebarOpen,
  expandedSubLinks,
  toggleSubLinks,
  isUserDetailPage,
  pathname,
  params,
  isAdmin,
  isClientManager,
  isEmployeeManager,
  adminPathname,
  employeePathname,
  closeSidebar,
}: Props) => {
  const sidebarLinks = isEmployeeManager
    ? EMPLOYEE_MANAGER_SIDEBAR_LINKS
    : isClientManager
    ? CLIENT_MANAGER_SIDEBAR_LINKS
    : isAdmin
    ? ADMIN_SIDEBAR_LINKS
    : SIDEBAR_LINKS;
  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          {/* Sidebar */}
          <motion.aside
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            transition={{ duration: 0.5 }}
            className="w-[280px] fixed top-0 left-0 bottom-0 bg-[#0F172A] p-5 flex flex-col gap-5 z-[1000] shadow-lg"
          >
            <Link
              onClick={() => closeSidebar()}
              href={isEmployeeManager ? "/employee-manager" : isClientManager ? "/client-manager/clients" : isAdmin ? "/admin" : "/overview"}
              className="h-[70px] flex items-center"
            >
              <Logo />
            </Link>
            <ul className="mt-3 flex flex-col gap-5 w-full">
              {sidebarLinks.map((item) => {
                const isActive = (isAdmin || isClientManager || isEmployeeManager)
                  ? adminPathname === item.activeId
                  : item.activeId
                  ? employeePathname === item.activeId
                  : pathname.includes(item.route);

                return (
                  <li key={item.id}>
                    {item.hasSubLink ? (
                      <button
                        onClick={(e) => toggleSubLinks(e, item.id)}
                        className="w-full rounded-[6px] p-[12px] text-[#FFFFFF] hover:bg-[#344054] transition-all duration-100 text-[16px] font-[500] flex gap-3 items-center active:bg-[#44536c]"
                      >
                        <Image
                          src={item.icon}
                          width={24}
                          height={24}
                          alt={item.name}
                        />
                        {item.name}
                        {expandedSubLinks[item.id] ? (
                          <ChevronUp className="ml-auto" />
                        ) : (
                          <ChevronDown className="ml-auto" />
                        )}
                      </button>
                    ) : (
                      <Link
                        onClick={() => closeSidebar()}
                        href={item.route}
                        className={`rounded-[6px] p-[12px] text-[#FFFFFF] hover:bg-[#344054] transition-all duration-100 text-[16px] font-[500] flex gap-3 items-center active:bg-[#44536c] ${
                          isActive && "bg-[#2d3749] hover:bg-[#344054]"
                        } `}
                      >
                        <Image
                          src={item.icon}
                          width={24}
                          height={24}
                          alt={item.name}
                        />
                        {item.name}
                      </Link>
                    )}

                    {item.hasSubLink && expandedSubLinks[item.id] && (
                      <motion.ul
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                        className="mt-3 flex flex-col gap-3"
                      >
                        {item.subLinks?.map((subLink) => (
                          <Link
                            onClick={() => closeSidebar()}
                            key={subLink.name}
                            href={subLink.route}
                            className={`text-[#FFFFFF] hover:bg-[#344054] active:bg-[#44536c] text-[16px] rounded-[6px] pl-[45px] py-[12px] font-[500] ${
                              pathname.includes(subLink.route) &&
                              "bg-[#2d3749] hover:bg-[rgb(52,64,84)]"
                            } `}
                          >
                            {subLink.name}
                          </Link>
                        ))}
                      </motion.ul>
                    )}
                  </li>
                );
              })}
            </ul>

            {isUserDetailPage && (
              <ul className="flex flex-col gap-5">
                <Link
                  onClick={() => closeSidebar()}
                  href={`/admin/users/${params.slug}`}
                  className={`rounded-[6px] p-[12px] text-[#FFFFFF] hover:bg-[#344054] pl-[45px] transition-all duration-100 text-[16px] font-[500] flex gap-3 items-center active:bg-[#44536c] ${
                    pathname.includes("form") &&
                    "bg-[#2d3749] hover:bg-[#344054]"
                  } `}
                >
                  Forms
                </Link>
                <Link
                  onClick={() => closeSidebar()}
                  href={`/admin/users/${params.slug}/documents`}
                  className={`rounded-[6px] p-[12px] text-[#FFFFFF] hover:bg-[#344054] pl-[45px] transition-all duration-100 text-[16px] font-[500] flex gap-3 items-center active:bg-[#44536c] ${
                    pathname === `/admin/users/${params.slug}/documents` &&
                    "bg-[#2d3749] hover:bg-[#344054]"
                  } `}
                >
                  Documents
                </Link>
              </ul>
            )}

            {/* <SidebarFooterLinks pathname={pathname} /> */}
          </motion.aside>

          {/* Dark Overlay */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-[900]"
            onClick={closeSidebar}
          />
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileSidebar;
