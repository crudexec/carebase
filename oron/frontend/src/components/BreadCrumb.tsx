"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Props {
  links: {
    name: string;
    route: string;
  }[];
  fixed?: boolean;
}

const BreadCrumb = ({ links, fixed }: Props) => {
  return (
    <Breadcrumb
      className={cn(
        fixed &&
          "lg:fixed lg:top-[70px] xl:top-[60px] bg-white lg:z-30 w-full lg:py-8 xl:py-10"
      )}
    >
      <BreadcrumbList>
        {links.map((link, index) => (
          <BreadcrumbItem key={index + 1}>
            <Link
              href={link.route}
              className={
                index === links.length - 1
                  ? "text-black"
                  : "transition-colors hover:text-foreground"
              }
            >
              {link.name}
            </Link>
            {index !== links.length - 1 && <BreadcrumbSeparator />}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BreadCrumb;
