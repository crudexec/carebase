"use client";

import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

interface AddButtonProps {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

export function AddButton({ onClick, className, disabled }: AddButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "bg-[#F1F5F9] hover:bg-[#ced1d3] flex items-center gap-2 rounded-[6px] px-[12px] py-[4px] text-[#0F172A] text-[14px] font-[500] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      disabled={disabled}
    >
      Add
      <Plus className="ml-1 h-4 w-4" />
    </button>
  );
}
