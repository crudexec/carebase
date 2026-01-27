"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon, XIcon } from "lucide-react";
import React, { useState } from "react";
import { Matcher } from "react-day-picker";

import { cn } from "@/lib";

import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const DateInput = React.forwardRef<
  HTMLButtonElement,
  {
    onChange: (value?: Date | null) => void;
    value?: Date | null;
    className?: string;
    disabled?: boolean;
    placeholder?: string;
    minDate?: Date;
    maxDate?: Date;
  }
>(
  (
    {
      onChange,
      value,
      disabled,
      className,
      placeholder = "Pick a date",
      minDate,
      maxDate,
    },
    ref,
  ) => {
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [month, setMonth] = useState(new Date());

    const dateRange = {
      ...(minDate ? { before: minDate } : {}),
      ...(maxDate ? { after: maxDate } : {}),
    };

    return (
      <div className={cn("grid gap-2 relative", className)}>
        <Popover
          modal={true}
          open={isCalendarOpen}
          onOpenChange={setIsCalendarOpen}
        >
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal z-100 py-5",
                !value && "text-muted-foreground",
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? (
                <div className="flex gap-2 items-center w-full justify-between">
                  {format(value, "PPP")}{" "}
                  {!disabled && (
                    <XIcon
                      className="h-4 w-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCalendarOpen(false);
                        onChange(null);
                      }}
                    />
                  )}
                </div>
              ) : (
                <span>{placeholder}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={value as Date}
              onSelect={(e) => {
                onChange(e as Date);
              }}
              initialFocus
              captionLayout="dropdown-buttons"
              defaultMonth={month}
              onMonthChange={setMonth}
              onDayClick={() => setIsCalendarOpen(false)}
              disabled={dateRange as Matcher}
              fromYear={1960}
              toYear={2100}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  },
);

DateInput.displayName = "DateInput";

export { DateInput };
