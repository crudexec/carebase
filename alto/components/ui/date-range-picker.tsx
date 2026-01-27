"use client";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { XIcon } from "lucide-react";
import * as React from "react";
import { Matcher } from "react-day-picker";

import { cn } from "@/lib";

import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

type DateRangePickerProps = {
  className?: string;
  onChange: (value: (Date | undefined)[]) => void;
  value?: (Date | undefined)[];
  min?: Date;
  max?: Date;
};

const DateRangePicker = ({
  className,
  onChange,
  value,
  min,
  max,
}: DateRangePickerProps) => {
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  const dateRange = {
    ...(min ? { before: min } : {}),
    ...(max ? { after: max } : {}),
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
            id="date"
            variant={"outline"}
            className={cn(
              "justify-start text-left font-normal",
              !value && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.[0] ? (
              value?.[1] ? (
                <>
                  <span className="mr-2">
                    {format(value?.[0], "LLL dd, y")} -{" "}
                    {format(value?.[1], "LLL dd, y")}{" "}
                  </span>
                  <XIcon
                    className="h-4 w-4 ml-2 absolute right-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCalendarOpen(false);
                      onChange([]);
                    }}
                  />
                </>
              ) : (
                format(value?.[0], "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            selected={{
              to: value?.[1],
              from: value?.[0],
            }}
            onSelect={(value) => {
              const selectedValue = value as { to: Date; from: Date };
              onChange([selectedValue?.from, selectedValue?.to]);
            }}
            initialFocus
            captionLayout="dropdown-buttons"
            fromYear={1960}
            toYear={2100}
            disabled={dateRange as Matcher}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export { DateRangePicker };
