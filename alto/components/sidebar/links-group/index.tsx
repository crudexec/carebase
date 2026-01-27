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

function isActive(path: string, label: string, link: string) {
  return (
    (path.startsWith(link) && label.toLowerCase() !== "/dashboard") ||
    (label.toLowerCase() === "dashboard" && path === "/")
  );
}

function sublinksActive(path: string, links: LinkGroupType[]) {
  return links.some((link) => path.startsWith(link.link as string));
}

function LinksGroup({
  icon,
  label,
  initiallyOpened,
  links,
  link,
  close,
}: LinksGroupProps) {
  const router = useRouter();
  const pathname = usePathname();

  const hasLinks = Array.isArray(links);
  const [opened, setOpened] = useState(initiallyOpened || false);

  const items = (hasLinks ? links : []).map((link) => {
    const isSubItemActive = pathname?.startsWith(link.link as string);
    if (link.link) {
      return (
        <Button
          key={link.label}
          onClick={() => {
            router.push(link.link as string);
            close();
          }}
          variant="ghost"
          className={`w-[100%] !block !font-medium pl-[8px] ml-[20px] text-sm !border-l-border border-l !rounded-none ${isSubItemActive && "!font-bold !bg-border"}`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {link.icon}
              <Link
                href={link.link as string}
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
          <LinksGroup {...link} close={close} />
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
            router.push(link as string);
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
                href={link as string}
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

export default LinksGroup;
