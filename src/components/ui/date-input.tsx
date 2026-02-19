"use client";

import * as React from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DateInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  error?: boolean;
}

const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          type="date"
          className={cn(
            "flex h-9 w-full rounded-md border bg-white pl-9 pr-3 py-2 text-sm transition-all duration-150",
            "placeholder:text-foreground-tertiary",
            "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer",
            error
              ? "border-error focus:border-error focus:ring-error/20"
              : "border-border",
            className
          )}
          ref={ref}
          {...props}
        />
        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-tertiary pointer-events-none" />
      </div>
    );
  }
);
DateInput.displayName = "DateInput";

export { DateInput };
