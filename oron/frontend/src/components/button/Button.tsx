"use client";

import { FC, ReactNode } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "../../lib/utils";

interface Props {
  asLink?: boolean;
  asRouter?: boolean;
  route?: string;
  children: ReactNode;
  type?: "button" | "reset" | "submit";
  variant?: "light";
  onClick?: (e?: any) => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  "data-testid"?: string;
}

const Button: FC<Props> = ({
  asLink,
  asRouter,
  route,
  children,
  type,
  variant,
  disabled,
  onClick,
  isLoading,
  className,
  "data-testid": dataTestId,
}) => {
  const { pending } = useFormStatus();
  const router = useRouter();

  if (asLink) {
    return (
      <Link
        href={route!}
        className="px-5 py-3 bg-[#2563EB] hover:bg-[#2564ebd9] rounded-[6px] h-fit w-fit text-[#F8FAFC] text-[14px] font-[400] active:bg-[#4274e0f3] flex items-center gap-5"
        data-testid={dataTestId}
      >
        {children}
      </Link>
    );
  }

  if (asRouter) {
    return (
      <button
        disabled={disabled}
        className="disabled:cursor-not-allowed"
        onClick={(e) => {
          e.stopPropagation();
          router.push(route!);
        }}
        data-testid={dataTestId}
      >
        {children}
      </button>
    );
  }

  if (
    (isLoading && variant === "light") ||
    (pending && variant === "light" && type === "submit")
  ) {
    return (
      <button
        disabled
        className={cn(
          "px-5 py-3 disabled:bg-[#F1F5F9] disabled:hover:bg-[#F1F5F9] disabled:text-[#0f172a4b] disabled:cursor-not-allowed rounded-[6px] h-fit w-[174px] min-w-[174px] flex items-center justify-center text-[#F8FAFC] text-[14px] font-[400]",
          className
        )}
        data-testid={dataTestId}
      >
        {children === "Uploading" && children}
        <Loader2 className="w-5 h-5 animate-spin" />
      </button>
    );
  }

  if (
    (pending && type === "submit") ||
    (isLoading && variant !== "light") ||
    (isLoading && type === "submit")
  ) {
    return (
      <button
        disabled
        className={cn(
          "px-5 py-3 bg-[#87aaf7] cursor-not-allowed rounded-[6px] h-fit w-[174px] min-w-[174px] flex items-center justify-center text-[#F8FAFC] text-[14px] font-[400]",
          className
        )}
        data-testid={dataTestId}
      >
        {children === "Uploading" && children}
        <Loader2 className="w-5 h-5 animate-spin" />
      </button>
    );
  }

  return (
    <button
      disabled={disabled ?? (pending || isLoading)}
      onClick={onClick}
      type={type ?? "submit"}
      className={cn(
        `flex items-center justify-center gap-3 px-5 py-3 bg-[#2563EB] hover:bg-[#2564ebd9] disabled:bg-[#2564eb69] disabled:hover:bg-[#2564eb69] disabled:text-white disabled:cursor-not-allowed rounded-[6px] h-fit w-[174px] min-w-[174px] text-[14px] font-[400] active:bg-[#4274e0f3] ${
          variant === "light" &&
          "bg-[#d9dde1] w-fit hover:bg-[#c7cbce] active:bg-[#a4a7aa] text-[#0F172A]"
        } ${
          (variant === "light" && pending && "cursor-not-allowed text-white") ||
          (isLoading && "cursor-not-allowed")
        } ${variant !== "light" && "text-[#F8FAFC]"}`,
        className
      )}
      data-testid={dataTestId}
    >
      {children}
    </button>
  );
};

export default Button;
