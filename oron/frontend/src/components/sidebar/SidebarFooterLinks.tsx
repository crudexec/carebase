"use client";

import Image from "next/image";
import Link from "next/link";

const SidebarFooterLinks = ({ pathname }: { pathname: string }) => {
  return (
    <ul className="flex flex-col gap-5 w-[85%] md:w-full mt-auto md:relative absolute bottom-0 mb-10">
      <Link
        href="/support"
        className={`rounded-[6px] p-[12px] text-[#FFFFFF] hover:bg-[#344054] active:bg-[#44536c] transition-all duration-100 text-[16px] font-[500] flex gap-3 items-center ${
          pathname === "/support" && "bg-[#2d3749] hover:bg-[#344054]"
        } `}
      >
        <Image
          src="/assets/images/dashboard/support.svg"
          width={24}
          height={24}
          alt="settings"
        />
        Support
      </Link>
    </ul>
  );
};

export default SidebarFooterLinks;
