"use client";

import Logo from "../Logo";
import Link from "next/link";
import { SIDEBAR_LINKS, ADMIN_SIDEBAR_LINKS, CLIENT_MANAGER_SIDEBAR_LINKS, EMPLOYEE_MANAGER_SIDEBAR_LINKS } from "./constant";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";
import SidebarFooterLinks from "./SidebarFooterLinks";
import useSidebarLogic from "./use-logic";
import MobileSidebar from "./MobileSidebar";

const Sidebar = ({ isAdmin, isClientManager, isEmployeeManager }: { isAdmin?: boolean; isClientManager?: boolean; isEmployeeManager?: boolean }) => {
  const {
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
  } = useSidebarLogic();

  const sidebarLinks = isEmployeeManager
    ? EMPLOYEE_MANAGER_SIDEBAR_LINKS
    : isClientManager
    ? CLIENT_MANAGER_SIDEBAR_LINKS
    : isAdmin
    ? ADMIN_SIDEBAR_LINKS
    : SIDEBAR_LINKS;

  if (isMobile) {
    return (
      <MobileSidebar
        isSidebarOpen={isSidebarOpen}
        expandedSubLinks={expandedSubLinks}
        toggleSubLinks={toggleSubLinks}
        isUserDetailPage={isUserDetailPage}
        pathname={pathname}
        params={params}
        isAdmin={isAdmin}
        isClientManager={isClientManager}
        isEmployeeManager={isEmployeeManager}
        adminPathname={adminPathname}
        employeePathname={employeePathname}
        closeSidebar={closeSidebar}
      />
    );
  }

  return (
    <aside
      className={`${
        isSidebarOpen
          ? "w-[280px]"
          : "hidden  lg:flex transition-all duration-500"
      } w-[280px] fixed top-0 left-0 bottom-0 bg-[#081639] p-5 lg:flex flex-col gap-5 z-[1000] transition-all duration-500`}
    >
      <Link
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
                  className="w-full rounded-[6px] p-[12px] text-[#FFFFFF] hover:bg-[#344054] transition-all duration-100 text-[16px] font-[500] flex gap-3 items-center active:bg-[#344054]"
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
                  href={item.route}
                  className={`rounded-[6px] p-[12px] text-[#FFFFFF] hover:bg-[#344054] transition-all duration-100 text-[16px] font-[500] flex gap-3 items-center active:bg-[#44536c] ${
                    isActive && "bg-[#344054] hover:bg-[#344054]"
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
            href={`/admin/users/${params.slug}`}
            className={`rounded-[6px] p-[12px] text-[#FFFFFF] hover:bg-[#344054] pl-[45px] transition-all duration-100 text-[16px] font-[500] flex gap-3 items-center active:bg-[#44536c] ${
              pathname.includes("form") && "bg-[#2d3749] hover:bg-[#344054]"
            } `}
          >
            Forms
          </Link>
          <Link
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
    </aside>
  );
};

export default Sidebar;
