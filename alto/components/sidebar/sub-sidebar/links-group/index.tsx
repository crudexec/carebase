"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import { useState } from "react";
import { IoChevronForwardSharp } from "react-icons/io5";

import { Button, Collapsible, CollapsibleContent } from "@/components/ui";

type LinkGroupType = {
  icon: string;
  label: string;
  close?: () => void;
  initiallyOpened?: boolean;
  link?: string;
  links?: LinkGroupType[];
};

interface LinksGroupProps {
  icon: string;
  label: string;
  close: () => void;
  initiallyOpened?: boolean;
  link?: string;
  links?: LinkGroupType[];
}

function isActive(pathname: string, label: string, link: string) {
  const path = link?.split("?")[0];
  return (
    (pathname.includes(path) && label.toLowerCase() !== "/dashboard") ||
    (label.toLowerCase() === "dashboard" && pathname === "/")
  );
}

function sublinksActive(pathname: string, links: LinkGroupType[]) {
  return links.some((link) => {
    const path = link?.link?.split("?")[0];
    return pathname.includes(path as string);
  });
}

function SubSideLinksGroup({
  icon,
  label,
  initiallyOpened,
  links,
  link,
  close,
}: LinksGroupProps) {
  const router = useRouter();
  const pathname = usePathname();

  const extractedPath = pathname.split("/").slice(0, 5).join("/");
  const hasLinks = Array.isArray(links);
  const [opened, setOpened] = useState(initiallyOpened || false);

  const items = (hasLinks ? links : []).map((link) => {
    const path = link?.link?.split("?")[0];
    const isSubItemActive = pathname === extractedPath + path;

    if (link.link) {
      return (
        <Button
          key={link.label}
          onClick={() => {
            router.push(`${extractedPath}/${link.link}`);
            close();
          }}
          variant="ghost"
          className={`w-[100%] !block !font-medium pl-[8px] ml-[20px] text-sm !border-l-border border-l !rounded-none ${isSubItemActive && "!font-bold !bg-border"}`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {link.icon}
              <Link
                href={`${extractedPath}/${link.link}`}
                className="px-4 rounded-xs block"
              >
                {link.label}
              </Link>
            </div>
          </div>
        </Button>
      );
    } else {
      return (
        <div className="ml-3" key={link.label}>
          <SubSideLinksGroup {...link} close={close} />
        </div>
      );
    }
  });

  return (
    <>
      <Button
        onClick={() => {
          setOpened((o) => !o);
          if (link) {
            router.push(`${extractedPath}/${link}`);
            close();
          }
        }}
        variant="ghost"
        className={`w-[100%] !block text-sm leading-1 !font-medium  !rounded-none ${
          (isActive(pathname as string, label, link as string) ||
            (hasLinks &&
              sublinksActive(pathname as string, links as LinkGroupType[]))) &&
          "!font-bold bg-border"
        }`}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {icon}
            {hasLinks ? (
              <div className="ml-4">{label}</div>
            ) : (
              <Link
                href={`${extractedPath}/${link}`}
                className="text-decoration-none px-4 rounded-xs block"
              >
                {label}
              </Link>
            )}
          </div>
          {hasLinks && (
            <IoChevronForwardSharp
              size="1rem"
              style={{
                transform: opened ? `rotate(90deg)` : "none",
              }}
              className="transition-transform duration-2000 ease"
            />
          )}
        </div>
      </Button>
      {hasLinks && (
        <Collapsible open={opened}>
          <CollapsibleContent>{items}</CollapsibleContent>
        </Collapsible>
      )}
    </>
  );
}

export default SubSideLinksGroup;
